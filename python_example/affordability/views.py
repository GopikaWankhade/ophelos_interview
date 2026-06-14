import logging

from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from .forms import StatementForm, TransactionFormSet, CsvUploadForm
from .models import Statement
from .csv_import import parser as csv_import, service as import_service
from .assessment import assess_statement, build_user_trend
from .messaging import message_for, SIGNPOSTS, DISCLAIMER

logger = logging.getLogger(__name__)


def index(request):
    if request.user.is_authenticated:
        return redirect('statements')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():

            user = form.get_user()
            login(request, user)
            return redirect('statements')
    else:
        form = AuthenticationForm()

    return render(request, 'home.html', {'form': form})

@login_required
def statements(request):
    statements = list(Statement.objects.filter(user=request.user)
                      .order_by('statement_period'))
    trend = build_user_trend(statements)
    return render(request, 'statements/index.html', {
        'statements': statements,
        'trend': trend,
    })

@login_required
def new_statement(request):
    if request.method == 'POST':
        statement_form = StatementForm(request.POST, user=request.user)
        transaction_formset = TransactionFormSet(request.POST)

        if statement_form.is_valid() and transaction_formset.is_valid():
            statement = statement_form.save(commit=False)
            statement.user = request.user
            statement.save()

            transactions = transaction_formset.save(commit=False)
            for transaction in transactions:
                transaction.statement = statement
                transaction.save()

            return redirect('statements')

    else:
        statement_form = StatementForm(user=request.user)
        transaction_formset = TransactionFormSet()

    return render(request, 'statements/new.html', {
        'form': statement_form,
        'transaction_formset': transaction_formset
    })

@login_required
def view_statement(request, statement_id):
    statement = get_object_or_404(Statement, id=statement_id, user=request.user)
    assessment = assess_statement(statement)
    # Running start/end balance for this month, derived across all the user's months.
    trend = build_user_trend(
        Statement.objects.filter(user=request.user).order_by('statement_period'))
    balance = next((p for p in trend.points
                    if p.period == statement.statement_period), None)
    return render(request, 'statements/view.html', {
        'statement': statement,
        'assessment': assessment,
        'balance': balance,
        'message': message_for(assessment),
        'signposts': SIGNPOSTS,
        'disclaimer': DISCLAIMER,
    })


@login_required
def import_csv(request):
    import_service.clear_stale_imports()
    if request.method != "POST":
        return render(request, "statements/import.html", {"form": CsvUploadForm()})

    form = CsvUploadForm(request.POST, request.FILES)
    if not form.is_valid():
        return render(request, "statements/import.html", {"form": form})

    # Everything from here is guarded: the temp file is deleted on every error
    # path, and no failure is allowed to surface a traceback to the customer.
    token = None
    try:
        token = import_service.save_upload_to_temp(form.cleaned_data["file"])
        text = import_service.read_temp(token)
        parsed = csv_import.parse_bank_csv(text, timezone.localdate())
        if parsed.file_error:
            import_service.delete_temp(token)
            messages.error(request, parsed.file_error)
            return render(request, "statements/import.html", {"form": CsvUploadForm()})

        groups = csv_import.group_by_month(parsed.rows)
        existing = set(Statement.objects.filter(
            user=request.user,
            statement_period__in=[g.period for g in groups],
        ).values_list("statement_period", flat=True))

        request.session["import_token"] = token
        preview = [{"group": g, "exists": g.period in existing} for g in groups]
        return render(request, "statements/import_preview.html", {
            "preview": preview,
            "row_errors": parsed.row_errors,
        })
    except UnicodeDecodeError:
        import_service.delete_temp(token)
        messages.error(request, "We couldn't read this file. Please make sure "
                                "it's a CSV exported from your bank.")
        return render(request, "statements/import.html", {"form": CsvUploadForm()})
    except Exception:
        import_service.delete_temp(token)
        request.session.pop("import_token", None)
        logger.exception("CSV import upload failed")
        messages.error(request, "We couldn't process this file. "
                                "Please check it and try again.")
        return render(request, "statements/import.html", {"form": CsvUploadForm()})


@login_required
def import_csv_confirm(request):
    if request.method != "POST":
        return redirect("import_csv")

    token = request.session.get("import_token")
    if not token or not import_service.temp_exists(token):
        messages.error(request, "Your import session expired. "
                                "Please upload the file again.")
        return redirect("import_csv")

    try:
        text = import_service.read_temp(token)
        parsed = csv_import.parse_bank_csv(text, timezone.localdate())
        groups = csv_import.group_by_month(parsed.rows)
        choices = {
            g.period: request.POST.get(f"choice-{g.period.isoformat()}", "skip")
            for g in groups
        }
    except Exception:
        import_service.delete_temp(token)
        request.session.pop("import_token", None)
        logger.exception("CSV import parse/prepare failed")
        messages.error(request, "We couldn't process this file. "
                                "Please check it and try again.")
        return redirect("import_csv")

    try:
        result = import_service.commit_import(request.user, groups, choices)
    except Exception:
        import_service.delete_temp(token)
        request.session.pop("import_token", None)
        logger.exception("CSV import commit failed")
        messages.error(request, "Something went wrong saving your import — "
                                "no changes were made. Please try again.")
        return redirect("import_csv")

    import_service.delete_temp(token)
    request.session.pop("import_token", None)
    months = result.created_statements + result.replaced_statements
    messages.success(
        request,
        f"Imported {result.created_transactions} transactions across "
        f"{months} month(s); {result.skipped_statements} skipped.")
    return redirect("statements")
