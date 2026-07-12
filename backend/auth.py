"""
auth.py - Authentication & Authorization utilities for EcoSphere ESG Platform.
Uses bcrypt directly (instead of passlib) for Python 3.14+ compatibility.
"""
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, List

import jwt
import bcrypt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .database import get_db
from . import models

# --------------- Configuration ---------------
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_hex(32))
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))
ALGORITHM = "HS256"

# --------------- Password Hashing (bcrypt directly) ---------------
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

# --------------- JWT Token Utilities ---------------
def create_access_token(user_id: int, role_name: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {"sub": str(user_id), "role": role_name, "exp": expire, "type": "access"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: int) -> tuple:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    token = secrets.token_urlsafe(64)
    return token, expire.isoformat()

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# --------------- FastAPI Security Dependencies ---------------
security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user

def require_role(*allowed_roles: str):
    def dependency(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ) -> models.User:
        user = get_current_user(credentials, db)
        role = db.query(models.Role).filter(models.Role.id == user.role_id).first()
        if not role or role.name not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: insufficient permissions")
        return user
    return dependency

# --------------- Rate Limiter (simple in-memory) ---------------
_login_attempts = {}

def check_rate_limit(ip: str, max_attempts: int = 10, window_seconds: int = 60):
    now = datetime.utcnow()
    key = ip
    if key in _login_attempts:
        attempts = [(t, c) for t, c in _login_attempts[key] if (now - t).total_seconds() < window_seconds]
        _login_attempts[key] = attempts
        if len(attempts) >= max_attempts:
            raise HTTPException(status_code=429, detail="Too many login attempts. Please wait and try again.")
    else:
        _login_attempts[key] = []

def record_attempt(ip: str):
    now = datetime.utcnow()
    if ip not in _login_attempts:
        _login_attempts[ip] = []
    _login_attempts[ip].append((now, 1))
