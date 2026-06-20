# Financial Overview (range summary) — Design Spec

**Date:** 2026-06-19
**App:** `python_example/` (Django) — `affordability`
**Status:** Proposed (pre-implementation).
**Builds on:** `2026-06-14-affordability-design.md` (assessment + trend + CSV import).

---

## 1. Goal & scope

Let a customer ask for a **roll-up of their financial position across a range of
months** — the last 3, 6, or 12 months, or a custom from/to range — on a dedicated
**Overview** page reached from a button on the statements list.

The existing "Your position" section on the statements page shows a per-month table for
*all* the user's statements. The Overview is different: it answers "over *this* window,
how am I doing overall?" with **aggregated cashflow figures** plus a lightweight visual,
and it is **transparent about which months it covers** (including any months in the
range that have no statement).

### MoSCoW

- **Must:** a separate Overview page; preset ranges (3/6/12 months) and a custom
  from/to month range; aggregated cashflow figures over the range; show the covered span
  and any missing months; tests that protect real behaviour.
- **Should:** amount-aware, supportive wording consistent with the rest of the app;
  a plain-HTML visual of money left over per month; robust handling of empty ranges and
  invalid query params (never a 500).
- **Won't (now):** charting libraries; balances/overdraft on this page (flows only);
  storing any derived overview; CSV-export of the overview; spending-category breakdown.

---

## 2. Key decisions (settled in brainstorming)

1. **Content:** aggregated cashflow figures for the range **plus a simple HTML bar
   visual** of money left over per month. No chart library.
2. **Preset anchor:** "last N months" is anchored to the user's **most recent
   statement**, not today's month — so presets always land on real data.
3. **Custom selection:** preset buttons (3/6/12) **plus** a from/to **month-dropdown**
   form (covers "a year" and any contiguous range; no separate calendar-year picker).
4. **Balance basis:** **flows only** — no running start/end balance on this page (avoids
   the question of carrying a prior overdraft into a partial window). Balances stay on
   the per-statement and full-trend views.
5. **Empty months in range:** **ignored** for all aggregates and averages (consistent
   with how `build_trend` already excludes `no_data` months), **but surfaced** so the
   user knows which months are and aren't included.

---

## 3. Data model

**No changes, no migration.** The overview is derived on demand from existing
`Statement`/`Transaction` rows — consistent with "affordability is calculated, not
stored". Reuses `statement_totals` for per-month income/expenditure.

---

## 4. Pure core — `affordability/assessment.py` (new code)

A new frozen dataclass and a pure builder, alongside `assess` / `build_trend`. No ORM in
the core function — fully unit-testable.

### Result type

```python
@dataclass(frozen=True)
class Overview:
    requested_start: date          # month-end of the first month in the requested range
    requested_end: date            # month-end of the last month in the requested range
    months_with_data: int          # count of months in range that have a statement w/ txns
    total_income: Decimal
    total_expenditure: Decimal
    net_position: Decimal              # total_income - total_expenditure (period net)
    average_disposable_income: Decimal | None   # mean money-left-over per data month; None if no data
    expenditure_ratio: Decimal | None # overall total_expenditure/total_income*100; None if income 0
    months_in_surplus: int
    months_in_deficit: int
    trajectory: str                    # "improving" | "worsening" | "stable" | "n/a"
    missing_months: list               # month-end dates in range with NO statement
    months: list                       # OverviewMonth per data month, ordered, for the visual
```

```python
@dataclass(frozen=True)
class OverviewMonth:
    period: date
    total_income: Decimal
    total_expenditure: Decimal
    disposable_income: Decimal     # money left over (may be negative)
    status: str
    status_label: str
```

### `build_overview(month_inputs, requested_start, requested_end) -> Overview`

- `month_inputs`: the `MonthInput`s (existing NamedTuple) for **statements that fall in
  the range** — the view supplies only these.
