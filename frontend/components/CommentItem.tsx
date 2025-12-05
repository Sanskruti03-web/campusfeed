'use client';

import { useState, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ReactionButtons from './ReactionButtons';

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

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: number, userName: string, content: string) => void;
  depth?: number;
  maxDepth?: number;
  showReplyButton?: boolean;
}

const CommentItem = memo(function CommentItem({
  comment,
  onReply,
  depth = 0,
  maxDepth = 10,
  showReplyButton = true,
}: CommentItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const shouldShowContinueThread = depth >= maxDepth && hasReplies;

  return (
    <div className="relative">
      <div className={`flex gap-2 ${depth > 0 ? 'ml-4 border-l-2 border-[var(--color-border)] pl-4' : ''}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted hover:text-[var(--color-text)] text-xs font-bold w-4 h-4 flex-shrink-0 mt-1"
        >
          {isCollapsed ? '[+]' : '[-]'}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-medium text-sm text-[var(--color-text)]">{comment.user_name}</span>
            <span className="text-xs text-muted">
              {comment.created_at && new Date(comment.created_at).toString() !== 'Invalid Date'
                ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                : 'Just now'}
            </span>
            {isCollapsed && hasReplies && (
              <span className="text-xs text-muted">
                ({comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'} hidden)
              </span>
            )}
          </div>

          {!isCollapsed && (
            <>
              <p className="text-[var(--color-text)] text-sm mt-1 whitespace-pre-wrap break-words">
                {comment.content}
              </p>

              <div className="flex items-center gap-3 mt-2">
                {showReplyButton && (
                  <button
                    onClick={() => onReply(comment.id, comment.user_name, comment.content)}
                    className="text-xs text-muted hover:text-[var(--color-highlight)] font-medium"
                  >
                    Reply
                  </button>
                )}
              </div>

              <div className="mt-2">
                <ReactionButtons commentId={comment.id} size="sm" />
              </div>

              {shouldShowContinueThread && (
                <div className="mt-3 mb-2">
                  <a
                    href={`#comment-${comment.replies![0].id}`}
                    className="text-xs text-[var(--color-highlight)] hover:underline flex items-center gap-1"
                  >
                    → Continue this thread ({comment.replies!.length} more{' '}
                    {comment.replies!.length === 1 ? 'reply' : 'replies'})
                  </a>
                </div>
              )}

              {/* Nested replies */}
              {!shouldShowContinueThread && hasReplies && (
                <div className="mt-3 space-y-3">
                  {comment.replies!.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      depth={depth + 1}
                      maxDepth={maxDepth}
                      showReplyButton={showReplyButton}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default CommentItem;
