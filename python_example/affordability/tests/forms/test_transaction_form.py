import pytest
from decimal import Decimal
from datetime import date, timedelta
from affordability.forms import TransactionForm

@pytest.mark.parametrize("data,valid", [
    ({"category": "income", "description": "Test", "amount": 100}, True),
    ({"category": "invalid", "description": "Test", "amount": 100}, False),
    ({"category": "income", "description": "", "amount": 100}, False),
])
def test_transaction_form(data, valid):
    form = TransactionForm(data)
    assert form.is_valid() == valid


def test_transaction_form_rejects_zero_amount():
    form = TransactionForm({"category": "income", "description": "x", "amount": "0"})
    assert not form.is_valid()
    assert "more than 0" in str(form.errors["amount"])


def test_transaction_form_rejects_negative_amount():
    form = TransactionForm({"category": "income", "description": "x", "amount": "-5.00"})
    assert not form.is_valid()
    assert "more than 0" in str(form.errors["amount"])


def test_transaction_form_rounds_amount_to_two_decimals():
    form = TransactionForm({"category": "income", "description": "x", "amount": "10.999"})
    assert form.is_valid(), form.errors
    assert form.cleaned_data["amount"] == Decimal("11.00")
