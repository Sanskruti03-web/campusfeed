from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_socketio import SocketIO
import os

db = SQLAlchemy()
login_manager = LoginManager()
limiter = Limiter(key_func=get_remote_address)

# SocketIO CORS - reads from ALLOWED_ORIGINS env var
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if _allowed_origins_env == "*":
    _socketio_origins = "*"
elif _allowed_origins_env:
    _socketio_origins = [origin.strip() for origin in _allowed_origins_env.split(",")]
else:
    _socketio_origins = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

socketio = SocketIO(cors_allowed_origins=_socketio_origins, async_mode="threading", manage_session=False)

