from django.contrib import admin
from .models import Vehicle, TelematicsSnapshot, FuelLog


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ["user", "year", "make", "model", "vin", "odometer", "created_at"]
    list_filter = ["make", "year", "created_at"]
    search_fields = ["vin", "make", "model", "user__email"]


@admin.register(TelematicsSnapshot)
class TelematicsSnapshotAdmin(admin.ModelAdmin):
    list_display = ["vehicle", "timestamp", "odometer", "speed_avg", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["vehicle__vin"]


@admin.register(FuelLog)
class FuelLogAdmin(admin.ModelAdmin):
    list_display = ["vehicle", "timestamp", "odometer", "gallons", "mpg", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["vehicle__vin"]
