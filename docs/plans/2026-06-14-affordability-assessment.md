# Affordability Assessment & Tracking — Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compute and display a meaningful, FCA-appropriate affordability assessment per monthly statement, plus a month-over-month trend, with `Decimal` money and an affordable-repayment guide when the customer is in debt.

**Architecture:** A pure, DB-free `assessment.py` service is the single source of truth for the maths (totals, surplus, ratio, status, repayment). Thin ORM adapters feed it from `Statement`/`Transaction`. A `messaging.py` map turns a status into customer-facing copy + signposting. Views call the service and render; nothing derived is persisted. Approach A from the spec.

**Tech Stack:** Python 3 / Django 5.1, pytest + pytest-django, `decimal.Decimal` for money.

> **Project workflow:** Do NOT run `git commit` without explicit user approval. Each task ends with a **Checkpoint**: run tests, then stage (`git add`) and pause for the user to review; commit only on their go-ahead. All commands run from the `python_example/` directory.

**Spec:** `docs/superpowers/specs/2026-06-14-affordability-design.md`

---

## File structure

| File | Responsibility |
|---|---|
| `affordability/models.py` (modify) | `amount` → `DecimalField`; add `Statement.total_outstanding_debt` |
| `affordability/migrations/0002_*.py` (create) | schema migration |
| `affordability/assessment.py` (create) | pure assessment + trend maths; ORM adapters |
| `affordability/messaging.py` (create) | status → customer copy + signposting |
| `affordability/forms.py` (modify) | add `total_outstanding_debt` to `StatementForm` |
| `affordability/views.py` (modify) | `view_statement` assessment; `statements` trend |
| `affordability/templates/statements/view.html` (modify) | render assessment + working + copy |
| `affordability/templates/statements/index.html` (modify) | render trend table |
| `affordability/tests/test_assessment.py` (create) | pure assessment unit tests |
| `affordability/tests/test_trend.py` (create) | pure trend unit tests |
| `affordability/tests/models/test_transaction.py` (modify) | Decimal amount tests |
| `affordability/tests/models/test_statement.py` (modify) | debt field test |
| `affordability/tests/views/test_statements.py` (modify) | assessment/trend display tests |

---

## Task 1: Switch money to Decimal + add debt field

**Files:**
- Modify: `affordability/models.py`
- Create: `affordability/migrations/0002_decimal_amount_and_debt.py` (generated)
- Modify: `affordability/tests/models/test_transaction.py`
- Modify: `affordability/tests/models/test_statement.py`

- [ ] **Step 1: Write failing tests for Decimal amount and debt field**

Add to `affordability/tests/models/test_transaction.py`:

```python
from decimal import Decimal
from django.core.exceptions import ValidationError as CoreValidationError

@pytest.mark.django_db
def test_transaction_amount_is_decimal():
    user = User.objects.create_user(username="dec", password="pw")
    statement = Statement.objects.create(user=user, statement_period=date.today())
    txn = Transaction.objects.create(
        statement=statement, category="income", description="Salary",
        amount=Decimal("1234.56"),
    )
    txn.refresh_from_db()
    assert txn.amount == Decimal("1234.56")

@pytest.mark.django_db
def test_transaction_amount_rejects_negative():
    user = User.objects.create_user(username="neg", password="pw")
    statement = Statement.objects.create(user=user, statement_period=date.today())
    txn = Transaction(
        statement=statement, category="expenditure", description="Bad",
        amount=Decimal("-1.00"),
    )
    with pytest.raises(CoreValidationError):
        txn.full_clean()
```

Add to `affordability/tests/models/test_statement.py`:

