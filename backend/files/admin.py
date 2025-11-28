from django.contrib import admin
from .models import File


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ["user", "filename", "url", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["filename", "user__email"]
