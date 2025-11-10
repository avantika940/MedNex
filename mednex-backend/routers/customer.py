"""
Customer Router - Customer-specific operations
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query, Body
from typing import List, Optional
from pydantic import BaseModel
import logging

from models.user import DiagnosisHistory
from utils.auth import require_customer, get_current_active_user
from database.mongodb_client import get_mongodb_client

router = APIRouter()
logger = logging.getLogger(__name__)

# Request models
class SaveDiagnosisRequest(BaseModel):
    """Request model for saving diagnosis"""
    symptoms: List[str]
    predicted_diseases: List[dict]

# Initialize database client
db_client = get_mongodb_client()

@router.get("/diagnosis-history", response_model=List[DiagnosisHistory])
async def get_my_diagnosis_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get current user's diagnosis history
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        
    Returns:
        List of diagnosis history records
    """
    try:
        history = await db_client.get_user_diagnosis_history(
            user_id=current_user["user_id"],
            skip=skip,
            limit=limit
        )
        
        return history
        
    except Exception as e:
        logger.error(f"Get diagnosis history error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get diagnosis history"
        )

@router.post("/save-diagnosis", response_model=DiagnosisHistory)
async def save_diagnosis_result(
    request: SaveDiagnosisRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Save a diagnosis result to user's history
    
    Args:
        request: SaveDiagnosisRequest containing symptoms and predicted diseases
        current_user: Current authenticated user
        
    Returns:
        Saved diagnosis record
    """
    try:
        diagnosis = await db_client.save_diagnosis_history(
            user_id=current_user["user_id"],
            symptoms=request.symptoms,
            predicted_diseases=request.predicted_diseases
        )
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save diagnosis"
            )
        
        logger.info(f"Diagnosis saved for user {current_user['email']}")
        return diagnosis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Save diagnosis error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save diagnosis"
        )

@router.get("/diagnosis-history/{diagnosis_id}", response_model=DiagnosisHistory)
async def get_diagnosis_by_id(
    diagnosis_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get a specific diagnosis record by ID
    
    Args:
        diagnosis_id: Diagnosis record ID
        current_user: Current authenticated user
        
    Returns:
        Diagnosis record
    """
    try:
        diagnosis = await db_client.get_diagnosis_by_id(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis record not found"
            )
        
        # Verify the diagnosis belongs to the current user
        if diagnosis["user_id"] != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return diagnosis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get diagnosis error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get diagnosis"
        )

@router.delete("/diagnosis-history/{diagnosis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagnosis_record(
    diagnosis_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Delete a diagnosis record from history
    
    Args:
        diagnosis_id: Diagnosis record ID to delete
        current_user: Current authenticated user
    """
    try:
        # Get the diagnosis first to verify ownership
        diagnosis = await db_client.get_diagnosis_by_id(diagnosis_id)
        
        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis record not found"
            )
        
        # Verify the diagnosis belongs to the current user
        if diagnosis["user_id"] != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Delete the record
        success = await db_client.delete_diagnosis(diagnosis_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete diagnosis"
            )
        
        logger.info(f"Diagnosis {diagnosis_id} deleted by user {current_user['email']}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete diagnosis error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete diagnosis"
        )

@router.get("/statistics")
async def get_user_statistics(current_user: dict = Depends(get_current_active_user)):
    """
    Get user statistics
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User statistics
    """
    try:
        stats = await db_client.get_user_statistics(current_user["user_id"])
        return stats
        
    except Exception as e:
        logger.error(f"Get user statistics error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user statistics"
        )
