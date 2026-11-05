import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
import jwt
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from app.config import settings
from app.database import get_db, serialize_doc

logger = logging.getLogger(__name__)
ph = PasswordHasher()
security_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash password using Argon2id."""
    return ph.hash(password)


def verify_password(stored_hash: str, plain_password: str) -> bool:
    """Verify password against Argon2id hash (with fallback)."""
    try:
        return ph.verify(stored_hash, plain_password)
    except (VerifyMismatchError, InvalidHashError):
        # Fallback check if it was hashed with bcrypt or plain
        try:
            import bcrypt
            return bcrypt.checkpw(plain_password.encode('utf-8'), stored_hash.encode('utf-8'))
        except Exception:
            return False
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def generate_tokens(user: dict) -> Dict[str, str]:
    """Generate access and refresh tokens for user."""
    user_id = str(user.get("_id") or user.get("id"))
    email = user.get("email")
    role = user.get("role", "candidate")

    access_payload = {
        "userId": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_EXPIRY_MINUTES),
        "iat": datetime.utcnow(),
    }
    access_token = jwt.encode(access_payload, settings.JWT_ACCESS_SECRET, algorithm=settings.JWT_ALGORITHM)

    refresh_payload = {
        "userId": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_EXPIRY_DAYS),
        "iat": datetime.utcnow(),
    }
    refresh_token = jwt.encode(refresh_payload, settings.JWT_REFRESH_SECRET, algorithm=settings.JWT_ALGORITHM)

    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
    }


def verify_token(token: str, secret: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, secret, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
) -> dict:
    """Dependency that extracts and verifies current user from Bearer header or cookie."""
    token = None
    if credentials:
        token = credentials.credentials
    elif "accessToken" in request.cookies:
        token = request.cookies.get("accessToken")
    
    if not token:
        # Check Authorization header directly
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
        )

    payload = verify_token(token, settings.JWT_ACCESS_SECRET)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

    user_id = payload.get("userId")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload",
        )

    db = get_db()
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = db["users"].find_one({"_id": user_id})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    clean_user = serialize_doc(user)
    clean_user.pop("passwordHash", None)
    clean_user["userId"] = clean_user["id"]
    return clean_user
