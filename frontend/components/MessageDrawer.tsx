"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { messagesAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface User {
  id: number;
  username: string;
  full_name?: string;
}

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Thread {
  user: User;
  last_message: string;
  unread_count: number;
  timestamp: string;
}

// Sample users for testing
const SAMPLE_USERS: User[] = [
  { id: 1, username: 'test1', full_name: 'Test User One' },
  { id: 2, username: 'test2', full_name: 'Test User Two' },
  { id: 3, username: 'test3', full_name: 'Test User Three' },
];

export default function MessageDrawer({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load threads
  useEffect(() => {
    if (!user) return;
    messagesAPI.threads()
      .then(data => setThreads(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [user]);

  // Load conversation when user is selected
  useEffect(() => {
    if (!selectedUser || !user) return;
    setMessages([]); // Reset messages when switching users
    messagesAPI.conversation(selectedUser.id)
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [selectedUser, user]);

  // Socket listeners
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    
    const handleNewMessage = (msg: Message) => {
      if (selectedUser && (msg.sender_id === selectedUser.id || msg.recipient_id === selectedUser.id)) {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:sent', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:sent', handleNewMessage);
    };
  }, [user, selectedUser]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredUsers = SAMPLE_USERS.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user || sending) return;
    
    setSending(true);
    try {
      await messagesAPI.send({
        recipient_id: selectedUser.id,
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Messages List Panel */}
      <div id="messages-panel">
        <div className="messages-header">
          <h3 className="messages-title">Messages</h3>
          <button onClick={onClose} className="messages-close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="messages-search-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="messages-search-icon">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="message-search-input"
          />
        </div>

        <div className="messages-list">
          <div className="messages-section-label">Start New Chat</div>
          {filteredUsers.map(u => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`message-user-card ${selectedUser?.id === u.id ? 'active' : ''}`}
            >
              <div className="message-user-avatar">
                {(u.full_name || u.username).charAt(0).toUpperCase()}
              </div>
              <div className="message-user-info">
                <div className="message-user-name">{u.full_name || u.username}</div>
                <div className="message-user-username">@{u.username}</div>
              </div>
            </button>
          ))}

          {threads.length > 0 && (
            <>
              <div className="messages-section-label" style={{ marginTop: '1.5rem' }}>Recent Chats</div>
              {threads.map(thread => (
                <button
                  key={thread.user.id}
                  onClick={() => setSelectedUser(thread.user)}
                  className={`message-user-card ${selectedUser?.id === thread.user.id ? 'active' : ''}`}
                >
                  <div className="message-user-avatar">
                    {(thread.user.full_name || thread.user.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="message-user-info">
                    <div className="message-user-name">
                      {thread.user.full_name || thread.user.username}
                      {thread.unread_count > 0 && (
                        <span className="message-unread-badge">{thread.unread_count}</span>
                      )}
                    </div>
                    <div className="message-user-last">{thread.last_message}</div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {selectedUser && (
        <div id="chat-panel">
          <div className="chat-header">
            <div className="chat-header-user">
              <div className="chat-user-avatar">
                {(selectedUser.full_name || selectedUser.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="chat-user-name">{selectedUser.full_name || selectedUser.username}</div>
                <div className="chat-user-status">@{selectedUser.username}</div>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="chat-close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 opacity-30">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message-bubble ${msg.sender_id === user?.id ? 'sent' : 'received'}`}
                  >
                    <p className="message-content">{msg.content}</p>
                    <p className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chat-input"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="chat-send-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
