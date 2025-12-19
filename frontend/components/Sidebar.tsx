"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import MessageDrawer from './MessageDrawer';
import NotificationDropdown from './NotificationDropdown';
import { messagesAPI, notificationsAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, PlusSquare, Bell, Mail, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [showMessages, setShowMessages] = useState(false);
  const [targetChatUserId, setTargetChatUserId] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage and sync with HTML class
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    const collapsed = saved === 'true';
    setIsCollapsed(collapsed);
    if (collapsed) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    if (newState) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
  };

  // Stats
  const [totalUnread, setTotalUnread] = useState(0);

  // Initial Fetch
  useEffect(() => {
    if (!user) return;

    // Messages Count
    messagesAPI.getUnreadCount()
      .then(res => setTotalUnread(res.data.count))
      .catch(console.error);


    // Socket Listeners
    const socket = getSocket();

    const handleNewMessage = () => {
      setTotalUnread(prev => prev + 1);
    };


    socket.on('new_message', handleNewMessage);


    return () => {
      socket.off('new_message', handleNewMessage);

    };
  }, [user]);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Create', href: '/posts/create', icon: PlusSquare },
    { label: 'Messages', onClick: () => setShowMessages(true), icon: Mail, count: totalUnread }
  ];

  return (
    <>
      <aside className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bg-[var(--color-bg-deep)]/80 backdrop-blur-xl border-r border-[var(--color-border)] transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-20 lg:w-64'}`}>
        <div className={`p-4 mb-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
            <div className="w-10 h-10 min-w-10 bg-gradient-to-br from-[var(--color-highlight)] to-[var(--color-highlight-alt)] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[var(--color-highlight)]/20 group-hover:rotate-3 transition-transform">
              CF
            </div>
            {!isCollapsed && <span className="font-bold text-xl font-outfit gradient-text-primary hidden lg:block tracking-tight">CampusFeed</span>}
          </Link>

          <button
            onClick={toggleCollapse}
            className={`hidden lg:flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] transition-all ${isCollapsed ? 'absolute -right-3 top-20 w-6 h-6 bg-[var(--color-highlight)] text-white shadow-lg rounded-full' : 'w-8 h-8'}`}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className={`flex-1 space-y-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : item.href ? pathname.startsWith(item.href) : false;
            const Icon = item.icon;
            const content = (
              <div className={`
                flex items-center gap-4 py-3 rounded-2xl transition-all duration-300 group relative
                ${isActive
                  ? 'bg-gradient-to-r from-[var(--color-highlight)]/10 to-transparent text-[var(--color-highlight)] font-bold'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]'}
                ${isCollapsed ? 'justify-center px-0' : 'px-4'}
              `}>
                <div className="relative">
                  <div className={isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {item.count && item.count > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[var(--color-bg-deep)] font-bold">
                      {item.count > 9 ? '9+' : item.count}
                    </span>
                  )}
                </div>
                {!isCollapsed && <span className="hidden lg:block text-sm tracking-wide">{item.label}</span>}

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-highlight)] rounded-r-full" />
                )}
              </div>
            );

            return (
              <div key={item.label}>
                {item.href ? (
                  <Link href={item.href}>{content}</Link>
                ) : (
                  <button onClick={item.onClick} className="w-full text-left">{content}</button>
                )}
              </div>
            );
          })}

          {/* Notification Dropdown */}
          <div>
            <NotificationDropdown isCollapsed={isCollapsed} />
          </div>
        </nav>

        {user && (
          <div className="p-4 mt-auto border-t border-[var(--color-border)]">
            <Link
              href={`/users/${user.id}`}
              className={`flex items-center gap-3 p-2 rounded-2xl transition-all group ${pathname === `/users/${user.id}` ? 'bg-[var(--color-highlight)]/10' : 'hover:bg-[var(--color-surface-soft)]'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className={`w-10 h-10 min-w-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${pathname === `/users/${user.id}` ? 'bg-[var(--color-highlight)] text-white' : 'bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--color-highlight)] group-hover:bg-[var(--color-highlight)] group-hover:text-white'}`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="hidden lg:block">
                  <p className={`text-sm font-bold truncate max-w-[120px] ${pathname === `/users/${user.id}` ? 'text-[var(--color-highlight)]' : 'text-[var(--color-text)]'}`}>{user.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Profile</p>
                </div>
              )}
            </Link>
          </div>
        )}
      </aside>

      {showMessages && (
        <MessageDrawer
          onClose={() => setShowMessages(false)}
          initialUserId={targetChatUserId}
        />
      )}
    </>
  );
}
