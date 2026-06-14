# Bank CSV Import — Implementation Plan (Phase 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a customer import a bank-export CSV (separate debit/credit columns), auto-group rows into monthly statements, preview with per-month Replace/Skip, and commit — with robust failure messaging and a temp-file lifecycle that deletes the upload on success or failure.

**Architecture:** A pure, DB-free `csv_import.py` parses and groups rows (returns structured file/row errors instead of raising). An effectful `import_service.py` owns the temp-file lifecycle (save/read/delete/stale-sweep, token validation) and the atomic `commit_import`. A two-step view flow (upload→preview, then confirm) keeps only a session **token**; the raw file lives in a private, gitignored temp dir and is deleted on every path.

**Tech Stack:** Python 3 / Django 5.1, pytest + pytest-django, `csv`, `decimal.Decimal`.

> **Project workflow:** Do NOT run `git commit` without explicit user approval. Each task ends with a **Checkpoint**: run tests, then stage and pause for review. All commands run from `python_example/`.

**Depends on:** Phase 1 (`2026-06-14-affordability-assessment.md`) — assumes `Transaction.amount` is `DecimalField`.
**Spec:** `docs/superpowers/specs/2026-06-14-affordability-design.md` §6.

---

## File structure

| File | Responsibility |
|---|---|
| `affordability/models.py` (modify) | add `Transaction.transaction_date` |
| `affordability/migrations/0003_transaction_date.py` (create) | schema migration |
| `affordability/csv_import.py` (create) | **pure** parse + group, structured errors |
| `affordability/import_service.py` (create) | temp-file lifecycle + atomic `commit_import` |
| `affordability/forms.py` (modify) | `CsvUploadForm` (extension/size validation) |
| `affordability/views.py` (modify) | `import_csv`, `import_csv_confirm` |
| `affordability/urls.py` (modify) | import routes |
| `affordability/templates/statements/import.html` (create) | upload page |
| `affordability/templates/statements/import_preview.html` (create) | preview + Replace/Skip |
| `affordability/templates/statements/index.html` (modify) | link to import (primary) |
| `affordability/management/commands/clear_stale_imports.py` (create) | sweep command |
| `python_example/settings.py` (modify) | `IMPORT_TMP_DIR`, `MAX_IMPORT_FILE_SIZE` |
| `python_example/.gitignore` (modify) | ignore `.import_tmp/` |
| `affordability/tests/test_csv_import.py` (create) | pure parser/grouping tests |
| `affordability/tests/test_import_service.py` (create) | temp-file + commit tests |
| `affordability/tests/forms/test_csv_upload_form.py` (create) | upload form tests |
| `affordability/tests/views/test_import.py` (create) | end-to-end import + failures |

---

## Task 1: Add `transaction_date` to Transaction

**Files:**
- Modify: `affordability/models.py`
- Create: `affordability/migrations/0003_transaction_date.py` (generated)
- Modify: `affordability/tests/models/test_transaction.py`

- [ ] **Step 1: Write the failing test**

Append to `affordability/tests/models/test_transaction.py`:

```python
@pytest.mark.django_db
def test_transaction_date_is_optional():
    user = User.objects.create_user(username="td", password="pw")
    s = Statement.objects.create(user=user, statement_period=date.today())
    txn = Transaction.objects.create(statement=s, category="income",
                                     description="Pay", amount=Decimal("10.00"))
    assert txn.transaction_date is None
    txn2 = Transaction.objects.create(statement=s, category="income",
                                      description="Pay", amount=Decimal("10.00"),
                                      transaction_date=date(2026, 1, 15))
    txn2.refresh_from_db()
    assert txn2.transaction_date == date(2026, 1, 15)
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/models/test_transaction.py::test_transaction_date_is_optional -v`
Expected: FAIL — `transaction_date` field missing.

- [ ] **Step 3: Add the field**

In `affordability/models.py`, add to `Transaction` (after `description`):

```python
    transaction_date = models.DateField(null=True, blank=True)
```

- [ ] **Step 4: Generate the migration**

Run: `python manage.py makemigrations affordability`
Expected: creates `affordability/migrations/0003_*.py` adding `transaction_date`.

- [ ] **Step 5: Run to verify pass**

Run: `pytest affordability/tests/models/test_transaction.py -v`
Expected: PASS.

- [ ] **Step 6: Checkpoint** — stage and pause.

```bash
git add affordability/models.py affordability/migrations/0003_*.py affordability/tests/models/test_transaction.py
# feat(models): add optional transaction_date for imported rows
```

---

## Task 2: CSV parsing — headers & debit/credit classification

**Files:**
- Create: `affordability/csv_import.py`
- Create: `affordability/tests/test_csv_import.py`

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/test_csv_import.py`:

```python
from decimal import Decimal
from datetime import date
from affordability.csv_import import parse_bank_csv

TODAY = date(2026, 6, 14)


def test_debit_is_expenditure_credit_is_income():
    text = (
        "Date,Description,Debit,Credit\n"
        "2026-01-05,Rent,800.00,\n"
        "2026-01-25,Salary,,2000.00\n"
    )
    result = parse_bank_csv(text, TODAY)
    assert result.file_error is None
    assert len(result.rows) == 2
    rent = result.rows[0]
    assert rent.category == "expenditure"
    assert rent.amount == Decimal("800.00")
    assert rent.transaction_date == date(2026, 1, 5)
    salary = result.rows[1]
    assert salary.category == "income"
    assert salary.amount == Decimal("2000.00")


