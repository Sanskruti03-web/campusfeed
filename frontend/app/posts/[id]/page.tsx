'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import CommentItem from '@/components/CommentItem';
import ReactionButtons from '@/components/ReactionButtons';
import { postsAPI, commentsAPI, reactionsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: number;
  title: string;
  content_md: string;
  content_html: string;
  category: string;
  user_id: number;
  created_at: string;
  edited_at?: string;
  media: Array<{ id: number; url: string; type: string }>;
}

interface Comment {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_id: number;
  user_name: string;
  content: string;
  depth: number;
  created_at: string;
  replies?: Comment[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postId = parseInt(params.id as string);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyToUserName, setReplyToUserName] = useState<string>('');
  const [replyToContent, setReplyToContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          postsAPI.get(postId),
          commentsAPI.list(postId),
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data.comments);
      } catch (err: any) {
        setError('Failed to load post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await commentsAPI.create(postId, {
        content: newComment,
        parent_id: replyTo || undefined,
      });
      setComments([...comments, response.data]);
      setNewComment('');
      setReplyTo(null);
      // Refresh comments
      const commentsRes = await commentsAPI.list(postId);
      setComments(commentsRes.data.comments);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to post comment');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await postsAPI.delete(postId);
      router.push('/');
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleReaction = async () => {
    try {
      await reactionsAPI.add({ post_id: postId, type: 'like' });
      alert('Reaction added!');
    } catch (err) {
      alert('Failed to react');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card-frame animate-pulse">
          <div className="card-inner">
            <div className="h-8 bg-[var(--color-surface-soft)] rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-[var(--color-surface-soft)] rounded w-1/4 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-[var(--color-surface-soft)] rounded"></div>
              <div className="h-4 bg-[var(--color-surface-soft)] rounded"></div>
              <div className="h-4 bg-[var(--color-surface-soft)] rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="card-frame">
          <div className="card-inner">
            <p className="text-red-600">{error || 'Post not found'}</p>
            <Link href="/" className="text-[var(--color-highlight)] hover:underline mt-4 inline-block">
              ← Back to feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-highlight)] mb-6 transition-colors font-medium">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Feed
        </Link>

        {/* Main Post Card */}
        <div className="card-frame mb-8 overflow-visible">
          <div className="card-inner p-8">
            <div className="flex items-start justify-between mb-6 gap-2">
              <button
                onClick={() => router.push(`/?category=${encodeURIComponent(post.category)}`)}
                className="category-pill hover:scale-105 transition-transform"
              >
                {post.category}
              </button>
              {user && user.id === post.user_id && (
                <div className="flex gap-2">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-highlight)]/10 hover:text-[var(--color-highlight)] transition-colors"
                    title="Edit Post"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg text-red-500/70 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                    title="Delete Post"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-extrabold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text)] to-[var(--color-text-muted)] mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 mb-8 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--color-highlight)] to-[var(--color-highlight-alt)] flex items-center justify-center text-[10px] text-white font-bold">
                  {(post as any).user_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <Link href={`/users/${post.user_id}`} className="font-semibold hover:text-[var(--color-highlight)] transition-colors">
                  {(post as any).user_name || 'Anonymous'}
                </Link>
              </div>
              <span className="text-[var(--color-border)]">•</span>
              <span>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                {post.edited_at && <span className="ml-1 opacity-60">(edited)</span>}
              </span>
            </div>

            <div className="prose prose-lg max-w-none mb-8 dark:prose-invert prose-headings:font-outfit prose-a:text-[var(--color-highlight)] prose-img:rounded-2xl prose-pre:bg-[var(--color-surface-soft)] prose-pre:border prose-pre:border-[var(--color-border)]">
              <ReactMarkdown>{post.content_md}</ReactMarkdown>
            </div>

            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {post.media.map((m) => (
                  <div key={m.id} className="relative group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]">
                    {m.type === 'image' ? (
                      <div className="relative aspect-video">
                        <img
                          src={m.url.startsWith('http') ? m.url : `${apiBase}${m.url}`}
                          alt="Post attachment"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <a
                        href={m.url.startsWith('http') ? m.url : `${apiBase}${m.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-6 hover:bg-[var(--color-surface)] transition-colors"
                      >
                        <div className="p-3 rounded-xl bg-[var(--color-highlight)]/10 text-[var(--color-highlight)]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                        <div>
                          <p className="font-bold text-[var(--color-text)]">Attached Document</p>
                          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">Click to download</p>
                        </div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
              <ReactionButtons postId={postId} size="lg" />
              <button
                onClick={() => document.getElementById('comment-input')?.focus()}
                className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors font-medium"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Write a comment
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="card-frame animate-in slide-in-from-bottom-4 duration-500">
          <div className="card-inner p-8">
            <h2 className="text-xl font-bold mb-6 gradient-text-primary flex items-center gap-2">
              Comments <span className="px-2 py-0.5 rounded-lg bg-[var(--color-surface-soft)] text-sm text-[var(--color-text)]">{comments.length}</span>
            </h2>

            {user && (
              <form onSubmit={handleCommentSubmit} className="mb-8 relative group">
                {replyTo && (
                  <div className="absolute -top-10 left-0 right-0 bg-[var(--color-surface-soft)]/80 backdrop-blur rounded-t-xl px-4 py-2 border border-[var(--color-border)] border-b-0 flex justify-between items-center text-sm animate-in slide-in-from-bottom-2">
                    <span className="text-[var(--color-text-muted)] flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l9-7" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" /></svg>
                      Replying to <strong>{replyToUserName}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyToUserName('');
                        setReplyToContent('');
                      }}
                      className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                )}

                <div className={`relative rounded-2xl bg-[var(--color-bg-deep)] border-2 transition-all ${replyTo ? 'rounded-t-none border-[var(--color-highlight)]' : 'border-[var(--color-border)] focus-within:border-[var(--color-highlight)]'}`}>
                  <textarea
                    id="comment-input"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full bg-transparent p-4 min-h-[100px] resize-none focus:outline-none rounded-2xl font-medium placeholder-[var(--color-text-muted)]/50"
                  />
                  <div className="flex justify-end p-2 border-t border-[var(--color-border)]/50">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="neo-btn px-6 py-2 bg-[var(--color-highlight)] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="animate-in fade-in duration-300">
                  <CommentItem
                    comment={comment}
                    onReply={(commentId, userName, content) => {
                      setReplyTo(commentId);
                      setReplyToUserName(userName);
                      setReplyToContent(content);
                      document.getElementById('comment-input')?.focus();
                    }}
                    showReplyButton={!!user}
                  />
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <p className="text-[var(--color-text-muted)] font-medium">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
