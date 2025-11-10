"""
Authentication Router - User registration, login, and authentication
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
import logging
from datetime import timedelta

from models.user import (
    UserCreate, User, LoginRequest, Token, UserUpdate, UserRole
)
from utils.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_active_user, require_admin, ACCESS_TOKEN_EXPIRE_MINUTES
)
from database.mongodb_client import get_mongodb_client

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize database client
db_client = get_mongodb_client()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user (customer by default)
    
    Args:
        user_data: User registration data
        
    Returns:
        Created user data
    """
    try:
        # Check if user already exists
        existing_user = await db_client.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user in database
        user = await db_client.create_user(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            role=user_data.role
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        logger.info(f"User registered: {user_data.email}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    """
    User login endpoint
    
    Args:
        login_data: Login credentials
        
    Returns:
        JWT access token and user data
    """
    try:
        # Get user from database
        user = await db_client.get_user_by_email(login_data.email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": user["email"],
                "role": user["role"],
                "user_id": user["id"]
            },
            expires_delta=access_token_expires
        )
        
        # Remove sensitive data
        user_response = {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "is_active": user["is_active"],
            "created_at": user["created_at"],
            "updated_at": user["updated_at"]
        }
        
        logger.info(f"User logged in: {login_data.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """
    Get current authenticated user information
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User data
    """
    try:
        user = await db_client.get_user_by_email(current_user["email"])
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )

@router.put("/me", response_model=User)
async def update_current_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Update current user information
    
    Args:
        user_update: User update data
        current_user: Current authenticated user
        
    Returns:
        Updated user data
    """
    try:
        # Hash password if provided
        update_data = user_update.dict(exclude_unset=True)
        
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        # Update user
        updated_user = await db_client.update_user(
            current_user["user_id"],
            update_data
        )
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"User updated: {current_user['email']}")
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(current_user: dict = Depends(get_current_active_user)):
    """
    Delete current user account
    
    Args:
        current_user: Current authenticated user
    """
    try:
        success = await db_client.delete_user(current_user["user_id"])
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"User deleted: {current_user['email']}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
