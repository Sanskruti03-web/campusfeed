from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import or_, desc
from ..extensions import db, limiter, socketio
from ..models.message import Message
from ..models.user import User
from ..models.notification import Notification

messages_bp = Blueprint("messages", __name__)


def _serialize_message(message: Message):
    return {
        "id": message.id,
        "sender_id": message.sender_id,
        "recipient_id": message.recipient_id,
        "content": message.content,
        "is_read": message.is_read,
        "created_at": message.created_at.isoformat(),
    }


@messages_bp.get("/threads")
@login_required
@limiter.limit("120/minute")
def list_threads():
    """Return recent threads (distinct peers) ordered by last message time."""
    recent_messages = (
        Message.query.filter(or_(Message.sender_id == current_user.id, Message.recipient_id == current_user.id))
        .order_by(desc(Message.created_at))
        .limit(100)
        .all()
    )

    threads = {}
    for m in recent_messages:
        other_id = m.recipient_id if m.sender_id == current_user.id else m.sender_id
        if other_id not in threads:
            other_user = db.session.get(User, other_id)
            threads[other_id] = {
                "user_id": other_id,
                "user_name": other_user.name if other_user else "Unknown",
                "username": other_user.email.split('@')[0] if other_user else "unknown",
                "last_message": _serialize_message(m),
                "unread_count": 0,
            }
        if not m.is_read and m.recipient_id == current_user.id:
            threads[other_id]["unread_count"] += 1

    return jsonify({"threads": list(threads.values())})


@messages_bp.get("/conversation/<int:other_id>")
@login_required
@limiter.limit("180/minute")
def get_conversation(other_id):
    """Return last 50 messages with a specific user."""
    messages = (
        Message.query.filter(
            or_(
                (Message.sender_id == current_user.id) & (Message.recipient_id == other_id),
                (Message.sender_id == other_id) & (Message.recipient_id == current_user.id),
            )
        )
        .order_by(desc(Message.created_at))
        .limit(50)
        .all()
    )

    return jsonify({"messages": list(reversed([_serialize_message(m) for m in messages]))})


@messages_bp.post("")
@login_required
@limiter.limit("60/minute")
def send_message():
    data = request.json or {}
    recipient_id = data.get("recipient_id")
    content = (data.get("content") or "").strip()

    if not recipient_id or not content:
        return jsonify({"error": "recipient_id and content are required"}), 400
    if recipient_id == current_user.id:
        return jsonify({"error": "Cannot message yourself"}), 400

    recipient = db.session.get(User, recipient_id)
    if not recipient:
        return jsonify({"error": "Recipient not found"}), 404

    message = Message(sender_id=current_user.id, recipient_id=recipient_id, content=content)
    db.session.add(message)
    db.session.commit()

    payload = _serialize_message(message)

    # Emit to recipient and sender rooms
    room_recipient = f"user_{recipient_id}"
    room_sender = f"user_{current_user.id}"
    socketio.emit("message:new", payload, room=room_recipient)
    socketio.emit("message:sent", payload, room=room_sender)

    # Optional notification for new direct messages
    notification = Notification(
        user_id=recipient_id,
        type="direct_message",
        content=f"{current_user.name} sent you a message",
        actor_id=current_user.id,
    )
    db.session.add(notification)
    db.session.commit()

    socketio.emit(
        "notification:new",
        {
            "id": notification.id,
            "type": notification.type,
            "content": notification.content,
            "actor_id": notification.actor_id,
            "actor_name": current_user.name,
            "created_at": notification.created_at.isoformat(),
            "is_read": notification.is_read,
        },
        room=room_recipient,
    )

    return jsonify({"message": payload, "notification_id": notification.id}), 201


@messages_bp.post("/<int:message_id>/read")
@login_required
@limiter.limit("120/minute")
def mark_message_read(message_id):
    message = db.session.get(Message, message_id)
    if not message:
        return jsonify({"error": "Message not found"}), 404
    if message.recipient_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    message.is_read = True
    
    # Also find and mark associated notification as read
    # We look for unread 'direct_message' notifications from this sender
    # This is a bit loose but best we can do without a direct link
    Notification.query.filter_by(
        user_id=current_user.id,
        actor_id=message.sender_id,
        type="direct_message",
        is_read=False
    ).update({"is_read": True})
    
    db.session.commit()
    return jsonify({"success": True})


@messages_bp.get("/unread-count")
@login_required
@limiter.limit("300/minute")
def get_unread_count():
    """Get total count of unread messages for current user"""
    count = Message.query.filter_by(
        recipient_id=current_user.id,
        is_read=False
    ).count()
    
    return jsonify({"count": count})
