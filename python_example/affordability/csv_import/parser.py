"""Pure bank-CSV parsing and monthly grouping. No Django ORM here.

Expected columns: date, description, and debit and/or credit
(debit = money out -> expenditure, credit = money in -> income).
Returns structured file/row errors instead of raising on expected problems.
"""
from __future__ import annotations

import calendar
import csv
import io
import re
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

# Day-first (UK) only. We deliberately exclude month-first (%m/%d/%Y): with a
# UK default it would silently misparse ambiguous US-style dates and put a row
# in the wrong month. Impossible day-first dates fail loudly as row errors.
DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y")

HEADER_ALIASES = {
    "date": {"date", "transaction date", "transactiondate", "posting date", "posted"},
    "description": {"description", "details", "narrative", "memo", "reference"},
    "debit": {"debit", "money out", "paid out", "withdrawal", "out"},
    "credit": {"credit", "money in", "paid in", "deposit", "in"},
}

_INVALID = object()
TWO_PLACES = Decimal("0.01")
# A plain decimal number only — rejects NaN, Infinity, and scientific notation
# (e.g. "1e3"), which Decimal() would otherwise accept silently.
_AMOUNT_RE = re.compile(r"^-?\d+(\.\d+)?$")

# Limits that mirror the database fields, so an out-of-range row becomes a clean
# per-row error in the preview instead of crashing the atomic commit
# (Transaction.amount is DecimalField(max_digits=10, decimal_places=2);
# Transaction.description is CharField(max_length=100)).
MAX_AMOUNT = Decimal("99999999.99")
DESCRIPTION_MAX_LENGTH = 100

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
    if _missing_columns(columns):
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
        # Distinguish an explicit zero (clear, actionable) from a blank row.
        if (debit is not None and debit == 0) or (credit is not None and credit == 0):
            return None, RowError(line_no, "Amount should be more than 0.")
        return None, RowError(line_no, "Row has no amount.")

    amount = debit if has_debit else credit
    if amount > MAX_AMOUNT:
        return None, RowError(line_no, "Amount is too large.")
    category = "expenditure" if has_debit else "income"
    return ParsedRow(line_no, txn_date, description[:DESCRIPTION_MAX_LENGTH],
                     category, amount), None


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
    if not _AMOUNT_RE.match(cleaned):
        return _INVALID
    try:
        return Decimal(cleaned).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)
    except (InvalidOperation, ValueError):
        return _INVALID


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
