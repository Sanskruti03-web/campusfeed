import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    
    # Robust Database URL handling
    _db_url = os.getenv("DATABASE_URL")
    
    # DEBUG: Print the raw DATABASE_URL to logs (remove after fixing)
    print(f"[CONFIG DEBUG] Raw DATABASE_URL: '{_db_url}'")
    
    # If DATABASE_URL is set but empty, or not set, use sqlite fallback
    if not _db_url or not _db_url.strip():
        SQLALCHEMY_DATABASE_URI = "sqlite:///campusfeed.db"
        print("[CONFIG DEBUG] Using SQLite fallback")
    else:
        # Fix legacy postgres:// usage
        SQLALCHEMY_DATABASE_URI = _db_url.replace("postgres://", "postgresql://")
        print(f"[CONFIG DEBUG] Final SQLALCHEMY_DATABASE_URI: '{SQLALCHEMY_DATABASE_URI[:50]}...'")


    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ALLOWED_EMAIL_DOMAINS = os.getenv("ALLOWED_EMAIL_DOMAINS", "nitrkl.ac.in").split(",")
    
    # Use absolute path relative to the backend directory
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", str(10 * 1024 * 1024)))  # 10MB
