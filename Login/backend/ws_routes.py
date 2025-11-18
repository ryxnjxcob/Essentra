from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import List, Dict

# Simple in-memory storage for connected users
connected_users: Dict[int, List[WebSocket]] = {}  # key: user_id

router = APIRouter()


@router.websocket("/ws/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    if user_id not in connected_users:
        connected_users[user_id] = []
    connected_users[user_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            # Optional: handle messages from client if needed
            print(f"Received from {user_id}: {data}")
    except WebSocketDisconnect:
        connected_users[user_id].remove(websocket)
        print(f"User {user_id} disconnected")


async def notify_user(user_id: int, message: dict):
    """Send a message to all connected websockets of a user."""
    if user_id in connected_users:
        for ws in connected_users[user_id]:
            await ws.send_json(message)
