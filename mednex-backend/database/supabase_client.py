"""
Supabase Database Client

This module handles all database operations for the MedNex application,
including connections to Supabase PostgreSQL for storing and retrieving
medical data, symptoms, diseases, and user sessions.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
import asyncio

logger = logging.getLogger(__name__)

class SupabaseClient:
    """Supabase database client for MedNex"""
    
    def __init__(self):
        """Initialize Supabase client"""
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        
        if not self.url or not self.key:
            logger.warning("Supabase credentials not found. Database functionality will be limited.")
            self.client = None
        else:
            try:
                self.client: Client = create_client(self.url, self.key)
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {str(e)}")
                self.client = None
    
    async def get_term_explanation(self, term: str) -> Optional[Dict[str, Any]]:
        """
        Get explanation for a medical term
        
        Args:
            term: Medical term to explain
            
        Returns:
            Dictionary with term explanation or None if not found
        """
        try:
            if not self.client:
                return self._get_fallback_explanation(term)
            
            # Query explanations table
            response = self.client.table('explanations').select('*').eq('term', term).execute()
            
            if response.data:
                explanation = response.data[0]
                return {
                    'term': explanation['term'],
                    'definition': explanation['definition'],
                    'source': explanation['source'],
                    'related_terms': explanation.get('related_terms', [])
                }
            
            return self._get_fallback_explanation(term)
            
        except Exception as e:
            logger.error(f"Error getting term explanation: {str(e)}")
            return self._get_fallback_explanation(term)
    
    async def get_treatments_for_disease(self, disease: str) -> List[str]:
        """
        Get treatments for a specific disease
        
        Args:
            disease: Disease name
            
        Returns:
            List of treatments
        """
        try:
            if not self.client:
                return self._get_fallback_treatments(disease)
            
            # Query diseases table
            response = self.client.table('diseases').select('treatment').eq('name', disease).execute()
            
            if response.data:
                treatment_text = response.data[0]['treatment']
                return [t.strip() for t in treatment_text.split(',') if t.strip()]
            
            return self._get_fallback_treatments(disease)
            
        except Exception as e:
            logger.error(f"Error getting treatments: {str(e)}")
            return self._get_fallback_treatments(disease)
    
    async def save_user_session(self, symptoms: List[str], predictions: List[Dict[str, Any]]) -> Optional[str]:
        """
        Save user session data (optional - for analytics)
        
        Args:
            symptoms: User's symptoms
            predictions: Disease predictions made
            
        Returns:
            Session ID if saved successfully
        """
        try:
            if not self.client:
                return None
            
            session_data = {
                'symptoms_reported': symptoms,
                'predictions': predictions
            }
            
            response = self.client.table('user_sessions').insert(session_data).execute()
            
            if response.data:
                return response.data[0]['id']
            
            return None
            
        except Exception as e:
            logger.error(f"Error saving user session: {str(e)}")
            return None
    
    async def get_symptom_disease_relationships(self, symptoms: List[str]) -> Dict[str, List[str]]:
        """
        Get disease relationships for given symptoms
        
        Args:
            symptoms: List of symptoms
            
        Returns:
            Dictionary mapping symptoms to related diseases
        """
        try:
            if not self.client:
                return self._get_fallback_relationships(symptoms)
            
            relationships = {}
            
            for symptom in symptoms:
                # Query symptom_disease_map table
                response = self.client.table('symptom_disease_map').select(
                    'diseases(name), weight'
                ).eq('symptoms.name', symptom).execute()
                
                if response.data:
                    related_diseases = [
                        item['diseases']['name'] 
                        for item in response.data 
                        if item['weight'] > 0.5
                    ]
                    relationships[symptom] = related_diseases
                else:
                    relationships[symptom] = []
            
            return relationships
            
        except Exception as e:
            logger.error(f"Error getting symptom-disease relationships: {str(e)}")
            return self._get_fallback_relationships(symptoms)
    
    async def initialize_database(self):
        """
        Initialize database tables and load sample data
        This would typically be run once during setup
        """
        try:
            if not self.client:
                logger.warning("Cannot initialize database - client not available")
                return False
            
            # Create tables if they don't exist (would be done via Supabase dashboard)
            # This is just for documentation of the expected schema
            
            logger.info("Database initialization would create the following tables:")
            logger.info("1. symptoms (id, name, description)")
            logger.info("2. diseases (id, name, description, treatment, severity)")
            logger.info("3. symptom_disease_map (id, symptom_id, disease_id, weight)")
            logger.info("4. explanations (id, term, definition, source, related_terms)")
            logger.info("5. user_sessions (id, created_at, symptoms_reported, predictions)")
            
            return True
            
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            return False
    
    def _get_fallback_explanation(self, term: str) -> Dict[str, Any]:
        """Fallback explanations for common medical terms"""
        explanations = {
            'fever': {
                'term': 'fever',
                'definition': 'An elevation in body temperature above the normal range, typically above 100.4°F (38°C). Usually indicates the body is fighting an infection.',
                'source': 'Medical Dictionary',
                'related_terms': ['temperature', 'infection', 'inflammation']
            },
            'headache': {
                'term': 'headache',
                'definition': 'Pain located in the head or upper neck, often caused by tension, dehydration, stress, or underlying medical conditions.',
                'source': 'Medical Dictionary',
                'related_terms': ['migraine', 'tension', 'pain']
            },
            'nausea': {
                'term': 'nausea',
                'definition': 'A feeling of sickness or discomfort in the stomach that may lead to vomiting.',
                'source': 'Medical Dictionary',
                'related_terms': ['vomiting', 'stomach', 'digestive']
            },
            'fatigue': {
                'term': 'fatigue',
                'definition': 'A feeling of tiredness, weakness, or lack of energy that can be physical, mental, or both.',
                'source': 'Medical Dictionary',
                'related_terms': ['tiredness', 'weakness', 'energy']
            }
        }
        
        return explanations.get(term.lower(), {
            'term': term,
            'definition': f'Medical term: {term}. Please consult healthcare professionals for detailed information.',
            'source': 'System',
            'related_terms': []
        })
    
    def _get_fallback_treatments(self, disease: str) -> List[str]:
        """Fallback treatments for common diseases"""
        treatments = {
            'common cold': ['Rest', 'Fluids', 'Over-the-counter pain relievers'],
            'influenza': ['Rest', 'Fluids', 'Antiviral medications'],
            'migraine': ['Pain relievers', 'Rest in dark room', 'Avoid triggers'],
            'food poisoning': ['Hydration', 'Bland diet', 'Medical attention if severe'],
            'allergic reaction': ['Avoid allergens', 'Antihistamines', 'Medical evaluation'],
            'anxiety': ['Relaxation techniques', 'Therapy', 'Medical consultation'],
            'hypertension': ['Lifestyle changes', 'Medication as prescribed', 'Regular monitoring'],
            'diabetes': ['Diet management', 'Regular exercise', 'Medication as prescribed'],
            'asthma': ['Inhalers', 'Avoid triggers', 'Medical management'],
            'gastritis': ['Dietary changes', 'Avoid irritants', 'Medications as needed']
        }
        
        return treatments.get(disease.lower(), ['Consult healthcare professional'])
    
    def _get_fallback_relationships(self, symptoms: List[str]) -> Dict[str, List[str]]:
        """Fallback symptom-disease relationships"""
        relationships = {
            'fever': ['Common Cold', 'Influenza', 'Food Poisoning'],
            'headache': ['Migraine', 'Hypertension', 'Influenza'],
            'nausea': ['Migraine', 'Food Poisoning', 'Gastritis'], 
            'cough': ['Common Cold', 'Influenza', 'Asthma'],
            'fatigue': ['Diabetes', 'Depression', 'Influenza'],
            'shortness of breath': ['Asthma', 'Anxiety'],
            'chest pain': ['Anxiety', 'Hypertension'],
            'stomach pain': ['Gastritis', 'Food Poisoning'],
            'rash': ['Allergic Reaction'],
            'dizziness': ['Hypertension', 'Anxiety']
        }
        
        result = {}
        for symptom in symptoms:
            symptom_key = symptom.lower()
            for key, diseases in relationships.items():
                if key in symptom_key or symptom_key in key:
                    result[symptom] = diseases
                    break
            
            if symptom not in result:
                result[symptom] = ['General Health Consultation']
        
        return result
