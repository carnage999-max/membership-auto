from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatThread, ChatMessage
from .serializers import ChatThreadSerializer, ChatMessageSerializer


class ChatThreadListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List chat threads for user"""
        threads = ChatThread.objects.filter(user=request.user).prefetch_related("messages")
        serializer = ChatThreadSerializer(threads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChatMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, thread_id):
        """List messages in a thread"""
        try:
            thread = ChatThread.objects.get(id=thread_id, user=request.user)
        except ChatThread.DoesNotExist:
            return Response(
                {"error": "Thread not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        since = request.query_params.get("since")
        messages = thread.messages.all()

        if since:
            try:
                from django.utils.dateparse import parse_datetime
                since_dt = parse_datetime(since)
                if since_dt:
                    messages = messages.filter(created_at__gt=since_dt)
            except (ValueError, TypeError):
                pass

        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, thread_id):
        """Send a message in a thread"""
        try:
            thread = ChatThread.objects.get(id=thread_id, user=request.user)
        except ChatThread.DoesNotExist:
            return Response(
                {"error": "Thread not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        body = request.data.get("body")
        attachments = request.data.get("attachments", [])

        if not body:
            return Response(
                {"error": "body is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = ChatMessage.objects.create(
            thread=thread,
            sender="user",
            body=body,
            attachments=attachments,
        )

        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
