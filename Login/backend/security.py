"""
Security utilities for authentication, password hashing, and JWT management.
Includes rate limiting and brute force protection.
"""

import bcrypt
import secrets
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from jose import jwt, JWTError, ExpiredSignatureError  # ✅ use python-jose
from .config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory stores (replace with Redis in production)
login_attempts: Dict[str, Dict] = {}
reset_tokens: Dict[str, Dict] = {}


class SecurityManager:
    """Handles all security-related operations."""
    
    def __init__(self):
        self.settings = get_settings()
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt with salt."""
        salt = bcrypt.gensalt(rounds=self.settings.bcrypt_rounds)
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash."""
        try:
            return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    def create_access_token(self, data: dict) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=self.settings.access_token_expire_minutes
        )
        to_encode.update({"exp": expire, "type": "access"})
        
        return jwt.encode(
            to_encode,
            self.settings.jwt_secret_key,
            algorithm=self.settings.jwt_algorithm,
        )
    
    def create_refresh_token(self, data: dict) -> str:
        """Create JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(
            days=self.settings.refresh_token_expire_days
        )
        to_encode.update({"exp": expire, "type": "refresh"})
        
        return jwt.encode(
            to_encode,
            self.settings.jwt_secret_key,
            algorithm=self.settings.jwt_algorithm,
        )
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(
                token,
                self.settings.jwt_secret_key,
                algorithms=[self.settings.jwt_algorithm],
            )
            
            if payload.get("type") != token_type:
                logger.warning(f"Invalid token type: expected {token_type}, got {payload.get('type')}")
                return None
            
            return payload
        except ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except JWTError as e:
            logger.warning(f"JWT validation error: {e}")
            return None
    
    def check_rate_limit(self, identifier: str) -> bool:
        """Check if identifier is rate limited."""
        now = datetime.now(timezone.utc)
        
        if identifier not in login_attempts:
            return True
        
        attempt_data = login_attempts[identifier]
        
        # Clean old attempts
        attempt_data["attempts"] = [
            attempt for attempt in attempt_data["attempts"]
            if now - attempt < timedelta(minutes=self.settings.rate_limit_period_minutes)
        ]
        
        # Check if locked out
        if attempt_data.get("locked_until") and now < attempt_data["locked_until"]:
            return False
        
        return len(attempt_data["attempts"]) < self.settings.rate_limit_requests
    
    def record_login_attempt(self, identifier: str, success: bool, user_id: Optional[int] = None):
        """Record login attempt for rate limiting and logging."""
        now = datetime.now(timezone.utc)
        
        if identifier not in login_attempts:
            login_attempts[identifier] = {"attempts": [], "failed_attempts": 0}
        
        attempt_data = login_attempts[identifier]
        
        if success:
            attempt_data["failed_attempts"] = 0
            attempt_data["locked_until"] = None
            logger.info(f"Successful login for user_id: {user_id}, ip: {identifier}")
        else:
            attempt_data["failed_attempts"] += 1
            attempt_data["attempts"].append(now)
            
            if attempt_data["failed_attempts"] >= self.settings.max_login_attempts:
                attempt_data["locked_until"] = now + timedelta(
                    minutes=self.settings.lockout_duration_minutes
                )
                logger.warning(f"Account locked for IP: {identifier} due to failed attempts")
            
            logger.warning(f"Failed login attempt for IP: {identifier}")
    
    def generate_reset_token(self, user_id: int) -> str:
        """Generate secure password reset token."""
        token = secrets.token_urlsafe(32)
        expire_time = datetime.now(timezone.utc) + timedelta(
            minutes=self.settings.reset_token_expire_minutes
        )
        
        reset_tokens[token] = {
            "user_id": user_id,
            "expires_at": expire_time,
            "used": False,
        }
        
        return token
    
    def verify_reset_token(self, token: str) -> Optional[int]:
        """Verify password reset token and return user_id."""
        if token not in reset_tokens:
            return None
        
        token_data = reset_tokens[token]
        now = datetime.now(timezone.utc)
        
        if token_data["expires_at"] < now or token_data["used"]:
            return None
        
        token_data["used"] = True
        return token_data["user_id"]
    
    def clean_expired_tokens(self):
        """Clean up expired reset tokens (call periodically)."""
        now = datetime.now(timezone.utc)
        expired_tokens = [
            token for token, data in reset_tokens.items()
            if data["expires_at"] < now
        ]
        for token in expired_tokens:
            del reset_tokens[token]


# Global instance
security = SecurityManager()


def get_client_ip(request) -> str:
    """Extract client IP for rate limiting."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    return request.client.host


def verify_rate_limit(request):
    """Middleware-style rate limit verification."""
    client_ip = get_client_ip(request)
    
    if not security.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )
    
    return client_ip
