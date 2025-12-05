from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, login_manager, limiter
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlite3 import Connection as SQLite3Connection


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    if isinstance(dbapi_conn, SQLite3Connection):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    limiter.init_app(app)

    # CORS configuration for frontend on localhost:3000
    CORS(
        app,
        resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
        supports_credentials=True,
        expose_headers=["Content-Type"],
    )

    from .routes.auth import auth_bp
    from .routes.posts import posts_bp
    from .routes.comments import comments_bp
    from .routes.reactions import reactions_bp
    from .routes.media import media_bp
    from .routes.users import users_bp
    from .routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(posts_bp, url_prefix="/posts")
    app.register_blueprint(comments_bp, url_prefix="/comments")
    app.register_blueprint(reactions_bp, url_prefix="/reactions")
    app.register_blueprint(media_bp, url_prefix="/media")
    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(notifications_bp, url_prefix="/notifications")

    @app.get("/healthz")
    def healthz():
        return {"status": "ok"}

    # serve uploaded files (dev only)
    from flask import send_from_directory
    import os

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename):
        upload_folder = app.config["UPLOAD_FOLDER"]
        full_path = os.path.join(upload_folder, filename)
        app.logger.info(f"Serving file: {filename}")
        app.logger.info(f"Upload folder: {upload_folder}")
        app.logger.info(f"Full path: {full_path}")
        app.logger.info(f"File exists: {os.path.exists(full_path)}")
        return send_from_directory(upload_folder, filename)

    return app
