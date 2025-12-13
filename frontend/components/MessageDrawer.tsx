"use client";

import { useEffect, useMemo, useState } from 'react';
import { messagesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getSocket } from '@/lib/socket';

interface Thread {
  user_id: number;
  user_name: string;
  last_message: {
    id: number;
    sender_id: number;
    recipient_id: number;
    content: string;
    is_read: boolean;
    created_at: string;
  };
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function MessageDrawer({ onClose }: { onClose?: () => void }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const selectedThread = useMemo(
    () => threads.find((t) => t.user_id === selectedUserId) || null,
    [threads, selectedUserId]
  );

  const fetchThreads = async () => {
    try {
      setLoadingThreads(true);
      const res = await messagesAPI.threads();
      setThreads(res.data.threads || []);
    } catch (err) {
      console.error('Failed to load threads', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  const fetchConversation = async (userId: number) => {
    try {
      setLoadingMessages(true);
      const res = await messagesAPI.conversation(userId);
      const items: Message[] = res.data.messages || [];
      setMessages(items);
      if (user) {
        const unread = items.filter((m) => !m.is_read && m.recipient_id === user.id);
        unread.forEach((m) => messagesAPI.markRead(m.id));
      }
    } catch (err) {
      console.error('Failed to load conversation', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const openThread = (userId: number) => {
    setSelectedUserId(userId);
    fetchConversation(userId);
    setThreads((prev) =>
      prev.map((t) => (t.user_id === userId ? { ...t, unread_count: 0 } : t))
    );
  };

  const sendMessage = async () => {
    if (!draft.trim() || !selectedUserId || sending) return;
    try {
      setSending(true);
      const res = await messagesAPI.send({ recipient_id: selectedUserId, content: draft.trim() });
      setMessages((prev) => [...prev, res.data.message]);
      setThreads((prev) => {
        const existing = prev.find((t) => t.user_id === selectedUserId);
        if (!existing) return prev;
        return prev.map((t) =>
          t.user_id === selectedUserId
            ? { ...t, last_message: res.data.message, unread_count: 0 }
            : t
        );
      });
      setDraft('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchThreads();
    const socket = getSocket();

    const handleIncoming = (msg: Message) => {
      if (!user) return;
      const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      const isForMe = msg.recipient_id === user.id;

      setThreads((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((t) => t.user_id === otherId);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            last_message: msg,
            unread_count: updated[idx].unread_count + (isForMe && otherId !== selectedUserId ? 1 : 0),
          };
        } else {
          updated.unshift({
            user_id: otherId,
            user_name: 'New message',
            last_message: msg,
            unread_count: isForMe ? 1 : 0,
          });
        }
        return updated;
      });

      if (selectedUserId === otherId) {
        setMessages((prev) => [...prev, msg]);
        if (isForMe) {
          messagesAPI.markRead(msg.id);
        }
      }
    };

    const handleSent = (msg: Message) => {
      if (!user) return;
      const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      if (selectedUserId === otherId) {
        setMessages((prev) => [...prev, msg]);
      }
      setThreads((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((t) => t.user_id === otherId);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], last_message: msg };
        }
        return updated;
      });
    };

    socket.on('message:new', handleIncoming);
    socket.on('message:sent', handleSent);

    return () => {
      socket.off('message:new', handleIncoming);
      socket.off('message:sent', handleSent);
    };
  }, [selectedUserId, user]);

  return (
    <div className="absolute left-20 top-0 z-50 w-[32rem] max-h-[70vh] overflow-hidden rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="flex h-full">
        <div className="w-2/5 border-r border-[var(--color-border)] p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Messages</h3>
            <button className="text-sm text-[var(--color-text)]/60" onClick={fetchThreads}>Refresh</button>
          </div>
          {loadingThreads ? (
            <p className="text-sm text-[var(--color-text)]/60">Loading threads…</p>
          ) : threads.length === 0 ? (
            <p className="text-sm text-[var(--color-text)]/60">No conversations yet.</p>
          ) : (
            <div className="space-y-2">
              {threads.map((t) => (
                <button
                  key={t.user_id}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${
                    t.user_id === selectedUserId ? 'bg-[var(--color-surface-soft)]/60' : 'hover:bg-[var(--color-surface-soft)]/50'
                  }`}
                  onClick={() => openThread(t.user_id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text)]">{t.user_name}</span>
                    {t.unread_count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-highlight)] text-white">
                        {t.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text)]/60 truncate">{t.last_message?.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-3/5 p-4 flex flex-col h-full">
          {selectedThread ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-[var(--color-text)]">Chat with</p>
                  <p className="text-lg font-semibold text-[var(--color-text)]">{selectedThread.user_name}</p>
                </div>
                {onClose && (
                  <button className="text-sm text-[var(--color-text)]/60" onClick={onClose}>Close</button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loadingMessages ? (
                  <p className="text-sm text-[var(--color-text)]/60">Loading…</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-[var(--color-text)]/60">Say hello 👋</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[90%] px-3 py-2 rounded-2xl text-sm ${
                        m.sender_id === selectedUserId
                          ? 'bg-[var(--color-surface-soft)]/60 text-[var(--color-text)]'
                          : 'bg-[var(--color-highlight)] text-white ml-auto'
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-3 flex items-center gap-2">
                <input
                  type="text"
                  className="neo-input flex-1 text-sm"
                  placeholder="Type a message"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                  }}
                  disabled={!selectedUserId}
                />
                <button className="neo-btn px-4 py-2 text-sm" onClick={sendMessage} disabled={sending || !draft.trim()}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text)]/70">
              <p className="text-sm">Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
