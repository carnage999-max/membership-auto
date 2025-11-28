from django.contrib import admin
from .models import User, Plan, Membership


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["email", "name", "phone", "role", "referral_code", "created_at"]
    search_fields = ["email", "name", "phone"]
    list_filter = ["role", "created_at"]


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ["name", "tier", "price_monthly", "created_at"]
    list_filter = ["tier", "created_at"]


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ["user", "plan", "status", "started_at", "next_billing_at"]
    list_filter = ["status", "started_at"]
    search_fields = ["user__email"]
