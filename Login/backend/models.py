from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, CheckConstraint, func
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
from sqlalchemy import JSON


class User(Base):
    __tablename__ = "users"
    __allow_unmapped__ = True  # ✅ ignore attributes not tied to a DB column

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Security tracking (persistent)
    last_login = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)

    # Runtime-only fields (not stored in DB)
    failed_attempts: int = 0
    last_failed_login: datetime | None = None

    # Relationships
    boards = relationship("Board", back_populates="user", cascade="all, delete")


class Board(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    mode = Column(String, CheckConstraint("mode IN ('canvas','notepad')"), default="canvas")
    notepad_content = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="boards")
    blocks = relationship("Block", back_populates="board", cascade="all, delete")
    notes = relationship("Note", back_populates="board", cascade="all, delete-orphan")


class Block(Base):
    __tablename__ = "blocks"
    
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    content = Column(String)

    board = relationship("Board", back_populates="blocks")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    text = Column(String, default="")
    x = Column(Integer, default=0)
    y = Column(Integer, default=0)
    width = Column(Integer, default=160)   # ✅ new
    height = Column(Integer, default=100)  # ✅ new

    board = relationship("Board", back_populates="notes")
    # New fields
    note_type = Column(String, default="text")   # text, image, checklist, link
    extra_data = Column(JSON, default={})        # flexible storage

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    token_hash = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_revoked = Column(Boolean, default=False)