def test_header_aliases_and_case_insensitive():
    text = (
        "transaction date,details,money out,money in\n"
        "05/01/2026,Tesco,12.50,\n"
    )
    result = parse_bank_csv(text, TODAY)
    assert result.file_error is None
    assert len(result.rows) == 1
    assert result.rows[0].category == "expenditure"
    assert result.rows[0].amount == Decimal("12.50")
    assert result.rows[0].transaction_date == date(2026, 1, 5)
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/test_csv_import.py -v`
Expected: FAIL — `No module named 'affordability.csv_import'`.

- [ ] **Step 3: Implement the parser skeleton + classification**

Create `affordability/csv_import.py`:

```python
"""Pure bank-CSV parsing and monthly grouping. No Django ORM here.

Expected columns: date, description, and debit and/or credit
(debit = money out -> expenditure, credit = money in -> income).
Returns structured file/row errors instead of raising on expected problems.
"""
from __future__ import annotations

import calendar
import csv
import io
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y")

HEADER_ALIASES = {
    "date": {"date", "transaction date", "transactiondate", "posting date", "posted"},
    "description": {"description", "details", "narrative", "memo", "reference"},
    "debit": {"debit", "money out", "paid out", "withdrawal", "out"},
    "credit": {"credit", "money in", "paid in", "deposit", "in"},
}

_INVALID = object()
TWO_PLACES = Decimal("0.01")

EMPTY_MSG = "This file looks empty — please check your export and try again."
CORRUPT_MSG = ("We couldn't read this file — it may be corrupted. "
               "Please re-export and try again.")


@dataclass(frozen=True)
class ParsedRow:
    row_number: int
    transaction_date: date
    description: str
    category: str   # "income" | "expenditure"
    amount: Decimal


@dataclass(frozen=True)
class RowError:
    row_number: int
    message: str


@dataclass
class ParsedImport:
    rows: list
    row_errors: list
    file_error: str | None = None


def parse_bank_csv(text, today):
    text = (text or "").lstrip("﻿")
    if not text.strip():
        return ParsedImport([], [], EMPTY_MSG)
    try:
        raw_rows = list(csv.reader(io.StringIO(text)))
    except csv.Error:
        return ParsedImport([], [], CORRUPT_MSG)
    if not raw_rows:
        return ParsedImport([], [], EMPTY_MSG)

    columns = _map_columns(raw_rows[0])
    missing = _missing_columns(columns)
    if missing:
        return ParsedImport([], [], _missing_message(raw_rows[0]))

    data_rows = raw_rows[1:]
    if not data_rows:
        return ParsedImport([], [], EMPTY_MSG)

    rows, errors = [], []
    for line_no, raw in enumerate(data_rows, start=2):  # header is line 1
        parsed, err = _parse_row(line_no, raw, columns, today)
        (errors if err else rows).append(err or parsed)

    if not rows:
        return ParsedImport([], errors,
            f"We couldn't read any valid transactions from this file "
            f"({len(errors)} rows had problems).")
    return ParsedImport(rows, errors, None)


def _map_columns(header):
    normalized = [h.strip().lower() for h in header]
    columns = {}
    for logical, aliases in HEADER_ALIASES.items():
        for idx, name in enumerate(normalized):
            if name in aliases:
                columns[logical] = idx
                break
    return columns


def _missing_columns(columns):
    missing = [c for c in ("date", "description") if c not in columns]
    if "debit" not in columns and "credit" not in columns:
        missing.append("debit/credit")
    return missing


def _missing_message(header):
    found = ", ".join(h.strip() for h in header if h.strip())
    return ("We couldn't find the expected columns. The file needs date, "
            "description, and debit and/or credit. We found: " + found + ".")


def _cell(raw, columns, key):
    idx = columns.get(key)
    if idx is None or idx >= len(raw):
        return ""
    return raw[idx].strip()


def _parse_row(line_no, raw, columns, today):
    date_str = _cell(raw, columns, "date")
    description = _cell(raw, columns, "description")
    debit = _parse_amount(_cell(raw, columns, "debit"))
    credit = _parse_amount(_cell(raw, columns, "credit"))

    txn_date = _parse_date(date_str)
    if txn_date is None:
        return None, RowError(line_no, f"Couldn't read the date '{date_str}'.")
    if txn_date > today:
        return None, RowError(line_no, "Date is in the future.")

    if debit is _INVALID or credit is _INVALID:
        return None, RowError(line_no, "Amount isn't a valid number.")
    if (debit is not None and debit < 0) or (credit is not None and credit < 0):
        return None, RowError(line_no, "Amount can't be negative.")

    has_debit = debit is not None and debit > 0
    has_credit = credit is not None and credit > 0
    if has_debit and has_credit:
        return None, RowError(line_no, "Row has both money in and money out.")
    if not has_debit and not has_credit:
        return None, RowError(line_no, "Row has no amount.")

    if has_debit:
        return ParsedRow(line_no, txn_date, description, "expenditure", debit), None
    return ParsedRow(line_no, txn_date, description, "income", credit), None


def _parse_date(s):
    if not s:
        return None
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _parse_amount(s):
    if not s:
        return None
    cleaned = s.replace("£", "").replace(",", "").replace(" ", "")
    if cleaned in ("", "-"):
        return None
    try:
        return Decimal(cleaned).quantize(TWO_PLACES)
    except (InvalidOperation, ValueError):
        return _INVALID
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/test_csv_import.py -v`
Expected: PASS (both tests).

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/csv_import.py affordability/tests/test_csv_import.py
# feat(csv): pure parser with header aliases and debit/credit classification
```

