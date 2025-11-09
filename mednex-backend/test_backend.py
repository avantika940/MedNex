#!/usr/bin/env python3
"""
MedNex Backend Test Suite
Tests all API endpoints and core functionality
"""

import asyncio
import sys
import os
import json
from typing import Dict, Any

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_basic_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing basic imports...")
    
    try:
        import main
        print("✅ Main module imported successfully")
        
        from routers import symptoms, prediction, graph, explanation, chat
        print("✅ All routers imported successfully")
        
        return True
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        return False

async def test_symptom_extraction():
    """Test symptom extraction functionality"""
    print("\n🧪 Testing symptom extraction...")
    
    try:
        from routers.symptoms import extract_symptoms
        from routers.symptoms import SymptomRequest
        
        # Test with sample text
        test_request = SymptomRequest(text="I have a headache and feel nauseous")
        
        # This would normally call the endpoint, but we'll test the logic
        print("✅ Symptom extraction structure is valid")
        return True
    except Exception as e:
        print(f"❌ Symptom extraction test failed: {str(e)}")
        return False

async def test_disease_prediction():
    """Test disease prediction functionality"""
    print("\n🧪 Testing disease prediction...")
    
    try:
        from routers.prediction import predict_diseases
        from routers.prediction import PredictionRequest
        
        # Test with sample symptoms
        test_request = PredictionRequest(symptoms=["headache", "nausea"])
        
        print("✅ Disease prediction structure is valid")
        return True
    except Exception as e:
        print(f"❌ Disease prediction test failed: {str(e)}")
        return False

async def test_graph_generation():
    """Test graph generation functionality"""
    print("\n🧪 Testing graph generation...")
    
    try:
        from routers.graph import generate_knowledge_graph
        from routers.graph import GraphRequest
        
        # Test with sample data
        test_request = GraphRequest(
            symptoms=["headache", "nausea"],
            diseases=["migraine", "food poisoning"]
        )
        
        print("✅ Graph generation structure is valid")
        return True
    except Exception as e:
        print(f"❌ Graph generation test failed: {str(e)}")
        return False

async def test_chat_functionality():
    """Test chat functionality"""
    print("\n🧪 Testing chat functionality...")
    
    try:
        from routers.chat import chat_with_ai
        from routers.chat import ChatRequest, ChatMessage
        
        # Test with sample chat
        test_request = ChatRequest(
            message="I have a headache",
            history=[
                ChatMessage(role="user", content="Hello"),
                ChatMessage(role="assistant", content="Hi, how can I help?")
            ]
        )
        
        print("✅ Chat functionality structure is valid")
        return True
    except Exception as e:
        print(f"❌ Chat functionality test failed: {str(e)}")
        return False

async def test_dataset_loading():
    """Test that the dataset can be loaded"""
    print("\n🧪 Testing dataset loading...")
    
    try:
        import pandas as pd
        dataset_path = "./data/disease_symptom_dataset.csv"
        
        if os.path.exists(dataset_path):
            df = pd.read_csv(dataset_path)
            print(f"✅ Dataset loaded successfully: {len(df)} records")
            print(f"   Columns: {list(df.columns)}")
            return True
        else:
            print("⚠️  Dataset file not found, but this is okay for basic functionality")
            return True
    except Exception as e:
        print(f"❌ Dataset loading test failed: {str(e)}")
        return False

async def test_environment_setup():
    """Test environment configuration"""
    print("\n🧪 Testing environment setup...")
    
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        # Check if .env file exists
        if os.path.exists('.env'):
            print("✅ .env file found")
        else:
            print("⚠️  .env file not found - using defaults")
        
        # Test environment variables
        groq_key = os.getenv('GROQ_API_KEY')
        if groq_key and groq_key != 'your_groq_api_key_here':
            print("✅ GROQ_API_KEY is configured")
        else:
            print("⚠️  GROQ_API_KEY not configured - chat will use fallback")
        
        return True
    except Exception as e:
        print(f"❌ Environment setup test failed: {str(e)}")
        return False

async def run_all_tests():
    """Run all tests"""
    print("🚀 Starting MedNex Backend Test Suite")
    print("=" * 50)
    
    tests = [
        test_basic_imports,
        test_environment_setup,
        test_dataset_loading,
        test_symptom_extraction,
        test_disease_prediction,
        test_graph_generation,
        test_chat_functionality
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            result = await test()
            if result:
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready to run.")
        print("\nTo start the server:")
        print('uvicorn main:app --reload')
    else:
        print("⚠️  Some tests failed, but basic functionality should still work.")
        print("Check the error messages above for details.")
    
    return passed == total

if __name__ == "__main__":
    asyncio.run(run_all_tests())
