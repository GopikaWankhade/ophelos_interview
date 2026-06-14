from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from datetime import date
from decimal import Decimal
import calendar


class Statement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="statements", db_index=True)
    statement_period = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "statement_period"],
                name="unique_user_statement_period",
            ),
        ]

    def clean(self):
        # A statement represents a whole month, so compare at month granularity:
        # the current (in-progress) month is allowed, only later months are "future".
        if self.statement_period:
            today = date.today()
            last_day = calendar.monthrange(today.year, today.month)[1]
            current_month_end = date(today.year, today.month, last_day)
            if self.statement_period > current_month_end:
                raise ValidationError("Statement period cannot be in the future.")

    def save(self, *args, **kwargs):
        if isinstance(self.statement_period, dict):
            try:
                year = self.statement_period.get("year")
                month = self.statement_period.get("month")
                last_day = calendar.monthrange(year, month)[1]
                self.statement_period = date(year, month, last_day)
            except (TypeError, ValueError):
                raise ValidationError("Invalid statement period format.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Statement for {self.user.username} - {self.statement_period.strftime('%Y-%m')}"


class Transaction(models.Model):
    CATEGORY_CHOICES = [
        ("income", "Income"),
        ("expenditure", "Expenditure"),
    ]


    statement = models.ForeignKey(Statement, on_delete=models.CASCADE, related_name="transactions", db_index=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.CharField(max_length=100)
    transaction_date = models.DateField(null=True, blank=True)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.category.capitalize()}: {self.amount} for {self.statement.user.username}"