---

## Task 3: Row-level validation & cleaning

**Files:**
- Modify: `affordability/tests/test_csv_import.py`

- [ ] **Step 1: Write the failing tests**

Append to `affordability/tests/test_csv_import.py`:

```python
def test_amount_cleaning_strips_symbols_and_commas():
    text = "Date,Description,Debit,Credit\n2026-01-05,Big,\"£1,234.56\",\n"
    result = parse_bank_csv(text, TODAY)
    assert result.rows[0].amount == Decimal("1234.56")


def test_row_errors_are_collected_not_raised():
    text = (
        "Date,Description,Debit,Credit\n"
        "not-a-date,Bad date,10.00,\n"        # bad date
        "2026-01-05,Both,10.00,5.00\n"        # both debit & credit
        "2026-01-06,Neither,,\n"              # neither
        "2026-01-07,Negative,-5.00,\n"        # negative
        "2026-01-08,Letters,abc,\n"           # non-numeric
        "2026-01-09,Good,12.00,\n"            # valid
    )
    result = parse_bank_csv(text, TODAY)
    assert len(result.rows) == 1
    assert len(result.row_errors) == 5
    assert result.rows[0].description == "Good"


def test_future_dated_rows_are_excluded():
    text = "Date,Description,Debit,Credit\n2026-12-31,Future,10.00,\n"
    result = parse_bank_csv(text, TODAY)
    assert result.rows == []
    assert any("future" in e.message.lower() for e in result.row_errors)


def test_utf8_bom_is_handled():
    text = "﻿Date,Description,Debit,Credit\n2026-01-05,Rent,800.00,\n"
    result = parse_bank_csv(text, TODAY)
    assert result.file_error is None
    assert len(result.rows) == 1
```

- [ ] **Step 2: Run to verify**

Run: `pytest affordability/tests/test_csv_import.py -v`
Expected: PASS — the Task 2 implementation already satisfies these. If any fail, fix `csv_import.py`, not the tests.

- [ ] **Step 3: Checkpoint** — stage and pause.

```bash
git add affordability/tests/test_csv_import.py
# test(csv): cleaning, row-error collection, future dates, BOM
```

---

## Task 4: File-level error messages

**Files:**
- Modify: `affordability/tests/test_csv_import.py`

- [ ] **Step 1: Write the failing tests**

Append to `affordability/tests/test_csv_import.py`:

```python
def test_empty_file_returns_file_error():
    assert parse_bank_csv("", TODAY).file_error == \
        "This file looks empty — please check your export and try again."


def test_header_only_returns_file_error():
    result = parse_bank_csv("Date,Description,Debit,Credit\n", TODAY)
    assert result.file_error is not None
    assert result.rows == []


def test_missing_columns_message_lists_found_headers():
    result = parse_bank_csv("Foo,Bar\n1,2\n", TODAY)
    assert result.file_error is not None
    assert "Foo, Bar" in result.file_error
    assert "debit and/or credit" in result.file_error


def test_all_invalid_rows_returns_file_error():
    text = "Date,Description,Debit,Credit\nbad,x,10,\nbad2,y,5,\n"
    result = parse_bank_csv(text, TODAY)
    assert result.rows == []
    assert "couldn't read any valid transactions" in result.file_error
```

- [ ] **Step 2: Run to verify**

Run: `pytest affordability/tests/test_csv_import.py -v`
Expected: PASS — covered by Task 2 implementation.

- [ ] **Step 3: Checkpoint** — stage and pause.

```bash
git add affordability/tests/test_csv_import.py
# test(csv): file-level error messages
```

---

## Task 5: Group rows into months

**Files:**
- Modify: `affordability/csv_import.py`
- Modify: `affordability/tests/test_csv_import.py`

- [ ] **Step 1: Write the failing tests**

Append to `affordability/tests/test_csv_import.py`:

```python
from affordability.csv_import import group_by_month


def test_group_by_month_creates_one_group_per_month():
    text = (
        "Date,Description,Debit,Credit\n"
        "2026-01-05,Rent,800.00,\n"
        "2026-01-25,Salary,,2000.00\n"
        "2026-02-03,Food,150.00,\n"
    )
    result = parse_bank_csv(text, TODAY)
    groups = group_by_month(result.rows)
    assert [g.period for g in groups] == [date(2026, 1, 31), date(2026, 2, 28)]
    jan = groups[0]
    assert jan.total_income == Decimal("2000.00")
    assert jan.total_expenditure == Decimal("800.00")
    assert len(jan.rows) == 2
    feb = groups[1]
    assert feb.total_expenditure == Decimal("150.00")
    assert feb.total_income == Decimal("0.00")
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/test_csv_import.py -v`
Expected: FAIL — `cannot import name 'group_by_month'`.

- [ ] **Step 3: Implement grouping**

Append to `affordability/csv_import.py`:

