"""
Symptoms Router - Extract medical entities from user input using BioBERT NER
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import logging
try:
    from models.biobert_ner import BioBERTExtractor
except ImportError:
    BioBERTExtractor = None

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize BioBERT extractor (will be loaded once on startup)
biobert_extractor = None

class SymptomRequest(BaseModel):
    text: str

class SymptomResponse(BaseModel):
    symptoms: List[str]
    entities: List[Dict[str, Any]]
    confidence_scores: Dict[str, float]

@router.on_event("startup")
async def load_model():
    """Load BioBERT model on startup"""
    global biobert_extractor
    try:
        if BioBERTExtractor:
            biobert_extractor = BioBERTExtractor()
            logger.info("BioBERT model loaded successfully")
        else:
            logger.warning("BioBERTExtractor not available, using fallback")
    except Exception as e:
        logger.error(f"Failed to load BioBERT model: {str(e)}")

@router.post("/extract_symptoms", response_model=SymptomResponse)
async def extract_symptoms(request: SymptomRequest):
    """
    Extract medical symptoms and entities from user text using BioBERT NER
    
    Args:
        request: SymptomRequest containing user's symptom description
        
    Returns:
        SymptomResponse with extracted symptoms, entities, and confidence scores
    """
    try:
        if not biobert_extractor:
            # Use simple rule-based extraction as fallback
            from typing import Dict, List, Any
            import re
            
            def simple_symptom_extraction(text: str) -> Dict[str, Any]:
                symptoms = []
                symptom_patterns = [
                    r'\b(?:pain|ache|fever|cough|headache|nausea|fatigue|dizziness)\b',
                    r'\b(?:swelling|rash|burning|tingling|numbness|weakness)\b',
                    r'\b(?:shortness of breath|difficulty breathing|chest pain)\b'
                ]
                
                for pattern in symptom_patterns:
                    matches = re.findall(pattern, text.lower())
                    symptoms.extend(matches)
                
                return {
                    "symptoms": list(set(symptoms)),
                    "entities": [{"text": s, "label": "SYMPTOM", "confidence": 0.7, "start": 0, "end": 0} for s in symptoms],
                    "confidence_scores": {s: 0.7 for s in symptoms}
                }
            
            result = simple_symptom_extraction(request.text)
            return SymptomResponse(
                symptoms=result["symptoms"],
                entities=result["entities"],
                confidence_scores=result["confidence_scores"]
            )
        
        if not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Text input cannot be empty"
            )
        
        # Extract entities using BioBERT
        result = biobert_extractor.extract_entities(request.text)
        
        return SymptomResponse(
            symptoms=result["symptoms"],
            entities=result["entities"],
            confidence_scores=result["confidence_scores"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting symptoms: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to extract symptoms. Please try again."
        )
