# Financial Overview (range summary) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated Overview page that rolls up a customer's cashflow across a chosen month range (preset 3/6/12 months anchored to their latest statement, or a custom from/to range), shows the covered span and any missing months, and renders a plain-HTML bar visual of money left over per month.

**Architecture:** Extends the existing pure `assessment.py` core with `build_overview` (aggregate + coverage maths) and a `build_user_overview` ORM adapter, plus pure range-resolution helpers. A new `OverviewRangeForm` validates GET-bound range selection. A thin `overview` view resolves the range, filters the user's statements, and renders `statements/overview.html`. No model change, nothing persisted.

**Tech Stack:** Python 3.11 / Django 5.1, pytest + pytest-django, `decimal.Decimal` for money.

## Global Constraints

- All money is `decimal.Decimal`, never float; figures quantized to 2 dp (`TWO_PLACES = Decimal("0.01")`).
- **Do NOT `git commit` without explicit user approval.** Each task ends with a **Checkpoint**: run tests, `git add`, and pause for review. Work directly on `main`.
- All commands run from the `python_example/` directory.
- Reuse existing constants/labels: `STATUS_NO_DATA/DEFICIT/TIGHT/SURPLUS`, `STATUS_LABELS`, `TWO_PLACES`, the `money`/`absval` template filters, and the `MonthInput`/`statement_totals` helpers — do not duplicate them.
- Supportive, amount-aware copy: never say "trending up" when the average money left over is negative (mirror `statements/index.html`).
- Flows only on this page — no running start/end balance.
- New URL must be registered **before** `statements/<int:statement_id>/` so it is not captured as a statement id.

**Spec:** `docs/specs/2026-06-19-financial-overview-design.md`

---

## File structure

| File | Responsibility |
|---|---|
| `affordability/assessment.py` (modify) | Move `month_end` here (pure); add `months_back`, `_months_in_range`, `resolve_overview_range`, `OverviewMonth`, `Overview`, `build_overview`, `build_user_overview` |
| `affordability/forms.py` (modify) | Import `month_end` from `assessment`; add `OverviewRangeForm` |
| `affordability/views.py` (modify) | Add `overview` view |
| `affordability/urls.py` (modify) | Add `statements/overview/` route (before the `<int:statement_id>` route) |
| `affordability/templates/statements/overview.html` (create) | Range controls, summary, coverage/missing-months, bar visual, empty states |
| `affordability/templates/statements/index.html` (modify) | Add "View financial overview" link |
| `affordability/tests/assessment/test_overview.py` (create) | Pure `build_overview` + range-resolution + ORM adapter tests |
| `affordability/tests/forms/test_overview_range_form.py` (create) | `OverviewRangeForm` validation tests |
| `affordability/tests/views/test_overview.py` (create) | View/template end-to-end tests |

---

## Task 1: Pure overview core — dataclasses + `build_overview`

**Files:**
- Modify: `affordability/assessment.py`
- Modify: `affordability/forms.py`
- Create: `affordability/tests/assessment/test_overview.py`

**Interfaces:**
- Consumes: existing `assess`, `MonthInput`, `STATUS_*`, `STATUS_LABELS`, `TWO_PLACES`.
- Produces:
  - `month_end(year, month) -> date` (moved from `forms.py`; last day of month)
  - `months_back(period: date, n: int) -> date` (month-end `n` months before `period`)
  - `OverviewMonth(period, total_income, total_expenditure, disposable_income, status, status_label)` (frozen dataclass)
  - `Overview(requested_start, requested_end, months_with_data, total_income, total_expenditure, net_position, average_disposable_income, expenditure_ratio, months_in_surplus, months_in_deficit, trajectory, missing_months, months, max_abs_disposable)` (frozen dataclass)
  - `build_overview(month_inputs: list[MonthInput], requested_start: date, requested_end: date) -> Overview`

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/assessment/test_overview.py`:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest affordability/tests/assessment/test_overview.py -v`
Expected: FAIL — `cannot import name 'build_overview'` (and `month_end`/`months_back`).

- [ ] **Step 3: Move `month_end` into `assessment.py` and add overview core**

In `affordability/assessment.py`, add `import calendar` at the top of the imports and append this block (after `build_user_trend`):

```python
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
```

Then update `affordability/forms.py` to reuse the relocated helper. Remove its local `month_end` definition (lines defining `def month_end(...)`) and the now-unneeded `import calendar`, and add the import:

