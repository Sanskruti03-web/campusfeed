'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [isTyping, setIsTyping] = useState(false);

  // Sync search state with URL params only when not typing
  useEffect(() => {
    if (!isTyping) {
      setSearch(searchParams.get('q') || '');
    }
  }, [searchParams, isTyping]);

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
    <nav className="px-4 sticky top-0 z-50 pt-4 bg-deep">
      <div className="flex items-center h-20 px-4  backdrop-blur-sm gap-4 w-full max-w-7xl mx-auto">
        <div className="flex-1">
          <div className="search-frame w-full rounded-2xl">
            <form onSubmit={handleSearch} className="relative search-inner rounded-2xl bg-transparent">
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text)]/60 pointer-events-none"
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
                // style={}
                style={{ paddingLeft: 50 }}
                type="search"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsTyping(true);
                }}
                className="pl-[60px] neo-input w-full pr-6 py-3 text-base placeholder-[var(--color-text)]/50 bg-transparent"
              />
            </form>
          </div>
        </div>
        {/* <div className="search-frame sm:w-40 mr-10">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="search-inner neo-input w-full"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div> */}
        {/* <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="search-frame flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-inner neo-input w-full"
            />
          </div>
          
        </div> */}
        

        <div className="flex items-center gap-3">
          {/* {user && <NotificationDropdown />} */}
          <div className="relative group">
            <div className="avatar-frame w-14 h-14 rounded-full">
              {user ? (
                <button
                  type="button"
                  onClick={() => router.push(`/users/${user.id}`)}
                  className="avatar-inner inline-flex items-center justify-center w-full h-full rounded-full text-white text-lg font-bold transition-all hover:scale-105 hover:shadow-xl"
                  aria-label="Account"
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="avatar-inner inline-flex items-center justify-center w-full h-full rounded-full text-white text-lg font-bold transition-all hover:scale-105 hover:shadow-xl"
                  aria-label="Login"
                >
                  ?
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

