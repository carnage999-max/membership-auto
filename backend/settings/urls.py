from django.urls import path
from . import views

urlpatterns = [
    path("settings/", views.admin_settings_view, name="admin-settings"),
    path("change-password/", views.change_password_view, name="change-password"),
    path("system/status/", views.system_status_view, name="system-status"),
    path("system/backup/", views.database_backup_view, name="database-backup"),
]
