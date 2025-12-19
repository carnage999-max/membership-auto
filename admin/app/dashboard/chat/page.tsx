'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Search, User, Clock, CheckCircle } from 'lucide-react';

interface ChatThread {
  id: string;
  member: {
    id: string;
    name: string;
    email: string;
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: string;
  assigned_to: string | null;
}

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadChatThreads();
  }, []);

  const loadChatThreads = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/chat/threads/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const threadsData = data.results || data;
        setThreads(Array.isArray(threadsData) ? threadsData : []);
      }
    } catch (error) {
      console.error('Error loading chat threads:', error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredThreads = Array.isArray(threads) ? threads.filter(thread => {
    const matchesSearch = 
      thread.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.last_message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || thread.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Chat Support</h1>
          <p className="text-text-secondary">Manage customer support conversations</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <MessageSquare className="w-4 h-4" />
          <span>{filteredThreads.length} threads</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Chat Threads */}
      {filteredThreads.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No conversations found' : 'No chat threads yet'}
          </h3>
          <p className="text-text-secondary">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Customer conversations will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredThreads.map((thread) => (
            <div key={thread.id} className="bg-surface border border-border rounded-lg p-4 hover:border-gold transition-colors cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold bg-opacity-10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-foreground">{thread.member?.name || 'Unknown'}</h3>
                      <p className="text-sm text-text-secondary">{thread.member?.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {thread.unread_count > 0 && (
                        <span className="px-2 py-1 bg-gold text-background text-xs font-medium rounded-full">
                          {thread.unread_count}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Clock className="w-4 h-4" />
                        {new Date(thread.last_message_time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-1">
                    {thread.last_message}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      thread.status === 'resolved' 
                        ? 'border-success text-success'
                        : thread.status === 'assigned'
                        ? 'border-warning text-warning'
                        : 'border-info text-info'
                    }`}>
                      {thread.status === 'resolved' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {thread.status}
                    </span>
                    {thread.assigned_to && (
                      <span className="text-xs text-text-muted">
                        Assigned to: {thread.assigned_to}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
