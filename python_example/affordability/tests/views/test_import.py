import pytest
from datetime import date
from decimal import Decimal
from unittest.mock import patch
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from affordability.csv_import import service as import_service
from affordability.models import Statement, Transaction

CSV = (
    b"Date,Description,Debit,Credit\n"
    b"2020-01-05,Rent,800.00,\n"
    b"2020-01-25,Salary,,2000.00\n"
    b"2020-02-03,Food,150.00,\n"
)


@pytest.fixture
def tmp_import_dir(settings, tmp_path):
    settings.IMPORT_TMP_DIR = tmp_path
    return tmp_path


def _login(client):
    User.objects.create_user(username="imp", password="pw")
    client.login(username="imp", password="pw")


@pytest.mark.django_db
def test_upload_shows_preview_with_two_months(client, tmp_import_dir):
    _login(client)
    upload = SimpleUploadedFile("s.csv", CSV, content_type="text/csv")
    resp = client.post(reverse("import_csv"), {"file": upload})
    body = resp.content.decode()
    assert resp.status_code == 200
    assert "Check your import" in body
    assert "2020" in body
    assert "£2,000.00" in body and "£800.00" in body   # money-formatted amounts
    assert client.session.get("import_token")  # token stored, not file


@pytest.mark.django_db
def test_upload_invalid_file_shows_message_and_no_token(client, tmp_import_dir):
    _login(client)
    upload = SimpleUploadedFile("s.csv", b"Foo,Bar\n1,2\n", content_type="text/csv")
    resp = client.post(reverse("import_csv"), {"file": upload})
    body = resp.content.decode()
    assert "expected columns" in body
    assert not client.session.get("import_token")


@pytest.mark.django_db
def test_upload_requires_login(client):
    resp = client.get(reverse("import_csv"))
    assert resp.status_code == 302


@pytest.mark.django_db
def test_upload_preview_reports_skipped_rows(client, tmp_import_dir):
    # A mix of valid and invalid rows: valid ones are importable, invalid ones
    # are surfaced to the user in the preview rather than silently dropped.
    mixed = (
        b"Date,Description,Debit,Credit\n"
        b"2020-01-05,Rent,800.00,\n"        # valid
        b"not-a-date,Bad,10.00,\n"          # invalid
    )
    _login(client)
    upload = SimpleUploadedFile("s.csv", mixed, content_type="text/csv")
    resp = client.post(reverse("import_csv"), {"file": upload})
    body = resp.content.decode()
    assert resp.status_code == 200
    assert "will be skipped" in body            # row-error section rendered
    assert client.session.get("import_token")   # valid rows still importable


@pytest.mark.django_db
def test_upload_unexpected_error_is_handled_and_temp_deleted(client, tmp_import_dir):
    _login(client)
    upload = SimpleUploadedFile("s.csv", CSV, content_type="text/csv")
    with patch("affordability.views.csv_import.parse_bank_csv",
               side_effect=RuntimeError("boom")):
        resp = client.post(reverse("import_csv"), {"file": upload})
    body = resp.content.decode().lower()
    assert resp.status_code == 200
    assert "process this file" in body          # generic friendly message
    assert "traceback" not in body              # no stack trace leaked
    assert not client.session.get("import_token")
    assert list(tmp_import_dir.iterdir()) == []  # temp file cleaned up


@pytest.mark.django_db
def test_upload_read_error_is_handled_and_temp_deleted(client, tmp_import_dir):
    _login(client)
    upload = SimpleUploadedFile("s.csv", CSV, content_type="text/csv")
    with patch("affordability.views.import_service.read_temp",
               side_effect=OSError("disk gone")):
        resp = client.post(reverse("import_csv"), {"file": upload})
    assert resp.status_code == 200
    assert "process this file" in resp.content.decode().lower()
    assert list(tmp_import_dir.iterdir()) == []  # temp file cleaned up


def _upload_and_get_token(client):
    upload = SimpleUploadedFile("s.csv", CSV, content_type="text/csv")
    client.post(reverse("import_csv"), {"file": upload})
    return client.session["import_token"]


@pytest.mark.django_db
def test_confirm_creates_statements_and_clears_token(client, tmp_import_dir):
    _login(client)
    _upload_and_get_token(client)
    resp = client.post(reverse("import_csv_confirm"), {})
    assert resp.status_code == 302
    assert resp.url == reverse("statements")
    assert Statement.objects.count() == 2
    assert Transaction.objects.count() == 3
    assert not client.session.get("import_token")


@pytest.mark.django_db
def test_import_success_message_shows_once_on_statements(client, tmp_import_dir):
    _login(client)
    _upload_and_get_token(client)
    resp = client.post(reverse("import_csv_confirm"), {}, follow=True)
    # The success message is shown on the page we land on (statements)...
    assert "Imported" in resp.content.decode()
    # ...and is consumed there, so it does not linger on the next page load.
    again = client.get(reverse("statements"))
    assert "Imported" not in again.content.decode()


@pytest.mark.django_db
def test_confirm_replace_existing_month(client, tmp_import_dir):
    _login(client)
    user = User.objects.get(username="imp")
    jan = Statement.objects.create(user=user, statement_period=date(2020, 1, 31))
    Transaction.objects.create(statement=jan, category="income",
                               description="old", amount=Decimal("1.00"))
    _upload_and_get_token(client)
    resp = client.post(reverse("import_csv_confirm"),
                       {"choice-2020-01-31": "replace"})
    assert resp.status_code == 302
    # Jan replaced (2 rows), Feb created (1 row); old row gone
    assert Transaction.objects.filter(statement=jan).count() == 2
    assert not Transaction.objects.filter(description="old").exists()


@pytest.mark.django_db
def test_confirm_without_token_shows_session_expired(client, tmp_import_dir):
    _login(client)
    resp = client.post(reverse("import_csv_confirm"), {}, follow=True)
    assert "session expired" in resp.content.decode().lower()
    assert Statement.objects.count() == 0


@pytest.mark.django_db
def test_temp_file_deleted_after_confirm(client, tmp_import_dir):
    _login(client)
    token = _upload_and_get_token(client)
    client.post(reverse("import_csv_confirm"), {})
    assert not import_service.temp_exists(token)


@pytest.mark.django_db
def test_confirm_commit_failure_shows_message_and_cleans_up(client, tmp_import_dir):
    _login(client)
    token = _upload_and_get_token(client)
    with patch("affordability.views.import_service.commit_import",
               side_effect=RuntimeError("db down")):
        resp = client.post(reverse("import_csv_confirm"), {}, follow=True)
    body = resp.content.decode().lower()
    assert "no changes were made" in body        # user told nothing was saved
    assert Statement.objects.count() == 0        # nothing persisted
    assert not import_service.temp_exists(token)  # temp file cleaned up
