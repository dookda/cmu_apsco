from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import GoogleAuthRequest, Token, UserResponse
from app.utils.auth import verify_google_token, create_access_token
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/api/auth",
    tags=["authentication"]
)


@router.post("/google", response_model=Token)
async def google_auth(
    auth_request: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with Google OAuth token

    Args:
        auth_request: Request containing Google ID token
        db: Database session

    Returns:
        JWT access token

    Raises:
        HTTPException: If Google token is invalid
    """
    # Verify Google token
    google_user_info = verify_google_token(auth_request.token)

    if google_user_info is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

    # Check if user exists
    user = db.query(User).filter(User.email == google_user_info['email']).first()

    if user is None:
        # Create new user
        user = User(
            email=google_user_info['email'],
            google_id=google_user_info['google_id'],
            name=google_user_info.get('name'),
            picture=google_user_info.get('picture')
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user info
        user.name = google_user_info.get('name')
        user.picture = google_user_info.get('picture')
        user.google_id = google_user_info['google_id']
        db.commit()

    # Create JWT token
    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information

    Args:
        current_user: Current authenticated user from dependency

    Returns:
        User information
    """
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout endpoint (token should be removed on client side)

    Note: Since we're using JWT tokens, actual logout happens on the client side
    by removing the token. This endpoint is here for API consistency.

    Args:
        current_user: Current authenticated user

    Returns:
        Success message
    """
    return {"message": "Successfully logged out"}
