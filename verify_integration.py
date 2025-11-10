"""
Integration Verification Script
Verifies that all frontend API calls have corresponding backend endpoints
"""

import requests
import time
from typing import Dict, List, Tuple

BASE_URL = "http://localhost:8000"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_colored(text: str, color: str):
    print(f"{color}{text}{RESET}")

def check_endpoint(method: str, endpoint: str, description: str, requires_auth: bool = False) -> Tuple[bool, str]:
    """Check if an endpoint exists and is accessible"""
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    
    # For auth-protected endpoints, we'll just check if they return 401 (which means they exist)
    # Instead of 404 (which means they don't)
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, json={}, headers=headers, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json={}, headers=headers, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        else:
            return False, "Unknown method"
        
        # For auth-required endpoints, 401 or 422 means the endpoint exists
        if requires_auth and response.status_code in [401, 422]:
            return True, f"✓ Exists (requires auth)"
        
        # For public endpoints, 200 or 422 is good
        if response.status_code in [200, 201, 422]:
            return True, f"✓ OK ({response.status_code})"
        
        # 404 means endpoint doesn't exist
        if response.status_code == 404:
            return False, "✗ Not Found (404)"
        
        # Other status codes might be OK depending on the endpoint
        return True, f"? Status {response.status_code}"
        
    except requests.exceptions.Timeout:
        return False, "✗ Timeout"
    except requests.exceptions.ConnectionError:
        return False, "✗ Connection Error"
    except Exception as e:
        return False, f"✗ Error: {str(e)}"

def main():
    print_colored("=" * 80, BLUE)
    print_colored("MEDNEX BACKEND-FRONTEND INTEGRATION VERIFICATION", BLUE)
    print_colored("=" * 80, BLUE)
    print()
    
    # Define all frontend API calls
    endpoints = [
        # Public endpoints from api.ts
        ("POST", "/api/extract_symptoms", "Extract symptoms from text", False),
        ("POST", "/api/predict", "Predict diseases", False),
        ("POST", "/api/graph", "Generate knowledge graph", False),
        ("POST", "/api/chat", "Chat with AI", False),
        ("GET", "/api/explain/test", "Explain medical term", False),
        ("GET", "/health", "Health check", False),
        ("GET", "/", "API info", False),
        
        # Auth endpoints from auth.ts
        ("POST", "/api/auth/login", "Login", False),
        ("POST", "/api/auth/register", "Register", False),
        ("GET", "/api/auth/me", "Get profile", True),
        ("PUT", "/api/auth/me", "Update profile", True),
        
        # Admin endpoints from admin-api.ts
        ("GET", "/api/admin/users", "Get all users", True),
        ("GET", "/api/admin/users/test-id", "Get user by ID", True),
        ("PUT", "/api/admin/users/test-id", "Update user", True),
        ("DELETE", "/api/admin/users/test-id", "Delete user", True),
        
        ("POST", "/api/admin/diseases", "Create disease", True),
        ("GET", "/api/admin/diseases", "Get all diseases", True),
        ("GET", "/api/admin/diseases/test-id", "Get disease by ID", True),
        ("PUT", "/api/admin/diseases/test-id", "Update disease", True),
        ("DELETE", "/api/admin/diseases/test-id", "Delete disease", True),
        
        ("POST", "/api/admin/symptoms", "Create symptom", True),
        ("GET", "/api/admin/symptoms", "Get all symptoms", True),
        ("PUT", "/api/admin/symptoms/test-id", "Update symptom", True),
        ("DELETE", "/api/admin/symptoms/test-id", "Delete symptom", True),
        
        ("GET", "/api/admin/analytics/overview", "Get analytics overview", True),
        
        # Customer endpoints from customer-api.ts
        ("GET", "/api/customer/diagnosis-history", "Get diagnosis history", True),
        ("POST", "/api/customer/save-diagnosis", "Save diagnosis", True),
        ("GET", "/api/customer/diagnosis-history/test-id", "Get diagnosis by ID", True),
        ("DELETE", "/api/customer/diagnosis-history/test-id", "Delete diagnosis", True),
        ("GET", "/api/customer/statistics", "Get user statistics", True),
    ]
    
    results = {
        "success": [],
        "failed": [],
        "warnings": []
    }
    
    print_colored("\nTesting endpoints...\n", YELLOW)
    
    for method, endpoint, description, requires_auth in endpoints:
        success, message = check_endpoint(method, endpoint, description, requires_auth)
        
        status_symbol = "✓" if success else "✗"
        color = GREEN if success else RED
        
        print(f"{color}{status_symbol} {method:6} {endpoint:50} {message}{RESET}")
        
        if success:
            results["success"].append((method, endpoint, description))
        else:
            results["failed"].append((method, endpoint, description, message))
        
        # Small delay to avoid overwhelming the server
        time.sleep(0.1)
    
    # Print summary
    print()
    print_colored("=" * 80, BLUE)
    print_colored("SUMMARY", BLUE)
    print_colored("=" * 80, BLUE)
    print()
    
    total = len(endpoints)
    success_count = len(results["success"])
    failed_count = len(results["failed"])
    
    print(f"Total endpoints checked: {total}")
    print_colored(f"✓ Successful: {success_count}", GREEN)
    if failed_count > 0:
        print_colored(f"✗ Failed: {failed_count}", RED)
    
    print()
    print(f"Success rate: {(success_count/total)*100:.1f}%")
    
    if results["failed"]:
        print()
        print_colored("FAILED ENDPOINTS:", RED)
        for method, endpoint, description, message in results["failed"]:
            print(f"  {RED}✗ {method} {endpoint} - {description} ({message}){RESET}")
    
    print()
    
    if failed_count == 0:
        print_colored("🎉 All endpoints are correctly integrated!", GREEN)
    else:
        print_colored(f"⚠️  {failed_count} endpoint(s) need attention", YELLOW)
    
    print()

if __name__ == "__main__":
    print("\nMake sure the backend server is running on http://localhost:8000")
    print("Press Enter to start verification...")
    input()
    main()
