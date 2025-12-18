"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState, useEffect } from 'react';
import MessageDrawer from './MessageDrawer';
import { messagesAPI, notificationsAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

function NavIcon({ label, href, svg, active }: { label: string; href: string; svg: React.ReactNode; active?: boolean }) {
  return (
    <div className="icon-frame">
      <Link href={href} className="icon-inner neo-icon group relative flex items-center justify-center w-full h-full rounded-2xl">
        <div className={`w-9 h-9 ${active ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text)]/70'} group-hover:text-[var(--color-text)]`}>
          {svg}
        </div>
        <span className="sidebar-tooltip">
          {label}
        </span>
      </Link>
    </div>
  );
}

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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const categories = useMemo(
    () => [
      'All',
      'Academics',
      'Events',
      'Clubs',
      'Sports',
      'Placements',
      'General',
      'Announcements',
      'Food',
      'Hostel',
    ],
    []
  );

  const goCategory = (cat: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (!cat || cat === 'All') sp.delete('category');
    else sp.set('category', cat);
    const q = sp.toString();
    router.push(q ? `/?${q}` : '/');
  };

  const [catSearch, setCatSearch] = useState('');
  const filtered = useMemo(
    () => categories.filter((c) => c.toLowerCase().includes(catSearch.trim().toLowerCase())),
    [categories, catSearch]
  );
  const activeCategory = searchParams.get('category') || 'All';
  const hasActiveCategory = !!searchParams.get('category') && activeCategory !== 'All';
  const [showUpdates, setShowUpdates] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [targetChatUserId, setTargetChatUserId] = useState<number | null>(null);
  const [unreadIds, setUnreadIds] = useState<Set<number>>(new Set());
  const unreadCount = unreadIds.size; // This is a rough proxy, better to fetch real count or use number directly

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);

  // Actually, let's use a number to match API
  const [totalUnread, setTotalUnread] = useState(0);

  // Fetch initial unread count
  useEffect(() => {
    if (!user) return;
    messagesAPI.getUnreadCount()
      .then(res => setTotalUnread(res.data.count))
      .catch(console.error);

    // Also listen for new messages to increment count
    const socket = getSocket();
    const handleNewMessage = (msg: any) => {
      // If the drawer is NOT open, or if it IS open but we are not chatting with this user?
      // Simplest: just increment. When drawer opens, we might reset or rely on reads.
      // For now: increment if drawer is closed or if it's sent to us.
      // Ideally MessageDrawer handles "read" status. Sidebar just shows raw count.
      // If we are looking at messages, this count might get desynced unless we share state.
      // For now, let's just increment on new message if received.
      if (msg.recipient_id === user.id) {
        setTotalUnread(prev => prev + 1);
      }
    };

    socket.on('message:new', handleNewMessage);
    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [user]);

  // Notifications Logic
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsAPI.list(),
        notificationsAPI.getUnreadCount(),
      ]);
      setNotifications(notifRes.data.notifications);
      setNotifUnreadCount(countRes.data.count);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute

    // Listen for real-time notifications
    const socket = getSocket();
    const handleNewNotif = (notif: any) => {
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
      setNotifUnreadCount(prev => prev + 1);
    };

    socket.on('notification:new', handleNewNotif);

    return () => {
      clearInterval(interval);
      socket.off('notification:new', handleNewNotif);
    };
  }, [user]);

  const handleMarkNotifRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setNotifUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setNotifUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_reply': return '💬';
      case 'post_reaction':
      case 'comment_reaction': return '❤️';
      default: return '🔔';
    }
  };

  // When drawer opens, we could re-fetch or clear? 
  // Let's pass a callback to MessageDrawer to refresh count when it closes.

  const filtersRef = useRef<HTMLDivElement | null>(null);
  const updatesRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
      if (updatesRef.current && !updatesRef.current.contains(e.target as Node)) {
        setShowUpdates(false);
      }
      // Note: messages panel removed from auto-close - user controls via close buttons
    };
    document.addEventListener('click', onDocClick);

    // Listen for open-chat event
    const handleOpenChat = (e: any) => {
      setTargetChatUserId(e.detail.userId);
      setShowMessages(true);
    };
    window.addEventListener('open-chat', handleOpenChat);

    return () => {
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('open-chat', handleOpenChat);
    };
  }, []);

  return (
    <aside className="sidebar">
      {/* Campus Feed Logo */}
      <div className="logo-frame">
        <Link href="/" className="logo-inner neo-logo inline-flex items-center justify-center w-full h-full rounded-2xl font-bold text-2xl tracking-wider">
          CF
        </Link>
      </div>

      <NavIcon
        label="Home"
        href="/"
        active={pathname === '/'}
        svg={
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        }
      />

      {/* Filters dropdown */}
      <div className="group relative" ref={filtersRef}>
        <div className="icon-frame">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="icon-inner neo-icon relative flex items-center justify-center w-full h-full rounded-2xl"
            aria-label="Filters"
          >
            <div className={`w-9 h-9 ${hasActiveCategory ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text)]/70'} group-hover:text-[var(--color-text)]`}>
              {/* Funnel icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" />
              </svg>
            </div>
            {hasActiveCategory && (
              <span className="absolute top-3 right-3 block w-2.5 h-2.5 rounded-full bg-[var(--color-highlight)]" />
            )}
            {!filtersOpen && (
              <span className="sidebar-tooltip left-20">
                {hasActiveCategory ? `Filters: ${activeCategory}` : 'Filters'}
              </span>
            )}
          </button>
        </div>
        {filtersOpen && (
          <div
            className="absolute left-20 top-0 z-50 w-80 max-h-[70vh] overflow-auto rounded-3xl bg-[var(--color-surface)]/90 backdrop-blur-xl border border-[var(--color-border)] p-4 shadow-xl"
            onWheel={(e) => {
              const target = e.currentTarget;
              const atTop = target.scrollTop === 0;
              const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight;
              if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
                e.preventDefault();
              }
              e.stopPropagation();
            }}
          >
            <div className="sticky top-0 bg-[var(--color-surface)] pb-3">
              <input
                type="search"
                placeholder="Filter categories"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className="neo-input w-full text-sm placeholder-[var(--color-text)]/50"
              />
            </div>
            {filtered.map((c) => (
              <button
                key={c}
                onClick={() => goCategory(c)}
                className={`w-full text-left px-3 py-2 rounded-xl text-[var(--color-text)] text-sm hover:bg-[var(--color-surface-soft)]/60 transition ${c === activeCategory ? 'bg-[var(--color-surface-soft)]/50' : ''
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Updates popup */}
      <div className="relative" ref={updatesRef}>
        <div className="icon-frame">
          <button
            className="icon-inner neo-icon relative flex items-center justify-center w-full h-full rounded-2xl"
            aria-label="Updates"
            onClick={() => setShowUpdates((v) => !v)}
          >
            <div className="w-9 h-9 text-[var(--color-text)]/70 group-hover:text-[var(--color-text)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 22a2.5 2.5 0 002.45-2H9.55A2.5 2.5 0 0012 22zm6-6V11a6 6 0 10-12 0v5L4 18v1h16v-1l-2-2z" />
              </svg>
            </div>
            {notifUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
              </span>
            )}
          </button>
        </div>
        {showUpdates && (
          <div
            className="absolute left-20 top-0 z-50 w-[26rem] max-h-[70vh] overflow-auto rounded-3xl bg-[var(--color-surface)]/90 backdrop-blur-xl border border-[var(--color-border)] p-5 shadow-xl"
            onWheel={(e) => {
              const target = e.currentTarget;
              const atTop = target.scrollTop === 0;
              const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight;
              if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
                e.preventDefault();
              }
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Updates</h3>
              {notifUnreadCount > 0 && (
                <button
                  onClick={handleMarkAllNotifsRead}
                  className="text-xs text-[var(--color-highlight)] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {
              notifications.length === 0 ? (
                <p className="text-sm text-[var(--color-text)]/70 py-4 text-center">No new updates.</p>
              ) : (
                <div className="space-y-0 divide-y divide-[var(--color-border)]">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`py-3 flex gap-3 hover:bg-[var(--color-surface-soft)] ml-[-1rem] mr-[-1rem] px-5 transition-colors cursor-pointer ${!notif.is_read ? 'bg-[var(--color-surface-soft)]/30' : ''}`}
                      onClick={() => {
                        if (!notif.is_read) handleMarkNotifRead(notif.id);

                        // If DM, open chat
                        if (notif.type === 'direct_message') {
                          setTargetChatUserId(notif.actor_id);
                          setShowMessages(true);
                          setShowUpdates(false);
                        } else if (notif.post_id) {
                          router.push(`/posts/${notif.post_id}`);
                          setShowUpdates(false);
                        }
                      }}
                    >
                      <div className="text-xl mt-0.5">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--color-text)] leading-snug">{notif.content}</p>
                        <p className="text-xs text-[var(--color-text)]/50 mt-1">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[var(--color-highlight)] mt-2 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}
      </div>

      {/* Messages popup */}
      <div className="relative" ref={messagesRef}>
        <div className="icon-frame">
          <button
            className="icon-inner neo-icon relative flex items-center justify-center w-full h-full rounded-2xl"
            aria-label="Messages"
            onClick={() => setShowMessages((v) => !v)}
          >
            <div className="w-9 h-9 text-[var(--color-text)]/70 group-hover:text-[var(--color-text)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M4 4h16v12H7l-3 3V4z" />
              </svg>
            </div>
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
        </div>
        {showMessages && (
          <MessageDrawer
            initialUserId={targetChatUserId}
            onClose={() => {
              setShowMessages(false);
              setTargetChatUserId(null); // Reset target
              // Refresh count when closing to reflect reads
              if (user) {
                messagesAPI.getUnreadCount()
                  .then(res => setTotalUnread(res.data.count))
                  .catch(console.error);
              }
            }}
          />
        )}
      </div>

      <NavIcon
        label="Create"
        href="/posts/create"
        svg={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M12 5v14m-7-7h14" strokeLinecap="round" />
          </svg>
        }
      />
    </aside >
  );
}