```python
@dataclass(frozen=True)
class MonthGroup:
    period: date              # last day of the month
    rows: list
    total_income: Decimal
    total_expenditure: Decimal


def group_by_month(rows):
    buckets = {}
    for r in rows:
        buckets.setdefault((r.transaction_date.year, r.transaction_date.month), []).append(r)
    groups = []
    for (year, month) in sorted(buckets):
        bucket = buckets[(year, month)]
        last_day = calendar.monthrange(year, month)[1]
        income = sum((x.amount for x in bucket if x.category == "income"), Decimal("0.00"))
        spend = sum((x.amount for x in bucket if x.category == "expenditure"), Decimal("0.00"))
        groups.append(MonthGroup(date(year, month, last_day), bucket, income, spend))
    return groups
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/test_csv_import.py -v`
Expected: PASS.

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/csv_import.py affordability/tests/test_csv_import.py
# feat(csv): group parsed rows into monthly groups with totals
```

---

## Task 6: Temp-file lifecycle

**Files:**
- Create: `affordability/import_service.py`
- Create: `affordability/tests/test_import_service.py`

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/test_import_service.py`:

```python
import os
import pytest
from affordability import import_service


@pytest.fixture
def tmp_import_dir(settings, tmp_path):
    settings.IMPORT_TMP_DIR = tmp_path
    return tmp_path


class _FakeUpload:
    def __init__(self, data):
        self._data = data
    def chunks(self):
        yield self._data


def test_save_read_delete_roundtrip(tmp_import_dir):
    token = import_service.save_upload_to_temp(_FakeUpload(b"hello,world\n"))
    assert import_service.temp_exists(token)
    assert import_service.read_temp(token) == "hello,world\n"
    import_service.delete_temp(token)
    assert not import_service.temp_exists(token)


def test_read_temp_strips_bom(tmp_import_dir):
    token = import_service.save_upload_to_temp(_FakeUpload("﻿Date\n".encode("utf-8")))
    assert import_service.read_temp(token).startswith("Date")


def test_invalid_token_is_rejected(tmp_import_dir):
    with pytest.raises(ValueError):
        import_service.temp_path("../../etc/passwd")
    with pytest.raises(ValueError):
        import_service.temp_path("not-a-token")


def test_clear_stale_imports_removes_old_files(tmp_import_dir):
    token = import_service.save_upload_to_temp(_FakeUpload(b"x"))
    path = import_service.temp_path(token)
    old = os.path.getmtime(path) - 7200
    os.utime(path, (old, old))
    removed = import_service.clear_stale_imports(max_age_seconds=3600)
    assert removed == 1
    assert not os.path.exists(path)
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/test_import_service.py -v`
Expected: FAIL — `No module named 'affordability.import_service'`.

- [ ] **Step 3: Implement the temp-file service**

Create `affordability/import_service.py`:

```python
"""Side-effectful import helpers: temp-file lifecycle + atomic commit.

The raw upload is stored only transiently in a private, non-web-served temp dir
with an unguessable token filename, and deleted on success or failure.
"""
from __future__ import annotations

import os
import re
import time
import uuid
from dataclasses import dataclass

from django.conf import settings
from django.db import transaction

from .models import Statement, Transaction

_TOKEN_RE = re.compile(r"^[0-9a-f]{32}\.csv$")


def _tmp_dir():
    d = settings.IMPORT_TMP_DIR
    os.makedirs(d, exist_ok=True)
    return d


def temp_path(token):
    if not _TOKEN_RE.match(token or ""):
        raise ValueError("Invalid import token")
    return os.path.join(_tmp_dir(), token)


def save_upload_to_temp(uploaded_file):
    token = uuid.uuid4().hex + ".csv"
    with open(temp_path(token), "wb") as fh:
        for chunk in uploaded_file.chunks():
            fh.write(chunk)
    return token


def read_temp(token):
    with open(temp_path(token), "rb") as fh:
        return fh.read().decode("utf-8-sig")


def temp_exists(token):
    try:
        return os.path.exists(temp_path(token))
    except ValueError:
        return False


def delete_temp(token):
    try:
        os.remove(temp_path(token))
    except (FileNotFoundError, ValueError):
        pass


def clear_stale_imports(max_age_seconds=3600, now=None):
    now = time.time() if now is None else now
    directory = _tmp_dir()
    removed = 0
    for name in os.listdir(directory):
        if not _TOKEN_RE.match(name):
            continue
        path = os.path.join(directory, name)
        try:
            if now - os.path.getmtime(path) > max_age_seconds:
                os.remove(path)
                removed += 1
        except FileNotFoundError:
            continue
    return removed


@dataclass
class ImportResult:
    created_statements: int
    replaced_statements: int
    skipped_statements: int
    created_transactions: int


@transaction.atomic
def commit_import(user, month_groups, choices):
    created = replaced = skipped = txns = 0
    for group in month_groups:
        existing = Statement.objects.filter(
            user=user, statement_period=group.period).first()
        if existing:
            if choices.get(group.period, "skip") == "skip":
                skipped += 1
                continue
            existing.transactions.all().delete()
            statement = existing
            replaced += 1
        else:
            statement = Statement.objects.create(
                user=user, statement_period=group.period)
            created += 1
        for r in group.rows:
            Transaction.objects.create(
                statement=statement, category=r.category,
                description=r.description, amount=r.amount,
                transaction_date=r.transaction_date)
            txns += 1
    return ImportResult(created, replaced, skipped, txns)
```

Also add the settings now so the tests' `settings.IMPORT_TMP_DIR` override has a real default. In `python_example/settings.py` (end of file):

```python
# Bank CSV import
IMPORT_TMP_DIR = BASE_DIR / ".import_tmp"
MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
```

And in `python_example/.gitignore` add a line:

