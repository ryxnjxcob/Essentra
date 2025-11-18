from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

import uuid
import random
import string

from .database import Base


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
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String, nullable=False)
    mode = Column(
        String, CheckConstraint("mode IN ('canvas','notepad')"), default="canvas"
    )
    notepad_content = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="boards")
    blocks = relationship("Block", back_populates="board", cascade="all, delete")
    notes = relationship("Note", back_populates="board", cascade="all, delete-orphan")

    collaborators = relationship(
        "Collaboration", back_populates="board", cascade="all, delete-orphan"
    )

    def generate_collab_code():
        return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

    collaboration_code = Column(
        String(10), unique=True, nullable=False, default=generate_collab_code
    )


class Block(Base):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(
        Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False
    )
    content = Column(String)

    board = relationship("Board", back_populates="blocks")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(
        Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False
    )
    text = Column(String, default="")
    x = Column(Integer, default=0)
    y = Column(Integer, default=0)
    width = Column(Integer, default=160)  # ✅ new
    height = Column(Integer, default=100)  # ✅ new

    board = relationship("Board", back_populates="notes")
    # New fields
    note_type = Column(String, default="text")  # text, image, checklist, link
    extra_data = Column(JSON, default={})  # flexible storage


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    token_hash = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_revoked = Column(Boolean, default=False)


class Collaboration(Base):
    __tablename__ = "collaborations"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    board = relationship("Board", back_populates="collaborators")
    user = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type = Column(String, nullable=False)  # e.g., 'access_request', 'access_response'
    message = Column(String, nullable=False)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
