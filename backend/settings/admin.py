from django.contrib import admin
from .models import AdminSettings


@admin.register(AdminSettings)
class AdminSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "name",
        "email",
        "email_alerts",
        "appointment_reminders",
        "system_updates",
        "updated_at",
    )
    list_filter = ("email_alerts", "appointment_reminders", "system_updates")
    search_fields = ("user__username", "name", "email")
    readonly_fields = ("created_at", "updated_at")
