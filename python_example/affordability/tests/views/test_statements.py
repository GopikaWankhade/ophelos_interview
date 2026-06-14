import pytest
from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from django.urls import reverse
from affordability.models import Statement, Transaction

@pytest.mark.django_db
def test_statements_view_requires_login(client):
    response = client.get(reverse("statements"))
    assert response.status_code == 302
    assert response.url == "/accounts/login/?next=/statements/"

@pytest.mark.django_db
def test_statements_view_authenticated(client):
    test_user = User.objects.create_user(username="testuser", password="testpass")
    client.login(username=test_user.username, password="testpass")

    response = client.get(reverse("statements"))
    assert response.status_code == 200
    assert "Your Statements" in response.content.decode()

@pytest.mark.django_db
def test_statements_index_shows_trend(client):
    user = User.objects.create_user(username="tr", password="pw")
    jan = Statement.objects.create(user=user, statement_period=date(2026, 1, 31))
    Transaction.objects.create(statement=jan, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=jan, category="expenditure", description="Spend", amount=Decimal("1500.00"))
    feb = Statement.objects.create(user=user, statement_period=date(2026, 2, 28))
    Transaction.objects.create(statement=feb, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=feb, category="expenditure", description="Spend", amount=Decimal("1800.00"))
    client.login(username="tr", password="pw")
    body = client.get(reverse("statements")).content.decode()
    assert "Your position" in body
    assert "Status" in body and "Surplus" in body            # status column
    assert "Income" in body and "Total spending" in body     # £ columns
    assert "Affordable repayment" not in body               # removed
    assert "Change" not in body                              # confusing column gone
    assert "On average" in body                              # summary line
    assert "500.00" in body and "200.00" in body             # months' money left over
    assert "75.00%" in body                                   # Jan spending ratio


@pytest.mark.django_db
def test_trend_summary_is_amount_aware_when_in_deficit(client):
    user = User.objects.create_user(username="od", password="pw")
    m1 = Statement.objects.create(user=user, statement_period=date(2026, 1, 31))
    Transaction.objects.create(statement=m1, category="income", description="Pay", amount=Decimal("1000.00"))
    Transaction.objects.create(statement=m1, category="expenditure", description="Spend", amount=Decimal("3000.00"))
    m2 = Statement.objects.create(user=user, statement_period=date(2026, 2, 28))
    Transaction.objects.create(statement=m2, category="income", description="Pay", amount=Decimal("1000.00"))
    Transaction.objects.create(statement=m2, category="expenditure", description="Spend", amount=Decimal("2000.00"))
    client.login(username="od", password="pw")
    body = client.get(reverse("statements")).content.decode()
    # Average money left over is negative, so don't claim things are "trending up".
    assert "trending up" not in body
    assert "spending more than your income" in body
    assert "£3,000.00" in body  # money format with thousands separator


@pytest.mark.django_db
def test_create_statement_view(client):
    test_user = User.objects.create_user(username="testuser", password="testpass")
    client.login(username=test_user.username, password="testpass")

    response = client.post(reverse("new_statement"), {
        "statement_period": date.today(),
        "transactions-TOTAL_FORMS": 5,
        "transactions-INITIAL_FORMS": 0,
    })
    assert Statement.objects.count() == 1
    assert response.status_code == 302
    assert response.url == "/statements/"

@pytest.mark.django_db
def test_view_statement(client):
    test_user = User.objects.create_user(username="testuser", password="testpass")
    statement = Statement.objects.create(user=test_user, statement_period=date.today())
    Transaction.objects.create(statement=statement, category="income", description="Salary", amount=2000)

    client.login(username=test_user.username, password="testpass")
    response = client.get(reverse("view_statement", args=[statement.id]))

    assert response.status_code == 200
    assert "Statement for" in response.content.decode()
    assert "Salary" in response.content.decode()


@pytest.mark.django_db
def test_view_statement_shows_assessment_and_balances(client):
    user = User.objects.create_user(username="v1", password="pw")
    s = Statement.objects.create(user=user, statement_period=date.today())
    Transaction.objects.create(statement=s, category="income", description="Pay", amount=Decimal("2000.00"))
    Transaction.objects.create(statement=s, category="expenditure", description="Rent", amount=Decimal("1500.00"))
    client.login(username="v1", password="pw")
    body = client.get(reverse("view_statement", args=[s.id])).content.decode()
    assert "500.00" in body                    # money left over (the working)
    assert "Start balance" in body and "End balance" in body  # balances shown
    assert "moneyhelper" not in body.lower()   # no signposting when in surplus
    assert "affordability decision" not in body  # disclaimer only on deficit


@pytest.mark.django_db
def test_view_statement_deficit_signposts_and_flags_overdraft(client):
    user = User.objects.create_user(username="v2", password="pw")
    s = Statement.objects.create(user=user, statement_period=date.today())
    Transaction.objects.create(statement=s, category="income", description="Pay", amount=Decimal("1000.00"))
    Transaction.objects.create(statement=s, category="expenditure", description="Rent", amount=Decimal("1200.00"))
    client.login(username="v2", password="pw")
    body = client.get(reverse("view_statement", args=[s.id])).content.decode()
    assert "StepChange" in body or "moneyhelper" in body.lower()  # signposting shown
    assert "overdrawn" in body.lower()                            # negative end balance flagged
    assert "affordability decision" in body                       # disclaimer shown on deficit
