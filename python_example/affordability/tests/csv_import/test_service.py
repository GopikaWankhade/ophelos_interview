import os
import pytest
from affordability.csv_import import service as import_service


@pytest.fixture
def tmp_import_dir(settings, tmp_path):
    settings.IMPORT_TMP_DIR = tmp_path
    return tmp_path


class _FakeUpload:
    def __init__(self, data):
        self._data = data

    def chunks(self):
        yield self._data


def test_save_read_delete_roundtrip(tmp_import_dir):
    token = import_service.save_upload_to_temp(_FakeUpload(b"hello,world\n"))
    assert import_service.temp_exists(token)
    assert import_service.read_temp(token) == "hello,world\n"
    import_service.delete_temp(token)
    assert not import_service.temp_exists(token)


def test_read_temp_strips_bom(tmp_import_dir):
    token = import_service.save_upload_to_temp(_FakeUpload("﻿Date\n".encode("utf-8")))
    assert import_service.read_temp(token).startswith("Date")


def test_invalid_token_is_rejected(tmp_import_dir):
    with pytest.raises(ValueError):
        import_service.temp_path("../../etc/passwd")
    with pytest.raises(ValueError):
        import_service.temp_path("not-a-token")


def test_clear_stale_imports_removes_old_files(tmp_import_dir):
    token = import_service.save_upload_to_temp(_FakeUpload(b"x"))
    path = import_service.temp_path(token)
    old = os.path.getmtime(path) - 7200
    os.utime(path, (old, old))
    removed = import_service.clear_stale_imports(max_age_seconds=3600)
    assert removed == 1
    assert not os.path.exists(path)


from decimal import Decimal
from datetime import date
from unittest.mock import patch
from django.contrib.auth.models import User
from affordability.models import Statement, Transaction
from affordability.csv_import import MonthGroup, ParsedRow


def _group(period, rows):
    income = sum((r.amount for r in rows if r.category == "income"), Decimal("0.00"))
    spend = sum((r.amount for r in rows if r.category == "expenditure"), Decimal("0.00"))
    return MonthGroup(period, rows, income, spend)


def _row(day, category, amount):
    return ParsedRow(1, date(2026, 1, day), "x", category, Decimal(amount))


@pytest.mark.django_db
def test_commit_creates_new_statements():
    user = User.objects.create_user(username="c1", password="pw")
    groups = [_group(date(2026, 1, 31), [_row(5, "expenditure", "800.00"),
                                         _row(25, "income", "2000.00")])]
    result = import_service.commit_import(user, groups, {})
    assert result.created_statements == 1
    assert result.created_transactions == 2
    assert Statement.objects.filter(user=user).count() == 1


@pytest.mark.django_db
def test_commit_skips_existing_month_by_default():
    user = User.objects.create_user(username="c2", password="pw")
    Statement.objects.create(user=user, statement_period=date(2026, 1, 31))
    groups = [_group(date(2026, 1, 31), [_row(5, "expenditure", "10.00")])]
    result = import_service.commit_import(user, groups, {})  # no choice -> skip
    assert result.skipped_statements == 1
    assert Transaction.objects.count() == 0


@pytest.mark.django_db
def test_commit_treats_unknown_choice_as_skip():
    user = User.objects.create_user(username="cx", password="pw")
    period = date(2026, 1, 31)
    Statement.objects.create(user=user, statement_period=period)
    groups = [_group(period, [_row(5, "expenditure", "10.00")])]
    result = import_service.commit_import(user, groups, {period: "garbage"})
    assert result.skipped_statements == 1     # not replaced
    assert Transaction.objects.count() == 0


@pytest.mark.django_db
def test_commit_replaces_existing_month_when_chosen():
    user = User.objects.create_user(username="c3", password="pw")
    period = date(2026, 1, 31)
    existing = Statement.objects.create(user=user, statement_period=period)
    Transaction.objects.create(statement=existing, category="income",
                               description="old", amount=Decimal("1.00"))
    groups = [_group(period, [_row(5, "expenditure", "800.00")])]
    result = import_service.commit_import(user, groups, {period: "replace"})
    assert result.replaced_statements == 1
    assert Transaction.objects.filter(statement=existing).count() == 1
    assert Transaction.objects.get(statement=existing).description == "x"


@pytest.mark.django_db
def test_commit_rolls_back_on_error():
    user = User.objects.create_user(username="c4", password="pw")
    groups = [_group(date(2026, 1, 31), [_row(5, "expenditure", "800.00"),
                                         _row(25, "income", "2000.00")])]
    with patch("affordability.csv_import.service.Transaction.objects.create",
               side_effect=RuntimeError("boom")):
        with pytest.raises(RuntimeError):
            import_service.commit_import(user, groups, {})
    # Atomic: nothing persisted
    assert Statement.objects.filter(user=user).count() == 0
    assert Transaction.objects.count() == 0


@pytest.mark.django_db
def test_replace_rollback_preserves_existing_data_on_error():
    """A failure mid-commit on Replace must not leave old data deleted and new
    data missing — the whole atomic operation rolls back."""
    user = User.objects.create_user(username="c5", password="pw")
    period = date(2026, 1, 31)
    existing = Statement.objects.create(user=user, statement_period=period)
    Transaction.objects.create(statement=existing, category="income",
                               description="old", amount=Decimal("5.00"))
    groups = [_group(period, [_row(5, "expenditure", "800.00"),
                              _row(25, "income", "2000.00")])]
    with patch("affordability.csv_import.service.Transaction.objects.create",
               side_effect=RuntimeError("boom")):
        with pytest.raises(RuntimeError):
            import_service.commit_import(user, groups, {period: "replace"})
    # Rollback restored the original transaction; no partial new data added.
    assert Transaction.objects.filter(statement=existing).count() == 1
    assert Transaction.objects.get(statement=existing).description == "old"
    assert Statement.objects.filter(user=user).count() == 1


from io import StringIO
from django.core.management import call_command


def test_clear_stale_imports_command(tmp_import_dir):
    token = import_service.save_upload_to_temp(_FakeUpload(b"x"))
    path = import_service.temp_path(token)
    old = os.path.getmtime(path) - 7200
    os.utime(path, (old, old))
    out = StringIO()
    call_command("clear_stale_imports", "--max-age", "3600", stdout=out)
    assert "Removed 1" in out.getvalue()
    assert not os.path.exists(path)