```python
from .assessment import month_end
```

(Keep `from datetime import date` — `StatementForm` still uses `date`.)

- [ ] **Step 4: Run tests to verify pass**

Run: `pytest affordability/tests/assessment/test_overview.py -v`
Expected: PASS (all overview tests).

- [ ] **Step 5: Run the form/model suites to confirm the `month_end` move didn't break anything**

Run: `pytest affordability/tests/forms/ affordability/tests/models/ -v`
Expected: PASS (StatementForm still produces month-end choices via the relocated helper).

- [ ] **Step 6: Checkpoint** — stage and pause for review.

```bash
git add affordability/assessment.py affordability/forms.py affordability/tests/assessment/test_overview.py
# Suggested message (commit only after user approval):
# feat(assessment): pure build_overview range roll-up + month helpers
```

---

## Task 2: Pure range resolution — `resolve_overview_range`

**Files:**
- Modify: `affordability/assessment.py`
- Modify: `affordability/tests/assessment/test_overview.py`

**Interfaces:**
- Consumes: `month_end`, `months_back` (Task 1).
- Produces: `resolve_overview_range(range_choice: str, latest_period: date | None, from_period: date | None = None, to_period: date | None = None) -> tuple[date, date] | None` — returns `(requested_start, requested_end)` month-end dates, or `None` when it cannot resolve (no statements and not a valid custom range).

- [ ] **Step 1: Write the failing tests**

Append to `affordability/tests/assessment/test_overview.py`:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest affordability/tests/assessment/test_overview.py::test_resolve_preset_anchored_to_latest_statement -v`
Expected: FAIL — `cannot import name 'resolve_overview_range'`.

- [ ] **Step 3: Implement the resolver**

Append to `affordability/assessment.py`:

```python
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
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pytest affordability/tests/assessment/test_overview.py -v`
Expected: PASS (all overview + resolver tests).

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/assessment.py affordability/tests/assessment/test_overview.py
# feat(assessment): resolve_overview_range (preset anchored to latest statement + custom)
```

---

## Task 3: ORM adapter — `build_user_overview`

**Files:**
- Modify: `affordability/assessment.py`
- Modify: `affordability/tests/assessment/test_overview.py`

**Interfaces:**
- Consumes: `statement_totals`, `MonthInput`, `build_overview` (Task 1).
- Produces: `build_user_overview(statements, requested_start: date, requested_end: date) -> Overview` — `statements` are already filtered to the range by the caller.

- [ ] **Step 1: Write the failing test**

Append to `affordability/tests/assessment/test_overview.py`:

```python
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
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/assessment/test_overview.py::test_build_user_overview_from_statements -v`
Expected: FAIL — `cannot import name 'build_user_overview'`.

- [ ] **Step 3: Add the adapter**

Append to `affordability/assessment.py`:

```python
def build_user_overview(statements, requested_start, requested_end):
    months = [MonthInput(s.statement_period, *statement_totals(s)) for s in statements]
    return build_overview(months, requested_start, requested_end)
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/assessment/test_overview.py -v`
Expected: PASS.

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/assessment.py affordability/tests/assessment/test_overview.py
# feat(assessment): build_user_overview ORM adapter
```

---

## Task 4: `OverviewRangeForm` (GET-bound range selection)

**Files:**
- Modify: `affordability/forms.py`
- Create: `affordability/tests/forms/test_overview_range_form.py`

**Interfaces:**
- Consumes: `month_end` (from `assessment`), `date`.
- Produces: `OverviewRangeForm(forms.Form)` with fields `range` (`"3"/"6"/"12"/"custom"`, default `"6"`), `from_month`, `to_month` (month-end isoformat choices, optional). After `is_valid()`, `cleaned_data["from_period"]` / `["to_period"]` hold parsed `date`s (or `None`). Rejects custom without both bounds, or `from_period > to_period`.

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/forms/test_overview_range_form.py`:

