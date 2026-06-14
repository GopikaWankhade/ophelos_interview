# Affordability Assessment & Bank CSV Import — Design Spec

**Date:** 2026-06-14
**App:** `python_example/` (Django) — `affordability`
**Status:** **Implemented.** This document was updated after the build to reflect the
final implementation. The design evolved during implementation — most notably, the
originally-planned stored-debt "affordable repayment" guide was replaced by an
**overdraft model** (a negative running balance). See `DECISIONS.md` for the rationale
and `SESSION_LOG.md` for the history.

---

## 1. Goal & scope

Customers record monthly income/expenditure. We added:

1. A **meaningful affordability assessment** shown to the customer.
2. **Tracking of financial position over time** (month to month).
3. A **bank-statement CSV import** so customers can load real data instead of
   hand-typing one date and five transaction lines.

All of this in an **FCA-regulated context**: supportive surfacing, careful data
handling, and figures that are explainable and reproducible.

### MoSCoW (as built)

- **Must:** per-statement assessment (income, expenditure, disposable income,
  expenditure-to-income ratio, status); track position over time; tests that protect
  real behaviour.
- **Should:** thoughtful edge cases (zero income, deficit, overdraft); customer-
  appropriate presentation for people in financial difficulty; FCA-aware data handling;
  CSV import.
- **Won't (now):** stored debt / pro-rata repayment allocation; interest modelling;
  charting libraries; daily-granularity statements; auth changes; column-mapping import UI.

---

## 2. Data model

`affordability/models.py`.

- **`Transaction.amount`**: `DecimalField(max_digits=10, decimal_places=2,
  validators=[MinValueValidator(Decimal("0.00"))])`. Real money; **all arithmetic uses
  `Decimal` — never float.**
- **`Transaction.transaction_date`**: `DateField(null=True, blank=True)` — the real
  per-row date from a CSV; used for monthly grouping; null for manual entries.
- **`Transaction.description`**: `CharField(max_length=100)`.
- **`Statement`**: `user`, `statement_period` (a **month-end** date), `created_at`,
  `updated_at`. A **`UniqueConstraint(user, statement_period)`** enforces one statement
  per month. `clean()` rejects a period **later than the current month** (month
  granularity, so the current in-progress month is allowed).

There is **no stored debt field** — debt is represented as a negative running balance
(see §4).

Migrations: `0002` (Decimal amount, `transaction_date`), `0003` (drop the short-lived
`total_outstanding_debt`), `0004` (unique constraint).

---

## 3. Core: affordability assessment service (approach A)

A standalone, **pure** module `affordability/assessment.py` — no ORM/DB needed for the
maths. Single source of truth, fully unit-testable.

### Result type

```python
@dataclass(frozen=True)
class AffordabilityAssessment:
    total_income: Decimal
    total_expenditure: Decimal
    disposable_income: Decimal          # surplus; may be negative
    expenditure_ratio: Decimal | None   # percentage; None when income == 0
    status: str                         # "no_data" | "deficit" | "tight" | "surplus"
    message_key: str                    # drives customer-facing copy
```

### Definitions

- `total_income` / `total_expenditure` = sums by category.
- `disposable_income` = `total_income − total_expenditure` (may be negative).
- `expenditure_ratio` = `total_expenditure / total_income × 100`, to 2 dp, **only when
  income > 0** (else `None` — no division by zero).
- **status:** `no_data` (no transactions) · `deficit` (surplus < 0) · `tight`
  (`0 ≤ surplus ≤ MIN_SURPLUS_THRESHOLD`) · `surplus` (surplus > threshold).

`assess(total_income, total_expenditure, has_transactions)` returns the dataclass.
ORM adapters: `statement_totals(statement)` and `assess_statement(statement)`.

Module constants: `MIN_SURPLUS_THRESHOLD = Decimal("0.00")`, `TWO_PLACES`, and
`STATUS_LABELS` (status → plain-language label, e.g. `"Surplus"`).

> **Removed during implementation:** the stored-debt "affordable repayment" guide
> (`suggested_repayment`, `months_to_clear`, `AFFORDABLE_FRACTION`). Replaced by the
> overdraft model + the over-time summary (DECISIONS.md).

---

## 4. Tracking over time (overdraft model)

`affordability/assessment.py`:

- `MonthInput(period, total_income, total_expenditure, has_transactions)`.
- `TrendPoint(period, total_income, total_expenditure, disposable_income,
  expenditure_ratio, status, status_label, start_balance, end_balance)`.
- `Trend(points, trajectory, average_disposable_income, months_in_surplus,
  months_in_deficit)`.
