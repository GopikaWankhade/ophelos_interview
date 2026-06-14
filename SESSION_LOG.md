# Session Log — Ophelos Affordability Task

A human-readable, turn-by-turn transcript of this pairing session: the user's
prompts (verbatim) and the assistant's outputs, including the clarifying questions
asked, the options offered, and the answers chosen.

---

## Turn 1 — Orientation & chat-history setup

**User:**
> read this project and get userself familiar with the code structure and the
> features which are already built. we are going to work on additional features.
> also we will have to maintain the chat history for this session, so that I can
> submit it. suggest a way to maintain it and keep in human readable form

**Assistant (summary of output):**
Explored the repo. Findings:
- A single **Django app** (`python_example/`) — the TypeScript example referenced
  in git history was removed in the `cleanup` commit.
- **Models:** `Statement` (user, `statement_period`; rejects future dates; `save()`
  can accept a `{year, month}` dict). `Transaction` (income/expenditure,
  description, `amount` as `PositiveIntegerField`).
- **Flow:** login → list statements → create statement + up to 5 transactions via
  inline formset → view a single statement.
- **Templates:** minimal, unstyled HTML. **Tests:** pytest for models/forms/views.
- **Notable gap:** affordability is never actually calculated.
- **Login:** `test@example.com` / `password123`.

For chat history, recommended a **curated Markdown log** (`SESSION_LOG.md`) over the
raw Claude Code JSONL transcript (noisy, not submission-friendly).

**Questions asked & answers chosen:**
- *How should I maintain the human-readable session log?* →
  **Curated MD, I update it** (later changed — see Turn 8).
- *What should the log emphasize?* → **Decisions & reasoning** (later changed to full
  transcript — see Turn 8).

Created `SESSION_LOG.md` with an initial entry.

---

## Turn 2 — Feature scoping (brainstorming)

**User:**
> lets scope the features now. for that load your brainstorming superpower and think
> as a system architech. currently we have a daily bank statements from the user
> which they can input in the product. we will have to add a features where user can
> see their financial health. Requirements
> **Must:** Calculate and display a meaningful affordability assessment to the
> customer; Allow customers to track their financial position over time; Be well
> tested. Tests should protect something real, not just assert happy paths.
> **Should:** Handle edge cases thoughtfully. What happens when income is zero, or
> expenditure exceeds income? Present information in a way that is appropriate for
> customers who may be in financial difficulty. Reflect the FCA-regulated context.
> Consider how data is handled, what is stored, and how decisions are surfaced to
> users.

**Assistant:** Invoked the `brainstorming` skill and asked clarifying questions one
at a time.

**Q1 — affordability metric.** Options: (A) Disposable income + ratio
[recommended]; (B) Essential vs non-essential; (C) Full Standard Financial
Statement (SFS).
→ **Answer:** "Go with Disposable income + ratio. however add the affordable
repayment guide as well if they are in debt".

**Q2 — time axis.** Noted tension: user said "daily" but model snaps to month-end.
Options: (A) Monthly snapshots, compare months [recommended]; (B) Monthly + richer
deltas; (C) Rework to daily entries.
→ **Answer:** "Monthly snapshots, compare months".

**Q3 — debt model.** Options: (A) Surplus-based guidance, no debt model
[recommended]; (B) Add total outstanding debt field; (C) Add a Debt model.
→ **Answer:** "Add total outstanding debt field".
(Assistant decided to place `total_outstanding_debt` on the `Statement`.)

**Q4 — deficit behaviour.** Options: (A) Suppress repayment, signpost support
[recommended]; (B) Show £0 guide + neutral explanation; (C) Show maths only.
→ **Answer:** "Suppress repayment, signpost support".

**Q5 — store vs derive.** Options: (A) Derive on demand, show the working
[recommended]; (B) Derive + persist snapshot; (C) Compute and store on model.
→ **Answer:** "Derive on demand, show the working".

**Assistant — approaches proposed:** (A) Pure assessment service module
[recommended]; (B) Methods on the `Statement` model; (C) Compute in view/template
[rejected]. Also proposed treating `amount` as whole pounds (integer arithmetic).

---

## Turn 3 — Decimal money + approach A

**User:**
> no keep the amounts in decimals as thats the real financial data. approach A looks
> good to me

**Assistant:** Acknowledged — switch `amount` to `DecimalField`; confirmed approach
A. Checked migration impact (existing integer-amount tests stay green; seed has no
transactions). Presented the full design in sections:
1. Scope (MoSCoW). 2. Data model changes. 3. Assessment service + result dataclass,
definitions, status values, repayment formula (×0.5, ROUND_FLOOR, capped at debt),
tunable constants. 4. `build_trend` over-time function. 5. Views/templates +
FCA-appropriate copy and signposting. 6. Edge-case table. 7. Testing strategy.
8. FCA/data-handling notes.

