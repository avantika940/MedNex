#!/usr/bin/env python3
"""
Simple API Test for debugging
"""

import requests
import json

def test_endpoints():
    base_url = "http://localhost:8000"
    
    # Test 1: Graph endpoint
    print("Testing graph endpoint...")
    try:
        payload = {
            "symptoms": ["headache", "fever"],
            "diseases": ["Common Cold"]
        }
        print(f"Payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{base_url}/api/graph", json=payload, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        print(f"Success: {response.status_code == 200}")
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")
        print(f"Full error: {str(e)}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Chat endpoint
    print("Testing chat endpoint...")
    try:
        payload = {
            "message": "I have a headache",
            "context": []
        }
        print(f"Payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{base_url}/api/chat", json=payload, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        print(f"Success: {response.status_code == 200}")
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")
        print(f"Full error: {str(e)}")

if __name__ == "__main__":
    test_endpoints()
