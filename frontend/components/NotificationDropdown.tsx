'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { notificationsAPI } from '@/lib/api';

interface Notification {
  id: number;
  type: string;
  content: string;
  post_id?: number;
  comment_id?: number;
  actor_name: string;
  actor_id: number;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notifRes, countRes] = await Promise.all([
        notificationsAPI.list(),
        notificationsAPI.getUnreadCount(),
      ]);
      setNotifications(notifRes.data.notifications);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_reply':
        return '💬';
      case 'post_reaction':
      case 'comment_reaction':
        return '❤️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <div className="bell-frame w-12 h-12 rounded-xl group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bell-inner neo-icon relative flex items-center justify-center w-full h-full rounded-xl transition-colors"
        >
          <div className="w-6 h-6 text-[var(--color-text)]/70 group-hover:text-[var(--color-text)] transition-colors">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] z-50">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-[var(--color-highlight)] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted">
                <div className="animate-spin w-8 h-8 border-4 border-[var(--color-highlight)] border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-[var(--color-surface-soft)] transition-colors ${
                      !notif.is_read ? 'bg-[var(--color-surface-soft)]/50' : ''
                    }`}
                  >
                    <Link
                      href={notif.post_id ? `/posts/${notif.post_id}` : '/'}
                      onClick={() => {
                        if (!notif.is_read) {
                          handleMarkAsRead(notif.id);
                        }
                        setIsOpen(false);
                      }}
                      className="block"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text)]">{notif.content}</p>
                          <p className="text-xs text-muted mt-1">
                            {formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-[var(--color-highlight)] rounded-full mt-1"></div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
