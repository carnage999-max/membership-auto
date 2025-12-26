import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { chatService } from '@/services/api/chat.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import { useAuthStore } from '@/stores/auth.store';
import {
  MessageCircle,
  Send,
  User,
  Bot,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChatMessage } from '@/types';

const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentThreadId, setCurrentThreadId] = useState<string>('');
  const [messageText, setMessageText] = useState('');

  // Fetch chat threads
  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ['chatThreads'],
    queryFn: chatService.getThreads,
  });

  // Fetch messages for current thread
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', currentThreadId],
    queryFn: () => chatService.getMessages(currentThreadId),
    enabled: !!currentThreadId,
  });

  // Create thread mutation
  const createThreadMutation = useMutation({
    mutationFn: chatService.createThread,
    onSuccess: (data) => {
      setCurrentThreadId(data.id);
      queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
    },
    onError: () => {
      showToast('error', 'Failed to create chat thread');
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ threadId, message }: { threadId: string; message: string }) =>
      chatService.sendMessage(threadId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', currentThreadId] });
      queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
      setMessageText('');
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: () => {
      showToast('error', 'Failed to send message');
    },
  });

  // Initialize thread if none exists
  useEffect(() => {
    if (threads && threads.length > 0 && !currentThreadId) {
      setCurrentThreadId(threads[0].id);
    } else if (threads && threads.length === 0 && !threadsLoading) {
      createThreadMutation.mutate('Support Chat');
    }
  }, [threads, currentThreadId, threadsLoading]);

  // Mark messages as read when viewing thread
  useEffect(() => {
    if (currentThreadId && messages && messages.length > 0) {
      const unreadCount = messages.filter((m) => !m.isRead && m.senderType !== 'user').length;
      if (unreadCount > 0) {
        chatService.markAsRead(currentThreadId);
        queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
      }
    }
  }, [currentThreadId, messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      return;
    }

    if (!currentThreadId) {
      showToast('error', 'No active chat thread');
      return;
    }

    sendMessageMutation.mutate({
      threadId: currentThreadId,
      message: messageText.trim(),
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.senderType === 'user';
    const isAgent = message.senderType === 'agent';
    const isSystem = message.senderType === 'system';

    return (
      <View
        key={message.id}
        className={`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && !isSystem && (
          <View className="mr-2 mt-1">
            <View className="w-8 h-8 rounded-full bg-gold/20 items-center justify-center">
              <Bot size={18} color="#cba86e" />
            </View>
          </View>
        )}

        <View className={`max-w-[75%] ${isSystem ? 'w-full' : ''}`}>
          <View
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'bg-gold'
                : isSystem
                ? 'bg-surface border border-border'
                : 'bg-surface'
            }`}
          >
            <Text
              className={`text-sm ${
                isUser ? 'text-white' : isSystem ? 'text-textMuted text-center' : 'text-foreground'
              }`}
            >
              {message.message}
            </Text>
          </View>
          <Text className={`text-xs text-textMuted mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {isUser && (
          <View className="ml-2 mt-1">
            <View className="w-8 h-8 rounded-full bg-gold/20 items-center justify-center">
              <User size={18} color="#cba86e" />
            </View>
          </View>
        )}
      </View>
    );
  };

  if (threadsLoading || createThreadMutation.isPending) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#cba86e" size="large" />
        <Text className="mt-4 text-sm text-textSecondary">Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      keyboardVerticalOffset={100}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 border-b border-border">
          <View className="flex-row items-center">
            <View className="bg-gold/20 p-3 rounded-full mr-3">
              <MessageCircle size={24} color="#cba86e" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-foreground">Support Chat</Text>
              <Text className="text-sm text-textSecondary">
                We typically respond within a few minutes
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messagesLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#cba86e" />
            </View>
          ) : messages && messages.length > 0 ? (
            messages.map((message) => renderMessage(message))
          ) : (
            <View className="items-center py-12">
              <MessageCircle size={48} color="#cba86e" />
              <Text className="mt-4 text-lg font-semibold text-foreground">
                Start a Conversation
              </Text>
              <Text className="mt-2 text-center text-sm text-textSecondary px-8">
                Send us a message and we'll get back to you right away
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View
          className="px-4 py-3 border-t border-border bg-background"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="flex-row items-end space-x-2">
            <View className="flex-1">
              <TextInput
                className="bg-surface border border-border rounded-2xl px-4 py-3 text-foreground"
                placeholder="Type a message..."
                placeholderTextColor="#707070"
                multiline
                maxLength={1000}
                value={messageText}
                onChangeText={setMessageText}
                style={{ maxHeight: 100 }}
              />
            </View>
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              activeOpacity={0.7}
              className={`p-3 rounded-full ${
                messageText.trim() ? 'bg-gold' : 'bg-surface'
              }`}
            >
              <Send
                size={24}
                color={messageText.trim() ? '#ffffff' : '#707070'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