```python
from datetime import date
from affordability.forms import OverviewRangeForm, month_end


def test_preset_is_valid_with_no_custom_fields():
    form = OverviewRangeForm({"range": "3"})
    assert form.is_valid(), form.errors
    assert form.cleaned_data["range"] == "3"
    assert form.cleaned_data["from_period"] is None
    assert form.cleaned_data["to_period"] is None


def test_blank_defaults_to_six():
    form = OverviewRangeForm({})
    assert form.is_valid(), form.errors
    assert form.cleaned_data["range"] == "6"


def test_custom_requires_both_bounds():
    form = OverviewRangeForm({"range": "custom", "from_month": month_end(2026, 1).isoformat()})
    assert not form.is_valid()
    assert "from_month" in form.errors or "to_month" in form.errors or "__all__" in form.errors


def test_custom_rejects_from_after_to():
    form = OverviewRangeForm({
        "range": "custom",
        "from_month": month_end(2026, 5).isoformat(),
        "to_month": month_end(2026, 2).isoformat(),
    })
    assert not form.is_valid()
    assert "from_month" in form.errors or "__all__" in form.errors


def test_custom_valid_parses_periods():
    form = OverviewRangeForm({
        "range": "custom",
        "from_month": month_end(2026, 2).isoformat(),
        "to_month": month_end(2026, 5).isoformat(),
    })
    assert form.is_valid(), form.errors
    assert form.cleaned_data["from_period"] == month_end(2026, 2)
    assert form.cleaned_data["to_period"] == month_end(2026, 5)
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/forms/test_overview_range_form.py -v`
Expected: FAIL — `cannot import name 'OverviewRangeForm'`.

- [ ] **Step 3: Implement the form**

Append to `affordability/forms.py`:

```python
RANGE_CHOICES = [
    ("3", "Last 3 months"),
    ("6", "Last 6 months"),
    ("12", "Last 12 months"),
    ("custom", "Custom range"),
]
MONTHS_FOR_CUSTOM = 24


def _custom_month_choices():
    """Month-end isoformat -> label for the last 24 months (current first)."""
    today = date.today()
    year, month = today.year, today.month
    choices = [("", "—")]
    for _ in range(MONTHS_FOR_CUSTOM):
        end = month_end(year, month)
        choices.append((end.isoformat(), end.strftime("%B %Y")))
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return choices


class OverviewRangeForm(forms.Form):
    range = forms.ChoiceField(choices=RANGE_CHOICES, required=False, label="Range")
    from_month = forms.ChoiceField(choices=[], required=False, label="From")
    to_month = forms.ChoiceField(choices=[], required=False, label="To")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        months = _custom_month_choices()
        self.fields["from_month"].choices = months
        self.fields["to_month"].choices = months

    def clean(self):
        cleaned = super().clean()
        if not cleaned.get("range"):
            cleaned["range"] = "6"

        from_period = self._to_date(cleaned.get("from_month"))
        to_period = self._to_date(cleaned.get("to_month"))

        if cleaned["range"] == "custom":
            if from_period is None or to_period is None:
                raise forms.ValidationError(
                    "Please choose both a start and an end month for a custom range.")
            if from_period > to_period:
                self.add_error("from_month",
                               "The start month can't be after the end month.")

        cleaned["from_period"] = from_period
        cleaned["to_period"] = to_period
        return cleaned

    @staticmethod
    def _to_date(value):
        if not value:
            return None
        try:
            return date.fromisoformat(value)
        except (TypeError, ValueError):
            return None
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/forms/test_overview_range_form.py -v`
Expected: PASS.

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/forms.py affordability/tests/forms/test_overview_range_form.py
# feat(forms): OverviewRangeForm with preset + validated custom range
```

---

## Task 5: Overview view, URL, template, and statements link

**Files:**
- Modify: `affordability/views.py`
- Modify: `affordability/urls.py`
- Create: `affordability/templates/statements/overview.html`
- Modify: `affordability/templates/statements/index.html`
- Create: `affordability/tests/views/test_overview.py`

**Interfaces:**
- Consumes: `build_user_overview`, `resolve_overview_range` (Tasks 2–3); `OverviewRangeForm` (Task 4); `Statement`.
- Produces: `overview` view at URL name `overview` (`statements/overview/`).

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/views/test_overview.py`:

```python
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
    assert "can't be after" in resp.content.decode()


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
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/views/test_overview.py -v`
Expected: FAIL — `Reverse for 'overview' not found` / view not defined.

- [ ] **Step 3: Add the URL**

In `affordability/urls.py`, add the route **before** the `statements/<int:statement_id>/` line:

```python
    path('statements/overview/', views.overview, name='overview'),
```

The list becomes:

