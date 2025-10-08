from fastapi import (
    Body,
    FastAPI,
    Depends,
    HTTPException,
    status,
    Request,
    Response,
    APIRouter,
    Form,
)
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import HTTPBearer
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import hashlib
import logging
import os

# Local imports
from .config import get_settings
from .database import get_database, db_manager
from .security import security, verify_rate_limit, logger
from .schemas import (
    UserRegister,
    UserResponse,
)
from .board_routes import router as board_router
from .note_routes import router as note_router
from .models import User
from .dependencies import get_current_user  # ✅ use the cookie-based version
from . import summarize


# -------------------------------
# App & config
# -------------------------------
logger = logging.getLogger(__name__)
templates = Jinja2Templates(directory="templates")

app = FastAPI(
    title="Essentra API",
    description="Production-ready authentication and boards system",
    version="1.0.0",
)

settings = get_settings()
bearer_scheme = HTTPBearer()


# -------------------------------
# Startup
# -------------------------------
@app.on_event("startup")
def startup():
    db_manager.create_tables()
    logger.info("Authentication API started")


# -------------------------------
# Utilities
# -------------------------------
def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# -------------------------------
# Auth router
# -------------------------------
auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserRegister, request: Request, db: Session = Depends(get_database)
):
    client_ip = verify_rate_limit(request)
    email = user_data.email.strip().lower()

    if db_manager.get_user_by_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    if hasattr(security, "validate_password"):
        security.validate_password(user_data.password)

    hashed_password = security.hash_password(user_data.password)
    new_user = db_manager.create_user(
        db,
        email=email,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
    )

    db.commit()
    db.refresh(new_user)

    logger.info(f"New user registered: {new_user.email} from IP {client_ip}")
    return new_user


@auth_router.post("/login")
def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_database),
):
    client_ip = verify_rate_limit(request)
    user = db_manager.get_user_by_email(db, email)

    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
    )

    if not user or not user.is_active:
        security.record_login_attempt(client_ip, False)
        raise auth_error

    if db_manager.is_user_locked(user):
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account temporarily locked due to too many failed attempts",
        )

    if not security.verify_password(password, user.hashed_password):
        db_manager.update_user_login(db, user, False)
        raise auth_error

    # Successful login
    db_manager.update_user_login(db, user, True)

    access_token = security.create_access_token({"sub": str(user.id)})
    refresh_token = security.create_refresh_token({"sub": str(user.id)})

    refresh_token_hash = hash_token(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    db_manager.store_refresh_token(db, user.id, refresh_token_hash, expires_at)

    # ✅ Create redirect response and set cookies on it
    response = RedirectResponse(url="/dashboard.html", status_code=303)
    response.set_cookie(
        "access_token", access_token, httponly=True, samesite="lax", path="/"
    )
    response.set_cookie(
        "refresh_token", refresh_token, httponly=True, samesite="lax", path="/"
    )

    return response


@auth_router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return RedirectResponse(url="/login.html", status_code=303)


# -------------------------------
# Routers
# -------------------------------
app.include_router(auth_router)
app.include_router(board_router, prefix="/boards", tags=["boards"])
app.include_router(note_router, tags=["notes"])
app.include_router(summarize.router)

# -------------------------------
# Middleware
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],  # ✅ frontend now served by FastAPI
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Static frontend
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
