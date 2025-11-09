#!/usr/bin/env python3
"""
MedNex Project Structure Verification

This script verifies that the MedNex project structure is clean and properly organized.
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath, description=""):
    """Check if a file exists and report status"""
    if os.path.exists(filepath):
        print(f"✅ {filepath} {description}")
        return True
    else:
        print(f"❌ {filepath} {description}")
        return False

def check_directory_structure():
    """Verify the main directory structure"""
    print("🔍 Checking project structure...")
    
    required_dirs = [
        "mednex-backend",
        "mednex-frontend", 
        "scripts",
    ]
    
    optional_dirs = [
        "docs",
        ".vscode",
        ".git"
    ]
    
    all_good = True
    
    for dir_name in required_dirs:
        if os.path.isdir(dir_name):
            print(f"✅ {dir_name}/ (required)")
        else:
            print(f"❌ {dir_name}/ (required)")
            all_good = False
    
    for dir_name in optional_dirs:
        if os.path.isdir(dir_name):
            print(f"✅ {dir_name}/ (optional)")
        else:
            print(f"ℹ️  {dir_name}/ (optional - not found)")
    
    return all_good

def check_backend_structure():
    """Verify backend structure"""
    print("\n🔍 Checking backend structure...")
    
    backend_files = [
        ("mednex-backend/main.py", "(main application)"),
        ("mednex-backend/requirements.txt", "(dependencies)"),
        ("mednex-backend/.env.example", "(environment template)"),
        ("mednex-backend/models/__init__.py", "(models package)"),
        ("mednex-backend/routers/__init__.py", "(routers package)"),
        ("mednex-backend/services/__init__.py", "(services package)"),
        ("mednex-backend/database/__init__.py", "(database package)"),
    ]
    
    all_good = True
    for filepath, description in backend_files:
        if not check_file_exists(filepath, description):
            all_good = False
    
    return all_good

def check_frontend_structure():
    """Verify frontend structure"""
    print("\n🔍 Checking frontend structure...")
    
    frontend_files = [
        ("mednex-frontend/package.json", "(dependencies)"),
        ("mednex-frontend/next.config.ts", "(Next.js config)"),
        ("mednex-frontend/tsconfig.json", "(TypeScript config)"),
        ("mednex-frontend/.env.local.example", "(environment template)"),
        ("mednex-frontend/app/page.tsx", "(main page)"),
        ("mednex-frontend/components/ChatInterface.tsx", "(chat component)"),
        ("mednex-frontend/lib/api.ts", "(API client)"),
        ("mednex-frontend/lib/types.ts", "(TypeScript types)"),
    ]
    
    all_good = True
    for filepath, description in frontend_files:
        if not check_file_exists(filepath, description):
            all_good = False
    
    return all_good

def check_scripts_and_docs():
    """Verify scripts and documentation"""
    print("\n🔍 Checking scripts and documentation...")
    
    files = [
        ("scripts/test_integration.py", "(integration tests)"),
        ("scripts/setup.sh", "(setup script - Unix)"),
        ("scripts/setup.bat", "(setup script - Windows)"),
        ("README.md", "(main documentation)"),
        ("DEVELOPMENT.md", "(development guide)"),
        ("PROJECT_SUMMARY.md", "(project summary)"),
        (".gitignore", "(git ignore rules)"),
        ("pyproject.toml", "(project configuration)"),
    ]
    
    all_good = True
    for filepath, description in files:
        if not check_file_exists(filepath, description):
            all_good = False
    
    return all_good

def check_for_unwanted_files():
    """Check for unwanted files that should be cleaned up (excluding virtual environments)"""
    print("\n🔍 Checking for unwanted files...")
    
    found_unwanted = []
    
    # Directories to skip entirely
    skip_dirs = {'.venv', 'venv', 'node_modules', '.git', '.next', 'dist', 'build'}
    
    # Check for __pycache__ directories and unwanted files outside of virtual environments
    for root, dirs, files in os.walk("."):
        # Skip virtual environment directories
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        # Skip if we're inside a virtual environment path
        if any(skip_dir in root for skip_dir in skip_dirs):
            continue
            
        if "__pycache__" in dirs:
            found_unwanted.append(os.path.join(root, "__pycache__"))
        
        for file in files:
            if file.endswith(('.pyc', '.pyo', '.log')) or file in ['.DS_Store', 'Thumbs.db']:
                found_unwanted.append(os.path.join(root, file))
    
    if found_unwanted:
        print("⚠️  Found unwanted files/directories (excluding virtual environments):")
        for item in found_unwanted[:10]:  # Show first 10
            print(f"   - {item}")
        if len(found_unwanted) > 10:
            print(f"   ... and {len(found_unwanted) - 10} more")
        return False
    else:
        print("✅ No unwanted files found (virtual environments excluded)")
        return True

def main():
    """Main verification function"""
    print("🚀 MedNex Project Structure Verification\n")
    
    # Change to project root if we're in scripts directory
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    
    results = []
    results.append(check_directory_structure())
    results.append(check_backend_structure())
    results.append(check_frontend_structure())
    results.append(check_scripts_and_docs())
    results.append(check_for_unwanted_files())
    
    print("\n" + "="*50)
    print("📊 VERIFICATION RESULTS")
    print("="*50)
    
    if all(results):
        print("🎉 All checks passed! Project structure is clean and properly organized.")
        return True
    else:
        print("⚠️  Some issues found. Please review the output above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