```
.import_tmp/
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/test_import_service.py -v`
Expected: PASS (all four).

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/import_service.py affordability/tests/test_import_service.py python_example/settings.py python_example/.gitignore
# feat(import): temp-file lifecycle with token validation and stale sweep
```

---

## Task 7: Atomic commit — create / replace / skip

**Files:**
- Modify: `affordability/tests/test_import_service.py`

- [ ] **Step 1: Write the failing tests**

Append to `affordability/tests/test_import_service.py`:

```python
from decimal import Decimal
from datetime import date
from unittest.mock import patch
from django.contrib.auth.models import User
from affordability.models import Statement, Transaction
from affordability.csv_import import MonthGroup, ParsedRow


def _group(period, rows):
    income = sum((r.amount for r in rows if r.category == "income"), Decimal("0.00"))
    spend = sum((r.amount for r in rows if r.category == "expenditure"), Decimal("0.00"))
    return MonthGroup(period, rows, income, spend)


def _row(day, category, amount):
    return ParsedRow(1, date(2026, 1, day), "x", category, Decimal(amount))


@pytest.mark.django_db
def test_commit_creates_new_statements():
    user = User.objects.create_user(username="c1", password="pw")
    groups = [_group(date(2026, 1, 31), [_row(5, "expenditure", "800.00"),
                                         _row(25, "income", "2000.00")])]
    result = import_service.commit_import(user, groups, {})
    assert result.created_statements == 1
    assert result.created_transactions == 2
    assert Statement.objects.filter(user=user).count() == 1


@pytest.mark.django_db
def test_commit_skips_existing_month_by_default():
    user = User.objects.create_user(username="c2", password="pw")
    Statement.objects.create(user=user, statement_period=date(2026, 1, 31))
    groups = [_group(date(2026, 1, 31), [_row(5, "expenditure", "10.00")])]
    result = import_service.commit_import(user, groups, {})  # no choice -> skip
    assert result.skipped_statements == 1
    assert Transaction.objects.count() == 0


@pytest.mark.django_db
def test_commit_replaces_existing_month_when_chosen():
    user = User.objects.create_user(username="c3", password="pw")
    period = date(2026, 1, 31)
    existing = Statement.objects.create(user=user, statement_period=period)
    Transaction.objects.create(statement=existing, category="income",
                               description="old", amount=Decimal("1.00"))
    groups = [_group(period, [_row(5, "expenditure", "800.00")])]
    result = import_service.commit_import(user, groups, {period: "replace"})
    assert result.replaced_statements == 1
    assert Transaction.objects.filter(statement=existing).count() == 1
    assert Transaction.objects.get(statement=existing).description == "x"


@pytest.mark.django_db
def test_commit_rolls_back_on_error():
    user = User.objects.create_user(username="c4", password="pw")
    groups = [_group(date(2026, 1, 31), [_row(5, "expenditure", "800.00"),
                                         _row(25, "income", "2000.00")])]
    with patch("affordability.import_service.Transaction.objects.create",
               side_effect=RuntimeError("boom")):
        with pytest.raises(RuntimeError):
            import_service.commit_import(user, groups, {})
    # Atomic: nothing persisted
    assert Statement.objects.filter(user=user).count() == 0
    assert Transaction.objects.count() == 0
```

- [ ] **Step 2: Run to verify**

Run: `pytest affordability/tests/test_import_service.py -v`
Expected: PASS — `commit_import` from Task 6 already satisfies these (atomic rollback included).

- [ ] **Step 3: Checkpoint** — stage and pause.

```bash
git add affordability/tests/test_import_service.py
# test(import): create/skip/replace and atomic rollback
```

---

## Task 8: Upload form validation

**Files:**
- Modify: `affordability/forms.py`
- Create: `affordability/tests/forms/test_csv_upload_form.py`

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/forms/test_csv_upload_form.py`:

```python
from django.core.files.uploadedfile import SimpleUploadedFile
from affordability.forms import CsvUploadForm


def _upload(name, content=b"Date,Description,Debit,Credit\n"):
    return {"file": SimpleUploadedFile(name, content, content_type="text/csv")}


def test_accepts_csv():
    form = CsvUploadForm({}, _upload("statement.csv"))
    assert form.is_valid(), form.errors


def test_rejects_non_csv_with_message():
    form = CsvUploadForm({}, _upload("statement.pdf"))
    assert not form.is_valid()
    assert "doesn't look like a CSV" in str(form.errors["file"])


def test_rejects_oversized_file(settings):
    settings.MAX_IMPORT_FILE_SIZE = 10  # 10 bytes
    form = CsvUploadForm({}, _upload("big.csv", b"x" * 50))
    assert not form.is_valid()
    assert "too large" in str(form.errors["file"])
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/forms/test_csv_upload_form.py -v`
Expected: FAIL — `cannot import name 'CsvUploadForm'`.

- [ ] **Step 3: Implement the form**

In `affordability/forms.py`, add at top:

```python
from django.conf import settings
```

Append:

