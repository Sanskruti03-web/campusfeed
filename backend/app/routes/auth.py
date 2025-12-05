from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from ..extensions import db, login_manager, limiter
from ..models.user import User
from ..config import Config

auth_bp = Blueprint("auth", __name__)
serializer = URLSafeTimedSerializer(secret_key=Config.SECRET_KEY)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@auth_bp.post("/signup")
@limiter.limit("5/hour")
def signup():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password")
    name = data.get("name")
    domain = email.split("@")[-1]
    if domain not in Config.ALLOWED_EMAIL_DOMAINS:
        return jsonify({"error": "Email domain not allowed"}), 400
    if not email or not password or not name:
        return jsonify({"error": "Missing fields"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
    user = User(email=email, name=name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    token = serializer.dumps(email)
    # TODO: send email with verification link containing token
    return jsonify({"message": "Signup successful. Check email for verification.", "token_debug": token}), 201

@auth_bp.get("/verify")
def verify():
    token = request.args.get("token")
    try:
        email = serializer.loads(token, max_age=60*60*24)
    except SignatureExpired:
        return jsonify({"error": "Token expired"}), 400
    except BadSignature:
        return jsonify({"error": "Invalid token"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.verified = True
    db.session.commit()
    return jsonify({"message": "Email verified"})

@auth_bp.post("/login")
@limiter.limit("10/minute")
def login():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
    if not user.verified:
        return jsonify({"error": "Email not verified"}), 403
    login_user(user)
    return jsonify({"message": "Logged in", "user": user.to_dict()})

@auth_bp.post("/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})

@auth_bp.get("/me")
@login_required
def me():
    return jsonify({"user": current_user.to_dict()})