---

## Turn 4 — Add bank CSV import

**User:**
> currently this app is getting the statement from the user input for one date and 5
> lines of transactions. instead of that add a feature to diurectly import a csv file
> which user might export from their banks

**Assistant:** Returned to clarifying questions for the CSV feature.

**CSV Q1 — row mapping.** Options: (A) Auto-group rows by month [recommended];
(B) One statement for a chosen month; (C) One statement, ignore dates.
→ **Answer:** "Auto-group rows by month".

**CSV Q2 — format.** Options: (A) Canonical signed-amount format, tolerant parsing
[recommended]; (B) Separate debit/credit columns; (C) User column-mapping step.
→ **Answer:** "Separate debit/credit columns" (debit → expenditure, credit → income).

**CSV Q3 — manual entry.** Options: (A) Keep both, CSV primary [recommended];
(B) Replace manual with CSV only; (C) Keep manual primary, CSV secondary.
→ **Answer:** "Keep both, CSV is primary".

**CSV Q4 — import storage.** Options: (A) Parsed txns only + add transaction_date
[recommended]; (B) Parsed only, no date field; (C) Also store raw CSV file.
→ **Answer:** "Parsed txns only + add transaction date".

**CSV Q5 — existing month.** Options: (A) Preview + per-month Replace/Skip
[recommended]; (B) Append to existing; (C) Replace silently.
→ **Answer:** "Preview + per-month choice".

**Assistant — CSV addendum:** two-step upload→preview→confirm flow; pure
`csv_import.py` (parse + group by month) separated from a `commit_import`
persistence orchestrator; `CsvUploadForm`; new URLs/templates; deltas to model
(add `transaction_date`), edge cases, and testing.

---

## Turn 5 — Robust failure handling

**User:**
> it looks good, however what about failed cases. if the csv file read fails due to
> any reason the user should get a proper message

**Assistant — failure-handling design:**
- Principle: never show a stack trace; always plain-English, supportive, actionable
  copy; log technical detail server-side.
- Separate **file-level failures** (fatal → back to upload, nothing imported) from
  **row-level problems** (non-fatal → shown in preview, those rows excluded).
- File-level message table: not-a-CSV, too large, bad encoding, empty, missing
  columns, malformed CSV, no valid rows — each with a specific user message.
- Row-level: unparseable date, both/neither debit & credit, non-numeric/negative
  amount, future-dated.
- Commit/session failures: atomic rollback message; session-expired message;
  catch-all generic message + server log.
- Added matching tests.

---

## Turn 6 — Temp-file lifecycle instead of in-memory

**User:**
> when csv file is in session and code is reading it. we should keep that file in
> temp folder and after user comformation or before that whenever file reads are
> complete and data is in db, then delete the file. also on above failed cases. do
> this instead of keeping it in memory

**Assistant — revised storage & lifecycle:**
- On upload, stream the file to a **private, non-web-served, gitignored temp dir**
  (`<BASE_DIR>/.import_tmp/`) with a **UUID** filename. Session stores only a
  **token**, never contents.
- Two-step: upload→parse→preview (token in session); confirm→verify ownership→
  re-read→commit in `transaction.atomic()`.
- **Delete the temp file on success and on every failure path** (context manager /
  `try…finally`).
- `clear_stale_imports()` sweep (TTL ~1h) on each upload + optional management
  command, as a backstop for abandoned imports.
- Updated FCA note: raw file only transient and access-controlled; deleted
  immediately; data minimisation preserved.
- Added matching tests (deleted on success/parse-failure/rollback; stale sweep;
  token mismatch rejected; temp dir not web-served).

---

## Turn 7 — Write the spec (no commit)

**User:**
> yes, write up the spec now. dont commit any changes let me review the spec or any
> future code changes

**Assistant:**
- Recorded the **review-before-commit** preference (memory `no-commit-without-review`).
- Wrote the spec to
  `docs/superpowers/specs/2026-06-14-affordability-design.md` (§1 Goal/scope,
  §2 model, §3 assessment service, §4 trend, §5 views, §6 CSV import incl. lifecycle
  & failure matrix, §7 FCA, §8 testing + edge-case matrix, §9 out of scope).
- Self-reviewed (no placeholders, internally consistent, in scope, unambiguous).
- **Did not commit.** Asked the user to review the spec before moving to the
  implementation plan.

---

