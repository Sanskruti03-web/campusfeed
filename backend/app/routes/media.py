import os
from uuid import uuid4
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from ..extensions import db, limiter
from ..models.post import Media, Post

ALLOWED_IMAGE_MIME = {"image/png", "image/jpeg", "image/webp"}
ALLOWED_DOC_MIME = {"application/pdf"}

media_bp = Blueprint("media", __name__)

@media_bp.post("/upload")
@login_required
@limiter.limit("30/minute")
def upload_media():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    post_id = request.form.get("post_id")
    if not post_id:
        return jsonify({"error": "post_id required"}), 400
    post = Post.query.get_or_404(int(post_id))
    if post.user_id != current_user.id:
        return jsonify({"error": "Not allowed"}), 403
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    mime = file.mimetype or "application/octet-stream"
    mtype = "image" if mime in ALLOWED_IMAGE_MIME else ("document" if mime in ALLOWED_DOC_MIME else None)
    if mtype is None:
        return jsonify({"error": "Unsupported file type"}), 400

    # Ensure upload folder exists
    upload_folder = current_app.config.get("UPLOAD_FOLDER")
    os.makedirs(upload_folder, exist_ok=True)

    # Save with unique name
    ext = os.path.splitext(secure_filename(file.filename))[1]
    fname = f"{uuid4().hex}{ext}"
    fpath = os.path.join(upload_folder, fname)
    file.save(fpath)

    size_bytes = os.path.getsize(fpath)
    max_len = current_app.config.get("MAX_CONTENT_LENGTH", 10 * 1024 * 1024)
    if size_bytes > max_len:
        os.remove(fpath)
        return jsonify({"error": "File too large"}), 400

    rel_path = f"/uploads/{fname}"
    media = Media(post_id=post.id, type=mtype, url=rel_path, mime=mime, size_bytes=size_bytes)
    db.session.add(media)
    db.session.commit()

    return jsonify({"id": media.id, "url": rel_path, "type": mtype}), 201
