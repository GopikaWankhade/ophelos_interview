import pytest
from decimal import Decimal
from django.contrib.auth.models import User
from django.urls import reverse

from affordability.models import Statement, Transaction
from affordability.assessment import month_end


def _statement(user, year, mon, income, spend):
    s = Statement.objects.create(user=user, statement_period=month_end(year, mon))
    Transaction.objects.create(statement=s, category="income", description="Pay", amount=Decimal(income))
    Transaction.objects.create(statement=s, category="expenditure", description="Out", amount=Decimal(spend))
    return s


@pytest.mark.django_db
def test_statements_page_links_to_overview(client):
    User.objects.create_user(username="u", password="pw")
    client.login(username="u", password="pw")
    body = client.get(reverse("statements")).content.decode()
    assert reverse("overview") in body
    assert "financial overview" in body.lower()


@pytest.mark.django_db
def test_overview_default_renders_summary(client):
    user = User.objects.create_user(username="u", password="pw")
    _statement(user, 2026, 1, "2000.00", "1500.00")   # surplus 500
    _statement(user, 2026, 2, "2000.00", "1800.00")   # surplus 200
    client.login(username="u", password="pw")
    body = client.get(reverse("overview")).content.decode()
    assert body.count("Your financial overview") >= 1
    assert "£4,000.00" in body          # total income
    assert "£3,300.00" in body          # total spending
    assert "January 2026" in body and "February 2026" in body  # coverage span


@pytest.mark.django_db
def test_overview_custom_range_filters_and_lists_missing(client):
    user = User.objects.create_user(username="u", password="pw")
    _statement(user, 2026, 1, "1000.00", "500.00")
    _statement(user, 2026, 4, "1000.00", "500.00")
    client.login(username="u", password="pw")
    resp = client.get(reverse("overview"), {
        "range": "custom",
        "from_month": month_end(2026, 1).isoformat(),
        "to_month": month_end(2026, 4).isoformat(),
    })
    body = resp.content.decode()
    assert resp.status_code == 200
    # Feb and Mar have no statement in the chosen range
    assert "February 2026" in body and "March 2026" in body
    assert "No statement" in body


@pytest.mark.django_db
def test_overview_custom_from_after_to_shows_error_no_500(client):
    user = User.objects.create_user(username="u", password="pw")
    _statement(user, 2026, 1, "1000.00", "500.00")
    client.login(username="u", password="pw")
    resp = client.get(reverse("overview"), {
        "range": "custom",
        "from_month": month_end(2026, 5).isoformat(),
        "to_month": month_end(2026, 2).isoformat(),
    })
    assert resp.status_code == 200
    assert "after the end month" in resp.content.decode()


@pytest.mark.django_db
def test_overview_no_statements_shows_empty_state(client):
    User.objects.create_user(username="u", password="pw")
    client.login(username="u", password="pw")
    body = client.get(reverse("overview")).content.decode()
    assert "don't have any statements yet" in body.lower()


@pytest.mark.django_db
def test_overview_requires_login(client):
    resp = client.get(reverse("overview"))
    assert resp.status_code == 302
