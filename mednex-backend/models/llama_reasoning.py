"""
Groq LLaMA Integration for Conversational AI

This module integrates with Groq's LLaMA 3.2 model for conversational
symptom collection and medical reasoning.
"""

import os
import json
import logging
from typing import Dict, List, Any
from groq import Groq
import re

logger = logging.getLogger(__name__)

class LLaMAReasoningService:
    """Groq LLaMA-based conversational AI service"""
    
    def __init__(self):
        """Initialize Groq client"""
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            logger.warning("GROQ_API_KEY not found. Chat functionality will be limited.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)
        
        self.model = "llama-3.1-70b-versatile"  # Updated to supported model
        self.system_prompt = """You are a medical symptom analysis assistant. Your role is to:
1. Ask clarifying questions about symptoms in a professional, empathetic manner
2. Extract and understand medical symptoms from user descriptions
3. Provide educational information (never diagnose)
4. Always include disclaimers that this is educational, not diagnostic

Guidelines:
- Be empathetic and professional
- Ask specific follow-up questions about symptoms
- Focus on symptom characteristics: duration, severity, triggers, etc.
- Never provide medical diagnoses
- Always recommend consulting healthcare professionals
- Keep responses concise but informative

Remember: This is an EDUCATIONAL tool, not a medical diagnostic system."""
    
    async def process_conversation(self, message: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Process conversational message with LLaMA
        
        Args:
            message: User's current message
            history: Previous conversation history
            
        Returns:
            Dictionary with response, follow-up questions, and extracted symptoms
        """
        try:
            if not self.client:
                return self._fallback_response(message)
            
            # Build conversation context
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Add conversation history
            for msg in history[-10:]:  # Keep last 10 messages for context
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Get response from Groq
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            
            # Extract symptoms from conversation
            extracted_symptoms = self._extract_symptoms_from_conversation(message, history)
            
            # Determine if follow-up is needed
            follow_up_needed = self._needs_follow_up(ai_response, extracted_symptoms)
            
            # Generate suggested questions
            suggested_questions = self._generate_suggested_questions(extracted_symptoms)
            
            return {
                "response": ai_response,
                "follow_up": follow_up_needed,
                "suggested_questions": suggested_questions,
                "extracted_symptoms": extracted_symptoms,
                "confidence": 0.85
            }
            
        except Exception as e:
            logger.error(f"Error processing conversation: {str(e)}")
            return self._fallback_response(message)
    
    def _extract_symptoms_from_conversation(self, message: str, history: List[Dict[str, str]]) -> List[str]:
        """
        Extract symptoms mentioned in the conversation
        
        Args:
            message: Current message
            history: Conversation history
            
        Returns:
            List of extracted symptoms
        """
        # Combine current message with recent history
        full_text = message
        for msg in history[-5:]:
            if msg["role"] == "user":
                full_text += " " + msg["content"]
        
        symptoms = []
        
        # Common symptom patterns
        symptom_patterns = [
            r'\b(?:i have|experiencing|feeling|suffering from)\s+([^.!?]+)',
            r'\b(pain|ache|fever|cough|headache|nausea|fatigue|dizziness)\b',
            r'\b(swelling|rash|burning|tingling|numbness|weakness)\b',
            r'\b(shortness of breath|difficulty breathing|chest pain)\b',
            r'\b(stomach ache|sore throat|runny nose|stuffy nose)\b'
        ]
        
        text_lower = full_text.lower()
        
        for pattern in symptom_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                if isinstance(match, tuple):
                    symptoms.extend([m.strip() for m in match if m.strip()])
                else:
                    symptoms.append(match.strip())
        
        # Clean and deduplicate
        symptoms = [s for s in set(symptoms) if len(s) > 2 and s not in ['the', 'and', 'or', 'but', 'with']]
        
        return symptoms[:10]  # Limit to 10 symptoms
    
    def _needs_follow_up(self, response: str, symptoms: List[str]) -> bool:
        """
        Determine if follow-up questions are needed
        
        Args:
            response: AI response
            symptoms: Extracted symptoms
            
        Returns:
            Boolean indicating if follow-up is needed
        """
        # Check if response contains questions
        question_indicators = ['?', 'could you', 'can you', 'would you', 'tell me more']
        
        for indicator in question_indicators:
            if indicator in response.lower():
                return True
        
        # Need follow-up if few symptoms identified
        return len(symptoms) < 3
    
    def _generate_suggested_questions(self, symptoms: List[str]) -> List[str]:
        """
        Generate suggested follow-up questions based on symptoms
        
        Args:
            symptoms: List of identified symptoms
            
        Returns:
            List of suggested questions
        """
        questions = []
        
        if 'pain' in ' '.join(symptoms).lower():
            questions.extend([
                "How would you rate the pain on a scale of 1-10?",
                "When did the pain start?",
                "What makes the pain better or worse?"
            ])
        
        if 'fever' in ' '.join(symptoms).lower():
            questions.extend([
                "What is your temperature?",
                "How long have you had the fever?",
                "Do you have chills or sweats?"
            ])
        
        if 'cough' in ' '.join(symptoms).lower():
            questions.extend([
                "Is it a dry cough or do you cough up mucus?",
                "How long have you been coughing?",
                "Is the cough worse at certain times?"
            ])
        
        # Generic questions if no specific symptoms
        if not questions:
            questions = [
                "How long have you been experiencing these symptoms?",
                "Are there any other symptoms you've noticed?",
                "What makes your symptoms better or worse?"
            ]
        
        return questions[:3]  # Return top 3 questions
    
    def _fallback_response(self, message: str) -> Dict[str, Any]:
        """
        Fallback response when Groq API is unavailable
        
        Args:
            message: User message
            
        Returns:
            Fallback response dictionary
        """
        # Simple symptom extraction
        symptoms = self._extract_symptoms_from_conversation(message, [])
        
        if symptoms:
            response = f"I understand you're experiencing {', '.join(symptoms[:3])}. Could you tell me more about when these symptoms started and how severe they are? Please remember this is educational information only - consult a healthcare professional for proper medical advice."
        else:
            response = "Could you describe your symptoms in more detail? For example, when did they start, how severe are they, and what makes them better or worse? Remember, this is educational information only - please consult a healthcare professional for medical advice."
        
        return {
            "response": response,
            "follow_up": True,
            "suggested_questions": [
                "When did your symptoms start?",
                "How severe are your symptoms?",
                "What makes them better or worse?"
            ],
            "extracted_symptoms": symptoms,
            "confidence": 0.6
        }
