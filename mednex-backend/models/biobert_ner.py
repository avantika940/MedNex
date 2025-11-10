"""
BioBERT NER Model for Medical Entity Extraction

This module uses BioBERT (dmis-lab/biobert-v1.1) to extract medical entities
from user text input, focusing on symptoms, diseases, and body parts.
"""

import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import logging
import re
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class BioBERTExtractor:
    """BioBERT-based medical entity extractor"""
    
    def __init__(self):
        """Initialize BioBERT model and tokenizer"""
        self.model_name = "dmis-lab/biobert-v1.1"
        self.tokenizer = None
        self.model = None
        self.ner_pipeline = None
        self._load_model()
    
    def _load_model(self):
        """Load BioBERT model and create NER pipeline"""
        try:
            logger.info(f"Loading BioBERT model: {self.model_name}")
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForTokenClassification.from_pretrained(self.model_name)
            
            # Create NER pipeline
            self.ner_pipeline = pipeline(
                "ner",
                model=self.model,
                tokenizer=self.tokenizer,
                aggregation_strategy="simple",
                device=0 if torch.cuda.is_available() else -1
            )
            
            logger.info("BioBERT model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load BioBERT model: {str(e)}")
            # Fallback to a simpler approach if BioBERT fails
            self._load_fallback_model()
    
    def _load_fallback_model(self):
        """Load a fallback NER model if BioBERT fails"""
        try:
            logger.info("Loading fallback NER model")
            self.ner_pipeline = pipeline(
                "ner",
                model="dbmdz/bert-large-cased-finetuned-conll03-english",
                aggregation_strategy="simple"
            )
            logger.info("Fallback model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load fallback model: {str(e)}")
            self.ner_pipeline = None
    
    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract medical entities from text
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary containing symptoms, entities, and confidence scores
        """
        try:
            if not self.ner_pipeline:
                return self._rule_based_extraction(text)
            
            # Process text with NER pipeline
            entities = self.ner_pipeline(text)
            
            # Filter and categorize entities
            symptoms = []
            all_entities = []
            confidence_scores = {}
            
            for entity in entities:
                entity_text = entity['word'].strip()
                confidence = entity['score']
                label = entity['label']
                
                # Skip very short entities or common words
                if len(entity_text) < 3 or entity_text.lower() in ['the', 'and', 'or', 'but']:
                    continue
                
                # Categorize as potential symptom based on context and label
                if self._is_medical_symptom(entity_text, label):
                    symptoms.append(entity_text)
                
                all_entities.append({
                    'text': entity_text,
                    'label': label,
                    'confidence': confidence,
                    'start': entity.get('start', 0),
                    'end': entity.get('end', 0)
                })
                
                confidence_scores[entity_text] = confidence
            
            # Add rule-based symptom extraction as backup
            rule_based_symptoms = self._extract_symptoms_rule_based(text)
            symptoms.extend([s for s in rule_based_symptoms if s not in symptoms])
            
            return {
                'symptoms': list(set(symptoms)),
                'entities': all_entities,
                'confidence_scores': confidence_scores
            }
            
        except Exception as e:
            logger.error(f"Error in entity extraction: {str(e)}")
            return self._rule_based_extraction(text)
    
    def _is_medical_symptom(self, text: str, label: str) -> bool:
        """
        Determine if an entity is likely a medical symptom
        
        Args:
            text: Entity text
            label: NER label
            
        Returns:
            Boolean indicating if it's likely a symptom
        """
        text_lower = text.lower()
        
        # Common symptom keywords
        symptom_indicators = [
            'pain', 'ache', 'fever', 'cough', 'headache', 'nausea',
            'fatigue', 'dizziness', 'swelling', 'rash', 'itch',
            'burning', 'tingling', 'numbness', 'weakness', 'shortness',
            'difficulty', 'trouble', 'discharge', 'bleeding', 'cramps'
        ]
        
        # Check if text contains symptom indicators
        for indicator in symptom_indicators:
            if indicator in text_lower:
                return True
        
        # Check NER labels that might indicate medical terms
        medical_labels = ['MISC', 'B-MISC', 'I-MISC', 'PER', 'B-PER']
        
        return label in medical_labels
    
    def _extract_symptoms_rule_based(self, text: str) -> List[str]:
        """
        Rule-based symptom extraction as fallback
        
        Args:
            text: Input text
            
        Returns:
            List of potential symptoms
        """
        text_lower = text.lower()
        symptoms = []
        
        # Common symptom patterns
        symptom_patterns = [
            r'\b(?:severe|mild|chronic|acute|sharp|dull)?\s*(?:pain|ache|aching)\b',
            r'\b(?:high|low)?\s*fever\b',
            r'\b(?:dry|persistent|chronic)?\s*cough\b',
            r'\bheadache\b',
            r'\bnausea\b',
            r'\bvomiting\b',
            r'\bdiarrhea\b',
            r'\bconstipation\b',
            r'\bfatigue\b',
            r'\btired\b',
            r'\bdizziness\b',
            r'\bswelling\b',
            r'\brash\b',
            r'\bitch(?:ing|y)?\b',
            r'\bburning\b',
            r'\btingling\b',
            r'\bnumbness\b',
            r'\bweakness\b',
            r'\bshortness of breath\b',
            r'\bdifficulty breathing\b',
            r'\bchest pain\b',
            r'\bstomach ache\b',
            r'\bsore throat\b',
            r'\brunny nose\b',
            r'\bstuff(?:y|ed) nose\b'
        ]
        
        for pattern in symptom_patterns:
            matches = re.findall(pattern, text_lower)
            symptoms.extend(matches)
        
        return list(set(symptoms))
    
    def _rule_based_extraction(self, text: str) -> Dict[str, Any]:
        """
        Fallback rule-based extraction when NER models fail
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with extracted information
        """
        symptoms = self._extract_symptoms_rule_based(text)
        
        return {
            'symptoms': symptoms,
            'entities': [
                {
                    'text': symptom,
                    'label': 'SYMPTOM',
                    'confidence': 0.7,
                    'start': 0,
                    'end': 0
                }
                for symptom in symptoms
            ],
            'confidence_scores': {symptom: 0.7 for symptom in symptoms}
        }
