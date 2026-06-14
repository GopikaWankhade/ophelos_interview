# Decisions

## What I Built

I built a simple financial health feature that allows users to:

* Import bank transactions from a CSV export
* Create statements grouped by month
* View an affordability assessment for each month
* Track how their financial position changes over time

The assessment focuses on a few key metrics:

* Total income
* Total spending
* Disposable income (money left over)
* Spending as a percentage of income
* A simple status: Surplus, Tight, or Deficit

I also added a running balance so users can see whether their position is improving or worsening over time.

The goal wasn't to build a budgeting tool. It was to give someone in financial difficulty a clear view of where they stand and whether things are moving in the right direction.

---

## Key Decisions

I deliberately chose to focus on affordability first because debt resolution starts with understanding whether current spending is sustainable. Financial health is a broad concept, but within the time constraints I felt that showing disposable income, spending trends, and whether a customer was consistently operating at a deficit would provide the most actionable insight.

### Monthly statements instead of daily tracking

I decided to use monthly statements because debt repayment and affordability conversations are usually monthly.

This also makes it much easier to understand trends over time and avoids unnecessary complexity.

### Affordability is calculated, not stored

All affordability metrics are derived from the underlying transactions whenever they are viewed.

This keeps the system simple and ensures every figure can be traced back to the source data.

### CSV import as the primary input method

I chose to focus on CSV import because it felt closer to a real-world customer journey.

Someone trying to understand their financial position is more likely to have bank exports covering several months than manually entering dozens of transactions.

Manual entry is still available as a fallback.

### Use Decimal for all money calculations

Financial calculations should be accurate and predictable.

All monetary values use Decimal rather than floating-point arithmetic to avoid rounding issues.

### Supportive customer messaging

Given Ophelos operates in a regulated debt-resolution space, I wanted the language to be supportive rather than judgmental.

For customers running a deficit, the application provides guidance and signposts free debt-advice organisations rather than presenting the result as a failure.

---

## FCA and Data Considerations

A few things influenced my implementation:

* Derived affordability decisions are not stored
* Raw uploaded bank statement files are treated as temporary and deleted after processing
* Users are shown how the affordability assessment was calculated
* Messaging avoids making definitive lending or credit decisions

I wanted the feature to provide guidance while remaining transparent about how results are produced.

---

## What I Left Out

A few areas would be important in a production system but were intentionally out of scope:

* Categorising spending into essential vs non-essential expenses
* Debt-specific modelling and repayment recommendations
* Interest calculations
* Multiple debt accounts and creditor-level views
* Visual charts and dashboards
* Editing previously imported transactions
* Support for arbitrary CSV formats

I prioritised a smaller, complete solution over a broader but partially finished one.

---

## What I'd Do Next

If I had more time, I would focus on three areas:

1. Introduce spending categorisation and affordability rules based on recognised financial guidance such as the Standard Financial Statement.
2. Add richer visualisation so customers can quickly understand trends such as visual charts.
3. Expand the import process to support a wider range of bank formats and account providers.
4. Edit or deletion of bank statements in case user wants to fix something.

I would also spend more time validating the affordability assessment with real users to ensure the feature is genuinely useful for people managing debt rather than simply producing accurate calculations.

---

## Time Spent

Approximately 4–5 hours.


*See also: [`SESSION_LOG.md`](SESSION_LOG.md) for the AI asistant prompt history, and
[`docs/`](docs/) (specs and plans) for the design detail.*
