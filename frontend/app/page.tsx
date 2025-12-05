'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { postsAPI } from '@/lib/api';
import CategoryFilter from '@/components/CategoryFilter';
import PostCard from '@/components/PostCard';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [error, setError] = useState('');

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
      setPosts(response.data.posts);
    } catch (err: any) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort]);

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
          <div className="search-frame sm:w-48">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="search-inner neo-input w-full"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div> */}

        {/* <div className="mb-6">
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div> */}

        {error && (
          <div className="card-frame mb-6">
            <div className="card-inner bg-red-50 text-red-700">
              {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="mb-5 break-inside-avoid">
                <div className="card-frame animate-pulse">
                  <div className="card-inner">
                    <div className="h-48 bg-[var(--color-surface-soft)] mb-3"></div>
                    <div className="h-4 bg-[var(--color-surface-soft)] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[var(--color-surface-soft)] rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card-frame text-center py-12">
            <div className="card-inner">
              <p className="text-muted text-lg">
                {search || category ? 'No posts match your filters.' : 'No posts yet. Be the first to post!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
            {posts.map((post, idx) => (
              <div 
                key={post.id} 
                className="mb-5 break-inside-avoid masonry-item-enter"
                style={{ animationDelay: `${(idx % 12) * 35}ms` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
