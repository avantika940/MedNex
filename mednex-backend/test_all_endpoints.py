#!/usr/bin/env python3
"""
MedNex Backend Endpoint Testing Suite
Tests all API endpoints with actual HTTP requests
Run the backend server first: uvicorn main:app --reload
"""

import requests
import json
import time
from typing import Dict, Any, Optional
from datetime import datetime
import sys

# Configuration
BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

# Test data
TEST_USER = {
    "email": f"test_user_{int(time.time())}@example.com",
    "full_name": "Test User",
    "password": "testpassword123",
    "role": "customer"
}

TEST_ADMIN = {
    "email": f"test_admin_{int(time.time())}@example.com",
    "full_name": "Test Admin",
    "password": "adminpassword123",
    "role": "admin"
}

# Global variables to store tokens
customer_token = None
admin_token = None
customer_user_id = None
admin_user_id = None

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_test_header(test_name: str):
    """Print a formatted test header"""
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*80}{Colors.END}")
    print(f"{Colors.CYAN}{Colors.BOLD}🧪 TEST: {test_name}{Colors.END}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'='*80}{Colors.END}")

def print_success(message: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message: str):
    """Print error message"""
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message: str):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def make_request(method: str, endpoint: str, data: Optional[Dict] = None, 
                token: Optional[str] = None) -> tuple[int, Dict[str, Any]]:
    """Make HTTP request and return status code and response"""
    url = f"{BASE_URL}{endpoint}"
    headers = HEADERS.copy()
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            return 0, {"error": "Invalid HTTP method"}
        
        try:
            return response.status_code, response.json()
        except:
            return response.status_code, {"message": response.text}
    except requests.exceptions.ConnectionError:
        return 0, {"error": "Connection failed. Is the server running?"}
    except requests.exceptions.Timeout:
        return 0, {"error": "Request timeout"}
    except Exception as e:
        return 0, {"error": str(e)}

# ==================== BASIC TESTS ====================

def test_server_running():
    """Test if server is running"""
    print_test_header("Server Health Check")
    
    status, response = make_request("GET", "/")
    
    if status == 200:
        print_success(f"Server is running: {response.get('message', '')}")
        return True
    else:
        print_error(f"Server not responding (Status: {status})")
        return False

def test_health_endpoint():
    """Test health check endpoint"""
    print_test_header("Health Endpoint")
    
    status, response = make_request("GET", "/health")
    
    if status == 200:
        print_success(f"Health check passed: {response}")
        return True
    else:
        print_error(f"Health check failed (Status: {status}): {response}")
        return False

# ==================== AUTHENTICATION TESTS ====================

def test_user_registration():
    """Test user registration"""
    print_test_header("User Registration (Customer)")
    
    status, response = make_request("POST", "/api/auth/register", TEST_USER)
    
    if status == 201:
        global customer_user_id
        customer_user_id = response.get("id")
        print_success(f"User registered successfully: {response.get('email')}")
        print_info(f"User ID: {customer_user_id}")
        return True
    elif status == 400 and "already registered" in response.get("detail", ""):
        print_warning("User already exists (expected if running multiple times)")
        return True
    else:
        print_error(f"Registration failed (Status: {status}): {response}")
        return False

def test_admin_registration():
    """Test admin registration"""
    print_test_header("Admin Registration")
    
    status, response = make_request("POST", "/api/auth/register", TEST_ADMIN)
    
    if status == 201:
        global admin_user_id
        admin_user_id = response.get("id")
        print_success(f"Admin registered successfully: {response.get('email')}")
        print_info(f"Admin ID: {admin_user_id}")
        return True
    elif status == 400 and "already registered" in response.get("detail", ""):
        print_warning("Admin already exists (expected if running multiple times)")
        return True
    else:
        print_error(f"Admin registration failed (Status: {status}): {response}")
        return False