```python
urlpatterns = [
    path('', views.index, name='home'),
    path('statements/', views.statements, name='statements'),
    path('statements/new/', views.new_statement, name='new_statement'),
    path('statements/import/', views.import_csv, name='import_csv'),
    path('statements/import/confirm/', views.import_csv_confirm, name='import_csv_confirm'),
    path('statements/overview/', views.overview, name='overview'),
    path('statements/<int:statement_id>/', views.view_statement, name='view_statement'),
]
```

- [ ] **Step 4: Add the view**

In `affordability/views.py`, update the assessment import and forms import lines:

```python
from .forms import StatementForm, TransactionFormSet, CsvUploadForm, OverviewRangeForm
from .assessment import (
    assess_statement, build_user_trend, build_user_overview, resolve_overview_range,
)
```

Add the view (e.g. after `statements`):

```python
@login_required
def overview(request):
    statements = list(Statement.objects.filter(user=request.user)
                      .order_by('statement_period'))

    form = OverviewRangeForm(request.GET) if request.GET else OverviewRangeForm()
    range_choice, from_period, to_period = "6", None, None
    if request.GET and form.is_valid():
        range_choice = form.cleaned_data["range"]
        from_period = form.cleaned_data["from_period"]
        to_period = form.cleaned_data["to_period"]

    overview_data = None
    if statements:
        latest = statements[-1].statement_period
        resolved = resolve_overview_range(range_choice, latest, from_period, to_period)
        if resolved:
            start, end = resolved
            in_range = [s for s in statements if start <= s.statement_period <= end]
            overview_data = build_user_overview(in_range, start, end)

    return render(request, 'statements/overview.html', {
        'form': form,
        'overview': overview_data,
        'has_statements': bool(statements),
    })
```

Note: when a custom range is invalid (e.g. `from > to`), `form.is_valid()` is False, so we fall back to the default 6-month `range_choice` for the data while still passing the bound `form` (with its errors) to the template, so the error message is shown.

- [ ] **Step 5: Create the template**

Create `affordability/templates/statements/overview.html`:

```html
{% load money_format %}
<h1>Your financial overview</h1>

<p><a href="{% url 'statements' %}">← Back to statements</a></p>

{% if not has_statements %}
  <p>You don't have any statements yet — import a bank statement or create one to see
     your overview.</p>
  <p>
    <a href="{% url 'import_csv' %}">Import bank statement (CSV)</a>
    &nbsp;|&nbsp;
    <a href="{% url 'new_statement' %}">Create new statement</a>
  </p>
{% else %}
  <h2>Choose a range</h2>
  <p>
    <a href="?range=3">Last 3 months</a> &nbsp;|&nbsp;
    <a href="?range=6">Last 6 months</a> &nbsp;|&nbsp;
    <a href="?range=12">Last 12 months</a>
  </p>

  <form method="get">
    {{ form.range.errors }}{{ form.non_field_errors }}
    <label>Custom range:
      {{ form.from_month.label_tag }} {{ form.from_month }}
      {{ form.from_month.errors }}
      {{ form.to_month.label_tag }} {{ form.to_month }}
      {{ form.to_month.errors }}
    </label>
    <input type="hidden" name="range" value="custom">
    <button type="submit">Show custom range</button>
  </form>

  {% if overview %}
    <h2>
      Covering {{ overview.requested_start|date:"F Y" }} – {{ overview.requested_end|date:"F Y" }}
      ({{ overview.months_with_data }} month{{ overview.months_with_data|pluralize }} with data)
    </h2>

    {% if overview.missing_months %}
      <p>No statement for:
        {% for m in overview.missing_months %}{{ m|date:"F Y" }}{% if not forloop.last %}, {% endif %}{% endfor %}.
        These months aren't included in the figures below.</p>
    {% endif %}

    {% if overview.months_with_data == 0 %}
      <p>We don't have any statements in this range yet.</p>
    {% else %}
      {% if overview.average_disposable_income < 0 %}
        <p>On average you're spending more than your income — about
           {{ overview.average_disposable_income|absval|money }} short each month.</p>
      {% else %}
        <p>On average you have {{ overview.average_disposable_income|money }} left over each month.</p>
        {% if overview.trajectory == 'improving' %}<p>Your money left over is trending up.</p>
        {% elif overview.trajectory == 'worsening' %}<p>Your money left over is trending down.</p>
        {% elif overview.trajectory == 'stable' %}<p>Your money left over is holding steady.</p>
        {% endif %}
      {% endif %}

      <ul>
        <li>Total income: {{ overview.total_income|money }}</li>
        <li>Total spending: {{ overview.total_expenditure|money }}</li>
        <li>Net position: {{ overview.net_position|money }}</li>
        <li>Spending as a share of income:
          {% if overview.expenditure_ratio is None %}not available (no income recorded)
          {% else %}{{ overview.expenditure_ratio }}%{% endif %}</li>
        <li>{{ overview.months_in_surplus }} month{{ overview.months_in_surplus|pluralize }} in surplus,
            {{ overview.months_in_deficit }} in deficit</li>
      </ul>

      <h3>Money left over each month</h3>
      <table border="0" cellpadding="4">
        {% for m in overview.months %}
          <tr>
            <td>{{ m.period|date:"M Y" }}</td>
            <td style="width:200px;">
              <div style="background:{% if m.disposable_income < 0 %}#c0392b{% else %}#27ae60{% endif %};
                          width:{% widthratio m.disposable_income|absval overview.max_abs_disposable 100 %}%;
                          min-width:1px; height:14px;"></div>
            </td>
            <td>{{ m.disposable_income|money }}</td>
            <td>{{ m.status_label }}</td>
          </tr>
        {% endfor %}
      </table>
    {% endif %}
  {% endif %}
{% endif %}
```

