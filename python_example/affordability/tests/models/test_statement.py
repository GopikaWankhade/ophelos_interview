import pytest
from datetime import date, timedelta
from decimal import Decimal
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
def test_statement_total_outstanding_debt_optional_and_decimal():
    user = User.objects.create_user(username="debt", password="pw")
    s1 = Statement.objects.create(user=user, statement_period=date.today())
    assert s1.total_outstanding_debt is None
    s2 = Statement.objects.create(
        user=user, statement_period=date.today(),
        total_outstanding_debt=Decimal("500.00"),
    )
    s2.refresh_from_db()
    assert s2.total_outstanding_debt == Decimal("500.00")