- `build_trend(months)` — orders by `period`, and maintains a **running balance**:
  `start_balance` carries in (first month starts at **£0**), `end_balance =
  start_balance + disposable_income`. The balance **can go negative** — that negative
  balance is the customer's **overdraft**.
- **Summary** ignores `no_data` (empty) months so they don't dilute the figures:
  `average_disposable_income` (mean over months with data), `months_in_surplus` /
  `months_in_deficit`, and `trajectory` (`improving`/`worsening`/`stable`/`n/a`) from the
  last two months that have data.
- `build_user_trend(statements)` is the ORM adapter.

---

## 5. Views & templates (presentation + FCA tone)

- **`view_statement`** renders the assessment **with the working shown** (start balance,
  total income, total spending, money left over, end balance, spending %), status copy,
  and — when the month's `end_balance < 0` — a clear **"overdrawn by £X"** note. Deficit
  statements **signpost free debt advice** (MoneyHelper, StepChange, National Debtline).
  A short disclaimer ("guidance, not a credit or affordability decision") is shown
  **only on deficit**.
- **`statements` index** shows a **Your position** section: a summary (amount-aware
  trend sentence — never "trending up" when the average is negative — plus average money
  left over and months in surplus/deficit) and a table:
  **Month · Start balance · Income · Total spending · Money left over · Spending %
  · Status**. Plain HTML, no chart library. Import and manual entry are both linked at
  the top.
- **`new_statement`** uses a **month dropdown** (`StatementForm`) listing the last 12
  months with already-recorded months excluded; the choice is stored as that month's
  **last day**. Up to five transactions via the inline formset; amounts are rounded to
  2 dp and must be > 0.
- Customer copy lives in `affordability/messaging.py` (`status → message` map + signposts
  + disclaimer). Money is rendered via a `money` template filter
  (`affordability/templatetags/money_format.py`) — thousands separators, 2 dp, sign
  before the £ (e.g. `-£580.50`).

---

## 6. Bank CSV import

### 6.1 Behaviour

- **Row mapping:** parse row dates, **group by calendar month**, create/update one
  `Statement` per month (`statement_period` = month-end). A multi-month CSV produces
  multiple monthly statements and powers the trend.
- **Format:** columns `date`, `description`, and **separate `debit` / `credit`** (debit
  = money out → **expenditure**, credit = money in → **income**). Tolerant parsing:
  case-insensitive headers, common aliases, **UK day-first** dates, amount cleaning
  (`£`, thousands commas).
- **Manual entry:** kept as a fallback (month dropdown, §5).
- **Existing months:** **preview before commit**, with a per-month **Replace / Skip**
  choice. No silent duplicates or data loss.

### 6.2 File lifecycle & storage

- On upload, **stream the file to a private temp directory** (`<BASE_DIR>/.import_tmp/`,
  gitignored, **not** web-served). Filename = an unguessable **UUID**.
- The **session stores only a token** (the temp filename) — never file contents/parsed
  rows.
- **Two-step flow:** upload → save temp → parse for preview (token in session); confirm
  → verify the token → re-read → commit inside `transaction.atomic()`.
- **Delete the temp file on success and on every failure path.**
- **`clear_stale_imports()`** sweep (TTL ~1 hour) runs on each upload; also a management
  command (`python manage.py clear_stale_imports`) — backstop for abandoned imports.

### 6.3 Components (package: `affordability/csv_import/`)

- **`parser.py`** (pure, no DB): `parse_bank_csv(text, today) -> ParsedImport` (tolerant
  headers; per-row parse/validate; classify debit→expenditure / credit→income; collect
  `row_errors` instead of raising; `file_error` for fatal problems) and
  `group_by_month(rows) -> list[MonthGroup]` (totals per month). Dataclasses
  `ParsedRow` / `RowError` / `ParsedImport` / `MonthGroup`. Constants `MAX_AMOUNT`
  (`99999999.99`, mirrors the field), `DESCRIPTION_MAX_LENGTH` (100), day-first
  `DATE_FORMATS`, and a numeric-only amount regex.
- **`service.py`** (effectful): temp-file lifecycle (`save_upload_to_temp`, `read_temp`,
  `temp_exists`, `delete_temp`, `temp_path` with token validation, `clear_stale_imports`)
  and `commit_import(user, month_groups, choices) -> ImportResult` (create per month +
  transactions, honouring Replace/Skip — only an explicit `"replace"` overwrites — all
  atomic).
- `CsvUploadForm` (`FileField`) — validates `.csv` extension and **size cap**; `read_temp`
  decodes UTF-8 (handles BOM via `utf-8-sig`).