- [ ] **Step 6: Add the link on the statements page**

In `affordability/templates/statements/index.html`, extend the action row (after the "Create new statement" link, inside the same `<p>`):

```html
  &nbsp;|&nbsp;
  <a href="{% url 'overview' %}"><strong>View financial overview</strong></a>
```

- [ ] **Step 7: Run the view tests to verify pass**

Run: `pytest affordability/tests/views/test_overview.py -v`
Expected: PASS (all six).

- [ ] **Step 8: Run the WHOLE suite**

Run: `pytest`
Expected: PASS — the new overview tests plus all pre-existing tests (100 before; ~120 after).

- [ ] **Step 9: Manual smoke test (recommended)**

```bash
python manage.py runserver
```
Log in (`test@example.com` / `password123`), import `01_valid_jan_feb.csv` and
`04_valid_mar_apr.csv`, open `/statements/`, click **View financial overview**, try the
3/6/12 presets and a custom range, and confirm the coverage line, missing-month note,
summary, and bar visual render.

- [ ] **Step 10: Checkpoint** — stage and pause.

```bash
git add affordability/views.py affordability/urls.py \
        affordability/templates/statements/overview.html \
        affordability/templates/statements/index.html \
        affordability/tests/views/test_overview.py
# feat(overview): overview page with range selection, coverage, and bar visual
```

---

## Self-review (completed by plan author)

- **Spec coverage:** §3 no model change (no migration task) · §4 pure `build_overview` + dataclasses (Task 1) · §5 `build_user_overview` adapter (Task 3) · §6 range resolution: preset anchored to latest statement, custom, default fallback (Task 2 `resolve_overview_range` + Task 4 form parsing/validation) · §7 view + URL ordering + `overview.html` (controls, coverage line, missing months, summary, bar visual) + index link (Task 5) · §8 edge/error handling: no statements, empty range, invalid params → 6-month fallback, `from > to` error (Tasks 4–5 tests) · §9 derive-on-demand/transparency (nothing persisted; coverage + missing months shown — Tasks 1, 5) · §10 testing across pure core, resolver, adapter, form, view (Tasks 1–5).
- **Placeholders:** none — every step has runnable code/commands.
- **Type consistency:** `month_end`, `months_back`, `_months_in_range`, `OverviewMonth`, `Overview` (incl. `max_abs_disposable`, `missing_months`, `months`), `build_overview(month_inputs, requested_start, requested_end)`, `resolve_overview_range(range_choice, latest_period, from_period, to_period)`, `build_user_overview(statements, requested_start, requested_end)`, `OverviewRangeForm` (`range`/`from_month`/`to_month` → `from_period`/`to_period`), URL name `overview`, and template context keys `form`/`overview`/`has_statements` are used identically across tasks.
- **Decimal/2dp:** all sums seed with `Decimal("0.00")`; averages/ratios quantized to `TWO_PLACES`; money rendered via the `money` filter.
- **`month_end` relocation:** moved into `assessment.py` (pure) and re-imported by `forms.py`; Task 1 Step 5 runs the form/model suites to confirm no regression.
```
