from decimal import Decimal
from datetime import date
from affordability.csv_import import parse_bank_csv, group_by_month

TODAY = date(2026, 6, 14)


def test_debit_is_expenditure_credit_is_income():
    text = (
        "Date,Description,Debit,Credit\n"
        "2026-01-05,Rent,800.00,\n"
        "2026-01-25,Salary,,2000.00\n"
    )
    result = parse_bank_csv(text, TODAY)
    assert result.file_error is None
    assert len(result.rows) == 2
    rent = result.rows[0]
    assert rent.category == "expenditure"
    assert rent.amount == Decimal("800.00")
    assert rent.transaction_date == date(2026, 1, 5)
    salary = result.rows[1]
    assert salary.category == "income"
    assert salary.amount == Decimal("2000.00")


def test_header_aliases_and_case_insensitive():
    text = (
        "transaction date,details,money out,money in\n"
        "05/01/2026,Tesco,12.50,\n"
    )
    result = parse_bank_csv(text, TODAY)
    assert result.file_error is None
    assert len(result.rows) == 1
    assert result.rows[0].category == "expenditure"
    assert result.rows[0].amount == Decimal("12.50")
    assert result.rows[0].transaction_date == date(2026, 1, 5)


def test_amount_cleaning_strips_symbols_and_commas():
    text = "Date,Description,Debit,Credit\n2026-01-05,Big,\"£1,234.56\",\n"
    result = parse_bank_csv(text, TODAY)
    assert result.rows[0].amount == Decimal("1234.56")


def test_row_errors_are_collected_not_raised():
    text = (
        "Date,Description,Debit,Credit\n"
        "not-a-date,Bad date,10.00,\n"        # bad date
        "2026-01-05,Both,10.00,5.00\n"        # both debit & credit
        "2026-01-06,Neither,,\n"              # neither
        "2026-01-07,Negative,-5.00,\n"        # negative
        "2026-01-08,Letters,abc,\n"           # non-numeric
        "2026-01-09,Good,12.00,\n"            # valid
    )
    result = parse_bank_csv(text, TODAY)
    assert len(result.rows) == 1
    assert len(result.row_errors) == 5
    assert result.rows[0].description == "Good"


def test_amount_too_large_is_row_error():
    # Exceeds DecimalField(max_digits=10, decimal_places=2) capacity.
    text = "Date,Description,Debit,Credit\n2026-01-05,Big,150000000.00,\n"
    result = parse_bank_csv(text, TODAY)
    assert result.rows == []
    assert any("too large" in e.message.lower() for e in result.row_errors)


def test_amount_at_field_limit_is_accepted():
    text = "Date,Description,Debit,Credit\n2026-01-05,Max,99999999.99,\n"
    result = parse_bank_csv(text, TODAY)
    assert len(result.rows) == 1
    assert result.rows[0].amount == Decimal("99999999.99")


def test_long_description_is_truncated_to_field_limit():
    long = "x" * 150
    text = f"Date,Description,Debit,Credit\n2026-01-05,{long},10.00,\n"
    result = parse_bank_csv(text, TODAY)
    assert len(result.rows) == 1
    assert len(result.rows[0].description) == 100


def test_ambiguous_us_style_date_is_rejected_not_misparsed():
    # 02/13/2026 is impossible day-first; must fail loudly, never parse as US.
    text = "Date,Description,Debit,Credit\n02/13/2026,US date,10.00,\n"
    result = parse_bank_csv(text, TODAY)
    assert result.rows == []
    assert any("date" in e.message.lower() for e in result.row_errors)


def test_uk_day_first_date_wins():
    text = "Date,Description,Debit,Credit\n03/04/2026,Ambiguous,10.00,\n"
    result = parse_bank_csv(text, TODAY)
    assert len(result.rows) == 1
    assert result.rows[0].transaction_date == date(2026, 4, 3)  # 3 April, not 4 March


def test_zero_amount_row_is_rejected_with_clear_message():
    text = "Date,Description,Debit,Credit\n2026-01-05,Zero,0.00,\n"
    result = parse_bank_csv(text, TODAY)
    assert result.rows == []
    assert any("more than 0" in e.message.lower() for e in result.row_errors)


def test_amount_is_rounded_to_two_decimals():
    text = "Date,Description,Debit,Credit\n2026-01-05,Round,10.999,\n"
    result = parse_bank_csv(text, TODAY)
    assert len(result.rows) == 1
    assert result.rows[0].amount == Decimal("11.00")


def test_future_dated_rows_are_excluded():
    text = "Date,Description,Debit,Credit\n2026-12-31,Future,10.00,\n"
    result = parse_bank_csv(text, TODAY)
    assert result.rows == []
    assert any("future" in e.message.lower() for e in result.row_errors)


def test_utf8_bom_is_handled():
    text = "﻿Date,Description,Debit,Credit\n2026-01-05,Rent,800.00,\n"
    result = parse_bank_csv(text, TODAY)
    assert result.file_error is None
    assert len(result.rows) == 1


def test_empty_file_returns_file_error():
    assert parse_bank_csv("", TODAY).file_error == \
        "This file looks empty — please check your export and try again."


def test_header_only_returns_file_error():
    result = parse_bank_csv("Date,Description,Debit,Credit\n", TODAY)
    assert result.file_error is not None
    assert result.rows == []


def test_missing_columns_message_lists_found_headers():
    result = parse_bank_csv("Foo,Bar\n1,2\n", TODAY)
    assert result.file_error is not None
    assert "Foo, Bar" in result.file_error
    assert "debit and/or credit" in result.file_error


def test_all_invalid_rows_returns_file_error():
    text = "Date,Description,Debit,Credit\nbad,x,10,\nbad2,y,5,\n"
    result = parse_bank_csv(text, TODAY)
    assert result.rows == []
    assert "couldn't read any valid transactions" in result.file_error


def test_group_by_month_creates_one_group_per_month():
    text = (
        "Date,Description,Debit,Credit\n"
        "2026-01-05,Rent,800.00,\n"
        "2026-01-25,Salary,,2000.00\n"
        "2026-02-03,Food,150.00,\n"
    )
    result = parse_bank_csv(text, TODAY)
    groups = group_by_month(result.rows)
    assert [g.period for g in groups] == [date(2026, 1, 31), date(2026, 2, 28)]
    jan = groups[0]
    assert jan.total_income == Decimal("2000.00")
    assert jan.total_expenditure == Decimal("800.00")
    assert len(jan.rows) == 2
    feb = groups[1]
    assert feb.total_expenditure == Decimal("150.00")
    assert feb.total_income == Decimal("0.00")