```python
class CsvUploadForm(forms.Form):
    file = forms.FileField()

    def clean_file(self):
        uploaded = self.cleaned_data["file"]
        if not (uploaded.name or "").lower().endswith(".csv"):
            raise forms.ValidationError(
                "That doesn't look like a CSV file — please upload the .csv "
                "your bank exported.")
        max_size = getattr(settings, "MAX_IMPORT_FILE_SIZE", 5 * 1024 * 1024)
        if uploaded.size > max_size:
            mb = max(1, max_size // (1024 * 1024))
            raise forms.ValidationError(
                f"This file is too large (max {mb} MB). Please upload a "
                "smaller export.")
        return uploaded
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/forms/test_csv_upload_form.py -v`
Expected: PASS.

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/forms.py affordability/tests/forms/test_csv_upload_form.py
# feat(forms): CsvUploadForm with extension and size validation
```

---

## Task 9: URLs + templates + statements link

**Files:**
- Modify: `affordability/urls.py`
- Create: `affordability/templates/statements/import.html`
- Create: `affordability/templates/statements/import_preview.html`
- Modify: `affordability/templates/statements/index.html`

- [ ] **Step 1: Add the routes**

In `affordability/urls.py`, add to `urlpatterns` (before the `<int:statement_id>` route to avoid capture conflicts):

```python
    path('statements/import/', views.import_csv, name='import_csv'),
    path('statements/import/confirm/', views.import_csv_confirm, name='import_csv_confirm'),
```

- [ ] **Step 2: Create the upload template**

Create `affordability/templates/statements/import.html`:

```html
<h1>Import a bank statement</h1>

{% if messages %}
  <ul class="messages">
    {% for m in messages %}<li>{{ m }}</li>{% endfor %}
  </ul>
{% endif %}

<p>Upload a CSV exported from your bank. It needs columns for <strong>date</strong>,
   <strong>description</strong>, and <strong>debit and/or credit</strong>
   (money out / money in).</p>

<form method="post" enctype="multipart/form-data">
  {% csrf_token %}
  {{ form.as_p }}
  <button type="submit">Upload and preview</button>
</form>

<a href="{% url 'statements' %}">Back to Statements</a>
```

- [ ] **Step 3: Create the preview template**

Create `affordability/templates/statements/import_preview.html`:

```html
<h1>Check your import</h1>

{% if row_errors %}
  <h2>{{ row_errors|length }} row(s) will be skipped</h2>
  <ul>
    {% for e in row_errors %}<li>Row {{ e.row_number }}: {{ e.message }}</li>{% endfor %}
  </ul>
{% endif %}

<form method="post" action="{% url 'import_csv_confirm' %}">
  {% csrf_token %}
  <table>
    <thead>
      <tr><th>Month</th><th>Income</th><th>Spending</th><th>Rows</th><th>Action</th></tr>
    </thead>
    <tbody>
      {% for item in preview %}
        <tr>
          <td>{{ item.group.period }}</td>
          <td>£{{ item.group.total_income }}</td>
          <td>£{{ item.group.total_expenditure }}</td>
          <td>{{ item.group.rows|length }}</td>
          <td>
            {% if item.exists %}
              Already exists —
              <label><input type="radio"
                name="choice-{{ item.group.period|date:'Y-m-d' }}" value="replace"> Replace</label>
              <label><input type="radio"
                name="choice-{{ item.group.period|date:'Y-m-d' }}" value="skip" checked> Skip</label>
            {% else %}
              New
            {% endif %}
          </td>
        </tr>
      {% endfor %}
    </tbody>
  </table>
  <button type="submit">Confirm import</button>
</form>

<a href="{% url 'import_csv' %}">Upload a different file</a>
```

- [ ] **Step 4: Link import as the primary action**

In `affordability/templates/statements/index.html`, add directly under `<h1>Your Statements</h1>`:

```html
<p><a href="{% url 'import_csv' %}"><strong>Import bank statement (CSV)</strong></a></p>
```

- [ ] **Step 5: Checkpoint** — stage and pause (views wired in Tasks 10–11; templates verified there).

```bash
git add affordability/urls.py affordability/templates/statements/import.html affordability/templates/statements/import_preview.html affordability/templates/statements/index.html
# feat(import): routes, upload/preview templates, statements link
```

---

## Task 10: Upload + preview view

**Files:**
- Modify: `affordability/views.py`
- Create: `affordability/tests/views/test_import.py`

- [ ] **Step 1: Write the failing tests**

Create `affordability/tests/views/test_import.py`:

```python
import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile

CSV = (
    b"Date,Description,Debit,Credit\n"
    b"2020-01-05,Rent,800.00,\n"
    b"2020-01-25,Salary,,2000.00\n"
    b"2020-02-03,Food,150.00,\n"
)


@pytest.fixture
def tmp_import_dir(settings, tmp_path):
    settings.IMPORT_TMP_DIR = tmp_path
    return tmp_path


def _login(client):
    User.objects.create_user(username="imp", password="pw")
    client.login(username="imp", password="pw")


@pytest.mark.django_db
def test_upload_shows_preview_with_two_months(client, tmp_import_dir):
    _login(client)
    upload = SimpleUploadedFile("s.csv", CSV, content_type="text/csv")
    resp = client.post(reverse("import_csv"), {"file": upload})
    body = resp.content.decode()
    assert resp.status_code == 200
    assert "Check your import" in body
    assert "Jan. 31, 2020" in body or "2020" in body
    assert "2000.00" in body and "800.00" in body
    assert client.session.get("import_token")  # token stored, not file


@pytest.mark.django_db
def test_upload_invalid_file_shows_message_and_no_token(client, tmp_import_dir):
    _login(client)
    upload = SimpleUploadedFile("s.csv", b"Foo,Bar\n1,2\n", content_type="text/csv")
    resp = client.post(reverse("import_csv"), {"file": upload})
    body = resp.content.decode()
    assert "expected columns" in body
    assert not client.session.get("import_token")


