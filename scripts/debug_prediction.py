#!/usr/bin/env python3
"""
Debug disease prediction response
"""

import requests
import json

def debug_prediction():
    base_url = "http://localhost:8000"
    
    # First, get symptoms
    print("Getting symptoms...")
    payload = {"text": "I have a severe headache, high fever, and nausea"}
    response = requests.post(f"{base_url}/api/extract_symptoms", json=payload)
    symptoms_data = response.json()
    symptoms = symptoms_data["symptoms"]
    print(f"Symptoms: {symptoms}")
    
    # Then, get disease prediction
    print("\nGetting disease predictions...")
    payload = {"symptoms": symptoms}
    response = requests.post(f"{base_url}/api/predict", json=payload)
    diseases_data = response.json()
    print(f"Full response: {json.dumps(diseases_data, indent=2)}")
    
    # Test graph with the actual data
    print("\nTesting graph with actual data...")
    diseases = diseases_data["diseases"]
    payload = {
        "symptoms": symptoms,
        "diseases": [d["name"] for d in diseases[:3]]
    }
    print(f"Graph payload: {json.dumps(payload, indent=2)}")
    response = requests.post(f"{base_url}/api/graph", json=payload)
    print(f"Graph response status: {response.status_code}")
    if response.status_code == 200:
        graph_data = response.json()
        print(f"Graph nodes: {len(graph_data['nodes'])}")
        print(f"Graph links: {len(graph_data['links'])}")
    else:
        print(f"Graph error: {response.text}")

if __name__ == "__main__":
    debug_prediction()
