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

from ..models import Statement, Transaction

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
    path = temp_path(token)
    try:
        with open(path, "wb") as fh:
            for chunk in uploaded_file.chunks():
                fh.write(chunk)
    except Exception:
        # Never leave a half-written upload behind on a failed save.
        try:
            os.remove(path)
        except OSError:
            pass
        raise
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
            # Only an explicit "replace" overwrites; anything else (missing or an
            # unexpected value) is treated as the safe default: skip.
            if choices.get(group.period) != "replace":
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
