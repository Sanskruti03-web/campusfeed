'use client';

import { useState, useEffect } from 'react';
import { reactionsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ReactionButtonsProps {
  postId?: number;
  commentId?: number;
  size?: 'sm' | 'md';
}

const REACTION_EMOJIS: Record<string, string> = {
  like: '👍',
  helpful: '💡',
  funny: '😄',
  insightful: '🧠',
  celebrate: '🎉',
};

export default function ReactionButtons({ postId, commentId, size = 'md' }: ReactionButtonsProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [postId, commentId]);

  const fetchReactions = async () => {
    try {
      const response = postId
        ? await reactionsAPI.getForPost(postId)
        : commentId
        ? await reactionsAPI.getForComment(commentId)
        : null;

      if (response) {
        setReactions(response.data.counts || {});
        setUserReactions(response.data.user_reactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch reactions:', err);
    }
  };

  const handleReaction = async (type: string) => {
    if (!user) {
      alert('Please login to react');
      return;
    }

    setLoading(true);
    try {
      const isCurrentlyReacted = userReactions.includes(type);
      
      if (isCurrentlyReacted) {
        // Remove reaction
        await reactionsAPI.remove({
          post_id: postId,
          comment_id: commentId,
          type,
        });
        setUserReactions(userReactions.filter((r) => r !== type));
        setReactions((prev) => ({
          ...prev,
          [type]: Math.max(0, (prev[type] || 0) - 1),
        }));
      } else {
        // Add reaction
        await reactionsAPI.add({
          post_id: postId,
          comment_id: commentId,
          type,
        });
        setUserReactions([...userReactions, type]);
        setReactions((prev) => ({
          ...prev,
          [type]: (prev[type] || 0) + 1,
        }));
      }
    } catch (err: any) {
      console.error('Failed to update reaction:', err);
      alert(err.response?.data?.error || 'Failed to react');
    } finally {
      setLoading(false);
    }
  };

  const buttonSize = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const emojiSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => {
        const count = reactions[type] || 0;
        const isReacted = userReactions.includes(type);

        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={loading}
            className={`${buttonSize} rounded-full border transition-all flex items-center gap-1 ${
              isReacted
                ? 'bg-[var(--color-highlight)] border-[var(--color-highlight)] text-white'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-soft)] text-[var(--color-text)]'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
          >
            <span className={emojiSize}>{emoji}</span>
            {count > 0 && <span className="font-medium">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
