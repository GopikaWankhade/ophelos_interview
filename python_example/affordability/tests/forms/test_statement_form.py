import pytest
from datetime import date
from django.contrib.auth.models import User
from affordability.forms import StatementForm, month_end
from affordability.models import Statement


def _current_month_end():
    today = date.today()
    return month_end(today.year, today.month)


@pytest.mark.django_db
def test_form_offers_last_12_months_including_current():
    user = User.objects.create_user(username="f1", password="pw")
    values = [v for v, _ in StatementForm(user=user).fields["statement_period"].choices]
    assert len(values) == 12
    assert _current_month_end().isoformat() in values  # current month allowed


@pytest.mark.django_db
def test_form_excludes_months_already_taken():
    user = User.objects.create_user(username="f2", password="pw")
    taken = _current_month_end()
    Statement.objects.create(user=user, statement_period=taken)
    values = [v for v, _ in StatementForm(user=user).fields["statement_period"].choices]
    assert taken.isoformat() not in values
    assert len(values) == 11


@pytest.mark.django_db
def test_form_accepts_available_month_and_stores_month_end():
    user = User.objects.create_user(username="f3", password="pw")
    chosen = _current_month_end()
    form = StatementForm({"statement_period": chosen.isoformat()}, user=user)
    assert form.is_valid(), form.errors
    assert form.cleaned_data["statement_period"] == chosen


@pytest.mark.django_db
def test_form_rejects_a_taken_month_even_if_posted():
    user = User.objects.create_user(username="f4", password="pw")
    taken = _current_month_end()
    Statement.objects.create(user=user, statement_period=taken)
    form = StatementForm({"statement_period": taken.isoformat()}, user=user)
    assert not form.is_valid()  # server-side enforcement, not just UI
