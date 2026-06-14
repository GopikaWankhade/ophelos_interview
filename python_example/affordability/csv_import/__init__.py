"""Bank-CSV import: pure parsing/grouping (`parser`) and the effectful
temp-file lifecycle + atomic commit (`service`).

Public API is re-exported here so callers can use `affordability.csv_import`
directly (e.g. `from affordability.csv_import import parse_bank_csv`).
"""
from .parser import (
    parse_bank_csv,
    group_by_month,
    ParsedRow,
    MonthGroup,
)
from . import service

__all__ = [
    "parse_bank_csv",
    "group_by_month",
    "ParsedRow",
    "MonthGroup",
    "service",
]
