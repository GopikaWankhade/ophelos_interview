from datetime import date
from affordability.forms import OverviewRangeForm, month_end


def test_preset_is_valid_with_no_custom_fields():
    form = OverviewRangeForm({"range": "3"})
    assert form.is_valid(), form.errors
    assert form.cleaned_data["range"] == "3"
    assert form.cleaned_data["from_period"] is None
    assert form.cleaned_data["to_period"] is None


def test_blank_defaults_to_six():
    form = OverviewRangeForm({})
    assert form.is_valid(), form.errors
    assert form.cleaned_data["range"] == "6"


def test_custom_requires_both_bounds():
    form = OverviewRangeForm({"range": "custom", "from_month": month_end(2026, 1).isoformat()})
    assert not form.is_valid()
    assert "from_month" in form.errors or "to_month" in form.errors or "__all__" in form.errors


def test_custom_rejects_from_after_to():
    form = OverviewRangeForm({
        "range": "custom",
        "from_month": month_end(2026, 5).isoformat(),
        "to_month": month_end(2026, 2).isoformat(),
    })
    assert not form.is_valid()
    assert "from_month" in form.errors or "__all__" in form.errors


def test_custom_valid_parses_periods():
    form = OverviewRangeForm({
        "range": "custom",
        "from_month": month_end(2026, 2).isoformat(),
        "to_month": month_end(2026, 5).isoformat(),
    })
    assert form.is_valid(), form.errors
    assert form.cleaned_data["from_period"] == month_end(2026, 2)
    assert form.cleaned_data["to_period"] == month_end(2026, 5)
