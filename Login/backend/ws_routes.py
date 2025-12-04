# ws_routes.py
from typing import Dict, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# -----------------------------
# 1️⃣ NOTIFICATION SOCKET
# -----------------------------
connected_users: Dict[int, List[WebSocket]] = {}


@router.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: int):
    user_id = int(user_id)
    await websocket.accept()

    # Register user
    if user_id not in connected_users:
        connected_users[user_id] = []
    connected_users[user_id].append(websocket)

    try:
        while True:
            await websocket.receive_text()  # Keep alive
    except WebSocketDisconnect:
        connected_users[user_id].remove(websocket)


async def notify_user(user_id: int, message: dict):
    if user_id not in connected_users:
        return

    for ws in connected_users[user_id]:
        try:
            await ws.send_json(message)
        except:
            pass


# -----------------------------
# 2️⃣ BOARD COLLAB SOCKET
# -----------------------------
active_boards: Dict[int, List[WebSocket]] = {}


@router.websocket("/ws/board/{board_id}")
async def websocket_board(websocket: WebSocket, board_id: int):
    board_id = int(board_id)
    await websocket.accept()

    if board_id not in active_boards:
        active_boards[board_id] = []
    active_boards[board_id].append(websocket)

    try:
        while True:
            message = await websocket.receive_text()
            # broadcast to all other collaborators
            for ws in active_boards[board_id]:
                if ws != websocket:
                    await ws.send_text(message)

    except WebSocketDisconnect:
        active_boards[board_id].remove(websocket)


@router.get("/notifications")
async def list_notifications():
    return []