```python
from decimal import Decimal

@pytest.mark.django_db
def test_statement_total_outstanding_debt_optional_and_decimal():
    from django.contrib.auth.models import User
    from datetime import date
    user = User.objects.create_user(username="debt", password="pw")
    s1 = Statement.objects.create(user=user, statement_period=date.today())
    assert s1.total_outstanding_debt is None
    s2 = Statement.objects.create(
        user=user, statement_period=date.today(),
        total_outstanding_debt=Decimal("500.00"),
    )
    s2.refresh_from_db()
    assert s2.total_outstanding_debt == Decimal("500.00")
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest affordability/tests/models/ -v`
Expected: FAIL — `total_outstanding_debt` attribute/field missing; negative amount not rejected.

- [ ] **Step 3: Update the models**

In `affordability/models.py`, update imports and fields:

```python
from django.core.validators import MinValueValidator
from decimal import Decimal
```

Change `Transaction.amount` from `models.PositiveIntegerField()` to:

```python
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
```

Add to `Statement` (after `statement_period`):

```python
    total_outstanding_debt = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
```

- [ ] **Step 4: Generate the migration**

Run: `python manage.py makemigrations affordability`
Expected: creates `affordability/migrations/0002_*.py` altering `Transaction.amount` and adding `Statement.total_outstanding_debt`.

- [ ] **Step 5: Run the full model suite to verify pass**

Run: `pytest affordability/tests/models/ -v`
Expected: PASS (new tests pass; existing integer-amount tests still pass — `Decimal("1000") == 1000`).

- [ ] **Step 6: Checkpoint** — stage and pause for review.

```bash
git add affordability/models.py affordability/migrations/0002_*.py affordability/tests/models/
# Suggested message (commit only after user approval):
# feat(models): use Decimal for transaction amount; add Statement.total_outstanding_debt
```

---

## Task 2: Pure assessment core — totals, surplus, ratio, status

**Files:**
- Create: `affordability/assessment.py`
- Create: `affordability/tests/test_assessment.py`

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/test_assessment.py`:

```python
from decimal import Decimal
from affordability.assessment import (
    assess, AffordabilityAssessment,
    STATUS_NO_DATA, STATUS_DEFICIT, STATUS_TIGHT, STATUS_SURPLUS,
)


def test_no_transactions_is_no_data():
    a = assess(Decimal("0"), Decimal("0"), has_transactions=False)
    assert a.status == STATUS_NO_DATA
    assert a.expenditure_ratio is None
    assert a.suggested_repayment is None


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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest affordability/tests/test_assessment.py -v`
Expected: FAIL — `No module named 'affordability.assessment'`.

- [ ] **Step 3: Implement the assessment core**

Create `affordability/assessment.py`:

```python
"""Pure affordability maths — no Django ORM dependency in the core functions."""
from __future__ import annotations

import math
from dataclasses import dataclass
from decimal import Decimal, ROUND_FLOOR

# Tunable policy constants (documented; this is guidance, not a demand).
AFFORDABLE_FRACTION = Decimal("0.5")   # share of surplus suggested as repayment
MIN_SURPLUS_THRESHOLD = Decimal("0.00")  # surplus must exceed this to be "surplus"
TWO_PLACES = Decimal("0.01")

STATUS_NO_DATA = "no_data"
STATUS_DEFICIT = "deficit"
STATUS_TIGHT = "tight"
STATUS_SURPLUS = "surplus"


@dataclass(frozen=True)
class AffordabilityAssessment:
    total_income: Decimal
    total_expenditure: Decimal
    disposable_income: Decimal            # surplus; may be negative
    expenditure_ratio: Decimal | None     # percentage; None when income == 0
    status: str
    suggested_repayment: Decimal | None
    months_to_clear: int | None
    message_key: str


