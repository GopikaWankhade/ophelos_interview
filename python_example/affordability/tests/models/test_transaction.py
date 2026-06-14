import pytest
from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from affordability.models import Statement, Transaction

@pytest.mark.django_db
def test_transaction_creation():
    test_user = User.objects.create_user(username="testuser", password="testpass")
    statement = Statement.objects.create(user=test_user, statement_period=date.today())
    transaction = Transaction.objects.create(
        statement=statement,
        category="income",
        description="Test Income",
        amount=1000
    )

    assert transaction.statement == statement
    assert transaction.category == "income"
    assert transaction.amount == 1000
    assert transaction.description == "Test Income"


@pytest.mark.django_db
def test_transaction_amount_is_decimal():
    user = User.objects.create_user(username="dec", password="pw")
    statement = Statement.objects.create(user=user, statement_period=date.today())
    txn = Transaction.objects.create(
        statement=statement, category="income", description="Salary",
        amount=Decimal("1234.56"),
    )
    txn.refresh_from_db()
    assert txn.amount == Decimal("1234.56")


@pytest.mark.django_db
def test_transaction_amount_rejects_negative():
    user = User.objects.create_user(username="neg", password="pw")
    statement = Statement.objects.create(user=user, statement_period=date.today())
    txn = Transaction(
        statement=statement, category="expenditure", description="Bad",
        amount=Decimal("-1.00"),
    )
    with pytest.raises(ValidationError):
        txn.full_clean()


@pytest.mark.django_db
def test_transaction_date_is_optional():
    user = User.objects.create_user(username="td", password="pw")
    statement = Statement.objects.create(user=user, statement_period=date.today())
    txn = Transaction.objects.create(statement=statement, category="income",
                                     description="Pay", amount=Decimal("10.00"))
    assert txn.transaction_date is None
    txn2 = Transaction.objects.create(statement=statement, category="income",
                                      description="Pay", amount=Decimal("10.00"),
                                      transaction_date=date(2026, 1, 15))
    txn2.refresh_from_db()
    assert txn2.transaction_date == date(2026, 1, 15)
