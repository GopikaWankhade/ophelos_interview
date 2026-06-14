from decimal import Decimal, ROUND_HALF_UP

from django import forms
from django.conf import settings
from django.forms import inlineformset_factory
from .models import Statement, Transaction

class StatementForm(forms.ModelForm):
    statement_period = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date'}),
        required=True
    )
    class Meta:
        model = Statement
        fields = ['statement_period']

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
