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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="text-[var(--color-highlight)] hover:underline mb-6 inline-block">
          ← Back to feed
        </Link>

        <div className="card-frame mb-6">
          <div className="card-inner">
            <div className="flex items-start justify-between mb-4 gap-2">
              <button className="category-pill">
                {post.category}
              </button>
              {user && user.id === post.user_id && (
                <div className="flex gap-3">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="text-sm text-[var(--color-highlight)] hover:underline font-medium"
                  >
                    Edit
                  </Link>
                  <button onClick={handleDelete} className="text-sm text-red-600 hover:underline font-medium">
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold gradient-text-primary mb-3">{post.title}</h1>
            <p className="text-sm text-muted mb-6">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              {post.edited_at && <span className="ml-2">(edited)</span>}
            </p>

            <div className="prose max-w-none mb-6">
              <ReactMarkdown>{post.content_md}</ReactMarkdown>
            </div>

            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {post.media.map((m) => (
                  <div key={m.id} className="relative">
                    {m.type === 'image' ? (
                      <img
                        src={m.url.startsWith('http') ? m.url : `${apiBase}${m.url}`}
                        alt="Post media"
                        className="rounded-lg w-full"
                      />
                    ) : (
                      <a
                        href={m.url.startsWith('http') ? m.url : `${apiBase}${m.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-soft)]"
                      >
                        📄 Document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <ReactionButtons postId={postId} size="md" />
            </div>
          </div>
        </div>

        <div className="card-frame">
          <div className="card-inner">
            <h2 className="text-xl font-bold mb-6 gradient-text-primary">Comments ({comments.length})</h2>

            {user && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                {replyTo && (
                  <div className="bg-[var(--color-surface-soft)] p-4 rounded-lg mb-3 border-l-4 border-[var(--color-highlight)]">
                    <div className="text-sm flex justify-between items-start">
                      <div className="flex-1">
                        <span className="font-medium text-[var(--color-text)]">
                          Replying to {replyToUserName}
                        </span>
                        <p className="text-muted mt-1 italic text-xs line-clamp-2">
                          "{replyToContent}"
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyToUserName('');
                          setReplyToContent('');
                        }}
                        className="text-[var(--color-highlight)] hover:underline ml-2 flex-shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="neo-input w-full resize-none"
                  rows={3}
                />
                <button
                  type="submit"
                  className="mt-3 neo-btn bg-[var(--color-highlight)] text-white"
                >
                  Post Comment
                </button>
              </form>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={(commentId, userName, content) => {
                    setReplyTo(commentId);
                    setReplyToUserName(userName);
                    setReplyToContent(content);
                    document.querySelector('textarea')?.focus();
                  }}
                  showReplyButton={!!user}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
