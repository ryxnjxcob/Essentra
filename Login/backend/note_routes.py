from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .database import get_database
from .models import Note, Board, User
from .dependencies import get_current_user
from .schemas import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter()

# ----------------------------
# Create a new note on a board
# ----------------------------
@router.post("/boards/{board_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    board_id: int,
    note_data: NoteCreate,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = db.query(Board).filter(Board.id == board_id, Board.user_id == user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found or not owned by you")

    note = Note(
        board_id=board.id,
        text=note_data.text,
        x=note_data.x,
        y=note_data.y,
        width=note_data.width,
        height=note_data.height,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


# ----------------------------
# List notes for a board
# ----------------------------
@router.get("/boards/{board_id}/notes", response_model=List[NoteResponse])
def list_notes(
    board_id: int,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = db.query(Board).filter(Board.id == board_id, Board.user_id == user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found or not owned by you")

    return db.query(Note).filter(Note.board_id == board.id).all()


# ----------------------------
# Update a specific note
# ----------------------------
@router.put("/boards/{board_id}/notes/{note_id}", response_model=NoteResponse)
def update_note(
    board_id: int,
    note_id: int,
    note_update: NoteUpdate,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    note = (
        db.query(Note)
        .join(Board)
        .filter(
            Note.id == note_id,
            Note.board_id == board_id,
            Board.user_id == current_user.id,
        )
        .first()
    )

    if not note:
        print(
            f"DEBUG: Failed update. note_id={note_id}, board_id={board_id}, user_id={current_user.id}"
        )
        raise HTTPException(status_code=404, detail="Note not found")

    # Update only provided fields
    if note_update.text is not None:
        note.text = note_update.text
    if note_update.x is not None:
        note.x = note_update.x
    if note_update.y is not None:
        note.y = note_update.y
    if note_update.width is not None:
        note.width = note_update.width
    if note_update.height is not None:
        note.height = note_update.height

    db.commit()
    #db.refresh(note)  # ✅ ensures we return a fresh copy, not stale
    return note


# ----------------------------
# Delete a specific note
# ----------------------------
@router.delete("/boards/{board_id}/notes/{note_id}", response_model=dict)
def delete_note(
    board_id: int,
    note_id: int,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = db.query(Board).filter(Board.id == board_id, Board.user_id == user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found or not owned by you")

    note = db.query(Note).filter(Note.id == note_id, Note.board_id == board.id).first()
    if not note:
        print(f"DEBUG: Delete failed. note_id={note_id}, board_id={board_id}, user_id={user.id}")
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()

    # ✅ Don't return the deleted object, only metadata
    return {"status": "success", "note_id": note_id}
