"""Pure affordability maths — no Django ORM dependency in the core functions.

This is the single source of truth for the assessment: totals, surplus, the
expenditure-to-income ratio, and a status. It is derived on demand from a
statement's transactions; nothing here is persisted.

The account is treated as overdraft-capable: the running balance can go negative
(a deficit month spends more than it earns), and that negative balance is the
customer's overdraft — there is no separately stored debt figure.
"""
from __future__ import annotations

import calendar
from dataclasses import dataclass
from datetime import date as _date
from decimal import Decimal
from typing import NamedTuple

MIN_SURPLUS_THRESHOLD = Decimal("0.00")   # surplus must exceed this to be "surplus"
TWO_PLACES = Decimal("0.01")

STATUS_NO_DATA = "no_data"
STATUS_DEFICIT = "deficit"
STATUS_TIGHT = "tight"
STATUS_SURPLUS = "surplus"

STATUS_LABELS = {
    STATUS_NO_DATA: "No data",
    STATUS_DEFICIT: "Deficit",
    STATUS_TIGHT: "Tight",
    STATUS_SURPLUS: "Surplus",
}


@dataclass(frozen=True)
class AffordabilityAssessment:
    total_income: Decimal
    total_expenditure: Decimal
    disposable_income: Decimal            # surplus; may be negative
    expenditure_ratio: Decimal | None     # percentage; None when income == 0
    status: str
    message_key: str


def assess(total_income, total_expenditure, has_transactions):
    income = Decimal(total_income)
    expenditure = Decimal(total_expenditure)
    disposable = income - expenditure

    if not has_transactions:
        return AffordabilityAssessment(
            total_income=income, total_expenditure=expenditure,
            disposable_income=disposable, expenditure_ratio=None,
            status=STATUS_NO_DATA, message_key=STATUS_NO_DATA,
        )

    ratio = None
    if income > 0:
        ratio = (expenditure / income * 100).quantize(TWO_PLACES)

    if disposable < 0:
        status = STATUS_DEFICIT
    elif disposable <= MIN_SURPLUS_THRESHOLD:
        status = STATUS_TIGHT
    else:
        status = STATUS_SURPLUS

    return AffordabilityAssessment(
        total_income=income, total_expenditure=expenditure,
        disposable_income=disposable, expenditure_ratio=ratio,
        status=status, message_key=status,
    )


# --- ORM adapters -----------------------------------------------------------

def statement_totals(statement):
    """Return (total_income, total_expenditure, has_transactions) for a Statement."""
    income = Decimal("0.00")
    expenditure = Decimal("0.00")
    count = 0
    for txn in statement.transactions.all():
        count += 1
        if txn.category == "income":
            income += txn.amount
        elif txn.category == "expenditure":
            expenditure += txn.amount
    return income, expenditure, count > 0


def assess_statement(statement):
    income, expenditure, has = statement_totals(statement)
    return assess(income, expenditure, has)


# --- Trend over time --------------------------------------------------------

class MonthInput(NamedTuple):
    period: _date
    total_income: Decimal
    total_expenditure: Decimal
    has_transactions: bool


@dataclass(frozen=True)
class TrendPoint:
    period: _date
    total_income: Decimal
    total_expenditure: Decimal
    disposable_income: Decimal
    expenditure_ratio: Decimal | None  # spending as % of income; None if income 0
    status: str
    status_label: str           # plain-language status, e.g. "Surplus"
    start_balance: Decimal      # running balance carried in (cumulative)
    end_balance: Decimal        # start_balance + disposable_income (may be negative)


@dataclass(frozen=True)
class Trend:
    points: list
    trajectory: str   # "improving" | "worsening" | "stable" | "n/a"
    average_disposable_income: Decimal | None
    months_in_surplus: int
    months_in_deficit: int


def build_trend(months):
    ordered = sorted(months, key=lambda m: m.period)
    points = []
    running = Decimal("0.00")    # cumulative balance, first month starts at zero
    for m in ordered:
        a = assess(m.total_income, m.total_expenditure, m.has_transactions)
        start_balance = running
        end_balance = start_balance + a.disposable_income
        points.append(TrendPoint(
            period=m.period, total_income=a.total_income,
            total_expenditure=a.total_expenditure,
            disposable_income=a.disposable_income,
            expenditure_ratio=a.expenditure_ratio, status=a.status,
            status_label=STATUS_LABELS[a.status],
            start_balance=start_balance, end_balance=end_balance,
        ))
        running = end_balance

    # Summary stats ignore "no data" (empty) months so they don't dilute the
    # average or flip the trajectory.
    data_points = [p for p in points if p.status != STATUS_NO_DATA]

    if len(data_points) < 2:
        trajectory = "n/a"
    else:
        change = data_points[-1].disposable_income - data_points[-2].disposable_income
        trajectory = "improving" if change > 0 else "worsening" if change < 0 else "stable"

    if data_points:
        total = sum((p.disposable_income for p in data_points), Decimal("0.00"))
        average = (total / len(data_points)).quantize(TWO_PLACES)
    else:
        average = None
    months_in_surplus = sum(1 for p in points if p.status == STATUS_SURPLUS)
    months_in_deficit = sum(1 for p in points if p.status == STATUS_DEFICIT)

    return Trend(points=points, trajectory=trajectory,
                 average_disposable_income=average,
                 months_in_surplus=months_in_surplus,
                 months_in_deficit=months_in_deficit)


