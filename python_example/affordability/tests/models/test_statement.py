import pytest
from datetime import date, timedelta
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from affordability.models import Statement

@pytest.mark.django_db
def test_statement_creation():
    test_user = User.objects.create(username="testuser", password="testpass")

    statement = Statement.objects.create(user=test_user, statement_period=date.today())

    assert statement.user == test_user
    assert statement.statement_period == date.today()

@pytest.mark.django_db
def test_future_statement_period():
    test_user = User.objects.create_user(username="testuser", password="testpass")
    future_date = date.today() + timedelta(days=30)
    statement = Statement(user=test_user, statement_period=future_date)

    with pytest.raises(ValidationError, match="Statement period cannot be in the future."):
        statement.clean()


@pytest.mark.django_db
def test_current_month_is_allowed():
    import calendar
    user = User.objects.create_user(username="cm", password="pw")
    today = date.today()
    current_month_end = date(today.year, today.month,
                             calendar.monthrange(today.year, today.month)[1])
    statement = Statement(user=user, statement_period=current_month_end)
    statement.clean()  # must not raise even though month-end may be after today


@pytest.mark.django_db
def test_duplicate_month_for_user_is_rejected():
    from django.db import IntegrityError
    user = User.objects.create_user(username="dup", password="pw")
    period = date(2026, 1, 31)
    Statement.objects.create(user=user, statement_period=period)
    with pytest.raises(IntegrityError):
        Statement.objects.create(user=user, statement_period=period)
