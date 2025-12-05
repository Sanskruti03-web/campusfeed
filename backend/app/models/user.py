from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from ..extensions import db

class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    branch = db.Column(db.String(120))
    year = db.Column(db.String(20))
    bio = db.Column(db.Text)
    profile_pic = db.Column(db.String(512))
    verified = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(20), default="user")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "branch": self.branch,
            "year": self.year,
            "bio": self.bio,
            "profile_pic": self.profile_pic,
            "verified": self.verified,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
