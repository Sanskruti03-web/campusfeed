from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from sqlalchemy import func
from ..extensions import db, limiter
from ..models.post import Post, Media
from ..models.reaction import Reaction
from ..models.user import User
from bleach import clean

posts_bp = Blueprint("posts", __name__)

@posts_bp.get("")
@limiter.limit("300/minute")
def list_posts():
    category = request.args.get("category")
    search = request.args.get("search", "").strip()
    sort = request.args.get("sort", "newest")  # newest, popular
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit

    q = Post.query.filter_by(is_deleted=False)

    # Filter by category
    if category:
        q = q.filter_by(category=category)

    # Search in title and content
    if search:
        search_pattern = f"%{search}%"
        q = q.filter(
            db.or_(
                Post.title.ilike(search_pattern),
                Post.content_md.ilike(search_pattern)
            )
        )

    # Sort
    if sort == "popular":
        q = q.outerjoin(Reaction, (Reaction.post_id == Post.id) & (Reaction.comment_id == None))
        q = q.group_by(Post.id)
        q = q.order_by(func.count(Reaction.id).desc(), Post.created_at.desc())
    else:
        q = q.order_by(Post.created_at.desc())

    total = q.count()
    q = q.offset(offset).limit(limit)
    
    posts = []
    for p in q.all():
        user = db.session.get(User, p.user_id)
        media = Media.query.filter_by(post_id=p.id, type="image").all()
        preview_url = media[0].url if media else None
        posts.append({
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "user_id": p.user_id,
            "user_name": user.name if user else "Unknown",
            "created_at": p.created_at.isoformat(),
            "edited_at": p.edited_at.isoformat() if p.edited_at else None,
            "cover_url": preview_url,
        })

    return jsonify({"posts": posts, "total": total, "page": page, "limit": limit})

@posts_bp.post("")
@login_required
@limiter.limit("20/minute")
def create_post():
    data = request.json or {}
    title = (data.get("title") or "").strip()
    content_md = data.get("content_md") or ""
    category = data.get("category") or "General"
    if not title:
        return jsonify({"error": "Title required"}), 400
    post = Post(
        user_id=current_user.id,
        title=title,
        content_md=content_md,
        content_html=clean(content_md, strip=True),
        category=category,
    )
    db.session.add(post)
    db.session.commit()
    return jsonify({"id": post.id}), 201

@posts_bp.get("/<int:post_id>")
@limiter.limit("120/hour")
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.is_deleted:
        return jsonify({"error": "Post deleted"}), 404
    media = Media.query.filter_by(post_id=post.id).all()
    return jsonify({
        "id": post.id,
        "title": post.title,
        "content_md": post.content_md,
        "content_html": post.content_html,
        "category": post.category,
        "created_at": post.created_at.isoformat(),
        "edited_at": post.edited_at.isoformat() if post.edited_at else None,
        "media": [{"id": m.id, "url": m.url, "type": m.type} for m in media]
    })

@posts_bp.patch("/<int:post_id>")
@login_required
@limiter.limit("20/minute")
def edit_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        return jsonify({"error": "Not allowed"}), 403
    data = request.json or {}
    title = data.get("title")
    content_md = data.get("content_md")
    category = data.get("category")
    if title is not None:
        post.title = title.strip() or post.title
    if content_md is not None:
        post.content_md = content_md
        post.content_html = clean(content_md, strip=True)
    if category is not None:
        post.category = category
    post.edited_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Post updated"})

@posts_bp.delete("/<int:post_id>")
@login_required
@limiter.limit("10/minute")
def delete_post(post_id):
    from ..models.comment import Comment
    from ..models.reaction import Reaction
    post = Post.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        return jsonify({"error": "Not allowed"}), 403
    
    # Manually delete related records to ensure cleanup
    # Delete reactions on post and all its comments
    Reaction.query.filter_by(post_id=post.id).delete()
    comment_ids = [c.id for c in Comment.query.filter_by(post_id=post.id).all()]
    if comment_ids:
        Reaction.query.filter(Reaction.comment_id.in_(comment_ids)).delete(synchronize_session=False)
    
    # Delete all comments
    Comment.query.filter_by(post_id=post.id).delete()
    
    # Delete all media
    Media.query.filter_by(post_id=post.id).delete()
    
    # Delete the post
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted"})
