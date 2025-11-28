from rest_framework import serializers
from .models import ChatThread, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "thread",
            "sender",
            "body",
            "attachments",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ChatThreadSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatThread
        fields = [
            "id",
            "user",
            "subject",
            "metadata",
            "messages",
            "last_message",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return ChatMessageSerializer(last_msg).data
        return None

