'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';


export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [isTyping, setIsTyping] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);

  // Sync search state with URL params only when not typing
  useEffect(() => {
    if (!isTyping) {
      setSearch(searchParams.get('q') || '');
    }
  }, [searchParams, isTyping]);

  // Close menu when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set('q', search.trim());
    } else {
      params.delete('q');
    }
    // Navigate to home with search params
    router.push(`/?${params.toString()}`);
    setIsTyping(false);
  };

  // Active search: update URL as user types (debounced)
  useEffect(() => {
    if (!isTyping) return;

    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentQ = searchParams.get('q') || '';
      const trimmedSearch = search.trim();

      // Only update if value actually changed
      if (trimmedSearch !== currentQ) {
        if (trimmedSearch) params.set('q', trimmedSearch);
        else params.delete('q');
        const q = params.toString();
        router.replace(q ? `/?${q}` : '/');
      }
      setIsTyping(false);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, isTyping]);

  return (
    <nav className="sticky top-0 z-40 w-full px-4 pt-4 pointer-events-none">
      <div className="max-w-7xl mx-auto h-20 bg-[var(--color-bg-deep)]/70 backdrop-blur-2xl border border-[var(--color-border)] rounded-3xl shadow-2xl px-6 flex items-center gap-4 pointer-events-auto">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative group max-w-2xl">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-highlight)] transition-colors pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search posts, topics, or people..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsTyping(true);
              }}
              className="w-full bg-[var(--color-surface-soft)]/50 border border-transparent focus:border-[var(--color-highlight)]/30 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[var(--color-highlight)]/10 transition-all placeholder-[var(--color-text-muted)] text-[var(--color-text)]"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          {/* Avatar with Dropdown Menu */}
          <div className="relative" ref={avatarMenuRef}>
            <button
              type="button"
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              className="avatar-frame w-14 h-14 rounded-full hover:scale-105 transition-transform"
              aria-label="Account menu"
            >
              {user ? (
                <div className="avatar-inner inline-flex items-center justify-center w-full h-full rounded-full text-white text-lg font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              ) : (
                <div className="avatar-inner inline-flex items-center justify-center w-full h-full rounded-full text-white text-lg font-bold">
                  ?
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {showAvatarMenu && user && (
              <div className="absolute right-0 top-16 w-48 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg overflow-hidden z-50">
                <div className="p-4 border-b border-[var(--color-border)]">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{user.name}</p>
                  <p className="text-xs text-[var(--color-text)]/60">{user.email}</p>
                </div>

                <div className="p-2 space-y-1">
                  {/* Profile */}
                  <button
                    onClick={() => {
                      router.push(`/users/${user.id}`);
                      setShowAvatarMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Profile
                  </button>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => {
                      toggleTheme();
                      setShowAvatarMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] transition flex items-center gap-2"
                  >
                    {theme === 'light' ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                        Dark Mode
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="5" />
                          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
                          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" />
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
                          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
                          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" />
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Light Mode
                      </>
                    )}
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowAvatarMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Login prompt when not logged in */}
            {showAvatarMenu && !user && (
              <div className="absolute right-0 top-16 w-48 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg overflow-hidden z-50">
                <div className="p-4">
                  <button
                    onClick={() => {
                      router.push('/auth/login');
                      setShowAvatarMenu(false);
                    }}
                    className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-highlight)] text-white hover:opacity-90 transition"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

