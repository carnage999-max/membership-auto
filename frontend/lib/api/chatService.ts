import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: 'user' | 'support';
  body: string;
  attachments?: string[];
  createdAt: string;
}

export interface ChatThread {
  id: string;
  userId: string;
  subject: string;
  status: 'open' | 'closed';
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadData {
  subject: string;
  initialMessage?: string;
}

export interface SendMessageData {
  body: string;
  attachments?: string[];
}

const chatService = {
  /**
   * Get all chat threads for the authenticated user
   */
  async getThreads(): Promise<ChatThread[]> {
    const response = await apiClient.get<ChatThread[]>(API_ENDPOINTS.CHAT.THREADS);
    return response.data;
  },

  /**
   * Get a specific chat thread
   */
  async getThread(threadId: string): Promise<ChatThread> {
    const response = await apiClient.get<ChatThread>(`${API_ENDPOINTS.CHAT.THREADS}${threadId}/`);
    return response.data;
  },

  /**
   * Create a new chat thread
   */
  async createThread(data: CreateThreadData): Promise<ChatThread> {
    const response = await apiClient.post<ChatThread>(API_ENDPOINTS.CHAT.THREADS, data);
    return response.data;
  },

  /**
   * Get messages for a specific thread
   * @param threadId - Thread ID
   * @param since - Optional ISO timestamp to get messages after this time
   */
  async getMessages(threadId: string, since?: string): Promise<ChatMessage[]> {
    const params: any = {};
    if (since) {
      params.since = since;
    }
    
    const response = await apiClient.get<ChatMessage[]>(
      API_ENDPOINTS.CHAT.MESSAGES(threadId),
      { params }
    );
    return response.data;
  },

  /**
   * Send a message in a thread
   */
  async sendMessage(threadId: string, data: SendMessageData): Promise<ChatMessage> {
    const response = await apiClient.post<ChatMessage>(
      API_ENDPOINTS.CHAT.MESSAGES(threadId),
      data
    );
    return response.data;
  },

  /**
   * Close a chat thread
   */
  async closeThread(threadId: string): Promise<void> {
    await apiClient.patch(`${API_ENDPOINTS.CHAT.THREADS}${threadId}/`, {
      status: 'closed',
    });
  },

  /**
   * Get WebSocket URL for real-time chat
   * @param token - JWT access token
   */
  getWebSocketUrl(token: string): string {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    return `${wsProtocol}//${host}/chat/ws/?token=${token}`;
  },
};

export default chatService;
