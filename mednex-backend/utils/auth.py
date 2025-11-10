"""
Authentication and Authorization Utilities
"""

from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Data to encode in the token
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT token
    
    Args:
        token: JWT token to decode
        
    Returns:
        Decoded token data
        
    Raises:
        HTTPException: If token is invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Get the current authenticated user from token
    
    Args:
        token: JWT token from request
        
    Returns:
        User data from token
        
    Raises:
        HTTPException: If token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        role: str = payload.get("role")
        
        if email is None:
            raise credentials_exception
            
        return {"email": email, "role": role, "user_id": payload.get("user_id")}
    except JWTError:
        raise credentials_exception

async def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Get current active user
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        Active user data
    """
    return current_user

async def require_admin(current_user: dict = Depends(get_current_active_user)) -> dict:
    """
    Require admin role for access
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Admin user data
        
    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

async def require_customer(current_user: dict = Depends(get_current_active_user)) -> dict:
    """
    Require customer role for access
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Customer user data
        
    Raises:
        HTTPException: If user is not a customer
    """
    if current_user.get("role") != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access required"
        )
    return current_user
