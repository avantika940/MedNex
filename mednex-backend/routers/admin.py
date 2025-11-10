"""
Admin Router - Admin-only operations for managing users, diseases, and symptoms
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
import logging

from models.user import User, UserUpdate, UserRole, Disease, DiseaseCreate, DiseaseUpdate, Symptom, SymptomCreate, SymptomUpdate
from utils.auth import require_admin
from database.mongodb_client import get_mongodb_client

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize database client
db_client = get_mongodb_client()

# ==================== USER MANAGEMENT ====================

@router.get("/users", response_model=List[User])
async def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_admin: dict = Depends(require_admin)
):
    """
    List all users (Admin only)
    
    Args:
        skip: Number of users to skip
        limit: Maximum number of users to return
        current_admin: Current admin user
        
    Returns:
        List of users
    """
    try:
        users = await db_client.get_all_users(skip=skip, limit=limit)
        logger.info(f"Admin {current_admin['email']} listed users")
        return users
        
    except Exception as e:
        logger.error(f"List users error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )

@router.get("/users/{user_id}", response_model=User)
async def get_user_by_id(
    user_id: str,
    current_admin: dict = Depends(require_admin)
):
    """
    Get a specific user by ID (Admin only)
    
    Args:
        user_id: User ID
        current_admin: Current admin user
        
    Returns:
        User data
    """
    try:
        user = await db_client.get_user_by_id(user_id)
        
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
            detail="Failed to get user"
        )

@router.put("/users/{user_id}", response_model=User)
async def update_user_by_admin(
    user_id: str,
    user_update: UserUpdate,
    current_admin: dict = Depends(require_admin)
):
    """
    Update any user (Admin only)
    
    Args:
        user_id: User ID to update
        user_update: User update data
        current_admin: Current admin user
        
    Returns:
        Updated user data
    """
    try:
        update_data = user_update.dict(exclude_unset=True)
        
        updated_user = await db_client.update_user(user_id, update_data)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"Admin {current_admin['email']} updated user {user_id}")
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_by_admin(
    user_id: str,
    current_admin: dict = Depends(require_admin)
):
    """
    Delete any user (Admin only)
    
    Args:
        user_id: User ID to delete
        current_admin: Current admin user
    """
    try:
        success = await db_client.delete_user(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"Admin {current_admin['email']} deleted user {user_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )

# ==================== DISEASE MANAGEMENT ====================

@router.post("/diseases", response_model=Disease, status_code=status.HTTP_201_CREATED)
async def create_disease(
    disease: DiseaseCreate,
    current_admin: dict = Depends(require_admin)
):
    """
    Create a new disease (Admin only)
    
    Args:
        disease: Disease data
        current_admin: Current admin user
        
    Returns:
        Created disease
    """
    try:
        created_disease = await db_client.create_disease(
            disease_data=disease.dict(),
            created_by=current_admin["user_id"]
        )
        
        logger.info(f"Admin {current_admin['email']} created disease {disease.name}")
        return created_disease
        
    except Exception as e:
        logger.error(f"Create disease error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create disease"
        )

@router.get("/diseases", response_model=List[Disease])
async def list_all_diseases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_admin: dict = Depends(require_admin)
):
    """
    List all diseases (Admin only)
    
    Args:
        skip: Number of diseases to skip
        limit: Maximum number of diseases to return
        current_admin: Current admin user
        
    Returns:
        List of diseases
    """
    try:
        diseases = await db_client.get_all_diseases(skip=skip, limit=limit)
        return diseases
        
    except Exception as e:
        logger.error(f"List diseases error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list diseases"
        )

@router.get("/diseases/{disease_id}", response_model=Disease)
async def get_disease_by_id(
    disease_id: str,
    current_admin: dict = Depends(require_admin)
):
    """
    Get a specific disease by ID (Admin only)
    
    Args:
        disease_id: Disease ID
        current_admin: Current admin user
        
    Returns:
        Disease data
    """
    try:
        disease = await db_client.get_disease_by_id(disease_id)
        
        if not disease:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Disease not found"
            )
        
        return disease
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get disease error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get disease"
        )

@router.put("/diseases/{disease_id}", response_model=Disease)
async def update_disease(
    disease_id: str,
    disease_update: DiseaseUpdate,
    current_admin: dict = Depends(require_admin)
):
    """
    Update a disease (Admin only)
    
    Args:
        disease_id: Disease ID to update
        disease_update: Disease update data
        current_admin: Current admin user
        
    Returns:
        Updated disease data
    """
    try:
        update_data = disease_update.dict(exclude_unset=True)
        
        updated_disease = await db_client.update_disease(disease_id, update_data)
        
        if not updated_disease:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Disease not found"
            )
        
        logger.info(f"Admin {current_admin['email']} updated disease {disease_id}")
        return updated_disease
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update disease error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update disease"
        )

@router.delete("/diseases/{disease_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_disease(
    disease_id: str,
    current_admin: dict = Depends(require_admin)
):
    """
    Delete a disease (Admin only)
    
    Args:
        disease_id: Disease ID to delete
        current_admin: Current admin user
    """
    try:
        success = await db_client.delete_disease(disease_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Disease not found"
            )
        
        logger.info(f"Admin {current_admin['email']} deleted disease {disease_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete disease error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete disease"
        )

# ==================== SYMPTOM MANAGEMENT ====================

@router.post("/symptoms", response_model=Symptom, status_code=status.HTTP_201_CREATED)
async def create_symptom(
    symptom: SymptomCreate,
    current_admin: dict = Depends(require_admin)
):
    """
    Create a new symptom (Admin only)
    
    Args:
        symptom: Symptom data
        current_admin: Current admin user
        
    Returns:
        Created symptom
    """
    try:
        created_symptom = await db_client.create_symptom(symptom.dict())
        
        logger.info(f"Admin {current_admin['email']} created symptom {symptom.name}")
        return created_symptom
        
    except Exception as e:
        logger.error(f"Create symptom error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create symptom"
        )

@router.get("/symptoms", response_model=List[Symptom])
async def list_all_symptoms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_admin: dict = Depends(require_admin)
):
    """
    List all symptoms (Admin only)
    
    Args:
        skip: Number of symptoms to skip
        limit: Maximum number of symptoms to return
        current_admin: Current admin user
        
    Returns:
        List of symptoms
    """
    try:
        symptoms = await db_client.get_all_symptoms(skip=skip, limit=limit)
        return symptoms
        
    except Exception as e:
        logger.error(f"List symptoms error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list symptoms"
        )

@router.get("/symptoms/{symptom_id}", response_model=Symptom)
async def get_symptom_by_id(
    symptom_id: str,
    current_admin: dict = Depends(require_admin)
):
    """
    Get a specific symptom by ID (Admin only)
    
    Args:
        symptom_id: Symptom ID
        current_admin: Current admin user
        
    Returns:
        Symptom data
    """
    try:
        symptom = await db_client.get_symptom_by_id(symptom_id)
        
        if not symptom:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Symptom not found"
            )
        
        return symptom
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get symptom error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get symptom"
        )

@router.put("/symptoms/{symptom_id}", response_model=Symptom)
async def update_symptom(
    symptom_id: str,
    symptom_update: SymptomUpdate,
    current_admin: dict = Depends(require_admin)
):
    """
    Update a symptom (Admin only)
    
    Args:
        symptom_id: Symptom ID to update
        symptom_update: Symptom update data
        current_admin: Current admin user
        
    Returns:
        Updated symptom data
    """
    try:
        update_data = symptom_update.dict(exclude_unset=True)
        
        updated_symptom = await db_client.update_symptom(symptom_id, update_data)
        
        if not updated_symptom:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Symptom not found"
            )
        
        logger.info(f"Admin {current_admin['email']} updated symptom {symptom_id}")
        return updated_symptom
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update symptom error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update symptom"
        )

@router.delete("/symptoms/{symptom_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_symptom(
    symptom_id: str,
    current_admin: dict = Depends(require_admin)
):
    """
    Delete a symptom (Admin only)
    
    Args:
        symptom_id: Symptom ID to delete
        current_admin: Current admin user
    """
    try:
        success = await db_client.delete_symptom(symptom_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Symptom not found"
            )
        
        logger.info(f"Admin {current_admin['email']} deleted symptom {symptom_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete symptom error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete symptom"
        )

# ==================== ANALYTICS ====================

@router.get("/analytics")
async def get_admin_analytics(current_admin: dict = Depends(require_admin)):
    """
    Get admin analytics overview
    
    Args:
        current_admin: Current admin user
        
    Returns:
        Analytics data
    """
    try:
        analytics = await db_client.get_admin_analytics()
        return analytics
        
    except Exception as e:
        logger.error(f"Get analytics error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get analytics"
        )

@router.get("/analytics/overview")
async def get_admin_analytics_overview(current_admin: dict = Depends(require_admin)):
    """Alias for analytics endpoint"""
    return await get_admin_analytics(current_admin)
