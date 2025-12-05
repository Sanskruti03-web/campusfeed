from datetime import datetime
from ..extensions import db

class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    content_md = db.Column(db.Text, nullable=False)
    content_html = db.Column(db.Text)
    category = db.Column(db.String(50), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    edited_at = db.Column(db.DateTime)
    is_deleted = db.Column(db.Boolean, default=False)

    # Relationships with cascade delete
    comments = db.relationship("Comment", backref="post", cascade="all, delete-orphan", passive_deletes=True)
    media = db.relationship("Media", backref="post", cascade="all, delete-orphan", passive_deletes=True)
    reactions = db.relationship("Reaction", backref="post", cascade="all, delete-orphan", passive_deletes=True)

class Media(db.Model):
    __tablename__ = "media"
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    type = db.Column(db.String(20))  # image or document
    url = db.Column(db.String(512))
    mime = db.Column(db.String(120))
    size_bytes = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
