import hashlib
import logging
import os
from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    Body,
    Depends,
    FastAPI,
    Form,
    HTTPException,
    Request,
    Response,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.security import HTTPBearer
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from . import note_routes, summarize, ws_routes
from .board_routes import router as board_router

# Local imports
from .config import get_settings
from .database import db_manager, get_database
from .dependencies import get_current_user  # ✅ use the cookie-based version
from .models import User
from .note_routes import router as note_router
from .schemas import (
    UserRegister,
    UserResponse,
)
from .security import logger, security, verify_rate_limit

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
            status_code=status.HTTP_423_LOCKED, detail="Account temporarily locked"
        )

    if not security.verify_password(password, user.hashed_password):
        db_manager.update_user_login(db, user, False)
        raise auth_error

    # Login success
    db_manager.update_user_login(db, user, True)

    access_token = security.create_access_token({"sub": str(user.id)})
    refresh_token = security.create_refresh_token({"sub": str(user.id)})

    refresh_token_hash = hash_token(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    db_manager.store_refresh_token(db, user.id, refresh_token_hash, expires_at)

    response = JSONResponse(
        content={
            "success": True,
            "redirect": "/app/dashboard",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
        }
    )

    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=False,  # True in production HTTPS
        samesite="lax",
        path="/",
    )

    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=False,  # True in production HTTPS
        samesite="lax",
        path="/",
    )

    return response


@auth_router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return RedirectResponse(url="/login.html", status_code=303)


@auth_router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


# -------------------------------
# Routers
# -------------------------------
app.include_router(auth_router)
app.include_router(board_router, prefix="/boards", tags=["boards"])
app.include_router(note_router)
app.include_router(summarize.router)

# -------------------------------
# Middleware
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],  # ✅ frontend now served by FastAPI
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Media uploads
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(BASE_DIR, "media")
os.makedirs(MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

app.include_router(ws_routes.router, prefix="")

# -------------------------------
# Static frontend (Vite build)
# -------------------------------

FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist")

# Serve actual static assets (CSS, JS, images)
app.mount(
    "/assets",
    StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")),
    name="assets",
)


# Serve index.html for the root route
@app.get("/")
async def serve_root():
    return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))


# Serve index.html for any React Router route under /app/*
@app.get("/app/{path:path}")
async def serve_app_routes(path: str):
    return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
