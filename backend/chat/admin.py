from django.contrib import admin
from .models import ChatThread, ChatMessage


@admin.register(ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    list_display = ["user", "subject", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__email", "subject"]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ["thread", "sender", "created_at"]
    list_filter = ["sender", "created_at"]
    search_fields = ["body"]
