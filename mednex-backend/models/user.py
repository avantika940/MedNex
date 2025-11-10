"""
User Models and Authentication Schema
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    """User roles for access control"""
    ADMIN = "admin"
    CUSTOMER = "customer"

class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CUSTOMER

class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    """User update model"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    """User model in database"""
    id: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

class User(UserBase):
    """User model for response"""
    id: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    """JWT Token model"""
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    """Token data for JWT"""
    email: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    """Login request model"""
    email: EmailStr
    password: str

# Disease Models for CRUD
class DiseaseBase(BaseModel):
    """Base disease model"""
    name: str
    description: str
    symptoms: List[str]
    treatment: str
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    category: Optional[str] = None

class DiseaseCreate(DiseaseBase):
    """Disease creation model"""
    pass

class DiseaseUpdate(BaseModel):
    """Disease update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    symptoms: Optional[List[str]] = None
    treatment: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None

class Disease(DiseaseBase):
    """Disease model for response"""
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None

    class Config:
        from_attributes = True

# Symptom Models for CRUD
class SymptomBase(BaseModel):
    """Base symptom model"""
    name: str
    description: str
    category: Optional[str] = None

class SymptomCreate(SymptomBase):
    """Symptom creation model"""
    pass

class SymptomUpdate(BaseModel):
    """Symptom update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class Symptom(SymptomBase):
    """Symptom model for response"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# User History Models
class DiagnosisHistory(BaseModel):
    """User diagnosis history model"""
    id: str
    user_id: str
    symptoms: List[str]
    predicted_diseases: List[dict]
    timestamp: datetime

    class Config:
        from_attributes = True
