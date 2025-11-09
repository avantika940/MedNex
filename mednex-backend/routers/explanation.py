"""
Explanation Router - Provide medical term definitions and explanations
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import logging
try:
    from database.supabase_client import SupabaseClient
except ImportError:
    SupabaseClient = None

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize database client
db_client = SupabaseClient() if SupabaseClient else None

class ExplanationResponse(BaseModel):
    term: str
    definition: str
    source: str
    related_terms: list[str]

@router.get("/explain/{term}", response_model=ExplanationResponse)
async def explain_medical_term(term: str):
    """
    Get explanation and definition for a medical term
    
    Args:
        term: Medical term to explain
        
    Returns:
        ExplanationResponse with definition and related information
    """
    try:
        if not term.strip():
            raise HTTPException(
                status_code=400,
                detail="Term cannot be empty"
            )
        
        # Clean the term
        clean_term = term.strip().lower()
        
        # Get explanation from database
        explanation = await db_client.get_term_explanation(clean_term) if db_client else None
        
        if not explanation:
            # Provide a basic explanation for unknown terms
            explanation = {
                "term": clean_term,
                "definition": f"Medical term: {clean_term}. Please consult healthcare professionals for detailed information.",
                "source": "System",
                "related_terms": []
            }
        
        return ExplanationResponse(
            term=explanation["term"],
            definition=explanation["definition"],
            source=explanation["source"],
            related_terms=explanation["related_terms"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error explaining term '{term}': {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get explanation. Please try again."
        )
