from decimal import Decimal
from affordability.assessment import assess
from affordability.messaging import message_for, SIGNPOSTS


def test_deficit_message_signposts_support():
    a = assess(Decimal("1000.00"), Decimal("1200.00"), has_transactions=True)
    msg = message_for(a)
    assert msg["show_signposting"] is True
    assert msg["headline"]
    assert SIGNPOSTS  # at least one free debt-advice link


def test_surplus_message_does_not_signpost():
    a = assess(Decimal("2000.00"), Decimal("1000.00"), has_transactions=True)
    msg = message_for(a)
    assert msg["show_signposting"] is False


def test_no_data_message():
    a = assess(Decimal("0"), Decimal("0"), has_transactions=False)
    msg = message_for(a)
    assert msg["headline"]
    assert msg["show_signposting"] is False