## Turn 8 — Make the session log a full transcript

**User:**
> in session log, keep the back and forth we did. try to keep all the prompts and
> your outputs

**Assistant:** Updated the logging preference (memory `session-log-maintenance`) and
rewrote `SESSION_LOG.md` into this turn-by-turn transcript, preserving the user's
prompts verbatim and the assistant's outputs (questions, options, and chosen
answers). Going forward, each new exchange is appended in this format.

---

## Turn 9 — Implementation plan

**User:**
> spec looks good to me, go ahead with the implementation plan

**Assistant:** Invoked the `writing-plans` skill. Because the spec covers two
separable subsystems, wrote **two sequenced, independently-testable TDD plans**
(each task ends at a review checkpoint — stage, don't auto-commit — per the
review-before-commit preference):
- `docs/superpowers/plans/2026-06-14-affordability-assessment.md` (Phase 1):
  Decimal money + debt field, pure `assessment.py` (totals/surplus/ratio/status +
  repayment guide), `build_trend`, `messaging.py`, and the statement/trend views.
- `docs/superpowers/plans/2026-06-14-bank-csv-import.md` (Phase 2): `transaction_date`
  field, pure `csv_import.py` (parse + group, structured errors), effectful
  `import_service.py` (temp-file lifecycle + atomic `commit_import`), `CsvUploadForm`,
  upload/preview/confirm views & templates, failure handling, and a stale-sweep
  management command.

Both plans self-reviewed for spec coverage, placeholders, and type consistency.
**Not committed** — awaiting the user's choice of execution approach.

---

## Turn 10 — Execute Phase 2 (CSV import)

**User:**
> looks good to me, lets start with phase 2 csv import as only after data capturing
> we will be able to test the phase 1 which is showing cutsomers their financial health

**Assistant:** Chose execution mode = **Inline in this session**; invoked
`executing-plans`. Flagged that Phase 2 needs Phase 1's `Decimal` model change as a
prerequisite, so folded the model migration into a single foundation step.

**User (mid-flight correction):**
> no continue work on main branch, I will review and then commit the code

→ Recorded preference (memory `no-commit-without-review`): work directly on `main`,
no feature branches; user reviews and commits.

**Built (TDD throughout — failing test → implement → green):**
- **Model foundation:** `Transaction.amount` → `DecimalField`, added
  `Transaction.transaction_date` and `Statement.total_outstanding_debt`; migration
  `0002_statement_total_outstanding_debt_and_more`.
- **`affordability/csv_import.py`** (pure): `parse_bank_csv` (header aliases,
  debit→expenditure / credit→income, amount cleaning, date formats, BOM,
  structured file/row errors, future-date exclusion) + `group_by_month`.
- **`affordability/import_service.py`** (effectful): temp-file lifecycle
  (save/read/delete/`temp_exists`/`temp_path` with token validation, `clear_stale_imports`)
  + atomic `commit_import` (create/replace/skip).
- **`CsvUploadForm`** (extension + size validation).
- **Views/URLs/templates:** `import_csv` (upload→preview, session token only),
  `import_csv_confirm` (Replace/Skip, atomic, guaranteed temp cleanup, session-expiry
  and catch-all messages); `import.html`, `import_preview.html`; CSV link on the
  statements list. `.import_tmp/` gitignored; settings `IMPORT_TMP_DIR` /
  `MAX_IMPORT_FILE_SIZE`.
- **Management command** `clear_stale_imports` for abandoned uploads.

**One test fix:** the non-CSV form-error assertion matched an apostrophe that Django
HTML-escapes; changed the assertion substring (implementation unchanged).

**Verification:** `pytest` → **47 passed**; `manage.py check` → no issues;
`makemigrations --check` → no changes; migration applied to the dev DB.

**Outcome:** Phase 2 complete on `main`, **not committed** — ready for the user to
review/commit and smoke-test (`runserver`, log in, import a CSV).

---

## Turn 11 — Code review of Phase 2 and fixes

**User:**
> load your superpower and review the code again. check for the failure cases, are we
> showing correct error reason to the users? for each failures the temp file is
> getting deleted? is the parsing of csv file and data import correct?

