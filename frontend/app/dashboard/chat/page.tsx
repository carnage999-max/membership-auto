'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import chatService, { ChatThread, ChatMessage } from '@/lib/api/chatService';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { MessageCircle, Send, Plus, X, Clock, CheckCheck, ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageBody, setMessageBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadSubject, setNewThreadSubject] = useState('');
  const [newThreadMessage, setNewThreadMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await chatService.getThreads();
      setThreads(data);
      
      // Auto-select first thread if available
      if (data.length > 0 && !selectedThread) {
        setSelectedThread(data[0]);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const data = await chatService.getMessages(threadId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const connectWebSocket = () => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;

    try {
      const wsUrl = chatService.getWebSocketUrl(token);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message' && data.message) {
          const newMessage = data.message as ChatMessage;
          
          // Only add if it's for the current thread
          if (selectedThread && newMessage.threadId === selectedThread.id) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!messageBody.trim() || !selectedThread || sending) return;

    try {
      setSending(true);
      const newMessage = await chatService.sendMessage(selectedThread.id, {
        body: messageBody.trim(),
      });
      
      setMessages((prev) => [...prev, newMessage]);
      setMessageBody('');
      
      // Refresh threads to update last message
      loadThreads();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCreateThread = async () => {
    if (!newThreadSubject.trim() || !newThreadMessage.trim()) {
      alert('Please provide both subject and message');
      return;
    }

    try {
      setSending(true);
      const thread = await chatService.createThread({
        subject: newThreadSubject.trim(),
        initialMessage: newThreadMessage.trim(),
      });
      
      // Reload threads and select the new one
      await loadThreads();
      setSelectedThread(thread);
      setShowNewThread(false);
      setNewThreadSubject('');
      setNewThreadMessage('');
    } catch (error) {
      console.error('Failed to create thread:', error);
      alert('Failed to create conversation. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-[#CBA86E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D0D0D] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#B3B3B3] hover:text-[#CBA86E] transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Support Chat</h1>
            <p className="text-[#B3B3B3]">Get help from our support team</p>
          </div>
          <button
            onClick={() => setShowNewThread(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors"
          >
            <Plus size={20} />
            New Conversation
          </button>
        </div>

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-xl p-6 w-full max-w-lg border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Start New Conversation</h2>
              <button
                onClick={() => setShowNewThread(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newThreadSubject}
                  onChange={(e) => setNewThreadSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CBA86E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={newThreadMessage}
                  onChange={(e) => setNewThreadMessage(e.target.value)}
                  placeholder="Describe your issue or question..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CBA86E] resize-none"
                />
              </div>

              <button
                onClick={handleCreateThread}
                disabled={sending || !newThreadSubject.trim() || !newThreadMessage.trim()}
                className="w-full py-3 bg-[#CBA86E] text-black font-semibold rounded-lg hover:bg-[#B89860] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Starting...' : 'Start Conversation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Thread List */}
        <div className="lg:col-span-1 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h3 className="font-semibold text-white">Conversations</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No conversations yet</p>
                <button
                  onClick={() => setShowNewThread(true)}
                  className="mt-4 text-[#CBA86E] hover:text-[#B89860] text-sm font-medium"
                >
                  Start your first chat
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#2A2A2A]">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full p-4 text-left hover:bg-[#0D0D0D] transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-[#0D0D0D] border-l-4 border-[#CBA86E]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-white text-sm truncate flex-1">
                        {thread.subject}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ml-2 ${
                          thread.status === 'open'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {thread.status}
                      </span>
                    </div>
                    {thread.lastMessage && (
                      <p className="text-xs text-gray-400 truncate">
                        {thread.lastMessage.body}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(thread.updatedAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden flex flex-col">
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[#2A2A2A] bg-[#0D0D0D]">
                <h3 className="font-semibold text-white">{selectedThread.subject}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Started {formatTime(selectedThread.createdAt)}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No messages yet</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-[#CBA86E] text-black'
                            : 'bg-[#0D0D0D] text-white border border-[#2A2A2A]'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.body}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 opacity-60" />
                          <span className="text-xs opacity-60">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-[#2A2A2A] bg-[#0D0D0D]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={sending || selectedThread.status === 'closed'}
                    className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CBA86E] disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !messageBody.trim() || selectedThread.status === 'closed'}
                    className="px-6 py-3 bg-[#CBA86E] text-black font-semibold rounded-lg hover:bg-[#B89860] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
                {selectedThread.status === 'closed' && (
                  <p className="text-xs text-gray-500 mt-2">
                    This conversation is closed. Start a new one if you need further assistance.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
