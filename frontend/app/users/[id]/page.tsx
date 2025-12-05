'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { usersAPI } from '@/lib/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  branch?: string;
  year?: string;
  bio?: string;
  profile_pic?: string;
  created_at: string;
  stats: {
    posts: number;
    comments: number;
  };
}

interface Post {
  id: number;
  title: string;
  category: string;
  created_at: string;
  edited_at?: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  post_id: number;
  post_title: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = parseInt(params.id as string);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, postsRes, commentsRes] = await Promise.all([
          usersAPI.get(userId),
          usersAPI.getPosts(userId),
          usersAPI.getComments(userId),
        ]);
        setProfile(profileRes.data);
        setPosts(postsRes.data.posts);
        setComments(commentsRes.data.comments);
      } catch (err: any) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card-frame animate-pulse">
          <div className="card-inner">
            <div className="h-32 bg-[var(--color-surface-soft)] rounded-xl mb-6"></div>
            <div className="h-8 bg-[var(--color-surface-soft)] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="card-frame">
          <div className="card-inner">
            <p className="text-red-600">{error || 'User not found'}</p>
            <Link href="/" className="text-[var(--color-highlight)] hover:underline mt-4 inline-block">
              ← Back to feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/" className="text-[var(--color-highlight)] hover:underline mb-8 inline-block font-medium">
          ← Back to feed
        </Link>

        {/* Profile Header Card */}
        <div className="card-frame mb-8">
          <div className="card-inner p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                {profile.profile_pic ? (
                  <div className="avatar-frame w-32 h-32 sm:w-40 sm:h-40">
                    <img
                      src={profile.profile_pic}
                      alt={profile.name}
                      className="avatar-inner w-full h-full rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="avatar-frame w-32 h-32 sm:w-40 sm:h-40">
                    <div className="avatar-inner w-full h-full rounded-full flex items-center justify-center text-white text-5xl sm:text-6xl font-extrabold shadow-2xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left w-full">
                <h1 className="text-3xl sm:text-4xl font-bold gradient-text-primary mb-3">{profile.name}</h1>
                {(profile.branch || profile.year) && (
                  <p className="text-muted mb-3 text-base">
                    {profile.branch && profile.year
                      ? `${profile.branch} • ${profile.year}`
                      : profile.branch || profile.year}
                  </p>
                )}
                {profile.bio && <p className="text-[var(--color-text)] mb-6 text-base leading-relaxed">{profile.bio}</p>}
                
                {/* Stats */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
                  <span className="flex items-center gap-2">
                    <strong className="text-[var(--color-text)] text-lg">{profile.stats.posts}</strong> 
                    <span className="text-muted">posts</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <strong className="text-[var(--color-text)] text-lg">{profile.stats.comments}</strong> 
                    <span className="text-muted">comments</span>
                  </span>
                  <span className="text-muted">
                    Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Tabs Card */}
        <div className="card-frame">
          <div className="card-inner">
            <div className="flex border-b border-[var(--color-border)]">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 px-4 sm:px-6 py-4 text-center font-semibold transition-all ${
                  activeTab === 'posts'
                    ? 'text-[var(--color-highlight)] border-b-2 border-[var(--color-highlight)] -mb-[1px]'
                    : 'text-muted hover:text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
                }`}
              >
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 px-4 sm:px-6 py-4 text-center font-semibold transition-all ${
                  activeTab === 'comments'
                    ? 'text-[var(--color-highlight)] border-b-2 border-[var(--color-highlight)] -mb-[1px]'
                    : 'text-muted hover:text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
                }`}
              >
                Comments ({comments.length})
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'posts' ? (
                posts.length === 0 ? (
                  <p className="text-center text-muted py-12">No posts yet</p>
                ) : (
                  <div className="space-y-5">
                    {posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className="block p-5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-highlight)] hover:bg-[var(--color-surface-soft)] transition-all hover:scale-[1.01]"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <button className="category-pill text-xs">
                            {post.category}
                          </button>
                          <span className="text-xs text-muted whitespace-nowrap">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            {post.edited_at && <span className="ml-2">(edited)</span>}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-text)] leading-relaxed">{post.title}</h3>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                comments.length === 0 ? (
                  <p className="text-center text-muted py-12">No comments yet</p>
                ) : (
                  <div className="space-y-5">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/30"
                      >
                        <Link
                          href={`/posts/${comment.post_id}`}
                          className="text-sm text-[var(--color-highlight)] hover:underline mb-3 inline-block font-medium"
                        >
                          On: {comment.post_title}
                        </Link>
                        <p className="text-[var(--color-text)] mb-3 leading-relaxed">{comment.content}</p>
                        <span className="text-xs text-muted">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
