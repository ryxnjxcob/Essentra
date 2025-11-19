# board_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import uuid

from .database import get_database
from .models import Board, Note, User, Collaboration, Notification
from .dependencies import get_current_user
from .schemas import NoteCreate, NoteUpdate, NoteResponse
from .ws_routes import notify_user

router = APIRouter(tags=["boards"])


# ------------------------
# Helper: Access Check
# ------------------------
def user_has_access(db: Session, board_id: int, user: User):
    """Returns board if the user owns it or is an approved collaborator."""
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        return None

    # Owner
    if board.user_id == user.id:
        return board

    # Collaborator
    collab = (
        db.query(Collaboration)
        .filter_by(board_id=board_id, user_id=user.id, status="approved")
        .first()
    )

    if collab:
        return board

    return None


# ------------------------
# BOARD CRUD
# ------------------------


class AccessDecision(BaseModel):
    approve: bool


class AccessRequest(BaseModel):
    code: str


class BoardCreate(BaseModel):
    title: str


class BoardOut(BaseModel):
    id: int
    title: str
    collaboration_code: str | None

    class Config:
        orm_mode = True


@router.post("", response_model=BoardOut, status_code=201)
def create_board(
    data: BoardCreate,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = Board(
        title=data.title, user_id=user.id, collaboration_code=str(uuid.uuid4())
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board


@router.get("", response_model=List[BoardOut])
def list_boards(
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    return db.query(Board).filter(Board.user_id == user.id).all()


@router.get("/{board_id}", response_model=BoardOut)
def get_board(
    board_id: int,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = user_has_access(db, board_id, user)
    if not board:
        raise HTTPException(403, "Access denied")
    return board


@router.delete("/{board_id}")
def delete_board(
    board_id: int,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = user_has_access(db, board_id, user)
    if not board or board.user_id != user.id:
        raise HTTPException(403, "Only owner can delete board")

    db.delete(board)
    db.commit()
    return {"message": "Board deleted"}


# ------------------------
# NOTE CRUD (COLLAB-SAFE)
# ------------------------
@router.post("/{board_id}/notes", response_model=NoteResponse)
def create_note(
    board_id: int,
    data: NoteCreate,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = user_has_access(db, board_id, user)
    if not board:
        raise HTTPException(403, "Access denied")

    note = Note(
        board_id=board_id,
        text=data.text,
        x=data.x,
        y=data.y,
        width=data.width,
        height=data.height,
        note_type=data.note_type,
        extra_data=data.extra_data or {},
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return NoteResponse.from_orm(note)


@router.get("/{board_id}/notes", response_model=List[NoteResponse])
def list_notes(
    board_id: int,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = user_has_access(db, board_id, user)
    if not board:
        raise HTTPException(403, "Access denied")

    notes = db.query(Note).filter(Note.board_id == board_id).all()
    return [NoteResponse.from_orm(n) for n in notes]


@router.put("/{board_id}/notes/{note_id}", response_model=NoteResponse)
def update_note(
    board_id: int,
    note_id: int,
    update: NoteUpdate,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = user_has_access(db, board_id, user)
    if not board:
        raise HTTPException(403, "Access denied")

    note = db.query(Note).filter(Note.id == note_id, Note.board_id == board_id).first()

    if not note:
        raise HTTPException(404, "Note not found")

    # Apply updates
    if update.text is not None:
        note.text = update.text
    if update.x is not None:
        note.x = update.x
    if update.y is not None:
        note.y = update.y
    if update.width is not None:
        note.width = update.width
    if update.height is not None:
        note.height = update.height
    if update.note_type is not None:
        note.note_type = update.note_type
    if update.extra_data is not None:
        note.extra_data.update(update.extra_data)

    db.commit()
    db.refresh(note)
    return NoteResponse.from_orm(note)


@router.delete("/{board_id}/notes/{note_id}")
def delete_note(
    board_id: int,
    note_id: int,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = user_has_access(db, board_id, user)
    if not board:
        raise HTTPException(403, "Access denied")

    note = db.query(Note).filter(Note.id == note_id, Note.board_id == board_id).first()

    if not note:
        raise HTTPException(404, "Note not found")

    db.delete(note)
    db.commit()
    return {"message": "Note deleted"}


from fastapi import BackgroundTasks


@router.post("/request-access")
def request_access(
    req: AccessRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    # 1. Find board
    board = db.query(Board).filter(Board.collaboration_code == req.code).first()
    if not board:
        raise HTTPException(404, "Invalid collaboration code")

    if board.user_id == user.id:
        raise HTTPException(400, "You are the owner of this board")

    # 2. Create collaboration request
    collab = Collaboration(board_id=board.id, user_id=user.id, status="pending")
    db.add(collab)
    db.commit()
    db.refresh(collab)

    # 3. Notify board owner (non-blocking)
    message = {
        "type": "access_request",
        "board_title": board.title,
        "requester_name": f"{user.first_name} {user.last_name}",
        "request_id": collab.id,
    }

    # Correct usage:
    background_tasks.add_task(notify_user, board.user_id, message)

    return {"message": "Request sent"}


@router.post("/collaboration/{request_id}/respond")
def respond_access(
    request_id: int,
    decision: AccessDecision,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    # Fetch collab
    collab = db.query(Collaboration).filter(Collaboration.id == request_id).first()
    if not collab:
        raise HTTPException(404, "Request not found")

    board = db.query(Board).filter(Board.id == collab.board_id).first()
    if not board:
        raise HTTPException(404, "Board not found")

    # Only owner can approve
    if board.user_id != user.id:
        raise HTTPException(403, "Only the owner may respond")

    # Approve/reject
    collab.status = "approved" if decision.approve else "rejected"
    db.commit()

    # Notify requester
    message = {
        "type": "access_response",
        "approved": decision.approve,
        "board_title": board.title,
    }

    background_tasks.add_task(notify_user, collab.user_id, message)

    return {"message": "Decision recorded"}
