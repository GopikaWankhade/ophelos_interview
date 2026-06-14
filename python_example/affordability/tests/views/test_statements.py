import pytest
from datetime import date
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
