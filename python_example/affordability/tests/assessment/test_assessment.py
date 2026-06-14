from decimal import Decimal
from affordability.assessment import (
    assess,
    STATUS_NO_DATA, STATUS_DEFICIT, STATUS_TIGHT, STATUS_SURPLUS,
)


def test_no_transactions_is_no_data():
    a = assess(Decimal("0"), Decimal("0"), has_transactions=False)
    assert a.status == STATUS_NO_DATA
    assert a.expenditure_ratio is None


def test_surplus_and_ratio():
    a = assess(Decimal("2000.00"), Decimal("1500.00"), has_transactions=True)
    assert a.disposable_income == Decimal("500.00")
    assert a.expenditure_ratio == Decimal("75.00")  # percentage
    assert a.status == STATUS_SURPLUS


def test_deficit_when_expenditure_exceeds_income():
    a = assess(Decimal("1000.00"), Decimal("1200.00"), has_transactions=True)
    assert a.disposable_income == Decimal("-200.00")
    assert a.status == STATUS_DEFICIT


def test_zero_income_does_not_divide_by_zero():
    a = assess(Decimal("0.00"), Decimal("300.00"), has_transactions=True)
    assert a.expenditure_ratio is None
    assert a.status == STATUS_DEFICIT


def test_breakeven_is_tight():
    a = assess(Decimal("1000.00"), Decimal("1000.00"), has_transactions=True)
    assert a.disposable_income == Decimal("0.00")
    assert a.status == STATUS_TIGHT


def test_status_boundaries_around_zero():
    # Just below zero is a deficit; exactly zero is tight; just above is surplus.
    assert assess(Decimal("100.00"), Decimal("100.01"), has_transactions=True).status == STATUS_DEFICIT
    assert assess(Decimal("100.00"), Decimal("100.00"), has_transactions=True).status == STATUS_TIGHT
    assert assess(Decimal("100.01"), Decimal("100.00"), has_transactions=True).status == STATUS_SURPLUS
