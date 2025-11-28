from django.contrib import admin
from .models import Referral


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ["referrer_user", "referred_user", "code", "status", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["code", "referrer_user__email", "referred_user__email"]
