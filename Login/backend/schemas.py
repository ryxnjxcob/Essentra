"""
Pydantic schemas for request/response validation.
Ensures strong input validation and type safety.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Literal, Dict, Any
import re
from datetime import datetime


class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @validator("password")
    def validate_password_strength(cls, v):
        """Validate password complexity."""
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    created_at: datetime
    is_active: bool

    class Config:
        orm_mode = True
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)

    @validator("new_password")
    def validate_password_strength(cls, v):
        """Validate password complexity."""
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


class MessageResponse(BaseModel):
    message: str


class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True


class ErrorResponse(BaseModel):
    detail: str


class BoardBase(BaseModel):
    title: str


class BoardCreate(BoardBase):
    pass


class BoardUpdate(BaseModel):
    title: Optional[str] = None
    mode: Optional[str] = None
    notepad_content: Optional[str] = None


class BoardOut(BoardBase):
    id: int
    user_id: int
    mode: str
    notepad_content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# -----------------------------
# Notes (extended for multimedia)
# -----------------------------

NoteType = Literal["text", "image", "audio", "video", "file"]


class NoteBase(BaseModel):
    text: Optional[str] = ""
    x: Optional[int] = 0
    y: Optional[int] = 0
    width: Optional[int] = 160
    height: Optional[int] = 100
    note_type: Optional[str] = "text"
    extra_data: Optional[Dict[str, Any]] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    text: Optional[str] = None
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    note_type: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None


class NoteResponse(NoteBase):
    id: int
    board_id: int

    class Config:
        orm_mode = True
