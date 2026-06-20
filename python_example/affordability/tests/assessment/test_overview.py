from decimal import Decimal
from datetime import date

from affordability.assessment import (
    build_overview, month_end, months_back, MonthInput,
    STATUS_SURPLUS, STATUS_DEFICIT,
)


def _mi(year, month, income, expenditure, has=True):
    return MonthInput(month_end(year, month), Decimal(income), Decimal(expenditure), has)


def test_month_end_and_months_back():
    assert month_end(2026, 2) == date(2026, 2, 28)
    assert month_end(2026, 6) == date(2026, 6, 30)
    # last 6 months ending June 2026 starts at January 2026
    assert months_back(date(2026, 6, 30), 5) == date(2026, 1, 31)
    # crossing a year boundary
    assert months_back(date(2026, 2, 28), 3) == date(2025, 11, 30)


def test_build_overview_aggregates_flows():
    months = [
        _mi(2026, 1, "2000.00", "1500.00"),   # surplus 500
        _mi(2026, 2, "2000.00", "1800.00"),   # surplus 200
        _mi(2026, 3, "2000.00", "2200.00"),   # deficit -200
    ]
    o = build_overview(months, month_end(2026, 1), month_end(2026, 3))
    assert o.months_with_data == 3
    assert o.total_income == Decimal("6000.00")
    assert o.total_expenditure == Decimal("5500.00")
    assert o.net_position == Decimal("500.00")
    assert o.average_disposable_income == Decimal("166.67")   # 500/3
    assert o.expenditure_ratio == Decimal("91.67")            # 5500/6000*100
    assert o.months_in_surplus == 2
    assert o.months_in_deficit == 1
    assert o.trajectory == "worsening"                        # 200 -> -200
    assert o.missing_months == []
    assert [m.period for m in o.months] == [
        month_end(2026, 1), month_end(2026, 2), month_end(2026, 3)]
    assert o.max_abs_disposable == Decimal("500.00")


def test_build_overview_reports_missing_months():
    # Range Jan-Apr, but only Jan and Mar have data
    months = [_mi(2026, 1, "1000.00", "500.00"), _mi(2026, 3, "1000.00", "500.00")]
    o = build_overview(months, month_end(2026, 1), month_end(2026, 4))
    assert o.months_with_data == 2
    assert o.missing_months == [month_end(2026, 2), month_end(2026, 4)]


def test_build_overview_ignores_no_data_months():
    # A statement with no transactions is treated as missing, not £0 data
    months = [
        _mi(2026, 1, "1000.00", "400.00"),
        _mi(2026, 2, "0.00", "0.00", has=False),
    ]
    o = build_overview(months, month_end(2026, 1), month_end(2026, 2))
    assert o.months_with_data == 1
    assert o.missing_months == [month_end(2026, 2)]
    assert o.average_disposable_income == Decimal("600.00")


def test_build_overview_zero_income_ratio_is_none():
    months = [_mi(2026, 1, "0.00", "300.00")]
    o = build_overview(months, month_end(2026, 1), month_end(2026, 1))
    assert o.expenditure_ratio is None
    assert o.trajectory == "n/a"            # single data month
    assert o.months_in_deficit == 1


def test_build_overview_empty_range():
    o = build_overview([], month_end(2026, 1), month_end(2026, 3))
    assert o.months_with_data == 0
    assert o.average_disposable_income is None
    assert o.expenditure_ratio is None
    assert o.trajectory == "n/a"
    assert o.missing_months == [month_end(2026, 1), month_end(2026, 2), month_end(2026, 3)]
    assert o.months == []
    assert o.max_abs_disposable == Decimal("0.00")


from affordability.assessment import resolve_overview_range


def test_resolve_preset_anchored_to_latest_statement():
    latest = month_end(2026, 6)
    # last 3 months -> Apr..Jun
    assert resolve_overview_range("3", latest) == (month_end(2026, 4), latest)
    # last 6 months -> Jan..Jun
    assert resolve_overview_range("6", latest) == (month_end(2026, 1), latest)
    # last 12 months -> Jul 2025..Jun 2026
    assert resolve_overview_range("12", latest) == (month_end(2025, 7), latest)


def test_resolve_unknown_choice_defaults_to_six_months():
    latest = month_end(2026, 6)
    assert resolve_overview_range("garbage", latest) == (month_end(2026, 1), latest)
    assert resolve_overview_range("", latest) == (month_end(2026, 1), latest)


def test_resolve_custom_range_uses_from_and_to():
    result = resolve_overview_range(
        "custom", month_end(2026, 6),
        from_period=month_end(2026, 2), to_period=month_end(2026, 5))
    assert result == (month_end(2026, 2), month_end(2026, 5))


def test_resolve_preset_without_statements_is_none():
    assert resolve_overview_range("6", None) is None


def test_resolve_custom_without_both_bounds_falls_back_to_preset():
    latest = month_end(2026, 6)
    # custom but missing a bound -> treat as default preset
    assert resolve_overview_range("custom", latest, from_period=month_end(2026, 2)) \
        == (month_end(2026, 1), latest)


import pytest
from django.contrib.auth.models import User
from affordability.models import Statement, Transaction
from affordability.assessment import build_user_overview


@pytest.mark.django_db
def test_build_user_overview_from_statements():
    user = User.objects.create_user(username="ov", password="pw")
    jan = Statement.objects.create(user=user, statement_period=month_end(2026, 1))
    Transaction.objects.create(statement=jan, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=jan, category="expenditure", description="Rent", amount=Decimal("1500.00"))
    mar = Statement.objects.create(user=user, statement_period=month_end(2026, 3))
    Transaction.objects.create(statement=mar, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=mar, category="expenditure", description="Rent", amount=Decimal("2600.00"))
    o = build_user_overview([jan, mar], month_end(2026, 1), month_end(2026, 3))
    assert o.months_with_data == 2
    assert o.total_income == Decimal("4000.00")
    assert o.net_position == Decimal("-100.00")          # 500 + (-600)
    assert o.missing_months == [month_end(2026, 2)]      # Feb has no statement
    assert o.months_in_surplus == 1
    assert o.months_in_deficit == 1
