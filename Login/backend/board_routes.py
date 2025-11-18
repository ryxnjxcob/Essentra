from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import uuid

from .models import Notification
from .database import get_database
from .models import Board, User, Collaboration
from .dependencies import get_current_user  # pulls user from JWT token
from .ws_routes import notify_user


router = APIRouter()


# ---------------------------
# Pydantic Schemas
# ---------------------------
class BoardCreate(BaseModel):
    title: str


class BoardOut(BaseModel):
    id: int
    title: str
    collaboration_code: str | None = None  # ✅ add this line

    class Config:
        orm_mode = True


class AccessRequest(BaseModel):
    board_id: int
    requester_id: int  # optional if you want to validate


class CodeRequest(BaseModel):
    code: str


class AccessCode(BaseModel):
    code: str


# ---------------------------
# Routes
# ---------------------------


# Create a new board
@router.post("", response_model=BoardOut, status_code=status.HTTP_201_CREATED)
def create_board(
    board: BoardCreate,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    new_board = Board(
        title=board.title,
        user_id=user.id,
        collaboration_code=str(uuid.uuid4()),  # ✅ generate unique code
    )
    db.add(new_board)
    db.commit()
    db.refresh(new_board)
    return new_board


# Get all boards for the logged-in user
@router.get("", response_model=List[BoardOut])
def list_boards(
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    boards = db.query(Board).filter(Board.user_id == user.id).all()
    return boards


# Get a single board (only if owned by user)
@router.get("/{board_id}", response_model=BoardOut)
def get_board(
    board_id: int,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = (
        db.query(Board).filter(Board.id == board_id, Board.user_id == user.id).first()
    )
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


# Delete a board (only if owned by user)
@router.delete("/{board_id}", response_model=dict)
def delete_board(
    board_id: int,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = (
        db.query(Board).filter(Board.id == board_id, Board.user_id == user.id).first()
    )
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    db.delete(board)
    db.commit()
    return {"message": f"Board {board_id} deleted"}


@router.post("/request-access", response_model=dict)
async def request_access(
    body: AccessCode,
    db: Session = Depends(get_database),
    requester: User = Depends(get_current_user),
):
    code = body.code
    board: Board = db.query(Board).filter(Board.collaboration_code == code).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    existing = (
        db.query(Collaboration)
        .filter(
            Collaboration.board_id == board.id, Collaboration.user_id == requester.id
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already requested or collaborator")

    collaboration = Collaboration(
        board_id=board.id, user_id=requester.id, status="pending"
    )
    db.add(collaboration)
    db.commit()

    # ✅ Create a persistent notification for the board owner
    notification = Notification(
        user_id=board.user_id,
        type="access_request",
        message=f"{requester.first_name} {requester.last_name} requested access to '{board.title}'",
        board_id=board.id,
    )
    db.add(notification)
    db.commit()

    # ✅ Send via WebSocket too
    await notify_user(
        board.user_id,
        {
            "type": "access_request",
            "board_id": board.id,
            "board_title": board.title,
            "requester_name": f"{requester.first_name} {requester.last_name}",
            "request_id": collaboration.id,
        },
    )

    return {"message": "Access request sent"}


@router.post("/collaboration/{collaboration_id}/respond", response_model=dict)
def respond_collaboration(
    collaboration_id: int,
    approve: bool = Body(...),
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    collab = (
        db.query(Collaboration)
        .join(Board)
        .filter(Collaboration.id == collaboration_id, Board.user_id == user.id)
        .first()
    )
    if not collab:
        raise HTTPException(status_code=404, detail="Request not found")

    collab.status = "approved" if approve else "rejected"
    db.commit()
    return {"message": f"Collaboration {'approved' if approve else 'rejected'}"}


@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_database), current_user: User = Depends(get_current_user)
):
    notifs = (
        db.query(Notification)
        .filter_by(user_id=current_user.id, read=False)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return [
        {"id": n.id, "type": n.type, "message": n.message, "board_id": n.board_id}
        for n in notifs
    ]
