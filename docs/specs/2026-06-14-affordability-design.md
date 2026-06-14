# Affordability Assessment & Bank CSV Import — Design Spec

**Date:** 2026-06-14
**App:** `python_example/` (Django) — `affordability`
**Status:** Approved design, ready for implementation planning

---

## 1. Goal & scope

Customers record monthly income/expenditure. We are adding:

1. A **meaningful affordability assessment** shown to the customer.
2. **Tracking of financial position over time** (month to month).
3. A **bank-statement CSV import** so customers can load real data instead of
   hand-typing one date and five transaction lines.

All of this in an **FCA-regulated context**: supportive surfacing, careful data
handling, and decisions that are explainable and reproducible.

### MoSCoW

- **Must:** per-statement assessment (income, expenditure, disposable income,
  expenditure-to-income ratio); track position over time; tests that protect real
  behaviour.
- **Should:** thoughtful edge cases (zero income, deficit); customer-appropriate
  presentation for people in financial difficulty; FCA-aware data handling and
  surfacing; affordable-repayment guide when the customer is in debt; CSV import.
- **Won't (now):** multiple-debt model with pro-rata allocation; interest
  modelling; charting libraries; daily-granularity statements; auth changes;
  migrating to a column-mapping import UI.

---

## 2. Data model changes

`affordability/models.py` + one migration.

- **`Transaction.amount`**: `PositiveIntegerField` → `DecimalField(max_digits=10,
  decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])`.
  Real money; non-negative. **All arithmetic uses `Decimal` — never float.**
- **`Transaction.transaction_date`**: new `DateField(null=True, blank=True)`.
  Real per-row date from CSV; used for monthly grouping; left null for manual
  entries.
- **`Statement.total_outstanding_debt`**: new `DecimalField(max_digits=10,
  decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])`.
  Optional; captured per monthly snapshot so debt can trend down over time.

Existing tests use integer amounts (`1000`, `100`); these compare equal to
`Decimal` and remain valid.

---

## 3. Core: affordability assessment service (approach A)

A standalone, **pure** module `affordability/assessment.py` — no ORM/DB needed for
the math. This is the single source of truth and is fully unit-testable.

### Result type

```python
@dataclass(frozen=True)
class AffordabilityAssessment:
    total_income: Decimal
    total_expenditure: Decimal
    disposable_income: Decimal          # surplus; may be negative
    expenditure_ratio: Decimal | None   # None when income == 0
    status: str                         # "no_data" | "deficit" | "tight" | "surplus"
    suggested_repayment: Decimal | None # None unless eligible
    months_to_clear: int | None         # None unless repaying
    message_key: str                    # drives customer-facing copy
```

### Definitions

- `total_income` = sum of `amount` where category == income.
- `total_expenditure` = sum of `amount` where category == expenditure.
- `disposable_income` = `total_income − total_expenditure` (may be negative).
- `expenditure_ratio` = `total_expenditure / total_income` **only when income > 0**,
  else `None` (no division by zero). Displayed as a percentage.
- **status:**
  - `no_data` — no transactions.
  - `deficit` — surplus < 0.
  - `tight` — `0 ≤ surplus ≤ MIN_SURPLUS_THRESHOLD`.
  - `surplus` — surplus > `MIN_SURPLUS_THRESHOLD`.

### Affordable repayment guide

Shown **only** when `status == "surplus"` **and** `total_outstanding_debt > 0`:

- `suggested_repayment = (disposable_income × AFFORDABLE_FRACTION)`, **rounded down**
  (`ROUND_FLOOR`, conservative), **capped at** `total_outstanding_debt`.
  Keeping a fraction of surplus *is* the safety buffer.
- `months_to_clear = ceil(total_outstanding_debt / suggested_repayment)` — flagged
  **illustrative** (ignores interest).
- Framed as **guidance, not a demand** — the customer decides.

### Tunable constants (module-level, documented)

- `AFFORDABLE_FRACTION = Decimal("0.5")`
- `MIN_SURPLUS_THRESHOLD = Decimal("0.00")`

---

## 4. Tracking over time

`affordability/assessment.py` → `build_trend(statements)` — pure function over a
user's statements:

- Order by `statement_period`.
- Per month: `{period, income, expenditure, surplus, status}`.
- `delta` vs the previous month's surplus.
- Overall `trajectory` label: `improving` / `worsening` / `stable`, from the sign of
  the latest surplus change.
