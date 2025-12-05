from datetime import datetime
from ..extensions import db

class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    depth = db.Column(db.Integer, default=0)
    path = db.Column(db.String(1024), index=True)  # materialized path string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)

    # Relationships for nested comments
    replies = db.relationship("Comment", backref=db.backref("parent", remote_side=[id]), cascade="all, delete-orphan", passive_deletes=True)
    reactions = db.relationship("Reaction", backref="comment", cascade="all, delete-orphan", passive_deletes=True)
    user = db.relationship("User", backref="comments")
