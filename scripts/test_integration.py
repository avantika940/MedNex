#!/usr/bin/env python3
"""
MedNex Full Stack Integration Test

This script tests the complete MedNex application stack:
- Backend API endpoints
- Frontend-Backend integration
- End-to-end symptom checking workflow

Usage:
    python scripts/test_integration.py [--backend-url URL] [--frontend-url URL]

Environment Variables:
    MEDNEX_BACKEND_URL: Backend URL (default: http://localhost:8000)
    MEDNEX_FRONTEND_URL: Frontend URL (default: http://localhost:3000)
"""

import requests
import json
import time
import sys
import os
import argparse
from typing import List, Dict, Any, Tuple

# Configuration with environment variable support
BACKEND_URL = os.getenv("MEDNEX_BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("MEDNEX_FRONTEND_URL", "http://localhost:3000")

def test_backend_health():
    """Test backend health endpoint"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Backend health check passed")
        return True
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return False

def test_symptom_extraction():
    """Test symptom extraction endpoint"""
    print("🔍 Testing symptom extraction...")
    try:
        payload = {"text": "I have a severe headache, high fever, and nausea"}
        response = requests.post(
            f"{BACKEND_URL}/api/extract_symptoms", 
            json=payload, 
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "symptoms" in data
        assert "entities" in data
        assert "confidence_scores" in data
        assert len(data["symptoms"]) > 0
        print(f"✅ Symptom extraction passed - found {len(data['symptoms'])} symptoms")
        return data["symptoms"]
    except Exception as e:
        print(f"❌ Symptom extraction failed: {e}")
        return []

def test_disease_prediction(symptoms):
    """Test disease prediction endpoint"""
    print("🔍 Testing disease prediction...")
    try:
        payload = {"symptoms": symptoms}
        response = requests.post(
            f"{BACKEND_URL}/api/predict", 
            json=payload, 
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "diseases" in data
        assert len(data["diseases"]) > 0
        for disease in data["diseases"]:
            assert "name" in disease
            assert "confidence" in disease
            assert "description" in disease
        print(f"✅ Disease prediction passed - found {len(data['diseases'])} potential diseases")
        return data["diseases"]
    except Exception as e:
        print(f"❌ Disease prediction failed: {e}")
        return []

def test_knowledge_graph(symptoms, diseases):
    """Test knowledge graph generation"""
    print("🔍 Testing knowledge graph generation...")
    try:
        payload = {
            "symptoms": symptoms,
            "diseases": [d["name"] for d in diseases[:3]]  # Limit to 3 diseases
        }
        response = requests.post(
            f"{BACKEND_URL}/api/graph", 
            json=payload, 
            timeout=15
        )
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data
        assert len(data["nodes"]) > 0
        print(f"✅ Knowledge graph generation passed - created {len(data['nodes'])} nodes and {len(data['edges'])} edges")
        return True
    except Exception as e:
        print(f"❌ Knowledge graph generation failed: {e}")
        if hasattr(e, 'response'):
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return False

def test_chat_endpoint():
    """Test conversational AI endpoint"""
    print("🔍 Testing chat endpoint...")
    try:
        payload = {
            "message": "I have been feeling tired and have a headache for the past few days",
            "context": []
        }
        response = requests.post(
            f"{BACKEND_URL}/api/chat", 
            json=payload, 
            timeout=20
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "suggested_questions" in data
        assert len(data["response"]) > 0
        print("✅ Chat endpoint passed")
        return True
    except Exception as e:
        print(f"❌ Chat endpoint failed: {e}")
        if hasattr(e, 'response'):
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return False

def test_frontend_accessibility():
    """Test frontend accessibility"""
    print("🔍 Testing frontend accessibility...")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        assert response.status_code == 200
        assert "html" in response.text.lower()
        print("✅ Frontend accessibility passed")
        return True
    except Exception as e:
        print(f"❌ Frontend accessibility failed: {e}")
        return False

def run_integration_tests():
    """Run complete integration test suite"""
    print("🚀 Starting MedNex Full Stack Integration Tests\n")
    
    results = []
    
    # Test backend health
    results.append(("Backend Health", test_backend_health()))
    
    # Test frontend accessibility
    results.append(("Frontend Accessibility", test_frontend_accessibility()))
    
    # Test symptom extraction
    symptoms = test_symptom_extraction()
    results.append(("Symptom Extraction", len(symptoms) > 0))
    
    if symptoms:
        # Test disease prediction
        diseases = test_disease_prediction(symptoms)
        results.append(("Disease Prediction", len(diseases) > 0))
        
        if diseases:
            # Test knowledge graph
            results.append(("Knowledge Graph", test_knowledge_graph(symptoms, diseases)))
    
    # Test chat endpoint
    results.append(("Chat Endpoint", test_chat_endpoint()))
    
    # Print results summary
    print("\n" + "="*50)
    print("📊 INTEGRATION TEST RESULTS")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, passed_status in results:
        status = "✅ PASSED" if passed_status else "❌ FAILED"
        print(f"{test_name}: {status}")
        if passed_status:
            passed += 1
    
    print("="*50)
    print(f"Overall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All integration tests passed! MedNex is fully operational.")
        return True
    else:
        print("⚠️  Some tests failed. Please check the logs above.")
        return False

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="MedNex Full Stack Integration Tests")
    parser.add_argument(
        "--backend-url", 
        default=BACKEND_URL, 
        help=f"Backend URL (default: {BACKEND_URL})"
    )
    parser.add_argument(
        "--frontend-url", 
        default=FRONTEND_URL, 
        help=f"Frontend URL (default: {FRONTEND_URL})"
    )
    parser.add_argument(
        "--verbose", "-v", 
        action="store_true", 
        help="Enable verbose output"
    )
    return parser.parse_args()

def main():
    """Main entry point"""
    args = parse_arguments()
    
    # Update URLs from arguments
    global BACKEND_URL, FRONTEND_URL
    BACKEND_URL = args.backend_url
    FRONTEND_URL = args.frontend_url
    
    if args.verbose:
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Frontend URL: {FRONTEND_URL}")
        print()
    
    success = run_integration_tests()
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
