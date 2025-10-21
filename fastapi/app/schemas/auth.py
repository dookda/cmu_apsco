from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    google_id: str
    picture: Optional[str] = None


class UserResponse(UserBase):
    id: int
    google_id: str
    picture: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GoogleAuthRequest(BaseModel):
    token: str  # Google ID token from frontend
