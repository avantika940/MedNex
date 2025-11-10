"""
Disease Matching Service

This service matches user symptoms to potential diseases using a symptom-disease
dataset and calculates confidence scores based on symptom overlap.
"""

import pandas as pd
import numpy as np
import os
import logging
from typing import List, Dict, Any
import time
from database.mongodb_client import MongoDBClient

logger = logging.getLogger(__name__)

class DiseaseMatchingService:
    """Service for matching symptoms to diseases"""
    
    def __init__(self):
        """Initialize disease matching service"""
        self.dataset_path = os.getenv("DATASET_PATH", "./data/disease_symptom_dataset.csv")
        self.disease_data = None
        self.db_client = MongoDBClient()
        self._load_dataset()
    
    def _load_dataset(self):
        """Load disease-symptom dataset"""
        try:
            if os.path.exists(self.dataset_path):
                logger.info(f"Loading dataset from {self.dataset_path}")
                self.disease_data = pd.read_csv(self.dataset_path)
                logger.info(f"Loaded {len(self.disease_data)} disease records")
            else:
                logger.warning("Dataset file not found. Using fallback data.")
                self._create_fallback_dataset()
        except Exception as e:
            logger.error(f"Error loading dataset: {str(e)}")
            self._create_fallback_dataset()
    
    def _create_fallback_dataset(self):
        """Create a fallback dataset with common diseases and symptoms"""
        fallback_data = {
            'Disease': [
                'Common Cold', 'Influenza', 'Migraine', 'Food Poisoning',
                'Allergic Reaction', 'Anxiety', 'Hypertension', 'Diabetes',
                'Asthma', 'Gastritis', 'Insomnia', 'Depression'
            ],
            'Symptom_1': [
                'runny nose', 'fever', 'headache', 'nausea',
                'rash', 'worry', 'high blood pressure', 'frequent urination',
                'shortness of breath', 'stomach pain', 'difficulty sleeping', 'sadness'
            ],
            'Symptom_2': [
                'cough', 'body aches', 'sensitivity to light', 'vomiting',
                'itching', 'restlessness', 'headache', 'excessive thirst',
                'wheezing', 'bloating', 'fatigue', 'loss of interest'
            ],
            'Symptom_3': [
                'sore throat', 'fatigue', 'nausea', 'diarrhea',
                'swelling', 'rapid heartbeat', 'dizziness', 'blurred vision',
                'cough', 'acid reflux', 'irritability', 'fatigue'
            ],
            'Description': [
                'Viral infection affecting nose and throat',
                'Respiratory illness caused by influenza viruses',
                'Severe headache often with nausea and light sensitivity',
                'Illness caused by consuming contaminated food',
                'Immune system reaction to allergens',
                'Mental health condition characterized by excessive worry',
                'Condition where blood pressure is consistently high',
                'Metabolic disorder affecting blood sugar levels',
                'Respiratory condition causing breathing difficulties',
                'Inflammation of stomach lining',
                'Sleep disorder preventing adequate rest',
                'Mental health condition affecting mood and behavior'
            ],
            'Treatment': [
                'Rest, fluids, over-the-counter medications',
                'Rest, fluids, antiviral medications if prescribed',
                'Pain relievers, rest in dark room, avoid triggers',
                'Hydration, bland diet, medical attention if severe',
                'Avoid allergens, antihistamines, medical evaluation',
                'Therapy, relaxation techniques, medical consultation',
                'Lifestyle changes, medication as prescribed',
                'Diet management, exercise, medication as prescribed',
                'Inhalers, avoid triggers, medical management',
                'Dietary changes, medications, avoid irritants',
                'Sleep hygiene, stress management, medical evaluation',
                'Therapy, lifestyle changes, medical consultation'
            ]
        }
        
        self.disease_data = pd.DataFrame(fallback_data)
        logger.info("Created fallback dataset with basic diseases")
    
    async def predict_diseases(self, symptoms: List[str]) -> Dict[str, Any]:
        """
        Predict diseases based on symptoms
        
        Args:
            symptoms: List of user symptoms
            
        Returns:
            Dictionary with disease predictions and metadata
        """
        start_time = time.time()
        
        try:
            if self.disease_data is None:
                raise Exception("Disease dataset not available")
            
            predictions = []
            
            # Clean symptoms
            clean_symptoms = [s.lower().strip() for s in symptoms]
            
            # Calculate confidence for each disease
            for _, disease_row in self.disease_data.iterrows():
                disease_name = disease_row['Disease']
                
                # Get disease symptoms (from columns Symptom_1, Symptom_2, etc.)
                disease_symptoms = []
                for col in disease_row.index:
                    if col.startswith('Symptom_') and pd.notna(disease_row[col]):
                        disease_symptoms.append(disease_row[col].lower().strip())
                
                # Calculate confidence based on symptom overlap
                confidence = self._calculate_confidence(clean_symptoms, disease_symptoms)
                
                if confidence > 0:  # Only include diseases with some symptom match
                    predictions.append({
                        'name': disease_name,
                        'confidence': confidence,
                        'description': disease_row.get('Description', 'No description available'),
                        'treatment': disease_row.get('Treatment', 'Consult healthcare professional'),
                        'severity': self._assess_severity(confidence),
                        'matching_symptoms': self._get_matching_symptoms(clean_symptoms, disease_symptoms)
                    })
            
            # Sort by confidence and return top 5
            predictions.sort(key=lambda x: x['confidence'], reverse=True)
            top_predictions = predictions[:5]
            
            # If no good matches, provide general advice
            if not top_predictions or top_predictions[0]['confidence'] < 20:
                top_predictions = self._get_general_recommendations(clean_symptoms)
            
            processing_time = time.time() - start_time
            
            return {
                'diseases': top_predictions,
                'processing_time': round(processing_time, 3)
            }
            
        except Exception as e:
            logger.error(f"Error in disease prediction: {str(e)}")
            return {
                'diseases': self._get_general_recommendations(symptoms),
                'processing_time': time.time() - start_time
            }
    
    def _calculate_confidence(self, user_symptoms: List[str], disease_symptoms: List[str]) -> float:
        """
        Calculate confidence score based on symptom overlap
        
        Args:
            user_symptoms: User's symptoms
            disease_symptoms: Disease's known symptoms
            
        Returns:
            Confidence score as percentage
        """
        if not user_symptoms or not disease_symptoms:
            return 0.0
        
        # Count exact matches
        exact_matches = 0
        partial_matches = 0
        
        for user_symptom in user_symptoms:
            for disease_symptom in disease_symptoms:
                # Exact match
                if user_symptom == disease_symptom:
                    exact_matches += 1
                    break
                # Partial match (one contains the other)
                elif user_symptom in disease_symptom or disease_symptom in user_symptom:
                    partial_matches += 1
                    break
        
        # Calculate confidence
        total_matches = exact_matches + (partial_matches * 0.7)
        confidence = (total_matches / len(user_symptoms)) * 100
        
        return round(min(confidence, 100), 2)
    
    def _get_matching_symptoms(self, user_symptoms: List[str], disease_symptoms: List[str]) -> List[str]:
        """Get list of matching symptoms between user and disease"""
        matches = []
        
        for user_symptom in user_symptoms:
            for disease_symptom in disease_symptoms:
                if user_symptom == disease_symptom or user_symptom in disease_symptom or disease_symptom in user_symptom:
                    matches.append(user_symptom)
                    break
        
        return matches
    
    def _assess_severity(self, confidence: float) -> str:
        """Assess severity based on confidence score"""
        if confidence >= 70:
            return "High"
        elif confidence >= 40:
            return "Medium"
        else:
            return "Low"
    
    def _get_general_recommendations(self, symptoms: List[str]) -> List[Dict[str, Any]]:
        """Provide general recommendations when no specific disease matches"""
        return [
            {
                'name': 'General Health Consultation',
                'confidence': 60.0,
                'description': f'Based on your symptoms ({", ".join(symptoms[:3])}), we recommend consulting a healthcare professional for proper evaluation.',
                'treatment': 'Schedule an appointment with your doctor or visit a clinic for professional medical advice.',
                'severity': 'Medium',
                'matching_symptoms': symptoms[:3]
            },
            {
                'name': 'Symptomatic Care',
                'confidence': 40.0,
                'description': 'General symptomatic care may help while you seek professional medical advice.',
                'treatment': 'Rest, stay hydrated, monitor symptoms, and seek medical attention if symptoms worsen.',
                'severity': 'Low',
                'matching_symptoms': symptoms[:2]
            }
        ]
