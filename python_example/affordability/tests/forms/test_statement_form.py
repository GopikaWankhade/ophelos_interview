import pytest
from decimal import Decimal
from datetime import date, timedelta
from affordability.forms import StatementForm

@pytest.mark.parametrize("data,valid", [
    ({"statement_period": date.today()}, True),
    ({"statement_period": date.today() + timedelta(days=30)}, False),
])
def test_statement_form(data, valid):
    form = StatementForm(data)
    assert form.is_valid() == valid
