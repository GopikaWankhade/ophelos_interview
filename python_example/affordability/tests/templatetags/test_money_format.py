from decimal import Decimal
from affordability.templatetags.money_format import money, absval


def test_money_formats_with_thousands_and_two_decimals():
    assert money(Decimal("2439.5")) == "£2,439.50"
    assert money(Decimal("1000000")) == "£1,000,000.00"
    assert money(Decimal("0")) == "£0.00"


def test_money_negative_sign_before_symbol():
    assert money(Decimal("-580.50")) == "-£580.50"


def test_money_none_or_empty_is_blank():
    assert money(None) == ""
    assert money("") == ""


def test_money_non_numeric_returned_unchanged():
    assert money("n/a") == "n/a"


def test_money_negative_zero_has_no_sign():
    assert money(Decimal("-0.00")) == "£0.00"


def test_absval_makes_positive():
    assert absval(Decimal("-780.50")) == Decimal("780.50")