- Handles single-statement and empty inputs.

---

## 5. Views & templates (presentation + FCA tone)

- **`view_statement`** renders the assessment **with the working shown** (income,
  expenditure, surplus, ratio), then status-appropriate copy:
  - `surplus` + debt → suggested repayment, explained ("based on your £X surplus,
    keeping a buffer"), framed as guidance; plus illustrative months-to-clear.
  - `surplus`, no debt → positive position acknowledged; no repayment guide.
  - `deficit` / `tight` → **no repayment figure**; supportive, non-judgmental
    message + **signpost free debt advice** (MoneyHelper, StepChange, National
    Debtline).
  - `no_data` → neutral prompt to add transactions / import a CSV.
- **`statements` index** gains a compact **trend table** (month, surplus, ▲/▼ delta,
  trajectory) — plain HTML, no chart library. CSV import is the **primary** action;
  manual entry remains as fallback.
- Customer copy lives in a small `status → message` map (centralised, testable).
- Short disclaimer: *illustrative guidance, not a lending/affordability decision,
  excludes interest.*

---

## 6. Bank CSV import

### 6.1 Behaviour decisions

- **Row mapping:** parse row dates, **group by calendar month**, create/update one
  `Statement` per month. A multi-month CSV produces multiple monthly statements and
  directly powers the trend.
- **Format:** documented columns `date`, `description`, and **separate `debit` /
  `credit`** columns (debit = money out → **expenditure**, credit = money in →
  **income**). Tolerant parsing: case-insensitive headers, common aliases, a couple
  of date formats, amount cleaning (`£`, thousands commas).
- **Manual entry:** kept; CSV is the prominent path, manual is the fallback.
- **Existing months:** **preview before commit**, with a per-month **Replace / Skip**
  choice. No silent duplicates or data loss.

### 6.2 File lifecycle & storage

- On upload, **stream the file to a private temp directory** (e.g.
  `<BASE_DIR>/.import_tmp/`, gitignored, **not** web-served). Filename = an
  unguessable **UUID**.
- The **session stores only a token** (the temp filename), tied to the owning user —
  never file contents or parsed rows.
- **Two-step flow:**
  1. **Upload** → save temp file → parse for preview → token in session.
  2. **Confirm** → verify the user owns the token → re-read temp file → commit inside
     `transaction.atomic()`.
- **Delete the temp file as soon as work is done** — on success (after commit) and on
  **every failure path**, via a context manager / `try…finally`.
- **`clear_stale_imports()`** sweep deletes temp files older than a short TTL
  (e.g. 1 hour), run on each new upload; plus an optional management command — a
  backstop for abandoned (previewed-but-never-confirmed) imports.

### 6.3 Components

- `affordability/csv_import.py` (**pure, no DB**):
  - `parse_bank_csv(text) -> ParsedImport` — tolerant header detection; per-row
    parse/validate; classify debit→expenditure, credit→income; collect row-level
    errors instead of raising; return parsed rows + `file_error` + `row_errors`.
  - `group_by_month(parsed)` — group valid rows by month; build per-month summary
    (counts, total income/expenditure, surplus).
- `commit_import(user, grouped, choices)` — thin persistence orchestrator: create
  `Statement` per month (`statement_period` = last day of month) + `Transaction`s,
  honouring Replace/Skip, atomic.
- `CsvUploadForm` (`FileField`) — validates extension, content, **size cap**,
  encoding (handles UTF-8 BOM).
- URLs: `statements/import/` (upload+preview), `statements/import/confirm/`.
- Templates: `import.html`, `import_preview.html`.

### 6.4 Failure handling

**Principles:**
- Never show a stack trace/raw exception to the customer — always plain-English,
  supportive, actionable copy. Technical detail logged server-side only.
- Separate **file-level failures** (fatal → back to upload, nothing imported) from
  **row-level problems** (non-fatal → shown in preview, those rows excluded, rest can
  proceed).
- Parser returns structured errors for *expected* problems; the view has a catch-all
  for the *unexpected* so no failure leaks a 500/traceback. Temp file deleted on
  every path.

**File-level failures (block, friendly message, stay on upload):**

| Cause | Message to user |
|---|---|
| Not a `.csv` / wrong content | "That doesn't look like a CSV file — please upload the `.csv` your bank exported." |
| Too large (> size cap) | "This file is too large (max N MB). Please upload a smaller export." |
| Can't decode (bad encoding) | "We couldn't read this file. Please make sure it's a CSV exported from your bank." |
| Empty / no data rows | "This file looks empty — please check your export and try again." |
| Missing required columns | "We couldn't find the expected columns. The file needs **date**, **description**, and **debit and/or credit**. We found: *<headers>*." |
| Malformed CSV (parse error) | "We couldn't read this file — it may be corrupted. Please re-export and try again." |
| No valid rows at all | "We couldn't read any valid transactions from this file (N rows had problems)." |

**Row-level problems (non-fatal, shown in preview, row excluded):** unparseable
date; row with both/neither debit & credit; non-numeric or negative amount;
future-dated row (would violate `Statement`'s no-future rule). Preview shows a count
and the first few offending rows with row numbers.

**Commit-time & session failures:**
- DB error during commit → `transaction.atomic()` rolls back fully → "Something went
  wrong saving your import — no changes were made. Please try again."
- Session expired / token mismatch between preview and confirm → "Your import session
  expired. Please upload the file again."
- Catch-all unexpected exception at the view boundary → "We couldn't process this
  file. Please check it and try again." + server-side log.

---

## 7. FCA / data-handling summary

- **Data minimisation:** no derived "decision" is stored — the assessment is always
  recomputed from source transactions, so it is reproducible and auditable. The raw
  bank file is held only transiently in an access-controlled, non-public temp area and
  deleted immediately on completion or failure, with a stale sweep as a safety net.
- **Transparency:** always show the working; the customer **previews and confirms**
  before any import is written.
- **Supportive surfacing:** non-judgmental copy, repayment suppressed when
  unaffordable, signposting to free debt advice; clear "illustrative guidance, not a
  credit decision" disclaimer.

---

## 8. Testing strategy (must: protect real behaviour)

- **`assessment.py` unit tests (no DB):** every edge case below; Decimal precision &
  `ROUND_FLOOR` conservatism; division-by-zero on zero income; repayment **capped at
  debt**; `months_to_clear` ceil; threshold boundaries (exactly at / just above /
  just below).
- **`build_trend` tests:** ordering, deltas, trajectory labels, single & empty.
- **Model/form tests:** `amount` accepts `Decimal("100.50")`, rejects negative;
  existing integer tests still pass; `transaction_date` and `total_outstanding_debt`
  optional.
- **`csv_import` unit tests (no DB):** header aliases; date-format & amount cleaning
  (`£`, commas); debit→expenditure / credit→income classification; invalid-row
  collection; empty / missing-columns; UTF-8 BOM; month grouping & summary totals;
  future-date exclusion.
- **CSV view/integration tests:** upload→preview→confirm; Replace vs Skip applied;
  idempotent re-import with Replace; atomic rollback on simulated commit failure;
  each file-level failure asserts the **specific user message** and that **nothing is
  persisted**; row-level exclusion counts; no raw traceback ever surfaced; user
  isolation; temp file deleted on success, on parse failure, and on commit rollback;
  stale sweep removes old files; confirm with mismatched/expired token rejected; temp
  dir not web-served.
- **Assessment view tests:** assessment + working rendered; deficit shows signposting
  and **no** repayment; surplus+debt shows repayment; index shows trend; user
  isolation preserved.

### Edge-case matrix (assessment)

| Case | Behaviour |
|---|---|
| No transactions | `no_data`; prompt to add/import; no ratio/repayment |
| income 0, expenditure 0 | `no_data` |
| income 0, expenditure > 0 | `deficit`; ratio `N/A`; suppress repayment; signpost |
| expenditure > income | `deficit`; suppress; signpost |
| surplus == 0 / ≤ threshold | `tight`; supportive; no repayment |
| surplus > threshold, debt 0 | positive position; no repayment guide |
| surplus > threshold, debt > 0 | repayment guide + illustrative months-to-clear |
| negative amount | rejected by validator |

---

## 9. Out of scope (future improvements)

- Multiple-debt model with pro-rata repayment allocation.
- Interest-aware months-to-clear.
- Column-mapping import UI for arbitrary bank layouts.
- Charts/visualisation for the trend.
- Daily-granularity statements.
