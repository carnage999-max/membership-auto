from django.contrib import admin
from .models import Offer


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ["title", "expiry", "created_at"]
    list_filter = ["expiry", "created_at"]
    search_fields = ["title", "description"]
