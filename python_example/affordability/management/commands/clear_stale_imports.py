from django.core.management.base import BaseCommand
from affordability.csv_import import service as import_service


class Command(BaseCommand):
    help = "Delete abandoned CSV import temp files older than the TTL."

    def add_arguments(self, parser):
        parser.add_argument("--max-age", type=int, default=3600,
                            help="Maximum age in seconds before a temp file is removed.")

    def handle(self, *args, **options):
        removed = import_service.clear_stale_imports(options["max_age"])
        self.stdout.write(f"Removed {removed} stale import file(s).")