**Assistant:** Invoked `requesting-code-review`; dispatched two focused reviewer
subagents in parallel (failure-handling; parsing/import correctness) against the
uncommitted working tree. Validated each finding before acting (didn't apply blindly).

**Real issues found & fixed (TDD — failing test first):**
- **Upload view not robust (failure handling).** `import_csv` caught only
  `UnicodeDecodeError` with no catch-all, so an `OSError` from `read_temp`, an ORM
  error, or a parser crash would 500 with a traceback (DEBUG=True) *and leak the temp
  file* — confirm was robust, upload was not. Fixed: wrapped the whole upload body in
  guarded try/except (`UnicodeDecodeError` → specific message; `Exception` → generic
  friendly message + server log), deleting the temp file on every path. Hardened
  `save_upload_to_temp` to remove a half-written file on save failure.
- **Oversized amount / over-long description crashed the atomic commit (parsing).**
  An amount ≥ £100,000,000.00 (exceeds `DecimalField(max_digits=10)`) or a description
  > 100 chars passed *preview* then blew up `commit_import` because `.create()` skips
  validation. Fixed in the pure parser: amounts over `MAX_AMOUNT` (99,999,999.99)
  become a per-row "Amount is too large." error; descriptions are truncated to 100.
- **Date misparse risk (parsing).** Removed the `%m/%d/%Y` fallback that could
  silently misparse US-style dates against the UK day-first default (and put a row in
  the wrong month); added `%d/%m/%y` for 2-digit UK years. Impossible day-first dates
  now fail loudly as row errors.

**Confirmed correct by review (no change):** debit/credit classification, amount
cleaning (£/commas), month grouping & Decimal totals, atomic commit + Replace/Skip,
future-date exclusion, token validation, and that Django messages DO render on a
same-request re-render (a reviewer hypothesis that proved to be a non-issue).

**Deferred (minor, noted not fixed):** zero-amount row message wording; supporting
2-digit/ISO-datetime date variants beyond UK; no dedup of identical rows (intended).

**Verification:** `pytest` → **54 passed** (+7 new); `manage.py check` → no issues.

**Outcome:** Review complete, fixes applied on `main`, **not committed**.

---

## Turn 12 — Data-integrity check: read failure during DB update

**User:**
> check for scenario: what will happen if the reading from file fails while updating
> the database. will the non complete data will gets added in the database?

**Assistant:** Traced the flow: in `import_csv_confirm` the file is **fully read and
parsed before any DB write** (sequential, not interleaved) — `read_temp` returns the
whole file or raises, and `commit_import` works only from in-memory `groups`, never
touching the file. So a read failure occurs in the first try-block, before any row is
written. The write block is `@transaction.atomic`, so any mid-commit failure rolls
back everything. **Answer: no, incomplete data is never added.**

Added a test proving the strongest case — a failure mid-commit on **Replace** rolls
back so the original data is restored and no partial new data remains
(`test_replace_rollback_preserves_existing_data_on_error`).

**Verification:** `pytest` → **55 passed**.

**Outcome:** Data-integrity guarantee confirmed and covered by a test, on `main`,
**not committed**.

---

## Turn 13 — Zero amounts + rounding to 2 decimals

**User:**
> are you handling zero amounts transactions as well? if user manually inputs zero
> amount, make sure to show message like "amount should be more than 0". also all
> amounts should be rounded to 2 decimals

**Assistant (TDD):**
- **Manual entry:** `TransactionForm` previously allowed 0 (`MinValueValidator(0)`).
  Overrode the `amount` field and added `clean_amount` that **rounds to 2 dp
  (ROUND_HALF_UP)** and rejects `<= 0` with the exact message
  **"Amount should be more than 0."** (also catches negatives). Rounding means an
  input like `10.999` becomes `11.00` instead of being rejected for too many places.
- **CSV import:** an explicit zero (`0.00`) now returns the same
  **"Amount should be more than 0."** row error (previously the vaguer "Row has no
  amount"); blank rows still say "Row has no amount". Made `_parse_amount` rounding
  explicit (ROUND_HALF_UP) so all imported amounts are 2 dp.

**Verification:** `pytest` → **60 passed** (+5 new). Confirmed the manual
multi-row formset still skips genuinely-empty rows (existing create-statement flow
unaffected).

**Outcome:** Zero-amount handling and 2-dp rounding applied across both manual and
CSV paths, on `main`, **not committed**.

---

## Turn 14 — Group parser & service into a `csv_import` package

**User:**
> create a folder in .../affordability, called csv import, migrate all related code there

**User (scope correction mid-task):**
> migrate only parser and service

**Assistant:** Flagged two constraints: a Python package can't contain a space, so the
folder is **`csv_import/`** (underscore, which also absorbs the old `csv_import.py`);
and Django-discovered templates/management-commands must stay in their fixed
locations. Per the correction, moved **only** the two logic modules:
- `affordability/csv_import.py` → `affordability/csv_import/parser.py`
- `affordability/import_service.py` → `affordability/csv_import/service.py`
- added `csv_import/__init__.py` re-exporting the public API so existing import
  paths keep working; fixed `service.py`'s model import to `..models`.

Updated references with aliases to minimise churn: `views.py` now does
`from .csv_import import parser as csv_import, service as import_service` (view
bodies and test patch targets unchanged); management command and the two affected
test files repointed to `affordability.csv_import.service`. Forms, views, templates,
and tests stayed where they were, as requested.

**Verification:** `pytest` → **60 passed**; `manage.py check` → no issues; no stale
references; old module files removed.

**Outcome:** CSV parsing/service code now lives in a cohesive `csv_import` package,
on `main`, **not committed**.

---

## Turn 15 — Test-suite audit (real coverage, no bloat)

**User:**
> check the tests now, are all the tests protecting something real? make sure to cover
> all functionality however should not be too many tests which are repetative

**Assistant:** Read every test file and audited each. Found the suite already lean and
purposeful (each parser/service/view test hits a distinct code path — no real
duplication). Made targeted changes:
- **Removed noise:** deleted the empty default `affordability/tests.py` stub
  (0 tests, and a confusing `tests.py`-module vs `tests/`-package name clash); removed
  a stray duplicate `@pytest.mark.django_db` decorator in `test_statements.py`.
- **Filled two real gaps (user-facing paths, not duplicates):**
  - preview surfaces **skipped (invalid) rows** while still importing the valid ones
    (`test_upload_preview_reports_skipped_rows`);
  - confirm view's **commit-time DB failure** shows "no changes were made", persists
    nothing, and cleans up the temp file
    (`test_confirm_commit_failure_shows_message_and_cleans_up`).

**Verification:** `pytest` → **62 passed**.

**Outcome:** Suite audited — real coverage confirmed, noise removed, two genuine gaps
closed, on `main`, **not committed**.

---

## Turn 16 — Organize tests into proper folders

**User:**
> make sure tests are in proper folders

**Assistant:** The two CSV test files were loose at the `tests/` root while everything
else is grouped by type (`forms/`, `models/`, `views/`). Moved them into a new
`tests/csv_import/` folder mirroring the package, renamed to match the modules:
- `tests/test_csv_import.py` → `tests/csv_import/test_parser.py`
- `tests/test_import_service.py` → `tests/csv_import/test_service.py`

Tests use absolute imports, so relocation needed no import changes.

**Verification:** `pytest` → **62 passed**.

**Outcome:** Test layout now mirrors the code structure, on `main`, **not committed**.

---

## Turn 17 — Live test kit (sample CSVs)

**User:**
> help me to test this feature live now. create some sample csv which will cover all
> scenarios. create one with proper data. another with invalide columns, 3rd one
> currupted, 4th one proper data with user in debt. create for same user for different
> months so that we can track month on month progress

**Assistant:** Created `python_example/sample_csvs/`: `01_valid_jan_feb.csv` (proper,
multi-month, includes a comma-formatted amount), `02_invalid_columns.csv` (wrong
headers), `03_corrupted.csv` (invalid UTF-8 bytes → decode error),
`04_valid_mar_apr_in_debt.csv` (proper, Mar+Apr). Parse-checked all four (expected
monthly surpluses confirmed), seeded the dev user, and gave run/login/test
instructions. Flagged that affordability/trend/debt display is Phase 1 (not yet
visible) and that a CSV has no debt column (set via form/shell).

**User** then shared a screenshot confirming the invalid-columns error rendering
correctly live. **Outcome:** import pipeline validated live.

---

## Turn 18 — Build Phase 1 (assessment + trend display)

**User:**
> start phase 1

**Assistant (executing-plans, TDD):** model foundation was already done in Phase 2,
so implemented the rest:
- **`affordability/assessment.py`** (pure): `assess()` (totals, surplus,
  expenditure-to-income ratio as %, status no_data/deficit/tight/surplus, conservative
  repayment guide capped at debt with ROUND_FLOOR), `statement_totals`/`assess_statement`
  ORM adapters, and `build_trend`/`build_user_trend` (month-over-month deltas +
  trajectory).
- **`affordability/messaging.py`**: status-keyed supportive copy, free-debt-advice
  signposting, illustrative-guidance disclaimer.
- **Views/templates:** `view_statement` now shows the assessment, the working,
  repayment guide (when surplus + debt), and signposting (when deficit/tight);
  `statements` index shows a month-over-month trend table. Added
  `total_outstanding_debt` to `StatementForm` for manual entry.
- Tests under `tests/assessment/` (assess, trend, ORM adapters, messaging) plus
  view/form tests.

**Verification:** `pytest` → **88 passed** (+26); `manage.py check` → no issues.

**Outcome:** Phase 1 complete — captured data now surfaces as the customer's
financial-health view and month-on-month trend, on `main`, **not committed**.

---

## Turn 19 — Statements page layout tweaks

**User** (with screenshot):
> keep the import bank statement and create bank statement together under your
> statements title, below that have a title your position then show that table. in the
> table show month, income in that month, total spending, money left over and then change

**Assistant:** Template-only change to `statements/index.html`: moved both action links
("Import bank statement (CSV)" and "Create new statement") together directly under the
"Your Statements" title (removed the stray bottom "Create New Statement" link); renamed
the heading to **"Your position"**; expanded the trend table to **Month · Income ·
Total spending · Money left over · Change** (trend points already carried income/
expenditure). Updated the trend view test to the new heading and to assert the new
Income/Total-spending columns.

**Verification:** `pytest` → **88 passed**.

**Outcome:** Statements page restructured per the mockup, on `main`, **not committed**.

---

## Turn 20 — Start/end balance (running) replacing income/spending columns

**User:**
> lets add start balance and end balance in above table, remove income and total
> spending. also add this on individual statements pages as well

**Assistant:** Asked what start/end balance should represent (no balances are stored;
CSVs have no balance column). User chose **derived running balance** — cumulative,
first month starts at £0, end = start + money left over, next month's start = previous
end. Implemented:
- `assessment.TrendPoint` gained `start_balance`/`end_balance`; `build_trend` carries a
  running cumulative balance.
- Statements table columns now **Month · Start balance · End balance · Money left over ·
  Change** (income/spending removed).
- `view_statement` reuses `build_user_trend` to find this month's running balance and
  shows **Start balance** / **End balance** in the working.
- Updated trend/view tests (running balance, new columns/labels).

**Verification:** `pytest` → **89 passed**.

**Outcome:** Running start/end balances shown on the trend table and each statement
page, on `main`, **not committed**.

---

## Turn 21 — Trend table polish: drop End balance, fix Change, add Spending %

**User** (with screenshot):
> remove end balance as its repetitive amount now. also change the "Change" column as
> its already showing down arrow and its still [negative] numbers. add a column for
> spending percentage of each month

**Assistant:**
- Removed the **End balance** column from the trend table (redundant with start +
  money left over). Kept it on the individual statement page (reads as "you ended at
  £X" there).
- Fixed **Change**: the ▲/▼ arrow now carries direction and the amount shows the
  **magnitude** (added `delta_magnitude = abs(delta)` to `TrendPoint`) — e.g. `▼ £300.00`
  instead of `▼ £-300.00`.
- Added a **Spending %** column (per-month expenditure-to-income ratio; surfaced
  `expenditure_ratio` on `TrendPoint`; shows `—` when income is £0).
- Updated trend/view tests (magnitude, ratio, new columns, no minus sign).

**Verification:** `pytest` → **90 passed**.

**Outcome:** Trend table polished per the mockup, on `main`, **not committed**.

---

## Turn 22 — UX brainstorm: clearer numbers + replace confusing "Change"

**User:**
> think as a user who wants to see their financial situation over the months. suggest
> what else numbers we should add... the "Change" column is still confusing

**Assistant (brainstorming):** Argued as a user-advocate that "Change" is a confusing
second-order number (month-over-month difference of a per-month flow) and largely
redundant with the "Overall trend" line. Proposed replacing it with a plain Status and
adding actionable numbers. **Decisions:** replace Change with **Status**
(Surplus/Tight/Deficit); add **Affordable repayment/month**, a **summary above the
table**, and bring back **Income & Total spending (£)**; keep 8 columns; keep "Start
balance" label.

**Implemented (TDD):**
- `assessment.STATUS_LABELS`; `TrendPoint` gained `status_label` and
  `suggested_repayment`; `Trend` gained `average_disposable_income`,
  `months_in_surplus`, `months_in_deficit`.
- Table columns now: **Month · Start balance · Income · Total spending · Money left
  over · Spending % · Affordable repayment · Status** ("Change" removed).
- Summary above the table: plain-words trend, average money left over, months in
  surplus/deficit.
- Updated trend/view tests.

(Design approved inline; given the small scope I implemented directly rather than the
full spec-doc/writing-plans ceremony.)

**Verification:** `pytest` → **92 passed**.

**Outcome:** Clearer, more actionable overview table, on `main`, **not committed**.

---

## Turn 23 — Overdraft model: drop debt field & affordable-repayment

**User** (after a clarifying exchange):
> remove the Affordable repayment entirely as we are already showing the avg of money
> left over. also remove separate debt field

**Context/decision:** Re-modelled debt as an **overdraft** — the running balance can go
negative (a deficit month spends more than it earns), and that negative balance *is*
the overdraft, derived from cashflow. No separately stored debt.

**Implemented:**
- Removed `Statement.total_outstanding_debt` (model + form), migration
  `0003_remove_statement_total_outstanding_debt`.
- Removed the whole repayment concept from `assessment.py`
  (`AffordabilityAssessment.suggested_repayment`/`months_to_clear`, `_repayment_guide`,
  `AFFORDABLE_FRACTION`, the `outstanding_debt` params, `TrendPoint.suggested_repayment`,
  `MonthInput.outstanding_debt`).
- Removed the **Affordable repayment** table column; statement page no longer shows a
  repayment/debt section and instead flags **"Your balance is overdrawn by £X"** when the
  month's end balance is negative. Reworded the surplus message and disclaimer.
- Updated tests accordingly (dropped 8 debt/repayment tests; added overdraft assertions).

**Verification:** `pytest` → **84 passed**; `manage.py check` → no issues; migration
applied; no stale references (only migration history + a "removed" assertion).

**Outcome:** Debt is now modelled as an overdraft (negative running balance); repayment
guide and debt field removed, on `main`, **not committed**.

---

## Turn 24 — Money formatting, conditional disclaimer, amount-aware summary

**User** (after testing the overdraft CSV):
> make sure all amounts are in money format. also show the disclaimer only when
> spending is higher than income. "trending up" still shows even though avg money left
> over is negative — give the proper message based on amounts.

**Implemented:**
- **Money format:** new `templatetags/money_format.py` (`money` filter → `£2,439.50`,
  `-£580.50` with thousands separators and sign before the £; plus an `absval` helper).
  Applied across the statements table, summary, statement detail (working +
  transactions + overdraft line), and the import preview. Unit-tested.
- **Disclaimer** ("not a credit or affordability decision") now shows **only when the
  month is in deficit** (`status == deficit`), not on surplus/tight statements.
- **Amount-aware summary:** when the average money left over is **negative**, the page
  no longer says "trending up"; it says *"On average you're spending more than your
  income — about £X short each month"* (with a gentle "it's improving vs last month"
  note only if applicable). The trending up/down/steady wording is reserved for a
  positive average.
- Updated tests (disclaimer gating, deficit-summary wording, money-formatted preview
  assertion) + new money-filter and deficit-summary tests.

**Verification:** `pytest` → **89 passed**.

**Outcome:** Consistent money formatting and honest, amount-based messaging, on `main`,
**not committed**.

---

## Turn 25 — Code review: edge cases, coverage, redundancy

**User:**
> review the code now. check for any edge cases we haven't handled and test coverage.
> check for redundancy in code or tests and any non needed code.

**Assistant (requesting-code-review):** Dispatched two parallel reviewer subagents
(edge-cases/coverage; redundancy/dead-code). Validated each finding, then fixed the
clearly-correct ones:
- **Parser hardening:** `NaN`, `Infinity`, and scientific notation (e.g. `1e3`) were
  silently accepted as amounts — now rejected via a numeric regex ("not a valid
  number"). + test.
- **Trend ignores empty months:** `no_data` (zero-transaction) months no longer dilute
  the average or flip the trajectory. + test.
- **Commit choice safety:** only an explicit `"replace"` overwrites an existing month;
  any unknown/missing value is treated as skip. + test.
- **Dead code removed:** `TrendPoint.delta`/`delta_magnitude` (left over from the
  removed "Change" column) and the unused `RowError`/`ParsedImport` re-exports.
- **Tidy-ups:** renamed the misleading `04_..._in_debt.csv` sample; removed two unused
  `Decimal` test imports.
- **Added coverage:** assessment status boundaries (−0.01/0.00/+0.01), money-filter
  edges (empty/non-numeric/negative-zero).

**Deferred (flagged for user decision):** duplicate-month statements — manual "Create
statement" can create two statements in the same month (the importer dedupes; manual
entry doesn't), which would double-count the trend. A clean fix needs a model decision
(normalise the manual period to month-end + a unique constraint + a friendly form
error).

**Verification:** `pytest` → **95 passed**; `manage.py check` → no issues; no stale
references.

**Outcome:** Hardened parser, cleaner trend stats, dead code removed, coverage gaps
closed, on `main`, **not committed**.

---

## Turn 26 — One statement per month (manual entry)

**User:**
> normalise the manual statement date to month-end, plus a unique constraint on
> (user, month), and for months we already have a statement, disable those months on
> the frontend.

**Decisions (confirmed):** allow the current in-progress month; dropdown offers the
last 12 months.

**Implemented:**
- **Manual form** now uses a **month dropdown** (`StatementForm` ChoiceField) listing
  the last 12 months (current first), with **months the user already has removed** from
  the list; the choice is stored as that month's **last day** (normalised to month-end,
  matching CSV imports). Server-side `ChoiceField` validation rejects a taken month even
  if POSTed.
- **Unique constraint** `unique_user_statement_period` on `(user, statement_period)`
  (migration `0004`) as a backstop.
- **Future check relaxed to month granularity** in `Statement.clean()` so the current
  month (whose month-end is after today) is allowed but later months are rejected.
- `new_statement` view passes `request.user` to the form.
- Tests: dropdown offers 12 months incl. current, excludes taken months, accepts/stores
  month-end, rejects taken month; model allows current month and rejects duplicates;
  updated the create-statement view test to post a month-end and assert normalisation.

**Verification:** `pytest` → **99 passed**; `manage.py check` → no issues; migration
applied.

**Outcome:** Manual and CSV paths now both yield exactly one canonical statement per
month; the duplicate-month gap from Turn 25 is closed, on `main`, **not committed**.

---

## Turn 27 — Stale "Imported…" flash message

**User** (with screenshot): the import page still showed "Imported 10 transactions across
2 month(s); 0 skipped" 30 minutes later, after many refreshes — "are we storing errors
in cache?"

**Diagnosis:** Not a cache — Django messages. `import_csv_confirm` adds the success
message then redirects to the **statements** page, but `index.html` never rendered
`messages`, so the message was never consumed and lingered in the session until a page
that *does* render messages (the import page) was loaded later.

**Fix:** Added a `{% if messages %}` block to `statements/index.html` so the success
message is shown — and consumed — on the page the user lands on after importing.
Added `test_import_success_message_shows_once_on_statements` (asserts it appears on
statements once and is gone on the next load).

**Verification:** `pytest` → **100 passed**.

**Outcome:** Flash messages no longer leak to later pages, on `main`, **not committed**.

---

## Turn 28 — README

**User:**
> write the readme file covering how to run this code, also include the sample csv which
> someone can use while testing.

**Assistant:** Rewrote `python_example/README.md` to cover: setup (venv, install, migrate,
seed), running, login, tests, a feature overview (assessment, trend, overdraft model, CSV
import, manual month entry), the CSV format with a minimal example, a table of the five
`sample_csvs/` files and a suggested demo order, the future-date note, the
`clear_stale_imports` command, and pointers to the specs/plans and `SESSION_LOG.md`.

**Outcome:** Documentation added, on `main`, **not committed**.

---

## Turn 29 — DECISIONS.md

**User:**
> add DECISIONS.md with what we built, what is left out, and the decisions we made
> (CSV-import-first, overdraft handling, plus the ones I missed) for me to review.

**Assistant:** Created `DECISIONS.md` (repo root) with: *What we built*, ten *Key
decisions* (each with decision / why / alternatives) — led by CSV-import-as-primary and
the overdraft model, then Decimal money, derive-on-demand, one-statement-per-month,
debit/credit + day-first parsing, preview + atomic Replace/Skip, transient temp-file
storage, FCA-aware presentation, and robust failure handling — and *What's left out*.
Also fixed relative links after the README was moved to the repo root (app lives in
`python_example/`; docs at `docs/`).

**Outcome:** `DECISIONS.md` added for review; README links corrected, on `main`,
**not committed**.

---

## Turn 30 — Align the design spec with the implementation

**User:**
> check if design spec is aligned with the decisions we made while implementation.

**Assistant:** Audited `docs/specs/2026-06-14-affordability-design.md` against the build:
found it was the original pre-implementation design and materially out of sync in ~9
areas (debt/affordable-repayment removed → overdraft model; running start/end balance &
reshaped trend; trend table columns; deficit-only disclaimer; `csv_import` now a package;
day-first-only dates; expanded amount validation; one-statement-per-month with month
dropdown + unique constraint; money formatting). User chose to **update the spec to
match the build**, so rewrote the diverged sections (status, MoSCoW, §2 model, §3
assessment result type, §4 overdraft/running-balance trend, §5 views/templates, §6.3
package + §6.4 validation, §7 FCA, §8 testing, edge-case matrix, §9 out-of-scope) and
marked it "Implemented".

**Note:** the plan docs under `docs/plans/` remain historical (pre-build) execution
artifacts; not updated.

**Outcome:** Spec now reflects the final implementation and agrees with `DECISIONS.md`,
on `main`, **not committed**.