@pytest.mark.django_db
def test_upload_requires_login(client):
    resp = client.get(reverse("import_csv"))
    assert resp.status_code == 302
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/views/test_import.py -v`
Expected: FAIL — `import_csv` view not defined.

- [ ] **Step 3: Implement the view**

In `affordability/views.py`, add imports at top:

```python
import logging
from django.contrib import messages
from django.utils import timezone
from .forms import StatementForm, TransactionFormSet, CsvUploadForm
from . import csv_import, import_service

logger = logging.getLogger(__name__)
```

(Adjust the existing `from .forms import StatementForm, TransactionFormSet` line to the one above.)

Add the view:

```python
@login_required
def import_csv(request):
    import_service.clear_stale_imports()
    if request.method != "POST":
        return render(request, "statements/import.html", {"form": CsvUploadForm()})

    form = CsvUploadForm(request.POST, request.FILES)
    if not form.is_valid():
        return render(request, "statements/import.html", {"form": form})

    token = import_service.save_upload_to_temp(form.cleaned_data["file"])
    try:
        text = import_service.read_temp(token)
    except UnicodeDecodeError:
        import_service.delete_temp(token)
        messages.error(request, "We couldn't read this file. Please make sure "
                                "it's a CSV exported from your bank.")
        return render(request, "statements/import.html", {"form": CsvUploadForm()})

    parsed = csv_import.parse_bank_csv(text, timezone.localdate())
    if parsed.file_error:
        import_service.delete_temp(token)
        messages.error(request, parsed.file_error)
        return render(request, "statements/import.html", {"form": CsvUploadForm()})

    groups = csv_import.group_by_month(parsed.rows)
    existing = set(Statement.objects.filter(
        user=request.user,
        statement_period__in=[g.period for g in groups],
    ).values_list("statement_period", flat=True))

    request.session["import_token"] = token
    preview = [{"group": g, "exists": g.period in existing} for g in groups]
    return render(request, "statements/import_preview.html", {
        "preview": preview,
        "row_errors": parsed.row_errors,
    })
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/views/test_import.py -v`
Expected: PASS for the three tests in this task (confirm tests come in Task 11).

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/views.py affordability/tests/views/test_import.py
# feat(import): upload + preview view (parse, group, conflict detection)
```

---

## Task 11: Confirm view — commit with Replace/Skip

**Files:**
- Modify: `affordability/views.py`
- Modify: `affordability/tests/views/test_import.py`

- [ ] **Step 1: Write the failing tests**

Append to `affordability/tests/views/test_import.py`:

```python
from datetime import date
from decimal import Decimal
from affordability.models import Statement, Transaction


def _upload_and_get_token(client):
    upload = SimpleUploadedFile("s.csv", CSV, content_type="text/csv")
    client.post(reverse("import_csv"), {"file": upload})
    return client.session["import_token"]


@pytest.mark.django_db
def test_confirm_creates_statements_and_clears_token(client, tmp_import_dir):
    _login(client)
    _upload_and_get_token(client)
    resp = client.post(reverse("import_csv_confirm"), {})
    assert resp.status_code == 302
    assert resp.url == reverse("statements")
    assert Statement.objects.count() == 2
    assert Transaction.objects.count() == 3
    assert not client.session.get("import_token")


@pytest.mark.django_db
def test_confirm_replace_existing_month(client, tmp_import_dir):
    _login(client)
    user = User.objects.get(username="imp")
    jan = Statement.objects.create(user=user, statement_period=date(2020, 1, 31))
    Transaction.objects.create(statement=jan, category="income",
                               description="old", amount=Decimal("1.00"))
    _upload_and_get_token(client)
    resp = client.post(reverse("import_csv_confirm"),
                       {"choice-2020-01-31": "replace"})
    assert resp.status_code == 302
    # Jan replaced (2 rows), Feb created (1 row); old row gone
    assert Transaction.objects.filter(statement=jan).count() == 2
    assert not Transaction.objects.filter(description="old").exists()


@pytest.mark.django_db
def test_confirm_without_token_shows_session_expired(client, tmp_import_dir):
    _login(client)
    resp = client.post(reverse("import_csv_confirm"), {}, follow=True)
    assert "session expired" in resp.content.decode().lower()
    assert Statement.objects.count() == 0


@pytest.mark.django_db
def test_temp_file_deleted_after_confirm(client, tmp_import_dir):
    _login(client)
    token = _upload_and_get_token(client)
    client.post(reverse("import_csv_confirm"), {})
    assert not import_service_temp_exists(token)


def import_service_temp_exists(token):
    from affordability import import_service
    return import_service.temp_exists(token)
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/views/test_import.py -v`
Expected: FAIL — `import_csv_confirm` not defined.

- [ ] **Step 3: Implement the confirm view**

Append to `affordability/views.py`:

