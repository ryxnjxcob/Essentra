'''# auth_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from .database import get_database
from .models import User
from .security import security, verify_rate_limit, get_client_ip
import logging

router = APIRouter()

@router.post("/login")
async def login(request: Request, username: str, password: str, db: Session = Depends(get_database)):
    # rate limit check
    client_ip = get_client_ip(request)
    verify_rate_limit(request)

    # find user
    user = db.query(User).filter(User.username == username).first()
    if not user or not security.verify_password(password, user.hashed_password):
        security.record_login_attempt(client_ip, False)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # success
    security.record_login_attempt(client_ip, True, user.id)
    token = security.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}'''
