"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { messagesAPI, usersAPI } from '@/lib/api';
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

// Sample users for testing - REMOVED


export default function MessageDrawer({ onClose, initialUserId }: { onClose: () => void; initialUserId?: number | null }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messagesVisible, setMessagesVisible] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatPos, setChatPos] = useState<{ top: number; left: number } | null>(null);
  const dragState = useRef<{ startX: number; startY: number; origTop: number; origLeft: number; dragging: boolean }>({ startX: 0, startY: 0, origTop: 0, origLeft: 0, dragging: false });

  // Close everything - called by parent via outside click or user clicking close-all button
  const handleCloseAll = () => {
    setMessagesVisible(false);
    setSelectedUser(null);
    onClose();
  };

  // Initialize chat panel position near the right edge when opened
  useEffect(() => {
    if (!selectedUser) return;
    const init = () => {
      const panel = chatRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = panel?.offsetWidth || 420;
      const h = panel?.offsetHeight || Math.min(0.7 * vh, 600);
      const margin = 16; // 1rem
      const top = Math.max(80, margin); // ~5rem from top by default
      const left = Math.max(margin, vw - w - margin);
      setChatPos({ top, left });
    };
    // Defer to next tick to ensure DOM measured
    setTimeout(init, 0);
  }, [selectedUser]);

  // Keep the panel within viewport on resize
  useEffect(() => {
    const onResize = () => {
      setChatPos((pos) => {
        if (!pos) return pos;
        const panel = chatRef.current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = panel?.offsetWidth || 420;
        const h = panel?.offsetHeight || 500;
        const left = Math.min(Math.max(8, pos.left), Math.max(8, vw - w - 8));
        const top = Math.min(Math.max(8, pos.top), Math.max(8, vh - h - 8));
        return { top, left };
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const beginDrag = (clientX: number, clientY: number) => {
    if (!chatPos) return;
    dragState.current = {
      startX: clientX,
      startY: clientY,
      origTop: chatPos.top,
      origLeft: chatPos.left,
      dragging: true,
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', endDrag);
  };

  const onMouseDownHeader = (e: React.MouseEvent) => {
    e.preventDefault();
    beginDrag(e.clientX, e.clientY);
  };

  const onTouchStartHeader = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    beginDrag(t.clientX, t.clientY);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragState.current.dragging) return;
    moveTo(e.clientX, e.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!dragState.current.dragging) return;
    const t = e.touches[0];
    if (!t) return;
    e.preventDefault();
    moveTo(t.clientX, t.clientY);
  };

  const moveTo = (clientX: number, clientY: number) => {
    const panel = chatRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = panel?.offsetWidth || 420;
    const h = panel?.offsetHeight || 500;
    const dx = clientX - dragState.current.startX;
    const dy = clientY - dragState.current.startY;
    let left = dragState.current.origLeft + dx;
    let top = dragState.current.origTop + dy;
    // clamp
    left = Math.min(Math.max(8, left), Math.max(8, vw - w - 8));
    top = Math.min(Math.max(8, top), Math.max(8, vh - h - 8));
    setChatPos({ top, left });
  };

  const endDrag = () => {
    dragState.current.dragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', endDrag);
  };

  // Load threads
  useEffect(() => {
    if (!user) return;
    messagesAPI.threads()
      .then(response => {
        const threadsData = response.data?.threads || [];
        const transformed = threadsData.map((t: any) => ({
          user: {
            id: t.user_id,
            username: t.user_name || 'unknown',
            full_name: t.user_name
          },
          last_message: t.last_message?.content || '',
          unread_count: t.unread_count || 0,
          timestamp: t.last_message?.created_at || new Date().toISOString()
        }));
        setThreads(transformed);
      })
      .catch(err => {
        console.error('Failed to load threads:', err);
        setThreads([]);
      });
  }, [user]);

  // Handle initialUserId
  useEffect(() => {
    if (!initialUserId) return;
    // Check if we already have this user selected
    if (selectedUser?.id === initialUserId) return;

    // Check if user is in threads
    const thread = threads.find(t => t.user.id === initialUserId);
    if (thread) {
      setSelectedUser(thread.user);
    } else {
      // Fetch user details
      usersAPI.get(initialUserId)
        .then(res => {
          if (res.data.user) {
            setSelectedUser(res.data.user);
          }
        })
        .catch(console.error);
    }
  }, [initialUserId, threads, selectedUser]);

  // Load conversation when user is selected
  useEffect(() => {
    if (!selectedUser || !user) return;
    setMessages([]); // Reset messages when switching users
    messagesAPI.conversation(selectedUser.id)
      .then(response => {
        const messagesData = response.data?.messages || [];
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      })
      .catch(err => {
        console.error('Failed to load conversation:', err);
        setMessages([]);
      });
  }, [selectedUser, user]);

  // Socket listeners
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleNewMessage = (msg: Message) => {
      // 1. Update active conversation messages if applicable
      if (selectedUser && (msg.sender_id === selectedUser.id || msg.recipient_id === selectedUser.id)) {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // If we are looking at this chat, we might want to mark it read immediately?
        // For now, let's assume the user has to click something or we do it efficiently.
        // Actually, if it's open, we should probably mark as read.
        if (msg.recipient_id === user.id && selectedUser.id === msg.sender_id) {
          messagesAPI.markRead(msg.id).catch(console.error);
        }
      }

      // 2. Update threads list
      setThreads(prev => {
        const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const existingThreadIndex = prev.findIndex(t => t.user.id === otherId);

        let newThread: Thread;

        if (existingThreadIndex >= 0) {
          const existing = prev[existingThreadIndex];
          newThread = {
            ...existing,
            last_message: msg.content,
            timestamp: msg.created_at,
            unread_count: (msg.recipient_id === user.id && (!selectedUser || selectedUser.id !== otherId))
              ? existing.unread_count + 1
              : existing.unread_count
          };
          // Remove from old position and add to top
          const newThreads = [...prev];
          newThreads.splice(existingThreadIndex, 1);
          return [newThread, ...newThreads];
        } else {
          // New thread! We need user info. 
          // Since we don't have the user object easily here without fetching, 
          // we might need to fetch the thread or user.
          // For now, if we can't get user details easily, let's just trigger a reload of threads.
          // Or we can try to construct it if we have context.
          // Simple approach: re-fetch threads.
          messagesAPI.threads().then(res => {
            // ... logic to update threads
            // actually easier to just call the API again if it's a new person
            // But let's try to be smooth.
            if (msg.sender_id === user.id) {
              // We sent it, we know who we sent to (selectedUser usually)
              // But wait, if we sent it, selectedUser is definitely set.
              // So we can use that.
            }
          });
          return prev; // Fallback to effect re-fetching
        }
      });

      // Re-fetch threads to be safe and get full user info for new chats
      messagesAPI.threads().then(res => {
        const threadsData = res.data?.threads || [];
        const transformed = threadsData.map((t: any) => ({
          user: {
            id: t.user_id,
            username: t.user_name || 'unknown',
            full_name: t.user_name
          },
          last_message: t.last_message?.content || '',
          unread_count: t.unread_count || 0,
          timestamp: t.last_message?.created_at || new Date().toISOString()
        }));
        setThreads(transformed);
      });
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

  // Filter threads instead of sample users
  const filteredThreads = threads.filter(t =>
    t.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.user.full_name && t.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user || sending) return;

    // Prevent messaging yourself
    if (selectedUser.id === user.id) {
      alert('You cannot send messages to yourself');
      return;
    }

    setSending(true);
    try {
      await messagesAPI.send({
        recipient_id: selectedUser.id,
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMsg = error?.response?.data?.error || 'Failed to send message. Please try again.';
      alert(errorMsg);
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
      {messagesVisible && (
        <div id="messages-panel">
          <div className="messages-header">
            <h3 className="messages-title">Messages</h3>
            <button onClick={() => setMessagesVisible(false)} className="messages-close-btn" aria-label="Hide messages list" title="Hide message list">
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

          <div className="messages-list" onWheel={(e) => {
            const target = e.currentTarget;
            const atTop = target.scrollTop === 0;
            const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight;
            if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
              e.preventDefault();
            }
            e.stopPropagation();
          }}>
            {/* 
          // Start New Chat Section - requires searching *all* users, which we might not have loaded.
          // For now, let's just rely on Threads + Search.
          // If the user searches, we should probably hit an API to search users if not found in threads?
          // The current implementation used SAMPLE_USERS which is bad.
          // Let's remove the "Start New Chat" with sample users and instead rely on a "New Message" button
          // that could open a user search modal.
          // Or just show nothing if no search.
           */}

            {searchTerm && filteredThreads.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No conversations found.
              </div>
            )}

            {filteredThreads.length > 0 && (
              <>
                {/* <div className="messages-section-label" style={{ marginTop: '1.5rem' }}>Recent Chats</div> */}
                {filteredThreads.map(thread => (
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
      )}

      {/* Chat Panel */}
      {selectedUser && (
        <div
          id="chat-panel"
          ref={chatRef}
          style={chatPos ? { position: 'fixed', top: chatPos.top, left: chatPos.left, right: 'auto' } : undefined}
        >
          <div className="chat-header" onMouseDown={onMouseDownHeader} onTouchStart={onTouchStartHeader} style={{ cursor: 'move' }}>
            <div className="chat-header-user">
              <div className="chat-user-avatar">
                {(selectedUser.full_name || selectedUser.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="chat-user-name">{selectedUser.full_name || selectedUser.username}</div>
                <div className="chat-user-status">@{selectedUser.username}</div>
              </div>
            </div>
            <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {!messagesVisible && (
                <button onClick={() => setMessagesVisible(true)} className="neo-btn" aria-label="Show messages list" style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem' }}>
                  Users
                </button>
              )}
              <button onClick={() => setSelectedUser(null)} className="chat-close-btn" aria-label="Close chat" title="Close chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button onClick={handleCloseAll} className="chat-close-btn" aria-label="Close all" title="Close all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="chat-messages" onWheel={(e) => {
            const target = e.currentTarget;
            const atTop = target.scrollTop === 0;
            const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight;
            if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
              e.preventDefault();
            }
            e.stopPropagation();
          }}>
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
