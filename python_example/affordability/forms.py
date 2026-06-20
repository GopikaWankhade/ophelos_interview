from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django import forms
from django.conf import settings
from django.forms import inlineformset_factory
from .models import Statement, Transaction
from .assessment import month_end

MONTHS_OFFERED = 12


class StatementForm(forms.ModelForm):
    # A statement is per-month: pick a month, stored as that month's last day.
    statement_period = forms.ChoiceField(choices=[], label="Month")

    class Meta:
        model = Statement
        fields = ['statement_period']

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['statement_period'].choices = self._available_months(user)

    @staticmethod
    def _available_months(user):
        """The last 12 months (current first), excluding months the user already
        has a statement for, so taken months can't be selected."""
        taken = set()
        if user is not None and getattr(user, "pk", None):
            taken = set(Statement.objects.filter(user=user)
                        .values_list("statement_period", flat=True))
        today = date.today()
        year, month = today.year, today.month
        choices = []
        for _ in range(MONTHS_OFFERED):
            end = month_end(year, month)
            if end not in taken:
                choices.append((end.isoformat(), end.strftime("%B %Y")))
            month -= 1
            if month == 0:
                month, year = 12, year - 1
        return choices

    def clean_statement_period(self):
        try:
            return date.fromisoformat(self.cleaned_data["statement_period"])
        except (TypeError, ValueError):
            raise forms.ValidationError("Please choose a month.")

class TransactionForm(forms.ModelForm):
    # Accept extra precision so we can round (rather than reject) to 2 dp.
    amount = forms.DecimalField()

    class Meta:
        model = Transaction
        fields = ['category', 'description', 'amount']

    def clean_amount(self):
        amount = self.cleaned_data.get("amount")
        if amount is None:
            return amount
        amount = amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if amount <= 0:
            raise forms.ValidationError("Amount should be more than 0.")
        return amount

TransactionFormSet = inlineformset_factory(Statement, Transaction, form=TransactionForm, extra=5, can_delete=False)


class CsvUploadForm(forms.Form):
    file = forms.FileField()

    def clean_file(self):
        uploaded = self.cleaned_data["file"]
        if not (uploaded.name or "").lower().endswith(".csv"):
            raise forms.ValidationError(
                "That doesn't look like a CSV file — please upload the .csv "
                "your bank exported.")
        max_size = getattr(settings, "MAX_IMPORT_FILE_SIZE", 5 * 1024 * 1024)
        if uploaded.size > max_size:
            mb = max(1, max_size // (1024 * 1024))
            raise forms.ValidationError(
                f"This file is too large (max {mb} MB). Please upload a "
                "smaller export.")
        return uploaded


RANGE_CHOICES = [
    ("3", "Last 3 months"),
    ("6", "Last 6 months"),
    ("12", "Last 12 months"),
    ("custom", "Custom range"),
]
MONTHS_FOR_CUSTOM = 24


def _custom_month_choices():
    """Month-end isoformat -> label for the last 24 months (current first)."""
    today = date.today()
    year, month = today.year, today.month
    choices = [("", "—")]
    for _ in range(MONTHS_FOR_CUSTOM):
        end = month_end(year, month)
        choices.append((end.isoformat(), end.strftime("%B %Y")))
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return choices


class OverviewRangeForm(forms.Form):
    range = forms.ChoiceField(choices=RANGE_CHOICES, required=False, label="Range")
    from_month = forms.ChoiceField(choices=[], required=False, label="From")
    to_month = forms.ChoiceField(choices=[], required=False, label="To")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        months = _custom_month_choices()
        self.fields["from_month"].choices = months
        self.fields["to_month"].choices = months

    def clean(self):
        cleaned = super().clean()
        if not cleaned.get("range"):
            cleaned["range"] = "6"

        from_period = self._to_date(cleaned.get("from_month"))
        to_period = self._to_date(cleaned.get("to_month"))

        if cleaned["range"] == "custom":
            if from_period is None or to_period is None:
                raise forms.ValidationError(
                    "Please choose both a start and an end month for a custom range.")
            if from_period > to_period:
                self.add_error("from_month",
                               "The start month can't be after the end month.")

        cleaned["from_period"] = from_period
        cleaned["to_period"] = to_period
        return cleaned

    @staticmethod
    def _to_date(value):
        if not value:
            return None
        try:
            return date.fromisoformat(value)
        except (TypeError, ValueError):
            return None