def build_user_trend(statements):
    months = []
    for s in statements:
        income, expenditure, has = statement_totals(s)
        months.append(MonthInput(s.statement_period, income, expenditure, has))
    return build_trend(months)


# --- Month helpers (pure) ---------------------------------------------------

def month_end(year, month):
    """Last day of the given month, as a date."""
    return _date(year, month, calendar.monthrange(year, month)[1])


def months_back(period, n):
    """Month-end date n whole months before `period` (n=0 returns the same month-end)."""
    index = period.year * 12 + (period.month - 1) - n
    year, month0 = divmod(index, 12)
    return month_end(year, month0 + 1)


def _months_in_range(start, end):
    """Ascending list of month-end dates from `start`'s month to `end`'s month, inclusive."""
    periods = []
    index = start.year * 12 + (start.month - 1)
    last = end.year * 12 + (end.month - 1)
    while index <= last:
        year, month0 = divmod(index, 12)
        periods.append(month_end(year, month0 + 1))
        index += 1
    return periods


# --- Overview (range roll-up) -----------------------------------------------

@dataclass(frozen=True)
class OverviewMonth:
    period: _date
    total_income: Decimal
    total_expenditure: Decimal
    disposable_income: Decimal     # money left over (may be negative)
    status: str
    status_label: str


@dataclass(frozen=True)
class Overview:
    requested_start: _date
    requested_end: _date
    months_with_data: int
    total_income: Decimal
    total_expenditure: Decimal
    net_position: Decimal                       # total_income - total_expenditure
    average_disposable_income: Decimal | None   # mean money left over per data month
    expenditure_ratio: Decimal | None           # overall %; None when income 0
    months_in_surplus: int
    months_in_deficit: int
    trajectory: str                             # improving|worsening|stable|n/a
    missing_months: list                        # month-end dates in range with no data
    months: list                                # OverviewMonth per data month (ascending)
    max_abs_disposable: Decimal                 # largest |money left over|; for bar scaling


def build_overview(month_inputs, requested_start, requested_end):
    by_period = {m.period: m for m in month_inputs}
    data = []
    missing = []
    for period in _months_in_range(requested_start, requested_end):
        m = by_period.get(period)
        if m is not None and m.has_transactions:
            a = assess(m.total_income, m.total_expenditure, m.has_transactions)
            data.append(OverviewMonth(
                period=period, total_income=a.total_income,
                total_expenditure=a.total_expenditure,
                disposable_income=a.disposable_income,
                status=a.status, status_label=STATUS_LABELS[a.status],
            ))
        else:
            missing.append(period)

    total_income = sum((p.total_income for p in data), Decimal("0.00"))
    total_expenditure = sum((p.total_expenditure for p in data), Decimal("0.00"))
    net = total_income - total_expenditure
    n = len(data)
    average = (net / n).quantize(TWO_PLACES) if n else None
    ratio = ((total_expenditure / total_income * 100).quantize(TWO_PLACES)
             if total_income > 0 else None)
    surplus = sum(1 for p in data if p.status == STATUS_SURPLUS)
    deficit = sum(1 for p in data if p.status == STATUS_DEFICIT)
    if n < 2:
        trajectory = "n/a"
    else:
        change = data[-1].disposable_income - data[-2].disposable_income
        trajectory = "improving" if change > 0 else "worsening" if change < 0 else "stable"
    max_abs = max((abs(p.disposable_income) for p in data), default=Decimal("0.00"))

    return Overview(
        requested_start=requested_start, requested_end=requested_end,
        months_with_data=n, total_income=total_income,
        total_expenditure=total_expenditure, net_position=net,
        average_disposable_income=average, expenditure_ratio=ratio,
        months_in_surplus=surplus, months_in_deficit=deficit,
        trajectory=trajectory, missing_months=missing,
        months=data, max_abs_disposable=max_abs,
    )


def build_user_overview(statements, requested_start, requested_end):
    months = [MonthInput(s.statement_period, *statement_totals(s)) for s in statements]
    return build_overview(months, requested_start, requested_end)


# --- Range resolution -------------------------------------------------------

_PRESET_MONTHS = {"3": 3, "6": 6, "12": 12}
_DEFAULT_PRESET = 6


def resolve_overview_range(range_choice, latest_period, from_period=None, to_period=None):
    """Resolve a range selection to (requested_start, requested_end) month-end dates.

    Presets ("3"/"6"/"12") are anchored to `latest_period` (the user's most recent
    statement). A custom range needs both `from_period` and `to_period`. Returns None
    when a preset is requested but the user has no statements (no anchor).
    """
    if range_choice == "custom" and from_period and to_period:
        return (from_period, to_period)
    if latest_period is None:
        return None
    n = _PRESET_MONTHS.get(range_choice, _DEFAULT_PRESET)
    return (months_back(latest_period, n - 1), latest_period)
