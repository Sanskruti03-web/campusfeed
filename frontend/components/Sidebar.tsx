"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState, useEffect } from 'react';

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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

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
      if (messagesRef.current && !messagesRef.current.contains(e.target as Node)) {
        setShowMessages(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
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
          <div className="absolute left-20 top-0 z-50 w-80 max-h-[70vh] overflow-auto rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
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
                className={`w-full text-left px-3 py-2 rounded-xl text-[var(--color-text)] text-sm hover:bg-[var(--color-surface-soft)]/60 transition ${
                  c === activeCategory ? 'bg-[var(--color-surface-soft)]/50' : ''
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
          </button>
        </div>
        {showUpdates && (
          <div className="absolute left-20 top-0 z-50 w-[26rem] max-h-[70vh] overflow-auto rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-text)]">Updates</h3>
            <p className="text-sm text-[var(--color-text)]/70">Activity on your posts and boards will appear here.</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)]">New reactions</span>
                <span className="text-xs text-[var(--color-text)]/60">2h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)]">New comments</span>
                <span className="text-xs text-[var(--color-text)]/60">1d</span>
              </div>
            </div>
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
          </button>
        </div>
        {showMessages && (
          <div className="absolute left-20 top-0 z-50 w-[30rem] max-h-[70vh] overflow-auto rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-text)]">Messages</h3>
            <input type="search" placeholder="Search users" className="neo-input w-full text-sm placeholder-[var(--color-text)]/50" />
            <div className="mt-3">
              <button className="w-full text-left px-3 py-2 rounded-xl text-[var(--color-text)] text-sm hover:bg-[var(--color-surface-soft)]/60 transition">
                Create group
              </button>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)]">test1</span>
                <button className="neo-btn text-xs px-3 py-1">Message</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)]">test2</span>
                <button className="neo-btn text-xs px-3 py-1">Message</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)]">test3</span>
                <button className="neo-btn text-xs px-3 py-1">Message</button>
              </div>
            </div>
          </div>
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
    </aside>
  );
}
