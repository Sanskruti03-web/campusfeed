"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, Users, FileText, Loader2, ArrowRight } from 'lucide-react';
import { postsAPI, usersAPI } from '@/lib/api';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');
    const [posts, setPosts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedQuery = useDebounce(query, 500);

    const performSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setPosts([]);
            setUsers([]);
            return;
        }
        setLoading(true);
        setHasSearched(true);
        try {
            if (activeTab === 'posts') {
                const res = await postsAPI.list(undefined, q);
                setPosts(res.data.posts);
            } else {
                const res = await usersAPI.search(q);
                setUsers(res.data.users);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        performSearch(debouncedQuery);
    }, [debouncedQuery, activeTab, performSearch]);

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 min-h-[90vh] animate-in fade-in duration-500">

            {/* Search Hero Area */}
            <div className="flex flex-col items-center gap-6 py-6">
                <h1 className="text-3xl md:text-4xl font-bold font-outfit text-center">
                    Find what you're looking for
                </h1>

                <div className="relative w-full max-w-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-highlight-alt)] rounded-2xl opacity-20 blur-xl group-focus-within:opacity-40 transition-opacity duration-500" />
                    <div className="relative flex items-center bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-lg transition-all group-focus-within:border-[var(--color-highlight)] group-focus-within:shadow-[var(--color-highlight)]/20">
                        <SearchIcon className="ml-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-highlight)] transition-colors" size={24} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={activeTab === 'posts' ? "Search for posts, topics..." : "Search for students, peers..."}
                            className="w-full pl-4 pr-16 py-5 bg-transparent text-lg font-medium text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none"
                            autoFocus
                        />
                        {loading && (
                            <div className="absolute right-5">
                                <Loader2 className="animate-spin text-[var(--color-highlight)]" size={24} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Modern Pill Tabs */}
                <div className="flex p-1.5 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-2xl backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'posts'
                                ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-text)] ring-1 ring-[var(--color-border)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
                            }`}
                    >
                        <FileText size={16} className={activeTab === 'posts' ? 'text-[var(--color-highlight)]' : ''} />
                        Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users'
                                ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-text)] ring-1 ring-[var(--color-border)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
                            }`}
                    >
                        <Users size={16} className={activeTab === 'users' ? 'text-[var(--color-highlight-alt)]' : ''} />
                        People
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">

                {/* Empty State */}
                {!loading && hasSearched && query && (activeTab === 'posts' ? posts.length === 0 : users.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards duration-700 delay-150">
                        <div className="w-20 h-20 rounded-full bg-[var(--color-surface-soft)] flex items-center justify-center text-[var(--color-text-muted)]">
                            <SearchIcon size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-[var(--color-text)]">No matches found</h3>
                            <p className="text-[var(--color-text-muted)]">Try adjusting your search terms</p>
                        </div>
                    </div>
                )}

                {/* Posts Grid */}
                {activeTab === 'posts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.map((post, idx) => (
                            <div key={post.id} className="animate-in fade-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                <PostCard post={post} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Users List */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map((user, idx) => (
                            <Link
                                href={`/users/${user.id}`}
                                key={user.id}
                                className="group block animate-in fade-in slide-in-from-bottom-8 duration-500"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[1.5rem] hover:border-[var(--color-highlight)]/30 hover:shadow-lg hover:shadow-[var(--color-highlight)]/5 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-highlight)]/0 via-[var(--color-highlight)]/0 to-[var(--color-highlight)]/0 group-hover:to-[var(--color-highlight)]/5 transition-all duration-500" />

                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-highlight)] to-[var(--color-highlight-alt)] flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0 ring-4 ring-[var(--color-bg-deep)]">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[var(--color-text)] text-lg truncate group-hover:text-[var(--color-highlight)] transition-colors">{user.name}</h3>
                                        <p className="text-sm text-[var(--color-text-muted)] truncate flex items-center gap-2">
                                            {user.year ? `Class of ${user.year}` : 'Student'}
                                            <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
                                            {user.branch || 'Campus'}
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-full bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-highlight)] group-hover:text-white transition-all transform group-hover:-rotate-45">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
