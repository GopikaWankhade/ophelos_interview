# Affordability Statements

A small Django app that helps customers understand their financial position over time.

Customers can record monthly income and expenditure either manually or by importing a bank-export CSV. The application provides an affordability assessment for each month and helps users understand whether their financial position is improving or worsening over time.

The Django app lives in the `python_example/` directory — run all commands below from there.

---

## Approach

I focused on helping customers answer a few simple but important questions:
* How much money comes in each month?
* How much goes out each month?
* Am I consistently running a surplus or a deficit?
* Is my financial position improving or getting worse over time?

Rather than providing repayment recommendations, I focused on affordability and trend tracking. This keeps the calculations transparent and explainable while still giving customers useful insight into their financial health.

The feature is designed with a regulated debt-resolution environment in mind, where explainability, data minimisation, and supportive communication are important.

---

## Setup

1. Install Python 3.11+
2. Create a virtual environment and install dependencies:

```sh
cd python_example
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Run migrations and load the test user:

```sh
python manage.py migrate
python manage.py loaddata affordability/seed/0001_test_user.json
```

4. Start the application:

```sh
python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000/
```

### Login Details

```text
username: test@example.com
password: password123
```

---

## Running the Tests

```sh
pytest
```

The test suite covers:
* Affordability calculations
* Running balance and trend calculations
* CSV import behaviour
* Form validation
* Model validation
* View behaviour
* Edge cases such as zero income, deficit months, invalid CSV files, and malformed transaction data

---

## Features

* Monthly affordability assessments showing income, spending, disposable income, and affordability status
* Financial position tracking across multiple months
* Running balance / overdraft tracking
* CSV bank statement import with validation and preview
* Manual statement entry
* Supportive messaging and debt-advice signposting for deficit months

---

## Sample Data

Example CSV files are available in:

```text
sample_csvs/
```

Suggested demo flow:

1. Import `01_valid_jan_feb.csv`
2. Import `04_valid_mar_apr.csv`
3. Import `05_overdraft_may_jun.csv`

This demonstrates surplus months, trend tracking, and a transition into overdraft.

Additional files demonstrate validation and error handling scenarios.

---

## Privacy and Data Handling

Because bank statement data is sensitive:

* Uploaded files are stored only temporarily during processing
* Files are deleted once the import completes or fails
* Affordability assessments are derived from source transactions rather than stored separately
* Users can see how affordability calculations are produced

The goal is to minimise stored data while keeping calculations transparent and explainable.

---

## Additional Documentation

* `DECISIONS.md` – design decisions, trade-offs, and future improvements
* `SESSION_LOG.md` – development history and AI-assisted workflow
* `docs/` – supporting design and implementation notes
* `app_screenshots`

---

## Time Spent

Approximately 4–5 hours.
