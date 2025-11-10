"""
MongoDB Atlas Database Client

This module handles all database operations for the MedNex application,
using MongoDB Atlas for persistent cloud storage.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class MongoDBClient:
    """MongoDB Atlas database client for MedNex"""
    
    def __init__(self):
        """Initialize MongoDB client"""
        self.mongodb_uri = os.getenv("MONGODB_URI")
        self.db_name = os.getenv("MONGODB_DB_NAME", "mednex")
        
        if not self.mongodb_uri:
            logger.warning("MongoDB URI not found. Using in-memory storage (data will not persist).")
            self.client = None
            self.db = None
            # In-memory fallback storage
            self._mock_users = {}
            self._mock_diseases = {}
            self._mock_symptoms = {}
            self._mock_diagnoses = {}
        else:
            try:
                self.client = MongoClient(self.mongodb_uri)
                self.db = self.client[self.db_name]
                
                # Test connection
                self.client.admin.command('ping')
                logger.info(f"MongoDB Atlas connected successfully to database: {self.db_name}")
                
                # Create indexes for better performance
                self._create_indexes()
                
            except Exception as e:
                logger.error(f"Failed to connect to MongoDB Atlas: {str(e)}")
                self.client = None
                self.db = None
                # Fallback to in-memory storage
                self._mock_users = {}
                self._mock_diseases = {}
                self._mock_symptoms = {}
                self._mock_diagnoses = {}
    
    def _create_indexes(self):
        """Create database indexes for better performance"""
        try:
            if self.db is not None:
                # Users collection indexes
                self.db.users.create_index("email", unique=True)
                self.db.users.create_index("role")
                
                # Diseases collection indexes
                self.db.diseases.create_index("name")
                
                # Symptoms collection indexes
                self.db.symptoms.create_index("name")
                
                # Diagnosis history indexes
                self.db.diagnosis_history.create_index("user_id")
                self.db.diagnosis_history.create_index("timestamp")
                
                logger.info("MongoDB indexes created successfully")
        except Exception as e:
            logger.warning(f"Error creating indexes: {str(e)}")
    
    # ==================== USER CRUD OPERATIONS ====================
    
    async def create_user(self, email: str, full_name: str, hashed_password: str, role: str = "customer") -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            user_data = {
                "_id": str(uuid.uuid4()),
                "email": email,
                "full_name": full_name,
                "hashed_password": hashed_password,
                "role": role,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            if self.db is not None:
                # Check if user exists
                existing = self.db.users.find_one({"email": email})
                if existing:
                    return None
                
                self.db.users.insert_one(user_data)
                user_data["id"] = user_data["_id"]
                return user_data
            else:
                # In-memory fallback
                if email in self._mock_users:
                    return None
                self._mock_users[email] = user_data
                user_data["id"] = user_data["_id"]
                return user_data
                
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            if self.db is not None:
                user = self.db.users.find_one({"email": email})
                if user:
                    user["id"] = user["_id"]
                    return user
                return None
            else:
                # In-memory fallback
                user = self._mock_users.get(email)
                if user:
                    user["id"] = user["_id"]
                return user
                
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            if self.db is not None:
                user = self.db.users.find_one({"_id": user_id})
                if user:
                    user["id"] = user["_id"]
                    return user
                return None
            else:
                # In-memory fallback
                for user in self._mock_users.values():
                    if user["_id"] == user_id:
                        user["id"] = user["_id"]
                        return user
                return None
                
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None
    
    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all users"""
        try:
            if self.db is not None:
                users = list(self.db.users.find().skip(skip).limit(limit))
                for user in users:
                    user["id"] = user["_id"]
                return users
            else:
                # In-memory fallback
                users = list(self._mock_users.values())[skip:skip+limit]
                for user in users:
                    user["id"] = user["_id"]
                return users
                
        except Exception as e:
            logger.error(f"Error getting all users: {str(e)}")
            return []
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            
            if self.db is not None:
                result = self.db.users.find_one_and_update(
                    {"_id": user_id},
                    {"$set": update_data},
                    return_document=True
                )
                if result:
                    result["id"] = result["_id"]
                    return result
                return None
            else:
                # In-memory fallback
                for user in self._mock_users.values():
                    if user["_id"] == user_id:
                        user.update(update_data)
                        user["id"] = user["_id"]
                        return user
                return None
                
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return None
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        try:
            if self.db is not None:
                result = self.db.users.delete_one({"_id": user_id})
                return result.deleted_count > 0
            else:
                # In-memory fallback
                for email, user in list(self._mock_users.items()):
                    if user["_id"] == user_id:
                        del self._mock_users[email]
                        return True
                return False
                
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return False
    
    # ==================== DISEASE CRUD OPERATIONS ====================
    
    async def create_disease(self, disease_data: Dict[str, Any], created_by: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Create a new disease"""
        try:
            # Add ID and timestamps
            disease_data["_id"] = str(uuid.uuid4())
            disease_data["created_at"] = datetime.utcnow()
            disease_data["updated_at"] = datetime.utcnow()
            if created_by:
                disease_data["created_by"] = created_by
            
            if self.db is not None:
                self.db.diseases.insert_one(disease_data)
                disease_data["id"] = disease_data["_id"]
                return disease_data
            else:
                # In-memory fallback
                self._mock_diseases[disease_data["_id"]] = disease_data
                disease_data["id"] = disease_data["_id"]
                return disease_data
                
        except Exception as e:
            logger.error(f"Error creating disease: {str(e)}")
            return None
    
    async def get_all_diseases(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all diseases"""
        try:
            if self.db is not None:
                diseases = list(self.db.diseases.find().skip(skip).limit(limit))
                for disease in diseases:
                    disease["id"] = disease["_id"]
                return diseases
            else:
                # In-memory fallback
                diseases = list(self._mock_diseases.values())[skip:skip+limit]
                for disease in diseases:
                    disease["id"] = disease["_id"]
                return diseases
                
        except Exception as e:
            logger.error(f"Error getting all diseases: {str(e)}")
            return []
    
    async def get_disease_by_id(self, disease_id: str) -> Optional[Dict[str, Any]]:
        """Get disease by ID"""
        try:
            if self.db is not None:
                disease = self.db.diseases.find_one({"_id": disease_id})
                if disease:
                    disease["id"] = disease["_id"]
                    return disease
                return None
            else:
                # In-memory fallback
                disease = self._mock_diseases.get(disease_id)
                if disease:
                    disease["id"] = disease["_id"]
                return disease
                
        except Exception as e:
            logger.error(f"Error getting disease by ID: {str(e)}")
            return None
    
    async def update_disease(self, disease_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update disease"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            
            if self.db is not None:
                result = self.db.diseases.find_one_and_update(
                    {"_id": disease_id},
                    {"$set": update_data},
                    return_document=True
                )
                if result:
                    result["id"] = result["_id"]
                    return result
                return None
            else:
                # In-memory fallback
                disease = self._mock_diseases.get(disease_id)
                if disease:
                    disease.update(update_data)
                    disease["id"] = disease["_id"]
                    return disease
                return None
                
        except Exception as e:
            logger.error(f"Error updating disease: {str(e)}")
            return None
    
    async def delete_disease(self, disease_id: str) -> bool:
        """Delete disease"""
        try:
            if self.db is not None:
                result = self.db.diseases.delete_one({"_id": disease_id})
                return result.deleted_count > 0
            else:
                # In-memory fallback
                if disease_id in self._mock_diseases:
                    del self._mock_diseases[disease_id]
                    return True
                return False
                
        except Exception as e:
            logger.error(f"Error deleting disease: {str(e)}")
            return False
    
    # ==================== SYMPTOM CRUD OPERATIONS ====================
    
    async def create_symptom(self, name: str, description: str) -> Optional[Dict[str, Any]]:
        """Create a new symptom"""
        try:
            symptom_data = {
                "_id": str(uuid.uuid4()),
                "name": name,
                "description": description,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            if self.db is not None:
                self.db.symptoms.insert_one(symptom_data)
                symptom_data["id"] = symptom_data["_id"]
                return symptom_data
            else:
                # In-memory fallback
                self._mock_symptoms[symptom_data["_id"]] = symptom_data
                symptom_data["id"] = symptom_data["_id"]
                return symptom_data
                
        except Exception as e:
            logger.error(f"Error creating symptom: {str(e)}")
            return None
    
    async def get_all_symptoms(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all symptoms"""
        try:
            if self.db is not None:
                symptoms = list(self.db.symptoms.find().skip(skip).limit(limit))
                for symptom in symptoms:
                    symptom["id"] = symptom["_id"]
                return symptoms
            else:
                # In-memory fallback
                symptoms = list(self._mock_symptoms.values())[skip:skip+limit]
                for symptom in symptoms:
                    symptom["id"] = symptom["_id"]
                return symptoms
                
        except Exception as e:
            logger.error(f"Error getting all symptoms: {str(e)}")
            return []
    
    async def get_symptom_by_id(self, symptom_id: str) -> Optional[Dict[str, Any]]:
        """Get symptom by ID"""
        try:
            if self.db is not None:
                symptom = self.db.symptoms.find_one({"_id": symptom_id})
                if symptom:
                    symptom["id"] = symptom["_id"]
                    return symptom
                return None
            else:
                # In-memory fallback
                symptom = self._mock_symptoms.get(symptom_id)
                if symptom:
                    symptom["id"] = symptom["_id"]
                return symptom
                
        except Exception as e:
            logger.error(f"Error getting symptom by ID: {str(e)}")
            return None
    
    async def update_symptom(self, symptom_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update symptom"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            
            if self.db is not None:
                result = self.db.symptoms.find_one_and_update(
                    {"_id": symptom_id},
                    {"$set": update_data},
                    return_document=True
                )
                if result:
                    result["id"] = result["_id"]
                    return result
                return None
            else:
                # In-memory fallback
                symptom = self._mock_symptoms.get(symptom_id)
                if symptom:
                    symptom.update(update_data)
                    symptom["id"] = symptom["_id"]
                    return symptom
                return None
                
        except Exception as e:
            logger.error(f"Error updating symptom: {str(e)}")
            return None
    
    async def delete_symptom(self, symptom_id: str) -> bool:
        """Delete symptom"""
        try:
            if self.db is not None:
                result = self.db.symptoms.delete_one({"_id": symptom_id})
                return result.deleted_count > 0
            else:
                # In-memory fallback
                if symptom_id in self._mock_symptoms:
                    del self._mock_symptoms[symptom_id]
                    return True
                return False
                
        except Exception as e:
            logger.error(f"Error deleting symptom: {str(e)}")
            return False
    
    # ==================== DIAGNOSIS HISTORY OPERATIONS ====================
    
    async def save_diagnosis_history(self, user_id: str, symptoms: List[str], predicted_diseases: List[dict]) -> Optional[Dict[str, Any]]:
        """Save diagnosis history"""
        try:
            diagnosis_data = {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "symptoms": symptoms,
                "predicted_diseases": predicted_diseases,
                "timestamp": datetime.utcnow()  # Changed from created_at to timestamp
            }
            
            if self.db is not None:
                self.db.diagnosis_history.insert_one(diagnosis_data)
                diagnosis_data["id"] = diagnosis_data["_id"]
                return diagnosis_data
            else:
                # In-memory fallback
                self._mock_diagnoses[diagnosis_data["_id"]] = diagnosis_data
                diagnosis_data["id"] = diagnosis_data["_id"]
                return diagnosis_data
                
        except Exception as e:
            logger.error(f"Error saving diagnosis history: {str(e)}")
            return None
    
    async def get_user_diagnosis_history(self, user_id: str, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user diagnosis history"""
        try:
            if self.db is not None:
                diagnoses = list(
                    self.db.diagnosis_history
                    .find({"user_id": user_id})
                    .sort("timestamp", -1)  # Changed from created_at to timestamp
                    .skip(skip)
                    .limit(limit)
                )
                for diagnosis in diagnoses:
                    diagnosis["id"] = diagnosis["_id"]
                return diagnoses
            else:
                # In-memory fallback
                user_diagnoses = [d for d in self._mock_diagnoses.values() if d["user_id"] == user_id]
                user_diagnoses = sorted(user_diagnoses, key=lambda x: x.get("timestamp", x.get("created_at", datetime.min)), reverse=True)  # Handle both field names
                diagnoses = user_diagnoses[skip:skip+limit]
                for diagnosis in diagnoses:
                    diagnosis["id"] = diagnosis["_id"]
                return diagnoses
                
        except Exception as e:
            logger.error(f"Error getting user diagnosis history: {str(e)}")
            return []
    
    async def get_diagnosis_by_id(self, diagnosis_id: str) -> Optional[Dict[str, Any]]:
        """Get diagnosis by ID"""
        try:
            if self.db is not None:
                diagnosis = self.db.diagnosis_history.find_one({"_id": diagnosis_id})
                if diagnosis:
                    diagnosis["id"] = diagnosis["_id"]
                    return diagnosis
                return None
            else:
                # In-memory fallback
                diagnosis = self._mock_diagnoses.get(diagnosis_id)
                if diagnosis:
                    diagnosis["id"] = diagnosis["_id"]
                return diagnosis
                
        except Exception as e:
            logger.error(f"Error getting diagnosis by ID: {str(e)}")
            return None
    
    async def delete_diagnosis(self, diagnosis_id: str) -> bool:
        """Delete diagnosis"""
        try:
            if self.db is not None:
                result = self.db.diagnosis_history.delete_one({"_id": diagnosis_id})
                return result.deleted_count > 0
            else:
                # In-memory fallback
                if diagnosis_id in self._mock_diagnoses:
                    del self._mock_diagnoses[diagnosis_id]
                    return True
                return False
                
        except Exception as e:
            logger.error(f"Error deleting diagnosis: {str(e)}")
            return False
    
    # ==================== ANALYTICS ====================
    
    async def get_admin_analytics(self) -> Dict[str, Any]:
        """Get admin analytics"""
        try:
            if self.db is not None:
                total_users = self.db.users.count_documents({})
                total_diseases = self.db.diseases.count_documents({})
                total_symptoms = self.db.symptoms.count_documents({})
                total_diagnoses = self.db.diagnosis_history.count_documents({})
                
                return {
                    "total_users": total_users,
                    "total_diseases": total_diseases,
                    "total_symptoms": total_symptoms,
                    "total_diagnoses": total_diagnoses
                }
            else:
                # In-memory fallback
                return {
                    "total_users": len(self._mock_users),
                    "total_diseases": len(self._mock_diseases),
                    "total_symptoms": len(self._mock_symptoms),
                    "total_diagnoses": len(self._mock_diagnoses)
                }
                
        except Exception as e:
            logger.error(f"Error getting admin analytics: {str(e)}")
            return {
                "total_users": 0,
                "total_diseases": 0,
                "total_symptoms": 0,
                "total_diagnoses": 0
            }
    
    async def get_user_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics"""
        try:
            if self.db is not None:
                total_diagnoses = self.db.diagnosis_history.count_documents({"user_id": user_id})
                recent = list(
                    self.db.diagnosis_history
                    .find({"user_id": user_id})
                    .sort("created_at", -1)
                    .limit(5)
                )
                
                for diagnosis in recent:
                    diagnosis["id"] = diagnosis["_id"]
                
                return {
                    "total_diagnoses": total_diagnoses,
                    "recent_diagnoses": recent,
                    "most_common_symptoms": []
                }
            else:
                # In-memory fallback
                user_diagnoses = [d for d in self._mock_diagnoses.values() if d["user_id"] == user_id]
                recent = sorted(user_diagnoses, key=lambda x: x["created_at"], reverse=True)[:5]
                
                for diagnosis in recent:
                    diagnosis["id"] = diagnosis["_id"]
                
                return {
                    "total_diagnoses": len(user_diagnoses),
                    "recent_diagnoses": recent,
                    "most_common_symptoms": []
                }
                
        except Exception as e:
            logger.error(f"Error getting user statistics: {str(e)}")
            return {
                "total_diagnoses": 0,
                "most_common_symptoms": [],
                "recent_diagnoses": []
            }

    async def get_term_explanation(self, term: str) -> Optional[Dict[str, Any]]:
        """
        Get explanation for a medical term
        
        Args:
            term: Medical term to explain
            
        Returns:
            Dictionary with term explanation or None
        """
        try:
            # Basic medical term dictionary (can be expanded)
            medical_terms = {
                "headache": {
                    "term": "headache",
                    "definition": "Pain or discomfort in the head, scalp, or neck. Can range from mild to severe.",
                    "source": "Medical Dictionary",
                    "related_terms": ["migraine", "tension headache", "cluster headache"]
                },
                "fever": {
                    "term": "fever",
                    "definition": "Elevated body temperature above normal (98.6°F/37°C), often indicating infection or illness.",
                    "source": "Medical Dictionary",
                    "related_terms": ["pyrexia", "temperature", "infection"]
                },
                "nausea": {
                    "term": "nausea",
                    "definition": "Feeling of discomfort or unease in the stomach with an urge to vomit.",
                    "source": "Medical Dictionary",
                    "related_terms": ["vomiting", "morning sickness", "motion sickness"]
                },
                "fatigue": {
                    "term": "fatigue",
                    "definition": "Extreme tiredness resulting from mental or physical exertion or illness.",
                    "source": "Medical Dictionary",
                    "related_terms": ["exhaustion", "weakness", "tiredness"]
                },
                "cough": {
                    "term": "cough",
                    "definition": "Sudden expulsion of air from the lungs to clear the airways of irritants or secretions.",
                    "source": "Medical Dictionary",
                    "related_terms": ["persistent cough", "dry cough", "productive cough"]
                },
                "dizziness": {
                    "term": "dizziness",
                    "definition": "Feeling of lightheadedness, unsteadiness, or spinning sensation.",
                    "source": "Medical Dictionary",
                    "related_terms": ["vertigo", "lightheadedness", "imbalance"]
                }
            }
            
            # Return explanation if found
            if term.lower() in medical_terms:
                return medical_terms[term.lower()]
            
            # Otherwise, check database if available
            if self.db is not None:
                explanation = self.db.medical_terms.find_one({"term": term.lower()})
                if explanation:
                    explanation["id"] = explanation["_id"]
                    return explanation
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting term explanation: {str(e)}")
            return None

# Singleton instance
_mongodb_client = None

def get_mongodb_client() -> MongoDBClient:
    """Get MongoDB client singleton"""
    global _mongodb_client
    if _mongodb_client is None:
        _mongodb_client = MongoDBClient()
    return _mongodb_client