- URLs `statements/import/` and `statements/import/confirm/`; templates `import.html`,
  `import_preview.html`.

### 6.4 Failure handling

- **Never** show a stack trace — always plain-English, supportive copy; technical detail
  logged server-side. **File-level** failures block (back to upload, nothing imported);
  **row-level** problems are reported in the preview and excluded so valid rows proceed.
  Both views have catch-alls so nothing leaks a 500; the temp file is deleted on every
  path.

**File-level (block, friendly message):** not a `.csv` / wrong content · too large ·
can't decode · empty / no data rows · missing columns (lists found headers) · malformed
CSV · no valid rows.

**Row-level (excluded, shown in preview):** unparseable or **ambiguous/US-style** date ·
**future-dated** · both **and** neither debit & credit · non-numeric / **NaN** /
**scientific notation** · **negative** · **zero** ("more than 0") · **too large**
(> field max). Over-long descriptions are **truncated** to 100 chars.

**Commit / session:** DB error → atomic rollback → "no changes were made"; missing/expired
session token → "your import session expired"; catch-all → "we couldn't process this
file" + server log.

---

## 7. FCA / data-handling summary

- **Data minimisation:** no derived "decision" is stored — the assessment is recomputed
  from source transactions (reproducible, auditable). The raw bank file is held only
  transiently in an access-controlled, non-public temp area and deleted on completion or
  failure, with a stale sweep as a safety net.
- **Transparency:** the working is always shown; the customer **previews and confirms**
  before any import is written.
- **Supportive surfacing:** non-judgmental, amount-aware copy; deficit months signpost
  free debt advice; a "guidance, not a credit/affordability decision" disclaimer is shown
  on deficit.

---

## 8. Testing (must: protect real behaviour)

~100 tests, organised under `affordability/tests/` (mirrors the code):

- **`assessment/`** — `assess` (totals, surplus, ratio, zero-income no-divide, status
  including the −0.01 / 0.00 / +0.01 boundaries); `build_trend` (running balance,
  ordering, trajectory, summary stats, `no_data` months excluded, status label, spending
  ratio); ORM adapters; `messaging`.
- **`csv_import/`** — parser (debit/credit classification, header aliases, £/comma
  cleaning & 2dp rounding, day-first wins / ambiguous-US rejected, zero / too-large /
  NaN / scientific rejected, future-date exclusion, BOM, file-level errors, month
  grouping); service (temp-file round-trip & token validation, stale sweep + command,
  commit create/skip/replace/unknown-choice, **atomic rollback** incl. the replace path
  restoring prior data).
- **`forms/`** — statement month dropdown (offers 12 months incl. current, excludes
  taken, accepts a valid month → stored month-end, rejects a taken month); transaction
  amount (zero/negative rejected, rounding); CSV upload (extension/size).
- **`models/`** — Decimal amount & negative rejection, optional `transaction_date`,
  current month allowed, **duplicate month rejected**, future month rejected.
- **`views/`** — import upload→preview→confirm, Replace/Skip, preview reports skipped
  rows, session-expired & commit-failure messages, temp file deleted on success / parse
  failure / rollback, success message shown once on statements; statement view
  (assessment, start/end balances, deficit signposting + overdraft flag + deficit-only
  disclaimer); statements index (trend table, summary, amount-aware messaging).
- **`templatetags/`** — `money` / `absval` (formatting, negatives, none/empty/non-numeric).

### Edge-case matrix (assessment & balance)

| Case | Behaviour |
|---|---|
| No transactions | `no_data`; prompt to add/import |
| income 0, expenditure 0 | `no_data` |
| income 0, expenditure > 0 | `deficit`; ratio `N/A`; signpost |
| expenditure > income | `deficit`; signpost; balance falls |
| surplus == 0 / ≤ threshold | `tight` |
| surplus > threshold | `surplus` |
| cumulative spending > income over time | running `end_balance` goes **negative (overdraft)**; "overdrawn by £X" shown |
| zero / negative / NaN / too-large amount (import or manual) | rejected with a clear message |

---

## 9. Out of scope (future improvements)

- A stored-debt "affordable repayment" guide (built then removed in favour of the
  overdraft model).
- Essential vs non-essential spending split / full Standard Financial Statement (SFS).
- Interest modelling.
- Multiple debts / creditor-level views.
- Reading a running "Balance" column from the CSV (we derive it instead).
- Charts / visualisation for the trend.
- Editing or deleting statements/transactions after creation.
- Column-mapping import UI for arbitrary bank layouts.
