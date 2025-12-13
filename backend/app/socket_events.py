from flask import request
from flask_login import current_user
from flask_socketio import join_room, leave_room, disconnect


def register_socket_events(socketio):
    @socketio.on("connect")
    def handle_connect():
        if not current_user.is_authenticated:
            disconnect()
            return
        room = f"user_{current_user.id}"
        join_room(room)

    @socketio.on("disconnect")
    def handle_disconnect():
        if current_user.is_authenticated:
            leave_room(f"user_{current_user.id}")

    @socketio.on("ping")
    def handle_ping(data=None):
        socketio.emit("pong", data or {}, room=request.sid)
