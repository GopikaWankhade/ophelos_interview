from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('statements/', views.statements, name='statements'),
    path('statements/new/', views.new_statement, name='new_statement'),
    path('statements/import/', views.import_csv, name='import_csv'),
    path('statements/import/confirm/', views.import_csv_confirm, name='import_csv_confirm'),
    path('statements/<int:statement_id>/', views.view_statement, name='view_statement'),
]
