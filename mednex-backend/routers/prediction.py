"""
Prediction Router - Predict diseases based on extracted symptoms
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import logging
try:
    from services.disease_matcher import DiseaseMatchingService
except ImportError:
    DiseaseMatchingService = None

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize disease matcher
disease_matcher = DiseaseMatchingService() if DiseaseMatchingService else None

class PredictionRequest(BaseModel):
    symptoms: List[str]

class DiseaseResult(BaseModel):
    name: str
    confidence: float
    description: str
    treatment: str
    severity: str

class PredictionResponse(BaseModel):
    diseases: List[DiseaseResult]
    total_symptoms: int
    processing_time: float

@router.post("/predict", response_model=PredictionResponse)
async def predict_diseases(request: PredictionRequest):
    """
    Predict diseases based on provided symptoms
    
    Args:
        request: PredictionRequest containing list of symptoms
        
    Returns:
        PredictionResponse with top predicted diseases and confidence scores
    """
    try:
        if not request.symptoms:
            raise HTTPException(
                status_code=400,
                detail="At least one symptom is required for prediction"
            )
        
        # Clean and validate symptoms
        symptoms = [s.strip().lower() for s in request.symptoms if s.strip()]
        
        if not symptoms:
            raise HTTPException(
                status_code=400,
                detail="Valid symptoms are required for prediction"
            )
        
        # Get disease predictions
        if disease_matcher:
            results = await disease_matcher.predict_diseases(symptoms)
        else:
            # Simple fallback prediction
            results = {
                "diseases": [
                    {
                        "name": "General Health Consultation Needed",
                        "confidence": 60.0,
                        "description": f"Based on your symptoms ({', '.join(symptoms[:3])}), we recommend consulting a healthcare professional.",
                        "treatment": "Schedule an appointment with your doctor for proper evaluation.",
                        "severity": "Medium"
                    }
                ],
                "processing_time": 0.1
            }
        
        return PredictionResponse(
            diseases=[
                DiseaseResult(
                    name=disease["name"],
                    confidence=disease["confidence"],
                    description=disease["description"],
                    treatment=disease["treatment"],
                    severity=disease["severity"]
                )
                for disease in results["diseases"]
            ],
            total_symptoms=len(symptoms),
            processing_time=results["processing_time"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting diseases: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to predict diseases. Please try again."
        )
