"""
Chat Router - Conversational AI using Groq LLaMA for symptom collection
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
try:
    from models.llama_reasoning import LLaMAReasoningService
except ImportError:
    LLaMAReasoningService = None

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize LLaMA service
llama_service = LLaMAReasoningService() if LLaMAReasoningService else None

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    follow_up: bool
    suggested_questions: List[str]
    extracted_symptoms: List[str]
    confidence: float

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Conversational AI endpoint for symptom collection and analysis
    
    Args:
        request: ChatRequest containing user message and conversation history
        
    Returns:
        ChatResponse with AI response, follow-up questions, and extracted symptoms
    """
    try:
        if not request.message.strip():
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )
        
        # Process conversation with LLaMA
        if llama_service:
            result = await llama_service.process_conversation(
                message=request.message,
                history=[
                    {"role": msg.role, "content": msg.content}
                    for msg in request.history
                ]
            )
        else:
            # Simple fallback response
            result = {
                "response": f"Thank you for sharing your symptoms. I understand you mentioned: {request.message}. For proper medical advice, please consult with a healthcare professional. This is an educational tool only.",
                "follow_up": True,
                "suggested_questions": [
                    "When did your symptoms start?",
                    "How severe are your symptoms?",
                    "Have you consulted a doctor?"
                ],
                "extracted_symptoms": [],
                "confidence": 0.5
            }
        
        return ChatResponse(
            response=result["response"],
            follow_up=result["follow_up"],
            suggested_questions=result["suggested_questions"],
            extracted_symptoms=result["extracted_symptoms"],
            confidence=result["confidence"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat processing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat message. Please try again."
        )
