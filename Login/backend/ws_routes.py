from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import List, Dict

router = APIRouter()

# -----------------------------
# 1️⃣ NOTIFICATION SOCKET
# -----------------------------
connected_users: Dict[int, List[WebSocket]] = {}


@router.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: int):
    await websocket.accept()
    user_id = int(user_id)

    connected_users.setdefault(user_id, [])
    connected_users[user_id].append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_users[user_id].remove(websocket)


async def notify_user(user_id: int, message: dict):
    print("Trying to notify user:", user_id, "message:", message)
    if user_id in connected_users:
        print("User has sockets:", len(connected_users[user_id]))
        for ws in connected_users[user_id]:
            await ws.send_json(message)
    else:
        print("No connected sockets for user", user_id)


# -----------------------------
# 2️⃣ BOARD COLLABORATION SOCKET
# -----------------------------
active_boards: Dict[int, List[WebSocket]] = {}


@router.websocket("/ws/board/{board_id}")
async def websocket_board(websocket: WebSocket, board_id: int):
    await websocket.accept()

    board_id = int(board_id)
    active_boards.setdefault(board_id, [])
    active_boards[board_id].append(websocket)

    try:
        while True:
            message = await websocket.receive_text()
            # broadcast to everyone else
            for ws in active_boards[board_id]:
                if ws != websocket:
                    await ws.send_text(message)
    except WebSocketDisconnect:
        active_boards[board_id].remove(websocket)
