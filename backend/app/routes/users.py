from flask import Blueprint, jsonify
from sqlalchemy import func
from ..extensions import db, limiter
from ..models.user import User
from ..models.post import Post
from ..models.comment import Comment

users_bp = Blueprint("users", __name__)

@users_bp.get("/<int:user_id>")
@limiter.limit("60/hour")
def get_user_profile(user_id):
    """Get user profile with stats"""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get post count
    post_count = db.session.query(func.count(Post.id)).filter_by(
        user_id=user_id, is_deleted=False
    ).scalar()
    
    # Get comment count
    comment_count = db.session.query(func.count(Comment.id)).filter_by(
        user_id=user_id
    ).scalar()
    
    profile = user.to_dict()
    profile["stats"] = {
        "posts": post_count,
        "comments": comment_count,
    }
    
    return jsonify(profile)

@users_bp.get("/<int:user_id>/posts")
@limiter.limit("60/hour")
def get_user_posts(user_id):
    """Get user's posts"""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    posts = Post.query.filter_by(user_id=user_id, is_deleted=False)\
        .order_by(Post.created_at.desc())\
        .limit(50)\
        .all()
    
    items = [
        {
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "created_at": p.created_at.isoformat(),
            "edited_at": p.edited_at.isoformat() if p.edited_at else None,
        }
        for p in posts
    ]
    
    return jsonify({"posts": items})

@users_bp.get("/<int:user_id>/comments")
@limiter.limit("60/hour")
def get_user_comments(user_id):
    """Get user's comments with post info"""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    comments = db.session.query(Comment, Post)\
        .join(Post, Comment.post_id == Post.id)\
        .filter(Comment.user_id == user_id, Post.is_deleted == False)\
        .order_by(Comment.created_at.desc())\
        .limit(50)\
        .all()
    
    items = [
        {
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at.isoformat(),
            "post_id": p.id,
            "post_title": p.title,
        }
        for c, p in comments
    ]
    
    return jsonify({"comments": items})