def test_user_login():
    """Test user login"""
    print_test_header("User Login (Customer)")
    
    login_data = {
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    
    status, response = make_request("POST", "/api/auth/login", login_data)
    
    if status == 200:
        global customer_token
        customer_token = response.get("access_token")
        print_success(f"Login successful for: {response.get('user', {}).get('email')}")
        print_info(f"Token: {customer_token[:50]}...")
        return True
    else:
        print_error(f"Login failed (Status: {status}): {response}")
        return False

def test_admin_login():
    """Test admin login"""
    print_test_header("Admin Login")
    
    login_data = {
        "email": TEST_ADMIN["email"],
        "password": TEST_ADMIN["password"]
    }
    
    status, response = make_request("POST", "/api/auth/login", login_data)
    
    if status == 200:
        global admin_token
        admin_token = response.get("access_token")
        print_success(f"Admin login successful for: {response.get('user', {}).get('email')}")
        print_info(f"Token: {admin_token[:50]}...")
        return True
    else:
        print_error(f"Admin login failed (Status: {status}): {response}")
        return False

def test_get_current_user():
    """Test getting current user info"""
    print_test_header("Get Current User Info")
    
    if not customer_token:
        print_warning("Skipping: No customer token available")
        return False
    
    status, response = make_request("GET", "/api/auth/me", token=customer_token)
    
    if status == 200:
        print_success(f"User info retrieved: {response.get('email')}")
        print_info(f"Role: {response.get('role')}")
        return True
    else:
        print_error(f"Get user info failed (Status: {status}): {response}")
        return False

# ==================== SYMPTOM EXTRACTION TESTS ====================

def test_symptom_extraction():
    """Test symptom extraction endpoint"""
    print_test_header("Symptom Extraction")
    
    test_data = {
        "text": "I have a severe headache, fever, and I'm feeling very nauseous. My throat is also sore."
    }
    
    status, response = make_request("POST", "/api/extract_symptoms", test_data)
    
    if status == 200:
        symptoms = response.get("symptoms", [])
        print_success(f"Extracted {len(symptoms)} symptoms: {symptoms}")
        print_info(f"Entities: {len(response.get('entities', []))}")
        return True
    else:
        print_error(f"Symptom extraction failed (Status: {status}): {response}")
        return False

def test_symptom_extraction_empty():
    """Test symptom extraction with empty text"""
    print_test_header("Symptom Extraction - Empty Input")
    
    test_data = {"text": ""}
    
    status, response = make_request("POST", "/api/extract_symptoms", test_data)
    
    if status == 400:
        print_success("Correctly rejected empty input")
        return True
    else:
        print_warning(f"Expected 400, got {status}: {response}")
        return False

# ==================== DISEASE PREDICTION TESTS ====================

def test_disease_prediction():
    """Test disease prediction endpoint"""
    print_test_header("Disease Prediction")
    
    test_data = {
        "symptoms": ["headache", "fever", "nausea", "sore throat"]
    }
    
    status, response = make_request("POST", "/api/predict", test_data)
    
    if status == 200:
        diseases = response.get("diseases", [])
        print_success(f"Predicted {len(diseases)} diseases")
        for disease in diseases[:3]:
            print_info(f"  - {disease['name']} (Confidence: {disease['confidence']}%)")
        return True
    else:
        print_error(f"Disease prediction failed (Status: {status}): {response}")
        return False

def test_disease_prediction_empty():
    """Test disease prediction with empty symptoms"""
    print_test_header("Disease Prediction - Empty Symptoms")
    
    test_data = {"symptoms": []}
    
    status, response = make_request("POST", "/api/predict", test_data)
    
    if status == 400:
        print_success("Correctly rejected empty symptoms")
        return True
    else:
        print_warning(f"Expected 400, got {status}: {response}")
        return False

# ==================== KNOWLEDGE GRAPH TESTS ====================

def test_knowledge_graph():
    """Test knowledge graph generation"""
    print_test_header("Knowledge Graph Generation")
    
    test_data = {
        "symptoms": ["headache", "fever", "nausea"],
        "diseases": ["migraine", "influenza", "food poisoning"]
    }
    
    status, response = make_request("POST", "/api/graph", test_data)
    
    if status == 200:
        nodes = response.get("nodes", [])
        edges = response.get("edges", [])
        print_success(f"Graph generated: {len(nodes)} nodes, {len(edges)} edges")
        return True
    else:
        print_error(f"Graph generation failed (Status: {status}): {response}")
        return False

# ==================== CHAT TESTS ====================

def test_chat():
    """Test conversational AI chat"""
    print_test_header("Chat with AI")
    
    test_data = {
        "message": "I have been experiencing headaches and dizziness for the past two days.",
        "history": []
    }
    
    status, response = make_request("POST", "/api/chat", test_data)
    
    if status == 200:
        print_success("Chat response received")
        print_info(f"Response: {response.get('response', '')[:100]}...")
        print_info(f"Extracted symptoms: {response.get('extracted_symptoms', [])}")
        print_info(f"Suggested questions: {len(response.get('suggested_questions', []))}")
        return True
    else:
        print_error(f"Chat failed (Status: {status}): {response}")
        return False

# ==================== CUSTOMER ENDPOINTS TESTS ====================

def test_save_diagnosis():
    """Test saving diagnosis to history"""
    print_test_header("Save Diagnosis to History")
    
    if not customer_token:
        print_warning("Skipping: No customer token available")
        return False
    
    test_data = {
        "symptoms": ["headache", "fever"],
        "predicted_diseases": [
            {"name": "Migraine", "confidence": 75.5},
            {"name": "Common Cold", "confidence": 60.2}
        ]
    }
    
    status, response = make_request("POST", "/api/customer/save-diagnosis", 
                                   test_data, token=customer_token)
    
    if status == 200:
        print_success(f"Diagnosis saved: ID {response.get('id')}")
        return True
    else:
        print_error(f"Save diagnosis failed (Status: {status}): {response}")
        return False

def test_get_diagnosis_history():
    """Test getting user's diagnosis history"""
    print_test_header("Get Diagnosis History")
    
    if not customer_token:
        print_warning("Skipping: No customer token available")
        return False
    
    status, response = make_request("GET", "/api/customer/diagnosis-history", 
                                   token=customer_token)
    
    if status == 200:
        history = response if isinstance(response, list) else []
        print_success(f"Retrieved {len(history)} diagnosis records")
        return True
    else:
        print_error(f"Get diagnosis history failed (Status: {status}): {response}")
        return False

# ==================== ADMIN ENDPOINTS TESTS ====================

def test_admin_list_users():
    """Test admin listing all users"""
    print_test_header("Admin - List All Users")
    
    if not admin_token:
        print_warning("Skipping: No admin token available")
        return False
    
    status, response = make_request("GET", "/api/admin/users", token=admin_token)
    
    if status == 200:
        users = response if isinstance(response, list) else []
        print_success(f"Retrieved {len(users)} users")
        return True
    else:
        print_error(f"List users failed (Status: {status}): {response}")
        return False

def test_admin_create_disease():
    """Test admin creating a disease"""
    print_test_header("Admin - Create Disease")
    
    if not admin_token:
        print_warning("Skipping: No admin token available")
        return False
    
    test_data = {
        "name": "Test Disease",
        "description": "This is a test disease for endpoint testing",
        "symptoms": ["symptom1", "symptom2"],
        "treatment": "Test treatment",
        "severity": "low",
        "category": "test"
    }
    
    status, response = make_request("POST", "/api/admin/diseases", 
                                   test_data, token=admin_token)
    
    if status == 201:
        print_success(f"Disease created: {response.get('name')}")
        return True
    else:
        print_error(f"Create disease failed (Status: {status}): {response}")
        print_warning("This is a known bug - disease CRUD parameter mismatch")
        return False

def test_admin_list_diseases():
    """Test admin listing all diseases"""
    print_test_header("Admin - List All Diseases")
    
    if not admin_token:
        print_warning("Skipping: No admin token available")
        return False
    
    status, response = make_request("GET", "/api/admin/diseases", token=admin_token)
    
    if status == 200:
        diseases = response if isinstance(response, list) else []
        print_success(f"Retrieved {len(diseases)} diseases")
        return True
    else:
        print_error(f"List diseases failed (Status: {status}): {response}")
        return False

# ==================== AUTHORIZATION TESTS ====================

def test_customer_cannot_access_admin():
    """Test that customer cannot access admin endpoints"""
    print_test_header("Authorization - Customer Cannot Access Admin Endpoints")
    
    if not customer_token:
        print_warning("Skipping: No customer token available")
        return False
    
    status, response = make_request("GET", "/api/admin/users", token=customer_token)
    
    if status == 403:
        print_success("Correctly denied customer access to admin endpoint")
        return True
    else:
        print_error(f"Authorization failed - Expected 403, got {status}")
        return False

def test_unauthenticated_cannot_access_protected():
    """Test that unauthenticated users cannot access protected endpoints"""
    print_test_header("Authorization - Unauthenticated Cannot Access Protected Endpoints")
    
    status, response = make_request("GET", "/api/auth/me")  # No token
    
    if status == 401:
        print_success("Correctly denied unauthenticated access")
        return True
    else:
        print_error(f"Authorization failed - Expected 401, got {status}")
        return False

# ==================== MAIN TEST RUNNER ====================

def run_all_tests():
    """Run all endpoint tests"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}")
    print("╔══════════════════════════════════════════════════════════════════════════════╗")
    print("║                    MedNex Backend Endpoint Test Suite                       ║")
    print("║                           Testing All Endpoints                             ║")
    print("╚══════════════════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}\n")
    
    results = {}
    
    # Test categories
    tests = [
        ("Basic", [
            ("Server Running", test_server_running),
            ("Health Endpoint", test_health_endpoint),
        ]),
        ("Authentication", [
            ("User Registration", test_user_registration),
            ("Admin Registration", test_admin_registration),
            ("User Login", test_user_login),
            ("Admin Login", test_admin_login),
            ("Get Current User", test_get_current_user),
        ]),
        ("Symptom Extraction", [
            ("Extract Symptoms", test_symptom_extraction),
            ("Empty Input Validation", test_symptom_extraction_empty),
        ]),
        ("Disease Prediction", [
            ("Predict Diseases", test_disease_prediction),
            ("Empty Symptoms Validation", test_disease_prediction_empty),
        ]),
        ("Knowledge Graph", [
            ("Generate Graph", test_knowledge_graph),
        ]),
        ("Chat AI", [
            ("Chat Conversation", test_chat),
        ]),
        ("Customer Endpoints", [
            ("Save Diagnosis", test_save_diagnosis),
            ("Get History", test_get_diagnosis_history),
        ]),
        ("Admin Endpoints", [
            ("List Users", test_admin_list_users),
            ("Create Disease", test_admin_create_disease),
            ("List Diseases", test_admin_list_diseases),
        ]),
        ("Authorization", [
            ("Customer Access Denied", test_customer_cannot_access_admin),
            ("Unauthenticated Access Denied", test_unauthenticated_cannot_access_protected),
        ]),
    ]
    
    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    
    for category, category_tests in tests:
        print(f"\n{Colors.BOLD}{Colors.BLUE}━━━━━━━━━━ {category} Tests ━━━━━━━━━━{Colors.END}\n")
        
        for test_name, test_func in category_tests:
            total_tests += 1
            try:
                result = test_func()
                results[test_name] = result
                if result:
                    passed_tests += 1
                else:
                    failed_tests += 1
            except Exception as e:
                print_error(f"Test crashed: {str(e)}")
                results[test_name] = False
                failed_tests += 1
            
            time.sleep(0.5)  # Small delay between tests
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.CYAN}")
    print("╔══════════════════════════════════════════════════════════════════════════════╗")
    print("║                              TEST SUMMARY                                    ║")
    print("╚══════════════════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}")
    
    print(f"\n{Colors.BOLD}Total Tests: {total_tests}{Colors.END}")
    print(f"{Colors.GREEN}✅ Passed: {passed_tests}{Colors.END}")
    print(f"{Colors.RED}❌ Failed: {failed_tests}{Colors.END}")
    print(f"{Colors.CYAN}Success Rate: {(passed_tests/total_tests*100):.1f}%{Colors.END}\n")
    
    # Print failed tests
    if failed_tests > 0:
        print(f"{Colors.RED}{Colors.BOLD}Failed Tests:{Colors.END}")
        for test_name, result in results.items():
            if not result:
                print(f"{Colors.RED}  ❌ {test_name}{Colors.END}")
    
    print("\n" + "="*80 + "\n")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    try:
        success = run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Tests interrupted by user{Colors.END}\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n{Colors.RED}Fatal error: {str(e)}{Colors.END}\n")
        sys.exit(1)
