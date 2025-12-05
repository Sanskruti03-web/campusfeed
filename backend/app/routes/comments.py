from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from ..extensions import db, limiter
from ..models.comment import Comment
from ..models.post import Post
from ..models.notification import Notification

comments_bp = Blueprint("comments", __name__)

@comments_bp.get("/post/<int:post_id>")
@limiter.limit("120/hour")
def list_comments(post_id):
    # Fetch all comments for the post
    all_comments = Comment.query.filter_by(
        post_id=post_id, 
        is_deleted=False
    ).order_by(Comment.created_at.asc()).all()
    
    def serialize(c: Comment):
        return {
            "id": c.id,
            "post_id": c.post_id,
            "parent_id": c.parent_id,
            "user_id": c.user_id,
            "user_name": c.user.name if c.user else "Unknown",
            "content": c.content,
            "depth": c.depth,
            "created_at": c.created_at.isoformat(),
        }
    
    # Build tree structure
    comment_map = {c.id: serialize(c) for c in all_comments}
    for c in comment_map.values():
        c['replies'] = []
    
    root_comments = []
    for c in all_comments:
        serialized = comment_map[c.id]
        if c.parent_id is None:
            root_comments.append(serialized)
        elif c.parent_id in comment_map:
            comment_map[c.parent_id]['replies'].append(serialized)
    
    return jsonify({"comments": root_comments})

@comments_bp.post("/post/<int:post_id>")
@login_required
@limiter.limit("30/minute")
def add_comment(post_id):
    data = request.json or {}
    content = (data.get("content") or "").strip()
    parent_id = data.get("parent_id")
    if not content:
        return jsonify({"error": "Content required"}), 400
    path = None
    depth = 0
    if parent_id:
        parent = Comment.query.get_or_404(parent_id)
        if parent.post_id != post_id:
            return jsonify({"error": "Parent mismatch"}), 400
        depth = (parent.depth or 0) + 1
        path = f"{parent.path}/{parent.id}" if parent.path else str(parent.id)
    comment = Comment(
        post_id=post_id,
        parent_id=parent_id,
        user_id=current_user.id,
        content=content,
        depth=depth,
        path=path,
    )
    db.session.add(comment)
    db.session.commit()
    
    # Create notification for post author or parent comment author
    post = db.session.get(Post, post_id)
    if parent_id:
        parent = db.session.get(Comment, parent_id)
        if parent and parent.user_id != current_user.id:
            notification = Notification(
                user_id=parent.user_id,
                type="comment_reply",
                content=f"{current_user.name} replied to your comment",
                post_id=post_id,
                comment_id=comment.id,
                actor_id=current_user.id,
            )
            db.session.add(notification)
    elif post and post.user_id != current_user.id:
        notification = Notification(
            user_id=post.user_id,
            type="comment_reply",
            content=f"{current_user.name} commented on your post",
            post_id=post_id,
            comment_id=comment.id,
            actor_id=current_user.id,
        )
        db.session.add(notification)
    
    db.session.commit()
    return jsonify({"id": comment.id}), 201

@comments_bp.patch("/<int:comment_id>")
@login_required
@limiter.limit("20/minute")
def edit_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != current_user.id:
        return jsonify({"error": "Not allowed"}), 403
    data = request.json or {}
    content = data.get("content")
    if content is not None:
        comment.content = content
    db.session.commit()
    return jsonify({"message": "Comment updated"})

@comments_bp.delete("/<int:comment_id>")
@login_required
@limiter.limit("20/minute")
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != current_user.id:
        return jsonify({"error": "Not allowed"}), 403
    comment.is_deleted = True
    db.session.commit()
    return jsonify({"message": "Comment deleted"})
