from decimal import Decimal
from datetime import date
from affordability.assessment import build_trend, MonthInput


def _m(year, month, income, expenditure, has=True):
    return MonthInput(date(year, month, 1), Decimal(income), Decimal(expenditure), has)


def test_empty_trend():
    t = build_trend([])
    assert t.points == []
    assert t.trajectory == "n/a"
    assert t.average_disposable_income is None
    assert t.months_in_surplus == 0
    assert t.months_in_deficit == 0


def test_trend_point_status_label():
    t = build_trend([MonthInput(date(2026, 1, 31), Decimal("2000"), Decimal("1500"), True)])
    assert t.points[0].status_label == "Surplus"


def test_trend_summary_stats():
    t = build_trend([
        _m(2026, 1, "2000", "1500"),  # surplus 500
        _m(2026, 2, "1000", "1200"),  # deficit -200
    ])
    assert t.months_in_surplus == 1
    assert t.months_in_deficit == 1
    assert t.average_disposable_income == Decimal("150.00")  # (500 + -200) / 2


def test_single_month_trend_has_no_delta():
    t = build_trend([_m(2026, 1, "2000", "1500")])
    assert len(t.points) == 1
    assert t.points[0].delta is None
    assert t.trajectory == "n/a"


def test_orders_by_period_and_computes_deltas():
    t = build_trend([
        _m(2026, 3, "2000", "1800"),  # surplus 200
        _m(2026, 1, "2000", "1500"),  # surplus 500
        _m(2026, 2, "2000", "1600"),  # surplus 400
    ])
    assert [p.period for p in t.points] == [date(2026, 1, 1), date(2026, 2, 1), date(2026, 3, 1)]
    assert t.points[0].delta is None
    assert t.points[1].delta == Decimal("-100.00")  # 400 - 500
    assert t.points[1].delta_magnitude == Decimal("100.00")  # arrow shows direction
    assert t.points[2].delta == Decimal("-200.00")  # 200 - 400
    assert t.trajectory == "worsening"


def test_trend_point_carries_spending_ratio():
    t = build_trend([_m(2026, 1, "2000", "1500")])
    assert t.points[0].expenditure_ratio == Decimal("75.00")  # 1500/2000 * 100


def test_running_balance_accumulates_from_zero():
    t = build_trend([
        _m(2026, 1, "2000", "1500"),  # money left over 500
        _m(2026, 2, "2000", "1800"),  # money left over 200
    ])
    assert t.points[0].start_balance == Decimal("0.00")
    assert t.points[0].end_balance == Decimal("500.00")
    assert t.points[1].start_balance == Decimal("500.00")   # carries forward
    assert t.points[1].end_balance == Decimal("700.00")


def test_improving_trajectory():
    t = build_trend([_m(2026, 1, "2000", "1900"), _m(2026, 2, "2000", "1500")])
    assert t.trajectory == "improving"


def test_stable_trajectory():
    t = build_trend([_m(2026, 1, "2000", "1500"), _m(2026, 2, "2000", "1500")])
    assert t.trajectory == "stable"