- `requested_start` / `requested_end`: **month-end dates** bounding the requested range
  (the view computes these from the preset/custom selection).
- **Enumerate** every calendar month from `requested_start` to `requested_end`
  inclusive. A month is *covered* if there is a `MonthInput` for it with
  `has_transactions=True`; otherwise it is **missing** (no statement, or a statement with
  no transactions → treated as missing for coverage purposes). `missing_months` =
  month-end dates of all uncovered months, ordered.
- **Aggregate over data months only** (drop `no_data`): `total_income`,
  `total_expenditure`, `net_position`, `months_in_surplus`/`months_in_deficit` (via the
  existing `assess` per month and `STATUS_*`), `average_disposable_income`
  (`net_position / months_with_data`, quantized to 2 dp; `None` if no data),
  `expenditure_ratio` (`None` when `total_income == 0`).
- **trajectory:** reuse the existing rule — compare the last two *data* months'
  `disposable_income`; `"n/a"` when fewer than two data months.
- Reuses module constants/labels: `STATUS_*`, `STATUS_LABELS`, `TWO_PLACES`.

> **Reuse note:** the per-month `assess()` call and the trajectory/surplus-count logic
> are shared in spirit with `build_trend`. We keep `build_overview` separate (no running
> balance, plus coverage/missing-month logic) rather than overloading `build_trend`.

---

## 5. ORM adapter — `affordability/assessment.py`

```python
def build_user_overview(statements, requested_start, requested_end):
    months = [MonthInput(s.statement_period, *statement_totals(s)) for s in statements]
    return build_overview(months, requested_start, requested_end)
```

`statements` are **already filtered to the range** by the view. `statement_totals`
returns `(income, expenditure, has_transactions)`, matching `MonthInput`'s fields.

---

## 6. Range resolution (view-level)

Driven by **GET query params** so the page is bookmarkable/shareable:

- `?range=3` | `?range=6` | `?range=12` — presets.
  - `requested_end` = the user's **most recent statement's** `statement_period`
    (already a month-end).
  - `requested_start` = month-end of the month `N-1` months before `requested_end`.
- `?range=custom&from=YYYY-MM&to=YYYY-MM` — custom.
  - `requested_start` = month-end of `from`'s month; `requested_end` = month-end of
    `to`'s month.
- **Default** (no/blank/invalid `range`): behave as `range=6`.
- **No statements at all:** there is no anchor — render the empty-state message
  (§8); do not attempt a range.

A small reusable helper `month_end(year, month)` already exists in `forms.py`; reuse it
(import or move to a shared spot — implementation plan decides). Statements are filtered
with `requested_start <= statement_period <= requested_end`.

### Form — `OverviewRangeForm` (plain `forms.Form`, GET-bound)

- `range` — `ChoiceField` (`3` / `6` / `12` / `custom`); default `6`.
- `from_month`, `to_month` — `ChoiceField`s listing selectable months (the user's
  available statement months, or the last 24 months — plan decides; mirror the
  `StatementForm` month-dropdown pattern and `month_end` storage).
- Validation: when `range == "custom"`, both `from_month`/`to_month` are required and
  `from_month <= to_month`; otherwise a friendly field error and the controls stay.
  Preset values need no extra validation.

Preset buttons may be rendered as simple links (`?range=3` etc.); the custom selection
submits the form via GET. Both routes land on the same view.

---

## 7. View, URL, template

### URL — `affordability/urls.py`

```python
path('statements/overview/', views.overview, name='overview'),
```

Placed **before** the `statements/<int:statement_id>/` route (same care taken for the
import routes) so `overview` is not captured as a statement id.

### View — `affordability/views.py`

```python
@login_required
def overview(request):
    statements = list(Statement.objects.filter(user=request.user)
                      .order_by('statement_period'))
    # resolve range (preset anchored to most recent statement, or custom) -> (start, end)
    # filter statements to [start, end]; build_user_overview(...); render
```