```python
@login_required
def import_csv_confirm(request):
    if request.method != "POST":
        return redirect("import_csv")

    token = request.session.get("import_token")
    if not token or not import_service.temp_exists(token):
        messages.error(request, "Your import session expired. "
                                "Please upload the file again.")
        return redirect("import_csv")

    try:
        text = import_service.read_temp(token)
        parsed = csv_import.parse_bank_csv(text, timezone.localdate())
        groups = csv_import.group_by_month(parsed.rows)
        choices = {
            g.period: request.POST.get(f"choice-{g.period.isoformat()}", "skip")
            for g in groups
        }
    except Exception:
        import_service.delete_temp(token)
        request.session.pop("import_token", None)
        logger.exception("CSV import parse/prepare failed")
        messages.error(request, "We couldn't process this file. "
                                "Please check it and try again.")
        return redirect("import_csv")

    try:
        result = import_service.commit_import(request.user, groups, choices)
    except Exception:
        import_service.delete_temp(token)
        request.session.pop("import_token", None)
        logger.exception("CSV import commit failed")
        messages.error(request, "Something went wrong saving your import — "
                                "no changes were made. Please try again.")
        return redirect("import_csv")

    import_service.delete_temp(token)
    request.session.pop("import_token", None)
    months = result.created_statements + result.replaced_statements
    messages.success(
        request,
        f"Imported {result.created_transactions} transactions across "
        f"{months} month(s); {result.skipped_statements} skipped.")
    return redirect("statements")
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/views/test_import.py -v`
Expected: PASS (all tests in this file).

- [ ] **Step 5: Checkpoint** — stage and pause.

```bash
git add affordability/views.py affordability/tests/views/test_import.py
# feat(import): confirm view with Replace/Skip, atomic commit, cleanup
```

---

## Task 12: Stale-sweep command + full-suite gate

**Files:**
- Create: `affordability/management/__init__.py`
- Create: `affordability/management/commands/__init__.py`
- Create: `affordability/management/commands/clear_stale_imports.py`
- Modify: `affordability/tests/test_import_service.py`

- [ ] **Step 1: Write the failing test**

Append to `affordability/tests/test_import_service.py`:

```python
from io import StringIO
from django.core.management import call_command


def test_clear_stale_imports_command(tmp_import_dir):
    token = import_service.save_upload_to_temp(_FakeUpload(b"x"))
    path = import_service.temp_path(token)
    old = os.path.getmtime(path) - 7200
    os.utime(path, (old, old))
    out = StringIO()
    call_command("clear_stale_imports", "--max-age", "3600", stdout=out)
    assert "Removed 1" in out.getvalue()
    assert not os.path.exists(path)
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest affordability/tests/test_import_service.py::test_clear_stale_imports_command -v`
Expected: FAIL — Unknown command `clear_stale_imports`.

- [ ] **Step 3: Create the management command package + command**

Create empty `affordability/management/__init__.py` and `affordability/management/commands/__init__.py`.

Create `affordability/management/commands/clear_stale_imports.py`:

```python
from django.core.management.base import BaseCommand
from affordability import import_service


class Command(BaseCommand):
    help = "Delete abandoned CSV import temp files older than the TTL."

    def add_arguments(self, parser):
        parser.add_argument("--max-age", type=int, default=3600,
                            help="Maximum age in seconds before a temp file is removed.")

    def handle(self, *args, **options):
        removed = import_service.clear_stale_imports(options["max_age"])
        self.stdout.write(f"Removed {removed} stale import file(s).")
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest affordability/tests/test_import_service.py -v`
Expected: PASS.

- [ ] **Step 5: Run the WHOLE suite**

Run: `pytest -v`
Expected: PASS — all Phase 1 + Phase 2 tests and the original suite.

- [ ] **Step 6: Manual smoke test (optional but recommended)**

```bash
python manage.py migrate
python manage.py runserver
```
Log in (`test@example.com` / `password123`), open `/statements/`, click **Import bank
statement (CSV)**, upload a small CSV with `Date,Description,Debit,Credit`, confirm,
and verify the statements + trend render.

- [ ] **Step 7: Checkpoint** — stage and pause.

```bash
git add affordability/management/ affordability/tests/test_import_service.py
# feat(import): management command to sweep stale import temp files
```

---

## Self-review (completed by plan author)

- **Spec coverage (§6):** row mapping → month groups (Task 5); separate debit/credit format + tolerant parsing (Tasks 2–4); keep manual entry + CSV primary link (Task 9); `transaction_date` persisted, raw file not persisted (Tasks 1, 6); preview + per-month Replace/Skip (Tasks 10–11); temp-file lifecycle + cleanup + stale sweep (Tasks 6, 12); ownership/token validation (Tasks 6, 11). **§6.4 failure handling:** file-level messages (Task 4, 10), row-level exclusion (Task 3), atomic rollback + session-expired + catch-all (Tasks 7, 11). **§7 FCA:** transient access-controlled temp file, deleted on every path (Tasks 6, 10, 11). **§8 testing:** parser, grouping, service, form, view, failure paths all covered.
- **Placeholders:** none — every step has runnable code/commands.
- **Type consistency:** `ParsedRow`, `RowError`, `ParsedImport`, `MonthGroup`, `parse_bank_csv(text, today)`, `group_by_month`, `save_upload_to_temp`/`read_temp`/`delete_temp`/`temp_exists`/`temp_path`/`clear_stale_imports`, `commit_import`/`ImportResult`, `CsvUploadForm`, `import_csv`/`import_csv_confirm`, session key `import_token`, and `choice-<ISO date>` field names are used identically across tasks and templates.
- **Cross-plan dependency:** Task 1 here assumes Phase 1's `Decimal` amount; the assessment/trend automatically reflect imported data with no extra work.

> **Note on test dates:** the view tests use 2020 dates so rows are never "future" relative to the real `timezone.localdate()`. The pure parser tests inject a fixed `today` for determinism.
```