def assess(total_income, total_expenditure, has_transactions, outstanding_debt=None):
    income = Decimal(total_income)
    expenditure = Decimal(total_expenditure)
    disposable = income - expenditure

    if not has_transactions:
        return AffordabilityAssessment(
            total_income=income, total_expenditure=expenditure,
            disposable_income=disposable, expenditure_ratio=None,
            status=STATUS_NO_DATA, suggested_repayment=None,
            months_to_clear=None, message_key=STATUS_NO_DATA,
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

    suggested, months = _repayment_guide(status, disposable, outstanding_debt)

    return AffordabilityAssessment(
        total_income=income, total_expenditure=expenditure,
        disposable_income=disposable, expenditure_ratio=ratio,
        status=status, suggested_repayment=suggested,
        months_to_clear=months, message_key=status,
    )


def _repayment_guide(status, disposable, outstanding_debt):
    """Suggested repayment is shown only with a real surplus and real debt."""
    if status != STATUS_SURPLUS or outstanding_debt is None:
        return None, None
    debt = Decimal(outstanding_debt)
    if debt <= 0:
        return None, None
    raw = (disposable * AFFORDABLE_FRACTION).quantize(TWO_PLACES, rounding=ROUND_FLOOR)
    suggested = min(raw, debt)
    if suggested <= 0:
        return None, None
    months = math.ceil(debt / suggested)
    return suggested, months
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pytest affordability/tests/test_assessment.py -v`
Expected: PASS (all five).

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/assessment.py affordability/tests/test_assessment.py
# feat(assessment): pure income/expenditure/surplus/ratio/status core
```

---

## Task 3: Affordable repayment guide tests

**Files:**
- Modify: `affordability/tests/test_assessment.py`

- [ ] **Step 1: Write the failing tests**

Append to `affordability/tests/test_assessment.py`:

```python
def test_repayment_suggested_when_surplus_and_debt():
    a = assess(Decimal("2000.00"), Decimal("1500.00"), has_transactions=True,
               outstanding_debt=Decimal("5000.00"))
    # 500 surplus * 0.5 = 250.00
    assert a.suggested_repayment == Decimal("250.00")
    assert a.months_to_clear == 20  # ceil(5000 / 250)


def test_repayment_capped_at_outstanding_debt():
    a = assess(Decimal("2000.00"), Decimal("1000.00"), has_transactions=True,
               outstanding_debt=Decimal("100.00"))
    # surplus 1000 * 0.5 = 500, capped at 100 debt
    assert a.suggested_repayment == Decimal("100.00")
    assert a.months_to_clear == 1


def test_no_repayment_when_in_deficit_even_with_debt():
    a = assess(Decimal("1000.00"), Decimal("1200.00"), has_transactions=True,
               outstanding_debt=Decimal("5000.00"))
    assert a.suggested_repayment is None
    assert a.months_to_clear is None


def test_no_repayment_when_no_debt():
    a = assess(Decimal("2000.00"), Decimal("1000.00"), has_transactions=True,
               outstanding_debt=None)
    assert a.suggested_repayment is None


def test_repayment_rounds_down_for_conservatism():
    # surplus 1.01 * 0.5 = 0.505 -> floor to 0.50
    a = assess(Decimal("1.01"), Decimal("0.00"), has_transactions=True,
               outstanding_debt=Decimal("100.00"))
    assert a.suggested_repayment == Decimal("0.50")
```

- [ ] **Step 2: Run tests to verify**

Run: `pytest affordability/tests/test_assessment.py -v`
Expected: PASS — `_repayment_guide` from Task 2 already satisfies these. If any fail, fix `_repayment_guide`, not the tests.

- [ ] **Step 3: Checkpoint** — stage and pause.

```bash
git add affordability/tests/test_assessment.py
# test(assessment): cover repayment guide, cap, suppression, rounding
```

---

## Task 4: ORM adapters — assess a Statement

**Files:**
- Modify: `affordability/assessment.py`
- Create: `affordability/tests/models/test_assess_statement.py`

- [ ] **Step 1: Write the failing test**

Create `affordability/tests/models/test_assess_statement.py`:

```python
import pytest
from decimal import Decimal
from datetime import date
from django.contrib.auth.models import User
from affordability.models import Statement, Transaction
from affordability.assessment import assess_statement, statement_totals, STATUS_SURPLUS


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
def test_assess_statement_uses_debt_field():
    user = User.objects.create_user(username="t2", password="pw")
    s = Statement.objects.create(user=user, statement_period=date.today(),
                                 total_outstanding_debt=Decimal("5000.00"))
    Transaction.objects.create(statement=s, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=s, category="expenditure", description="Rent", amount=Decimal("1500.00"))
    a = assess_statement(s)
    assert a.status == STATUS_SURPLUS
    assert a.suggested_repayment == Decimal("250.00")
```

- [ ] **Step 2: Run to verify it fails**

Run: `pytest affordability/tests/models/test_assess_statement.py -v`
Expected: FAIL — `cannot import name 'assess_statement'`.

- [ ] **Step 3: Add the adapters**

Append to `affordability/assessment.py`:

```python
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
    return assess(income, expenditure, has, statement.total_outstanding_debt)
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/models/test_assess_statement.py -v`
Expected: PASS.

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/assessment.py affordability/tests/models/test_assess_statement.py
# feat(assessment): ORM adapters statement_totals and assess_statement
```

---

## Task 5: Trend over time

**Files:**
- Modify: `affordability/assessment.py`
- Create: `affordability/tests/test_trend.py`

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/test_trend.py`:

```python
from decimal import Decimal
from datetime import date
from affordability.assessment import build_trend, MonthInput


def _m(year, month, income, expenditure, has=True, debt=None):
    return MonthInput(date(year, month, 1), Decimal(income), Decimal(expenditure), has, debt)


def test_empty_trend():
    t = build_trend([])
    assert t.points == []
    assert t.trajectory == "n/a"


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
    periods = [p.period for p in t.points]
    assert periods == [date(2026, 1, 1), date(2026, 2, 1), date(2026, 3, 1)]
    assert t.points[0].delta is None
    assert t.points[1].delta == Decimal("-100.00")  # 400 - 500
    assert t.points[2].delta == Decimal("-200.00")  # 200 - 400
    assert t.trajectory == "worsening"


def test_improving_trajectory():
    t = build_trend([_m(2026, 1, "2000", "1900"), _m(2026, 2, "2000", "1500")])
    assert t.trajectory == "improving"


def test_stable_trajectory():
    t = build_trend([_m(2026, 1, "2000", "1500"), _m(2026, 2, "2000", "1500")])
    assert t.trajectory == "stable"
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/test_trend.py -v`
Expected: FAIL — `cannot import name 'build_trend'`.

- [ ] **Step 3: Implement trend**

Append to `affordability/assessment.py`:

```python
from datetime import date as _date
from typing import NamedTuple


class MonthInput(NamedTuple):
    period: _date
    total_income: Decimal
    total_expenditure: Decimal
    has_transactions: bool
    outstanding_debt: Decimal | None = None


@dataclass(frozen=True)
class TrendPoint:
    period: _date
    total_income: Decimal
    total_expenditure: Decimal
    disposable_income: Decimal
    status: str
    delta: Decimal | None   # vs previous month's disposable_income


@dataclass(frozen=True)
class Trend:
    points: list
    trajectory: str   # "improving" | "worsening" | "stable" | "n/a"


def build_trend(months):
    ordered = sorted(months, key=lambda m: m.period)
    points = []
    previous = None
    for m in ordered:
        a = assess(m.total_income, m.total_expenditure, m.has_transactions, m.outstanding_debt)
        delta = None if previous is None else (a.disposable_income - previous)
        points.append(TrendPoint(
            period=m.period, total_income=a.total_income,
            total_expenditure=a.total_expenditure,
            disposable_income=a.disposable_income, status=a.status, delta=delta,
        ))
        previous = a.disposable_income

    if len(points) < 2:
        trajectory = "n/a"
    else:
        change = points[-1].disposable_income - points[-2].disposable_income
        trajectory = "improving" if change > 0 else "worsening" if change < 0 else "stable"

    return Trend(points=points, trajectory=trajectory)
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/test_trend.py -v`
Expected: PASS (all six).

- [ ] **Step 5: Add the ORM trend adapter + test**

Append to `affordability/assessment.py`:

```python
def build_user_trend(statements):
    months = []
    for s in statements:
        income, expenditure, has = statement_totals(s)
        months.append(MonthInput(s.statement_period, income, expenditure, has,
                                 s.total_outstanding_debt))
    return build_trend(months)
```

Append to `affordability/tests/models/test_assess_statement.py`:

```python
@pytest.mark.django_db
def test_build_user_trend_from_statements():
    from affordability.assessment import build_user_trend
    user = User.objects.create_user(username="trend", password="pw")
    jan = Statement.objects.create(user=user, statement_period=date(2026, 1, 31))
    Transaction.objects.create(statement=jan, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=jan, category="expenditure", description="Spend", amount=Decimal("1500.00"))
    feb = Statement.objects.create(user=user, statement_period=date(2026, 2, 28))
    Transaction.objects.create(statement=feb, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=feb, category="expenditure", description="Spend", amount=Decimal("1800.00"))
    t = build_user_trend([feb, jan])
    assert [p.period for p in t.points] == [date(2026, 1, 31), date(2026, 2, 28)]
    assert t.trajectory == "worsening"
```

- [ ] **Step 6: Run to verify pass**

Run: `pytest affordability/tests/test_trend.py affordability/tests/models/test_assess_statement.py -v`
Expected: PASS.

- [ ] **Step 7: Checkpoint** — stage and pause.

```bash
git add affordability/assessment.py affordability/tests/test_trend.py affordability/tests/models/test_assess_statement.py
# feat(assessment): month-over-month trend with deltas and trajectory
```

---

## Task 6: Customer-facing messaging map

**Files:**
- Create: `affordability/messaging.py`
- Create: `affordability/tests/test_messaging.py`

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/test_messaging.py`:

```python
from decimal import Decimal
from affordability.assessment import assess
from affordability.messaging import message_for, SIGNPOSTS


def test_deficit_message_signposts_support():
    a = assess(Decimal("1000.00"), Decimal("1200.00"), has_transactions=True)
    msg = message_for(a)
    assert msg["show_signposting"] is True
    assert msg["headline"]
    assert SIGNPOSTS  # at least one free debt-advice link


def test_surplus_message_does_not_signpost():
    a = assess(Decimal("2000.00"), Decimal("1000.00"), has_transactions=True)
    msg = message_for(a)
    assert msg["show_signposting"] is False


def test_no_data_message():
    a = assess(Decimal("0"), Decimal("0"), has_transactions=False)
    msg = message_for(a)
    assert msg["headline"]
    assert msg["show_signposting"] is False
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/test_messaging.py -v`
Expected: FAIL — `No module named 'affordability.messaging'`.

- [ ] **Step 3: Implement messaging**

Create `affordability/messaging.py`:

```python
"""Customer-facing copy keyed by assessment status. Supportive, non-judgmental,
appropriate for people who may be in financial difficulty (FCA duty of care)."""
from affordability.assessment import (
    STATUS_NO_DATA, STATUS_DEFICIT, STATUS_TIGHT, STATUS_SURPLUS,
)

SIGNPOSTS = [
    {"name": "MoneyHelper", "url": "https://www.moneyhelper.org.uk/"},
    {"name": "StepChange", "url": "https://www.stepchange.org/"},
    {"name": "National Debtline", "url": "https://www.nationaldebtline.org/"},
]

DISCLAIMER = (
    "This is illustrative guidance based on the figures you provided, not a credit "
    "or affordability decision, and it does not account for interest."
)

MESSAGES = {
    STATUS_NO_DATA: {
        "headline": "Add your income and spending to see your position.",
        "body": "Once you add transactions or import a bank statement, "
                "we'll show your affordability here.",
        "show_signposting": False,
    },
    STATUS_DEFICIT: {
        "headline": "Your spending is higher than your income this month.",
        "body": "You're not alone, and support is available. Free, confidential "
                "debt advice can help you find a way forward.",
        "show_signposting": True,
    },
    STATUS_TIGHT: {
        "headline": "Your income and spending are closely matched this month.",
        "body": "There isn't much left over right now. Free debt advice is "
                "available if you'd like support.",
        "show_signposting": True,
    },
    STATUS_SURPLUS: {
        "headline": "You have some money left over this month.",
        "body": "Based on your surplus, here is an amount you might be able to "
                "afford — it's only a guide, and the choice is yours.",
        "show_signposting": False,
    },
}


def message_for(assessment):
    return MESSAGES[assessment.message_key]
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/test_messaging.py -v`
Expected: PASS.

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/messaging.py affordability/tests/test_messaging.py
# feat(messaging): supportive status-keyed copy with debt-advice signposting
```

---

## Task 7: Show the assessment on the statement page

**Files:**
- Modify: `affordability/views.py`
- Modify: `affordability/templates/statements/view.html`
- Modify: `affordability/tests/views/test_statements.py`

- [ ] **Step 1: Write the failing tests**

Append to `affordability/tests/views/test_statements.py`:

```python
from decimal import Decimal

@pytest.mark.django_db
def test_view_statement_shows_surplus_and_repayment(client):
    user = User.objects.create_user(username="v1", password="pw")
    s = Statement.objects.create(user=user, statement_period=date.today(),
                                 total_outstanding_debt=Decimal("5000.00"))
    Transaction.objects.create(statement=s, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=s, category="expenditure", description="Rent", amount=Decimal("1500.00"))
    client.login(username="v1", password="pw")
    body = client.get(reverse("view_statement", args=[s.id])).content.decode()
    assert "500.00" in body          # disposable income shown (the working)
    assert "250.00" in body          # suggested repayment shown
    assert "moneyhelper" not in body.lower()  # no signposting when in surplus


@pytest.mark.django_db
def test_view_statement_deficit_suppresses_repayment_and_signposts(client):
    user = User.objects.create_user(username="v2", password="pw")
    s = Statement.objects.create(user=user, statement_period=date.today(),
                                 total_outstanding_debt=Decimal("5000.00"))
    Transaction.objects.create(statement=s, category="income", description="Pay", amount=Decimal("1000.00"))
    Transaction.objects.create(statement=s, category="expenditure", description="Rent", amount=Decimal("1200.00"))
    client.login(username="v2", password="pw")
    body = client.get(reverse("view_statement", args=[s.id])).content.decode()
    assert "StepChange" in body or "moneyhelper" in body.lower()  # signposting shown
    assert "Suggested" not in body  # no repayment figure label in deficit
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/views/test_statements.py -v`
Expected: FAIL — assessment/signposting not in template.

- [ ] **Step 3: Update the view**

In `affordability/views.py`, update imports and `view_statement`:

```python
from .assessment import assess_statement
from .messaging import message_for, SIGNPOSTS, DISCLAIMER
```

```python
@login_required
def view_statement(request, statement_id):
    statement = get_object_or_404(Statement, id=statement_id, user=request.user)
    assessment = assess_statement(statement)
    return render(request, 'statements/view.html', {
        'statement': statement,
        'assessment': assessment,
        'message': message_for(assessment),
        'signposts': SIGNPOSTS,
        'disclaimer': DISCLAIMER,
    })
```

- [ ] **Step 4: Update the template**

Replace `affordability/templates/statements/view.html` with:

```html
<h1>Statement for {{ statement.statement_period }}</h1>

<section class="affordability">
  <h2>{{ message.headline }}</h2>
  <p>{{ message.body }}</p>

  <h3>How we worked this out</h3>
  <ul>
    <li>Total income: £{{ assessment.total_income }}</li>
    <li>Total spending: £{{ assessment.total_expenditure }}</li>
    <li>Money left over: £{{ assessment.disposable_income }}</li>
    {% if assessment.expenditure_ratio is not None %}
      <li>Spending is {{ assessment.expenditure_ratio }}% of your income</li>
    {% else %}
      <li>Spending as a share of income: not available (no income recorded)</li>
    {% endif %}
  </ul>

  {% if assessment.suggested_repayment is not None %}
    <h3>An amount you might afford</h3>
    <p>Suggested affordable repayment: £{{ assessment.suggested_repayment }} a month.</p>
    {% if assessment.months_to_clear %}
      <p>At that rate it would take about {{ assessment.months_to_clear }} months
         to clear your balance (illustrative — excludes interest).</p>
    {% endif %}
  {% endif %}

  {% if message.show_signposting %}
    <h3>Free, confidential support</h3>
    <ul>
      {% for s in signposts %}
        <li><a href="{{ s.url }}">{{ s.name }}</a></li>
      {% endfor %}
    </ul>
  {% endif %}

  <p><small>{{ disclaimer }}</small></p>
</section>

<h2>Transactions</h2>
{% if statement.transactions.all %}
    <ul>
        {% for transaction in statement.transactions.all %}
            <li>{{ transaction.category }}: {{ transaction.amount }} - {{ transaction.description }}</li>
        {% endfor %}
    </ul>
{% else %}
    <p>No transactions recorded for this statement.</p>
{% endif %}

<a href="{% url 'statements' %}">Back to Statements</a>
```

- [ ] **Step 5: Run to verify pass**

Run: `pytest affordability/tests/views/test_statements.py -v`
Expected: PASS (including the pre-existing `test_view_statement`).

- [ ] **Step 6: Checkpoint** — stage and pause.

```bash
git add affordability/views.py affordability/templates/statements/view.html affordability/tests/views/test_statements.py
# feat(views): show affordability assessment, working, repayment, signposting
```

---

## Task 8: Trend table on the statements list

**Files:**
- Modify: `affordability/views.py`
- Modify: `affordability/templates/statements/index.html`
- Modify: `affordability/tests/views/test_statements.py`

- [ ] **Step 1: Write the failing test**

Append to `affordability/tests/views/test_statements.py`:

```python
@pytest.mark.django_db
def test_statements_index_shows_trend(client):
    user = User.objects.create_user(username="tr", password="pw")
    jan = Statement.objects.create(user=user, statement_period=date(2026, 1, 31))
    Transaction.objects.create(statement=jan, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=jan, category="expenditure", description="Spend", amount=Decimal("1500.00"))
    feb = Statement.objects.create(user=user, statement_period=date(2026, 2, 28))
    Transaction.objects.create(statement=feb, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=feb, category="expenditure", description="Spend", amount=Decimal("1800.00"))
    client.login(username="tr", password="pw")
    body = client.get(reverse("statements")).content.decode()
    assert "Your position over time" in body
    assert "500.00" in body and "200.00" in body  # both months' surpluses
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/views/test_statements.py::test_statements_index_shows_trend -v`
Expected: FAIL — trend not rendered.

- [ ] **Step 3: Update the view**

In `affordability/views.py`, update `statements` and imports:

```python
from .assessment import assess_statement, build_user_trend
```

```python
@login_required
def statements(request):
    statements = list(Statement.objects.filter(user=request.user)
                      .order_by('statement_period'))
    trend = build_user_trend(statements)
    return render(request, 'statements/index.html', {
        'statements': statements,
        'trend': trend,
    })
```

- [ ] **Step 4: Update the template**

Replace `affordability/templates/statements/index.html` with:

```html
<h1>Your Statements</h1>

{% if trend.points %}
  <h2>Your position over time</h2>
  <p>Overall trend: {{ trend.trajectory }}</p>
  <table>
    <thead><tr><th>Month</th><th>Money left over</th><th>Change</th></tr></thead>
    <tbody>
      {% for p in trend.points %}
        <tr>
          <td>{{ p.period }}</td>
          <td>£{{ p.disposable_income }}</td>
          <td>
            {% if p.delta is None %}—
            {% elif p.delta > 0 %}▲ £{{ p.delta }}
            {% else %}▼ £{{ p.delta }}{% endif %}
          </td>
        </tr>
      {% endfor %}
    </tbody>
  </table>
{% endif %}

{% if statements %}
    <ul>
        {% for statement in statements %}
            <li>
                <a href="{% url 'view_statement' statement.id %}">
                    Statement for {{ statement.statement_period }}
                </a>
            </li>
        {% endfor %}
    </ul>
{% else %}
    <p>No statements available.</p>
{% endif %}

<a href="{% url 'new_statement' %}">Create New Statement</a>
```

- [ ] **Step 5: Run to verify pass**

Run: `pytest affordability/tests/views/test_statements.py -v`
Expected: PASS.

- [ ] **Step 6: Checkpoint** — stage and pause.

```bash
git add affordability/views.py affordability/templates/statements/index.html affordability/tests/views/test_statements.py
# feat(views): month-over-month trend table on statements list
```

---

## Task 9: Capture outstanding debt on the statement form

**Files:**
- Modify: `affordability/forms.py`
- Modify: `affordability/templates/statements/new.html` (no change needed if using `form.as_p`; verify)
- Create: `affordability/tests/forms/test_statement_form.py` additions

- [ ] **Step 1: Write the failing test**

Append to `affordability/tests/forms/test_statement_form.py`:

```python
from decimal import Decimal
from datetime import date
from affordability.forms import StatementForm

def test_statement_form_accepts_optional_debt():
    form = StatementForm({"statement_period": date(2026, 1, 1).isoformat(),
                          "total_outstanding_debt": "5000.00"})
    assert form.is_valid(), form.errors
    assert form.cleaned_data["total_outstanding_debt"] == Decimal("5000.00")

def test_statement_form_debt_is_optional():
    form = StatementForm({"statement_period": date(2026, 1, 1).isoformat()})
    assert form.is_valid(), form.errors
```

(If `test_statement_form.py` already imports `date`/`StatementForm`, don't duplicate the imports.)

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/forms/test_statement_form.py -v`
Expected: FAIL — `total_outstanding_debt` not in the form.

- [ ] **Step 3: Update the form**

In `affordability/forms.py`, change `StatementForm.Meta.fields`:

```python
    class Meta:
        model = Statement
        fields = ['statement_period', 'total_outstanding_debt']
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/forms/ -v`
Expected: PASS. The `new.html` template uses `{{ form.as_p }}`, so the new field renders automatically — no template change required.

- [ ] **Step 5: Run the WHOLE suite**

Run: `pytest -v`
Expected: PASS — all Phase 1 tests plus the original suite.

- [ ] **Step 6: Checkpoint** — stage and pause.

```bash
git add affordability/forms.py affordability/tests/forms/test_statement_form.py
# feat(forms): capture optional total outstanding debt on a statement
```

---

## Self-review (completed by plan author)

- **Spec coverage:** §2 model (Task 1, 9) · §3 assessment service incl. repayment (Tasks 2–4) · §4 trend (Task 5) · §5 views/templates/copy/signposting (Tasks 6–8) · §7 FCA derive-on-demand (no derived storage — Tasks 2–8) · §8 testing & edge-case matrix (Tasks 2–8). CSV import (§6) is Phase 2 (separate plan).
- **Placeholders:** none — every step has runnable code/commands.
- **Type consistency:** `assess(...)` signature, `AffordabilityAssessment` fields, `MonthInput`, `TrendPoint`, `Trend`, `build_trend`/`build_user_trend`, `statement_totals`/`assess_statement`, `message_for`/`SIGNPOSTS`/`DISCLAIMER` are used identically across tasks.
- **Edge-case matrix:** no_data, zero income (no div-by-zero), deficit, tight/breakeven, surplus+debt, repayment cap, no-debt, rounding — all covered in Tasks 2–3.
```
