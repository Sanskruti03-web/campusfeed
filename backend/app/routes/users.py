from flask import Blueprint, jsonify, request
from sqlalchemy import func
from flask_login import login_required, current_user
from ..extensions import db, limiter
from ..models.user import User
from ..models.post import Post
from ..models.comment import Comment

users_bp = Blueprint("users", __name__)

@users_bp.get("/me")
@login_required
@limiter.limit("60/hour")
def get_my_profile():
    return get_user_profile(current_user.id)

@users_bp.patch("/me")
@login_required
@limiter.limit("10/minute")
def update_profile():
    """Update current user profile"""
    data = request.get_json()
    
    # Allowed fields
    allowed = ["bio", "branch", "year", "profile_pic"]
    
    for key in allowed:
        if key in data:
            setattr(current_user, key, data[key])
            
    try:
        db.session.commit()
        return jsonify(current_user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

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
    
    items = []
    for p in posts:
        # Get first media if exists
        media_list = [{"url": m.url, "type": m.type} for m in p.media]
        
        items.append({
            "id": p.id,
            "title": p.title,
            "content": p.content_md, # Send content for preview
            "category": p.category,
            "created_at": p.created_at.isoformat() + "Z",
            "edited_at": (p.edited_at.isoformat() + "Z") if p.edited_at else None,
            "vote_score": len(p.reactions),
            "media": media_list,
            "user_id": user.id,
            "user_name": user.name
        })
    
    return jsonify({"posts": items})

@users_bp.get("")
@limiter.limit("60/minute")
def search_users():
    """Search users by name or email"""
    query = request.args.get("search", "").strip()
    if not query:
        return jsonify({"users": []})
        
    search_pattern = f"%{query}%"
    users = User.query.filter(
        db.or_(
            User.name.ilike(search_pattern),
            User.email.ilike(search_pattern)
        )
    ).limit(20).all()
    
    return jsonify({"users": [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "profile_pic": u.profile_pic,
            "branch": u.branch,
            "year": u.year
        } for u in users
    ]})

@users_bp.post("/feedback")
@login_required
@limiter.limit("5/minute")
def submit_feedback():
    data = request.get_json()
    content = data.get("content")
    type_ = data.get("type", "feature") # feature, bug, other
    
    if not content:
        return jsonify({"error": "Content required"}), 400
        
    # In a real app, save to DB. For now, log it.
    print(f"FEEDBACK [{type_}] from User {current_user.id}: {content}")
    
    return jsonify({"message": "Feedback received"})

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
            "created_at": c.created_at.isoformat() + "Z",
            "post_id": p.id,
            "post_title": p.title,
        }
        for c, p in comments
    ]
    
    return jsonify({"comments": items})