- Reads GET params via `OverviewRangeForm`.
- No statements → render `overview.html` with an empty state, no overview object.
- Otherwise resolve the range, filter, build the overview, render.

### Template — `affordability/templates/statements/overview.html`

`{% load money_format %}`. Sections:

1. **Heading** "Your financial overview".
2. **Range controls:** Last 3 / 6 / 12 months links + the custom from/to form
   (highlight the active selection).
3. **Coverage line:** "Covering **{requested_start month} – {requested_end month}**
   ({months_with_data} month(s) with data)." When `missing_months` is non-empty:
   "No statement for: **Mar 2026, May 2026**" so the user knows exactly which months the
   figures exclude.
4. **Summary block:** total income, total spending, net position, average money left
   over per month, months in surplus / deficit, overall spending %, and an
   **amount-aware trajectory sentence** reusing the honest wording from the statements
   page (never "trending up" when the average is negative).
5. **Visual:** a plain-HTML horizontal **bar chart** of money left over per month — one
   row per data month, bar width = `abs(disposable_income)` scaled to the range's max
   absolute value, surplus vs deficit styled differently (e.g. colour + ▲/▼). Inline
   styles/CSS only; **no JavaScript, no chart library**.
6. **Back to statements** link.

All money rendered via the existing `money` filter; percentages shown as the
assessment already does (`—` when not available).

### Button on the statements page — `statements/index.html`

Add an Overview link to the existing action row (next to Import / Create new statement):

```html
<a href="{% url 'overview' %}"><strong>View financial overview</strong></a>
```

(Default view = last 6 months.)

---

## 8. Edge & error handling

- **No statements at all:** "You don't have any statements yet — import a bank statement
  or create one to see your overview." + links. No 500.
- **Range with no data months** (e.g. a custom range entirely before/after the user's
  data): "We don't have any statements in this range yet." + the coverage line still
  shows the requested span. No aggregates rendered.
- **Single data month:** `trajectory = "n/a"`; `average_disposable_income` = that
  month's figure. Visual shows one bar.
- **Income £0 across the range:** overall `expenditure_ratio` is `None` → "not
  available".
- **Invalid / missing query params:** silently fall back to last 6 months.
- **Custom `from > to`:** friendly form error; controls remain; no crash.
- All amounts remain `Decimal`, 2 dp (guaranteed upstream by import/manual entry).

---

## 9. FCA / data-handling notes

- **Derive on demand:** the overview stores nothing; every figure is recomputed from
  source transactions and traceable to the months listed.
- **Transparency:** the page states the exact span and any missing months, so the user
  is never misled about what the totals cover.
- **Supportive surfacing:** non-judgmental, amount-aware copy; consistent with the
  deficit/surplus tone used elsewhere.

---

## 10. Testing

- **Pure `build_overview`:** totals & net; average over data months only; ratio `None`
  when income 0; surplus/deficit counts; trajectory improving/worsening/stable/n/a;
  empty `month_inputs`; ignores `no_data` months; **missing-month detection** (gap in the
  middle; range extending past data on either side); single data month; ordering of
  `months` and `missing_months`.
- **ORM `build_user_overview`:** builds correctly from real `Statement`s filtered to a
  range.
- **Range resolution helper:** preset anchored to most recent statement (3/6/12); custom
  from/to; default fallback; invalid params → 6 months; `from > to` handled.
- **View:** Overview button present on the statements page; overview renders summary +
  coverage line + visual for a preset; custom range filters correctly and lists missing
  months; empty-range and no-statements messages; invalid params don't 500; login
  required (302 when anonymous).
- **Template/visual:** bars render with scaled widths; money is `money`-formatted;
  missing-months note shown only when applicable.

---

## 11. Out of scope (future)

- Charts via a real charting library / richer visualisation.
- Balances/overdraft on the overview (kept flows-only by design).
- Spending-category breakdown within the range.
- Exporting the overview (PDF/CSV).
- Comparing two ranges side by side.
