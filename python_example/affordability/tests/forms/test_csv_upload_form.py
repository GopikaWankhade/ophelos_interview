from django.core.files.uploadedfile import SimpleUploadedFile
from affordability.forms import CsvUploadForm


def _upload(name, content=b"Date,Description,Debit,Credit\n"):
    return {"file": SimpleUploadedFile(name, content, content_type="text/csv")}


def test_accepts_csv():
    form = CsvUploadForm({}, _upload("statement.csv"))
    assert form.is_valid(), form.errors


def test_rejects_non_csv_with_message():
    form = CsvUploadForm({}, _upload("statement.pdf"))
    assert not form.is_valid()
    assert "look like a CSV file" in str(form.errors["file"])


def test_rejects_oversized_file(settings):
    settings.MAX_IMPORT_FILE_SIZE = 10  # 10 bytes
    form = CsvUploadForm({}, _upload("big.csv", b"x" * 50))
    assert not form.is_valid()
    assert "too large" in str(form.errors["file"])
