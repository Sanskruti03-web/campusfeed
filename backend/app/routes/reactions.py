from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import func
from ..extensions import db, limiter
from ..models.reaction import Reaction
from ..models.post import Post
from ..models.comment import Comment
from ..models.notification import Notification

reactions_bp = Blueprint("reactions", __name__)

ALLOWED_REACTION_TYPES = ["like", "helpful", "funny", "insightful", "celebrate"]

@reactions_bp.post("")
@login_required
@limiter.limit("60/hour")
def add_reaction():
    data = request.json or {}
    post_id = data.get("post_id")
    comment_id = data.get("comment_id")
    type_ = data.get("type") or "like"
    
    if type_ not in ALLOWED_REACTION_TYPES:
        return jsonify({"error": f"Invalid reaction type. Allowed: {ALLOWED_REACTION_TYPES}"}), 400
    
    if not post_id and not comment_id:
        return jsonify({"error": "Target required"}), 400
    
    # Check if reaction already exists - if so, just return success
    existing = Reaction.query.filter_by(
        post_id=post_id, 
        comment_id=comment_id, 
        user_id=current_user.id, 
        type=type_
    ).first()
    
    if existing:
        return jsonify({"id": existing.id, "message": "Already reacted"}), 200
    
    reaction = Reaction(post_id=post_id, comment_id=comment_id, user_id=current_user.id, type=type_)
    try:
        db.session.add(reaction)
        db.session.commit()
        
        # Create notification for post/comment author
        if post_id:
            post = db.session.get(Post, post_id)
            if post and post.user_id != current_user.id:
                notification = Notification(
                    user_id=post.user_id,
                    type="post_reaction",
                    content=f"{current_user.name} reacted {type_} to your post",
                    post_id=post_id,
                    actor_id=current_user.id,
                )
                db.session.add(notification)
        elif comment_id:
            comment = db.session.get(Comment, comment_id)
            if comment and comment.user_id != current_user.id:
                notification = Notification(
                    user_id=comment.user_id,
                    type="comment_reaction",
                    content=f"{current_user.name} reacted {type_} to your comment",
                    post_id=comment.post_id,
                    comment_id=comment_id,
                    actor_id=current_user.id,
                )
                db.session.add(notification)
        
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Duplicate reaction or invalid"}), 400
    return jsonify({"id": reaction.id}), 201

@reactions_bp.delete("")
@login_required
@limiter.limit("60/hour")
def remove_reaction():
    data = request.json or {}
    post_id = data.get("post_id")
    comment_id = data.get("comment_id")
    type_ = data.get("type") or "like"
    r = Reaction.query.filter_by(post_id=post_id, comment_id=comment_id, user_id=current_user.id, type=type_).first()
    if not r:
        return jsonify({"error": "Reaction not found"}), 404
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "Reaction removed"})

@reactions_bp.get("/post/<int:post_id>")
@limiter.limit("120/hour")
def get_post_reactions(post_id):
    # Get reaction counts grouped by type
    counts = db.session.query(
        Reaction.type, 
        func.count(Reaction.id).label('count')
    ).filter_by(
        post_id=post_id
    ).group_by(Reaction.type).all()
    
    reaction_counts = {type_: count for type_, count in counts}
    
    # Get current user's reactions if authenticated
    user_reactions = []
    if current_user.is_authenticated:
        user_reactions = [r.type for r in Reaction.query.filter_by(
            post_id=post_id, 
            user_id=current_user.id
        ).all()]
    
    return jsonify({
        "counts": reaction_counts,
        "user_reactions": user_reactions,
        "total": sum(reaction_counts.values())
    })

@reactions_bp.get("/comment/<int:comment_id>")
@limiter.limit("120/hour")
def get_comment_reactions(comment_id):
    # Get reaction counts grouped by type
    counts = db.session.query(
        Reaction.type, 
        func.count(Reaction.id).label('count')
    ).filter_by(
        comment_id=comment_id
    ).group_by(Reaction.type).all()
    
    reaction_counts = {type_: count for type_, count in counts}
    
    # Get current user's reactions if authenticated
    user_reactions = []
    if current_user.is_authenticated:
        user_reactions = [r.type for r in Reaction.query.filter_by(
            comment_id=comment_id, 
            user_id=current_user.id
        ).all()]
    
    return jsonify({
        "counts": reaction_counts,
        "user_reactions": user_reactions,
        "total": sum(reaction_counts.values())
    })
