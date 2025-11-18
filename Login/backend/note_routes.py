import os
from uuid import uuid4
from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
)
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from .database import get_database
from .models import Note, Board, User
from .dependencies import get_current_user
from .schemas import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter()

# ----------------------------
# File upload config
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(BASE_DIR, "..", "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

ALLOWED_PREFIXES = ("image/", "audio/", "video/")


# ----------------------------
# Upload file for multimedia note
# ----------------------------
@router.post("/upload")
async def upload_note_file(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    # basic MIME type guard
    if not file.content_type.startswith(ALLOWED_PREFIXES):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}",
        )

    ext = os.path.splitext(file.filename)[1] or ""
    filename = f"{uuid4().hex}{ext}"
    file_path = os.path.join(MEDIA_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    url = f"/media/{filename}"
    return JSONResponse({"url": url})


# ----------------------------
# Helper: map model -> schema
# ----------------------------
def note_to_response(note: Note) -> NoteResponse:
    return NoteResponse(
        id=note.id,
        board_id=note.board_id,
        text=note.text,
        x=note.x,
        y=note.y,
        width=note.width,
        height=note.height,
        note_type=note.note_type or "text",
        extra_data=note.extra_data or {},
    )


# ----------------------------
# Create a new note on a board
# ----------------------------
@router.post(
    "/boards/{board_id}/notes",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    board_id: int,
    note_data: NoteCreate,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = (
        db.query(Board).filter(Board.id == board_id, Board.user_id == user.id).first()
    )
    if not board:
        raise HTTPException(
            status_code=404, detail="Board not found or not owned by you"
        )

    note = Note(
        board_id=board.id,
        text=note_data.text or "",
        x=note_data.x or 0,
        y=note_data.y or 0,
        width=note_data.width or 160,
        height=note_data.height or 100,
        note_type=note_data.note_type or "text",  # 👈 matches schemas + frontend
        extra_data=note_data.extra_data or {},  # 👈 contains { "url": ... } for media
    )

    db.add(note)
    db.commit()
    db.refresh(note)
    return note_to_response(note)


# ----------------------------
# List notes for a board
# ----------------------------
@router.get("/boards/{board_id}/notes", response_model=List[NoteResponse])
def list_notes(
    board_id: int,
    db: Session = Depends(get_database),
    user: User = Depends(get_current_user),
):
    board = (
        db.query(Board).filter(Board.id == board_id, Board.user_id == user.id).first()
    )
    if not board:
        raise HTTPException(
            status_code=404, detail="Board not found or not owned by you"
        )

    notes = db.query(Note).filter(Note.board_id == board.id).all()
    return [note_to_response(n) for n in notes]


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

    # Existing position/size/text
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

    # Multimedia type
    if note_update.note_type is not None:
        note.note_type = note_update.note_type

    # Extra data
    if note.extra_data is None:
        note.extra_data = {}

    if note_update.extra_data is not None:
        note.extra_data.update(note_update.extra_data)

    db.commit()
    db.refresh(note)
    return note_to_response(note)


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
    board = (
        db.query(Board).filter(Board.id == board_id, Board.user_id == user.id).first()
    )
    if not board:
        raise HTTPException(
            status_code=404, detail="Board not found or not owned by you"
        )

    note = db.query(Note).filter(Note.id == note_id, Note.board_id == board.id).first()
    if not note:
        print(
            f"DEBUG: Delete failed. note_id={note_id}, board_id={board_id}, user_id={user.id}"
        )
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()

    return {"status": "success", "note_id": note_id}
