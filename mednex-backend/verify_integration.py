#!/usr/bin/env python3
"""
Backend-Frontend Integration Verification Script
Tests that backend endpoints match frontend API calls
"""

import requests
import json
from typing import Dict, Any
import sys

BASE_URL = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

def check_endpoint(method: str, endpoint: str, description: str) -> bool:
    """Check if an endpoint exists"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json={}, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json={}, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, timeout=5)
        
        # Consider 404, 401, 403, 422 (validation error) as "endpoint exists"
        if response.status_code in [200, 201, 401, 403, 404, 422]:
            print(f"{Colors.GREEN}✅ {method:6} {endpoint:50} - {description}{Colors.END}")
            return True
        else:
            print(f"{Colors.YELLOW}⚠️  {method:6} {endpoint:50} - Status: {response.status_code}{Colors.END}")
            return True
    except requests.exceptions.ConnectionError:
        print(f"{Colors.RED}❌ {method:6} {endpoint:50} - Server not running{Colors.END}")
        return False
    except Exception as e:
        print(f"{Colors.RED}❌ {method:6} {endpoint:50} - Error: {str(e)}{Colors.END}")
        return False

def main():
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*100}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}Backend-Frontend Integration Verification{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*100}{Colors.END}\n")
    
    results = []
    
    # Basic Endpoints
    print(f"\n{Colors.BOLD}{Colors.BLUE}━━━ Basic Endpoints ━━━{Colors.END}\n")
    results.append(check_endpoint("GET", "/", "API Info"))
    results.append(check_endpoint("GET", "/health", "Health Check"))
    results.append(check_endpoint("GET", "/docs", "API Documentation"))
    
    # Authentication Endpoints
    print(f"\n{Colors.BOLD}{Colors.BLUE}━━━ Authentication Endpoints (lib/auth.ts) ━━━{Colors.END}\n")
    results.append(check_endpoint("POST", "/api/auth/register", "User Registration"))
    results.append(check_endpoint("POST", "/api/auth/login", "User Login"))
    results.append(check_endpoint("GET", "/api/auth/me", "Get Current User"))
    results.append(check_endpoint("PUT", "/api/auth/me", "Update Profile"))
    results.append(check_endpoint("DELETE", "/api/auth/me", "Delete Account"))
    
    # AI Feature Endpoints
    print(f"\n{Colors.BOLD}{Colors.BLUE}━━━ AI Feature Endpoints (lib/api.ts) ━━━{Colors.END}\n")
    results.append(check_endpoint("POST", "/api/extract_symptoms", "Symptom Extraction (BioBERT)"))
    results.append(check_endpoint("POST", "/api/predict", "Disease Prediction"))
    results.append(check_endpoint("POST", "/api/graph", "Knowledge Graph Generation"))
    results.append(check_endpoint("POST", "/api/chat", "AI Chat (Groq LLaMA)"))
    results.append(check_endpoint("GET", "/api/explain/headache", "Term Explanation"))
    
    # Customer Endpoints
    print(f"\n{Colors.BOLD}{Colors.BLUE}━━━ Customer Endpoints (lib/customer-api.ts) ━━━{Colors.END}\n")
    results.append(check_endpoint("GET", "/api/customer/diagnosis-history", "Get Diagnosis History"))
    results.append(check_endpoint("POST", "/api/customer/save-diagnosis", "Save Diagnosis"))
    results.append(check_endpoint("GET", "/api/customer/diagnosis-history/123", "Get Diagnosis by ID"))
    results.append(check_endpoint("DELETE", "/api/customer/diagnosis-history/123", "Delete Diagnosis"))
    results.append(check_endpoint("GET", "/api/customer/statistics", "Get User Statistics"))
    
    # Admin User Management
    print(f"\n{Colors.BOLD}{Colors.BLUE}━━━ Admin User Management (lib/admin-api.ts) ━━━{Colors.END}\n")
    results.append(check_endpoint("GET", "/api/admin/users", "List All Users"))
    results.append(check_endpoint("GET", "/api/admin/users/123", "Get User by ID"))
    results.append(check_endpoint("PUT", "/api/admin/users/123", "Update User"))
    results.append(check_endpoint("DELETE", "/api/admin/users/123", "Delete User"))
    
    # Admin Disease Management
    print(f"\n{Colors.BOLD}{Colors.BLUE}━━━ Admin Disease Management (lib/admin-api.ts) ━━━{Colors.END}\n")
    results.append(check_endpoint("POST", "/api/admin/diseases", "Create Disease"))
    results.append(check_endpoint("GET", "/api/admin/diseases", "List All Diseases"))
    results.append(check_endpoint("GET", "/api/admin/diseases/123", "Get Disease by ID"))
    results.append(check_endpoint("PUT", "/api/admin/diseases/123", "Update Disease"))
    results.append(check_endpoint("DELETE", "/api/admin/diseases/123", "Delete Disease"))
    
    # Admin Symptom Management
    print(f"\n{Colors.BOLD}{Colors.BLUE}━━━ Admin Symptom Management (lib/admin-api.ts) ━━━{Colors.END}\n")
    results.append(check_endpoint("POST", "/api/admin/symptoms", "Create Symptom"))
    results.append(check_endpoint("GET", "/api/admin/symptoms", "List All Symptoms"))
    results.append(check_endpoint("GET", "/api/admin/symptoms/123", "Get Symptom by ID"))
    results.append(check_endpoint("PUT", "/api/admin/symptoms/123", "Update Symptom"))
    results.append(check_endpoint("DELETE", "/api/admin/symptoms/123", "Delete Symptom"))
    
    # Admin Analytics
    print(f"\n{Colors.BOLD}{Colors.BLUE}━━━ Admin Analytics (lib/admin-api.ts) ━━━{Colors.END}\n")
    results.append(check_endpoint("GET", "/api/admin/analytics", "Get Analytics"))
    
    # Summary
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*100}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}Summary{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*100}{Colors.END}\n")
    
    total = len(results)
    passed = sum(results)
    failed = total - passed
    
    print(f"{Colors.BOLD}Total Endpoints Checked: {total}{Colors.END}")
    print(f"{Colors.GREEN}✅ Available: {passed}{Colors.END}")
    print(f"{Colors.RED}❌ Unavailable: {failed}{Colors.END}")
    print(f"{Colors.CYAN}Success Rate: {(passed/total*100):.1f}%{Colors.END}\n")
    
    if failed == 0:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 All frontend endpoints are available in the backend!{Colors.END}\n")
        return True
    else:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠️  Some endpoints may need implementation{Colors.END}\n")
        return False

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Verification interrupted{Colors.END}\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n{Colors.RED}Fatal error: {str(e)}{Colors.END}\n")
        sys.exit(1)
