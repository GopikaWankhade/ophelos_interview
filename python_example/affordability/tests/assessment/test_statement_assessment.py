import pytest
from decimal import Decimal
from datetime import date
from django.contrib.auth.models import User
from affordability.models import Statement, Transaction
from affordability.assessment import (
    assess_statement, statement_totals, build_user_trend, STATUS_SURPLUS,
)


@pytest.mark.django_db
def test_statement_totals_sums_by_category():
    user = User.objects.create_user(username="t", password="pw")
    s = Statement.objects.create(user=user, statement_period=date.today())
    Transaction.objects.create(statement=s, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=s, category="expenditure", description="Rent", amount=Decimal("800.00"))
    Transaction.objects.create(statement=s, category="expenditure", description="Food", amount=Decimal("200.00"))
    income, expenditure, has = statement_totals(s)
    assert income == Decimal("2000.00")
    assert expenditure == Decimal("1000.00")
    assert has is True


@pytest.mark.django_db
def test_assess_statement_returns_status_and_surplus():
    user = User.objects.create_user(username="t2", password="pw")
    s = Statement.objects.create(user=user, statement_period=date.today())
    Transaction.objects.create(statement=s, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=s, category="expenditure", description="Rent", amount=Decimal("1500.00"))
    a = assess_statement(s)
    assert a.status == STATUS_SURPLUS
    assert a.disposable_income == Decimal("500.00")


@pytest.mark.django_db
def test_build_user_trend_from_statements():
    user = User.objects.create_user(username="trend", password="pw")
    jan = Statement.objects.create(user=user, statement_period=date(2026, 1, 31))
    Transaction.objects.create(statement=jan, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=jan, category="expenditure", description="Spend", amount=Decimal("1500.00"))
    feb = Statement.objects.create(user=user, statement_period=date(2026, 2, 28))
    Transaction.objects.create(statement=feb, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=feb, category="expenditure", description="Spend", amount=Decimal("1800.00"))
    t = build_user_trend([feb, jan])  # unordered input
    assert [p.period for p in t.points] == [date(2026, 1, 31), date(2026, 2, 28)]
    assert t.trajectory == "worsening"
