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
