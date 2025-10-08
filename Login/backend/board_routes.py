from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from .database import get_database
from .models import Board, User
from .dependencies import get_current_user  # pulls user from JWT token

router = APIRouter()

# ---------------------------
# Pydantic Schemas
# ---------------------------
class BoardCreate(BaseModel):
    title: str

class BoardOut(BaseModel):
    id: int
    title: str

    class Config:
        orm_mode = True


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
    new_board = Board(title=board.title, user_id=user.id)
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
    board = db.query(Board).filter(
        Board.id == board_id, Board.user_id == user.id
    ).first()
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
    board = db.query(Board).filter(
        Board.id == board_id, Board.user_id == user.id
    ).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    db.delete(board)
    db.commit()
    return {"message": f"Board {board_id} deleted"}
