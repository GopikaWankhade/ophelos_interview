"""Template filters for displaying money consistently.

`money` formats a Decimal as GBP currency with thousands separators, two
decimal places, and the sign before the £ symbol (e.g. -£580.50).
"""
from decimal import Decimal, InvalidOperation

from django import template

register = template.Library()

TWO_PLACES = Decimal("0.01")


@register.filter
def money(value):
    if value is None or value == "":
        return ""
    try:
        amount = Decimal(value).quantize(TWO_PLACES)
    except (InvalidOperation, TypeError, ValueError):
        return value
    sign = "-" if amount < 0 else ""
    return f"{sign}£{abs(amount):,.2f}"


@register.filter
def absval(value):
    try:
        return abs(Decimal(value))
    except (InvalidOperation, TypeError, ValueError):
        return value
