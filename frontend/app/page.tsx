'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { postsAPI } from '@/lib/api';
import CategoryFilter from '@/components/CategoryFilter';
import PostCard from '@/components/PostCard';
import SkeletonPost from '@/components/SkeletonPost';

interface Post {
  id: number;
  title: string;
  category: string;
  created_at: string;
  edited_at?: string;
  cover_url?: string;
  coverUrl?: string;
  media?: { url: string }[];
  content?: string;
  body?: string;
  user_id: number;
  user_name: string;
}

const POSTS_PER_PAGE = 20;

// Backgrounds and copy for each category hero
const CATEGORY_HERO: Record<string, { image: string; title: string; subtitle: string }> = {
  all: {
    image:
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1600&auto=format&fit=crop',
    title: 'Campus Feed',
    subtitle: 'Stay updated with campus events, announcements, and more.'
  },
  academics: {
    image:
      'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop',
    title: 'Academics',
    subtitle: 'Notes, timetables, and academic discussions — all in one place.'
  },
  events: {
    image:
      'https://images.unsplash.com/photo-1515165562835-c3b8c2c6253f?q=80&w=1600&auto=format&fit=crop',
    title: 'Events',
    subtitle: 'Fests, talks, meetups — never miss what’s happening on campus.'
  },
  clubs: {
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
    title: 'Clubs',
    subtitle: 'From robotics to drama — explore activities that excite you.'
  },
  sports: {
    image:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop',
    title: 'Sports',
    subtitle: 'Matches, tryouts, and fitness — get in the game.'
  },
  placements: {
    image:
      'https://images.unsplash.com/photo-1554774853-b415df9eeb92?q=80&w=1600&auto=format&fit=crop',
    title: 'Placements',
    subtitle: 'Drives, prep, and success stories to guide your journey.'
  },
  general: {
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop',
    title: 'General',
    subtitle: 'Open discussions and everyday campus life.'
  },
  announcements: {
    image:
      'https://images.unsplash.com/photo-1510070009289-b5bc34383727?q=80&w=1600&auto=format&fit=crop',
    title: 'Announcements',
    subtitle: 'Official notices and updates straight from the source.'
  },
  food: {
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop',
    title: 'Food',
    subtitle: 'Mess menus, reviews, and the best bites around.'
  },
  hostel: {
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
    title: 'Hostel',
    subtitle: 'Hostel updates, room info, and amenities.'
  }
};

export default function Home() {
  const searchParams = useSearchParams();
  const [displayPosts, setDisplayPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Get search from URL params (set by Navbar)
  const search = searchParams.get('q') || '';

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await postsAPI.list(
        category || undefined,
        search || undefined,
        sort
      );
      const allPostsData = response.data.posts || [];
      console.log(`📊 Fetched ${allPostsData.length} posts total`);
      setAllPosts(allPostsData);
      // Load first batch of posts
      setDisplayPosts(allPostsData.slice(0, POSTS_PER_PAGE));
      setHasMore(allPostsData.length > POSTS_PER_PAGE);
    } catch (err: any) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort]);

  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayPosts.length;
      const nextBatch = allPosts.slice(currentLength, currentLength + POSTS_PER_PAGE);
      setDisplayPosts(prev => [...prev, ...nextBatch]);
      setHasMore(currentLength + POSTS_PER_PAGE < allPosts.length);
      setLoadingMore(false);
    }, 300);
  }, [displayPosts.length, allPosts, loadingMore, hasMore]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && hasMore && !loadingMore && !loading && displayPosts.length > 0) {
            loadMorePosts();
          }
        });
      },
      { threshold: 0.01, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, loadMorePosts, displayPosts.length]);

  useEffect(() => {
    // Always reflect URL -> state, including when category is cleared (All)
    const categoryParam = searchParams.get('category') || '';
    // Only update if the value actually changed to prevent unnecessary re-renders
    setCategory(prev => prev !== categoryParam ? categoryParam : prev);
  }, [searchParams]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchPosts]);

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Hero Section - no IIFE, no key, just direct render */}
        {(() => {
          const key = (category || 'all').toLowerCase();
          const hero = CATEGORY_HERO[key] ?? CATEGORY_HERO.all;
          const label = category || 'All';
          return (
            <div className="relative mb-8 category-hero-frame">
              <div
                className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px] brightness-90"
                style={{ backgroundImage: `url(${hero.image})` }}
                aria-hidden="true"
              />
              <div className="absolute inset-0" />
              <div className="relative category-hero-inner">
                <div className="bg-transparent p-8 sm:p-12 md:p-16 flex flex-col gap-2">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="card-inner text-base px-4 py-2 rounded-2xl tracking-wide font-semibold text-white">
                      {label}
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-white drop-shadow-lg">
                    {hero.title}
                    {label && label !== 'All' ? ` — ${label}` : ''}
                  </h1>
                  <p className="text-lg sm:text-xl font-medium text-white/90 max-w-2xl drop-shadow-md mt-2">
                    {hero.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Search and Sort */}
        {/* Mobile Category Filters */}
        <div className="mb-6 md:hidden">
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>

        {/* Sort Controls */}
        <div className="mb-8 flex justify-end">
          <div className="relative group">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)] group-hover:text-[var(--color-highlight)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] pl-5 pr-10 py-2.5 rounded-xl font-bold text-sm cursor-pointer shadow-sm hover:border-[var(--color-highlight)]/50 focus:outline-none focus:border-[var(--color-highlight)] focus:ring-1 focus:ring-[var(--color-highlight)] transition-all min-w-[160px]"
            >
              <option value="newest">Latest Posts</option>
              <option value="popular">Most Popular</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="card-frame mb-6">
            <div className="card-inner bg-red-50 text-red-700">
              {error}
            </div>
          </div>
        )}

        {loading && displayPosts.length === 0 ? (
          <div className="space-y-6">
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-[2.5rem] text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface-soft)] flex items-center justify-center text-[var(--color-text-muted)] mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">No posts found</h3>
            <p className="text-[var(--color-text-muted)] max-w-sm">
              {search || category ? 'Try adjusting your search or filters.' : 'Be the first to post something!'}
            </p>
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
              {displayPosts.map((post, idx) => (
                <div
                  key={post.id}
                  className="break-inside-avoid animate-in fade-in duration-500 fill-mode-backwards"
                  style={{ animationDelay: `${(idx % 5) * 100}ms` }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>

            {/* Lazy load trigger */}
            <div ref={observerTarget} className="w-full py-12 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[var(--color-highlight)] rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-[var(--color-highlight)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-[var(--color-highlight)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
              {hasMore && !loadingMore && !loading && displayPosts.length > 0 && (
                <p className="text-[var(--color-text-muted)] text-sm font-medium">Scroll for more</p>
              )}
              {!hasMore && displayPosts.length > 0 && (
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm font-medium opacity-60">
                  <div className="h-px w-8 bg-current"></div>
                  <span>End of Feed</span>
                  <div className="h-px w-8 bg-current"></div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
