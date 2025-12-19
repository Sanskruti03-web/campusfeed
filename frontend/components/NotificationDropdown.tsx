"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Heart, MessageCircle, UserPlus, Star, Info } from 'lucide-react';
import { notificationsAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';

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

interface NotificationDropdownProps {
  isCollapsed?: boolean;
}

export default function NotificationDropdown({ isCollapsed = false }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    const interval = setInterval(fetchNotifications, 30000);
    const socket = getSocket();
    const handleNew = (notif: any) => {
      setNotifications(prev => [
        {
          id: notif.id,
          type: notif.type,
          content: notif.content,
          post_id: notif.post_id,
          comment_id: notif.comment_id,
          actor_name: notif.actor_name || 'Someone',
          actor_id: notif.actor_id,
          is_read: notif.is_read ?? false,
          created_at: notif.created_at,
        },
        ...prev,
      ].slice(0, 50));
      setUnreadCount(prev => prev + 1);
    };
    socket.on('notification:new', handleNew);

    return () => {
      clearInterval(interval);
      socket.off('notification:new', handleNew);
    };
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
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'post_reaction':
      case 'comment_reaction':
        return <Heart size={16} className="text-pink-500" />;
      case 'follow':
        return <UserPlus size={16} className="text-green-500" />;
      case 'mention':
        return <Star size={16} className="text-yellow-500" />;
      default:
        return <Info size={16} className="text-[var(--color-highlight)]" />;
    }
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-4 py-3 rounded-2xl transition-all duration-300 group relative w-full
          ${isOpen
            ? 'bg-gradient-to-r from-[var(--color-highlight)]/10 to-transparent text-[var(--color-highlight)] font-bold'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]'}
          ${isCollapsed ? 'justify-center px-0' : 'px-4'}
        `}
      >
        <div className="relative">
          <div className={isOpen ? 'scale-110' : 'group-hover:scale-110 transition-transform'}>
            <Bell size={24} strokeWidth={isOpen ? 2.5 : 2} />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[var(--color-bg-deep)] font-bold shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {!isCollapsed && <span className="hidden lg:block text-sm tracking-wide">Notif</span>}

        {isOpen && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-highlight)] rounded-r-full" />
        )}
      </button>

      {isOpen && (
        <div className="fixed left-[5.5rem] lg:left-[17rem] top-4 w-[24rem] max-w-[calc(100vw-6rem)] bg-[var(--color-surface)]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-[var(--color-border)] z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 px-6 border-b border-[var(--color-border)] bg-[var(--color-surface-soft)]/30">
            <h3 className="text-lg font-bold font-outfit text-[var(--color-text)]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-[var(--color-highlight)] hover:underline uppercase tracking-wide"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center text-[var(--color-text-muted)]">
                <div className="animate-spin w-8 h-8 border-4 border-[var(--color-highlight)] border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm">Loading updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-[var(--color-text-muted)]">
                <div className="w-16 h-16 bg-[var(--color-surface-soft)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={24} className="opacity-50" />
                </div>
                <p className="font-medium">No details yet</p>
                <p className="text-sm opacity-60">We'll notify you when something happens.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]/50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`relative group transition-colors hover:bg-[var(--color-surface-soft)] ${!notif.is_read ? 'bg-[var(--color-highlight)]/5' : ''}`}
                  >
                    <Link
                      href={notif.post_id ? `/posts/${notif.post_id}` : '/'}
                      onClick={() => {
                        if (!notif.is_read) handleMarkAsRead(notif.id);
                        setIsOpen(false);
                      }}
                      className="flex gap-4 p-4"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-highlight)] to-[var(--color-highlight-alt)] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-[var(--color-bg-deep)]">
                          {notif.actor_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1 bg-[var(--color-surface)] rounded-full shadow-sm ring-1 ring-[var(--color-border)]">
                          {getNotificationIcon(notif.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--color-text)] leading-snug">
                          <span className="font-bold">{notif.actor_name}</span>{' '}
                          <span className="text-[var(--color-text-muted)]">
                            {notif.content.replace(notif.actor_name, '').trim()}
                          </span>
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      {!notif.is_read && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--color-highlight)] rounded-full shadow-[0_0_8px_var(--color-highlight)]"></div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
