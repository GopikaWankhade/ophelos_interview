"""Customer-facing copy keyed by assessment status. Supportive, non-judgmental,
appropriate for people who may be in financial difficulty (FCA duty of care)."""
from affordability.assessment import (
    STATUS_NO_DATA, STATUS_DEFICIT, STATUS_TIGHT, STATUS_SURPLUS,
)

SIGNPOSTS = [
    {"name": "MoneyHelper", "url": "https://www.moneyhelper.org.uk/"},
    {"name": "StepChange", "url": "https://www.stepchange.org/"},
    {"name": "National Debtline", "url": "https://www.nationaldebtline.org/"},
]

DISCLAIMER = (
    "This is guidance based on the figures you provided, not a credit or "
    "affordability decision."
)

MESSAGES = {
    STATUS_NO_DATA: {
        "headline": "Add your income and spending to see your position.",
        "body": "Once you add transactions or import a bank statement, "
                "we'll show your affordability here.",
        "show_signposting": False,
    },
    STATUS_DEFICIT: {
        "headline": "Your spending is higher than your income this month.",
        "body": "You're not alone, and support is available. Free, confidential "
                "debt advice can help you find a way forward.",
        "show_signposting": True,
    },
    STATUS_TIGHT: {
        "headline": "Your income and spending are closely matched this month.",
        "body": "There isn't much left over right now. Free debt advice is "
                "available if you'd like support.",
        "show_signposting": True,
    },
    STATUS_SURPLUS: {
        "headline": "You have some money left over this month.",
        "body": "Keeping a buffer for unexpected costs is a good idea. You can see "
                "how your balance is building up over time on your statements page.",
        "show_signposting": False,
    },
}


def message_for(assessment):
    return MESSAGES[assessment.message_key]
