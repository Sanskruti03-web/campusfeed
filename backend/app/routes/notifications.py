from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from ..extensions import db, limiter
from ..models.notification import Notification
from ..models.user import User

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.get("")
@login_required
@limiter.limit("300/minute")
def list_notifications():
    """Get current user's notifications"""
    notifications = Notification.query.filter_by(user_id=current_user.id)\
        .order_by(Notification.created_at.desc())\
        .limit(50)\
        .all()
    
    items = []
    for n in notifications:
        actor = db.session.get(User, n.actor_id)
        items.append({
            "id": n.id,
            "type": n.type,
            "content": n.content,
            "post_id": n.post_id,
            "comment_id": n.comment_id,
            "actor_name": actor.name if actor else "Unknown",
            "actor_id": n.actor_id,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
        })
    
    return jsonify({"notifications": items})

@notifications_bp.post("/<int:notification_id>/read")
@login_required
@limiter.limit("300/minute")
def mark_as_read(notification_id):
    """Mark notification as read"""
    notification = db.session.get(Notification, notification_id)
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
    
    if notification.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({"success": True})

@notifications_bp.post("/read-all")
@login_required
@limiter.limit("100/minute")
def mark_all_as_read():
    """Mark all notifications as read"""
    Notification.query.filter_by(user_id=current_user.id, is_read=False)\
        .update({"is_read": True})
    db.session.commit()
    
    return jsonify({"success": True})

@notifications_bp.get("/unread-count")
@login_required
@limiter.limit("300/minute")
def get_unread_count():
    """Get count of unread notifications"""
    count = Notification.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).count()
    
    return jsonify({"count": count})
