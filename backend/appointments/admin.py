from django.contrib import admin
from .models import Appointment, Location


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ["name", "address", "phone", "created_at"]
    search_fields = ["name", "address"]


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ["user", "vehicle", "location", "start_time", "status", "created_at"]
    list_filter = ["status", "start_time", "created_at"]
    search_fields = ["user__email", "vehicle__vin"]
