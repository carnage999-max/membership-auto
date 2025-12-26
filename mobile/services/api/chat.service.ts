import { api } from './client';
import type { ChatThread, ChatMessage } from '@/types';

export const chatService = {
  /**
   * Get all chat threads for the user
   */
  getThreads: async () => {
    const response = await api.get<ChatThread[]>('/chats/threads/');
    return response.data;
  },

  /**
   * Get messages for a specific thread
   */
  getMessages: async (threadId: string) => {
    const response = await api.get<ChatMessage[]>(`/chats/threads/${threadId}/messages/`);
    return response.data;
  },

  /**
   * Send a message to a thread
   */
  sendMessage: async (threadId: string, message: string) => {
    const response = await api.post<ChatMessage>(`/chats/threads/${threadId}/messages/`, {
      message,
    });
    return response.data;
  },

  /**
   * Create a new chat thread
   */
  createThread: async (subject?: string) => {
    const response = await api.post<ChatThread>('/chats/threads/', {
      subject,
    });
    return response.data;
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (threadId: string) => {
    const response = await api.post(`/chats/threads/${threadId}/mark-read/`);
    return response.data;
  },
};
