"""Pure affordability maths — no Django ORM dependency in the core functions.

This is the single source of truth for the assessment: totals, surplus, the
expenditure-to-income ratio, and a status. It is derived on demand from a
statement's transactions; nothing here is persisted.

The account is treated as overdraft-capable: the running balance can go negative
(a deficit month spends more than it earns), and that negative balance is the
customer's overdraft — there is no separately stored debt figure.
"""
from __future__ import annotations

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
    delta: Decimal | None       # signed change vs previous month's money left over
    delta_magnitude: Decimal | None  # abs(delta); the arrow conveys direction
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
    previous = None
    running = Decimal("0.00")    # cumulative balance, first month starts at zero
    for m in ordered:
        a = assess(m.total_income, m.total_expenditure, m.has_transactions)
        delta = None if previous is None else (a.disposable_income - previous)
        delta_magnitude = None if delta is None else abs(delta)
        start_balance = running
        end_balance = start_balance + a.disposable_income
        points.append(TrendPoint(
            period=m.period, total_income=a.total_income,
            total_expenditure=a.total_expenditure,
            disposable_income=a.disposable_income,
            expenditure_ratio=a.expenditure_ratio, status=a.status,
            status_label=STATUS_LABELS[a.status],
            delta=delta, delta_magnitude=delta_magnitude,
            start_balance=start_balance, end_balance=end_balance,
        ))
        previous = a.disposable_income
        running = end_balance

    if len(points) < 2:
        trajectory = "n/a"
    else:
        change = points[-1].disposable_income - points[-2].disposable_income
        trajectory = "improving" if change > 0 else "worsening" if change < 0 else "stable"

    if points:
        total = sum((p.disposable_income for p in points), Decimal("0.00"))
        average = (total / len(points)).quantize(TWO_PLACES)
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
