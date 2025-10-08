# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from .config import get_settings

settings = get_settings()

# Database setup
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DatabaseManager:
    def __init__(self):
        self.settings = get_settings()

    def get_db(self) -> Session:
        db = SessionLocal()
        try:
            return db
        finally:
            pass

    def create_tables(self):
        Base.metadata.create_all(bind=engine)

    # Lazy imports so we avoid circular imports
    def get_user_by_email(self, db: Session, email: str):
        from .models import User
        return db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, db: Session, user_id: int):
        from .models import User
        return db.query(User).filter(User.id == user_id).first()

    def create_user(self, db: Session, email: str, hashed_password: str, first_name: str, last_name: str):
        from .models import User
        user = User(
            email=email,
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def is_user_locked(self, user) -> bool:
        """Return True if user is locked due to too many failed login attempts."""
        if not user.failed_attempts or not user.last_failed_login:
            return False

        if user.failed_attempts >= settings.max_login_attempts:
            lockout_expires = user.last_failed_login + timedelta(minutes=settings.lockout_duration_minutes)
            if datetime.utcnow() < lockout_expires:
                return True
        return False

    def update_user_login(self, db, user, success: bool):
        """Update login attempt counters for user."""
        if success:
            user.failed_attempts = 0
            user.last_failed_login = None
        else:
            user.failed_attempts = (user.failed_attempts or 0) + 1
            user.last_failed_login = datetime.utcnow()
        db.add(user)
        db.commit()
        db.refresh(user)

    def store_refresh_token(self, db, user_id: int, token_hash: str, expires_at: datetime):
        from .models import RefreshToken
        refresh_token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(refresh_token)
        db.commit()
        db.refresh(refresh_token)
        return refresh_token

    def get_refresh_token(self, db, token_hash: str):
        from .models import RefreshToken
        return db.query(RefreshToken).filter_by(token_hash=token_hash).first()

    def delete_refresh_token(self, db, token_hash: str):
        from .models import RefreshToken
        token = db.query(RefreshToken).filter_by(token_hash=token_hash).first()
        if token:
            db.delete(token)
            db.commit()
            return True
        return False


db_manager = DatabaseManager()


def get_database():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
