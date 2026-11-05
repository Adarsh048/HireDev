import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Response, Request, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.database import get_db, serialize_doc
from app.security import (
    hash_password,
    verify_password,
    generate_tokens,
    verify_token,
    get_current_user,
)
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refreshToken: Optional[str] = None


def set_auth_cookies(response: Response, tokens: dict):
    # Set accessToken cookie (15 mins or 1 day)
    response.set_cookie(
        key="accessToken",
        value=tokens["accessToken"],
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=15 * 60,
    )
    # Set refreshToken cookie (7 days)
    response.set_cookie(
        key="refreshToken",
        value=tokens["refreshToken"],
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=7 * 24 * 60 * 60,
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, response: Response):
    db = get_db()
    email_clean = req.email.lower().strip()
    
    existing = db["users"].find_one({"email": email_clean})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    pwd_hash = hash_password(req.password)
    user_doc = {
        "email": email_clean,
        "passwordHash": pwd_hash,
        "name": req.name or email_clean.split("@")[0],
        "role": "candidate",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    
    res = db["users"].insert_one(user_doc)
    user_doc["_id"] = res.inserted_id
    
    tokens = generate_tokens(user_doc)
    set_auth_cookies(response, tokens)
    
    user_data = {
        "id": str(res.inserted_id),
        "email": email_clean,
        "name": user_doc["name"],
        "role": user_doc["role"],
    }
    
    return {
        "success": True,
        "message": "User registered successfully",
        "data": {
            "user": user_data,
            "tokens": tokens,
        },
    }


@router.post("/login")
async def login(req: LoginRequest, response: Response):
    db = get_db()
    email_clean = req.email.lower().strip()
    
    user = db["users"].find_one({"email": email_clean})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    stored_hash = user.get("passwordHash", "")
    if not verify_password(stored_hash, req.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    tokens = generate_tokens(user)
    set_auth_cookies(response, tokens)

    user_data = {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name") or user["email"].split("@")[0],
        "role": user.get("role", "candidate"),
    }

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "user": user_data,
            "tokens": tokens,
        },
    }


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("accessToken")
    response.delete_cookie("refreshToken")
    return {
        "success": True,
        "message": "Logged out successfully",
    }


@router.post("/refresh")
async def refresh_token(request: Request, response: Response, body: Optional[RefreshRequest] = None):
    token = request.cookies.get("refreshToken")
    if not token and body and body.refreshToken:
        token = body.refreshToken

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
        )

    payload = verify_token(token, settings.JWT_REFRESH_SECRET)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("userId")
    db = get_db()
    from bson import ObjectId
    user = db["users"].find_one({"_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    tokens = generate_tokens(user)
    set_auth_cookies(response, tokens)

    return {
        "success": True,
        "message": "Token refreshed",
        "data": {
            "tokens": tokens,
            "accessToken": tokens["accessToken"],
        },
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "user": {
                "id": current_user["id"],
                "email": current_user["email"],
                "name": current_user.get("name"),
                "role": current_user.get("role", "candidate"),
            }
        },
    }

