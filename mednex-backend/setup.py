#!/usr/bin/env python3
"""
Setup script for MedNex Backend
"""

import subprocess
import sys
import os

def check_python_version():
    """Check if Python version is 3.10+"""
    if sys.version_info < (3, 10):
        print("Error: Python 3.10 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Requirements installed successfully")
    except subprocess.CalledProcessError:
        print("Error: Failed to install requirements")
        print("Please run: pip install -r requirements.txt")
        sys.exit(1)

def check_env_file():
    """Check if .env file exists"""
    if not os.path.exists('.env'):
        print("⚠️  .env file not found")
        print("Please copy .env.example to .env and configure your API keys")
        print("cp .env.example .env")
    else:
        print("✓ .env file found")

def main():
    """Main setup function"""
    print("Setting up MedNex Backend...")
    print("=" * 40)
    
    check_python_version()
    install_requirements()
    check_env_file()
    
    print("\n" + "=" * 40)
    print("✓ Setup complete!")
    print("\nTo start the server:")
    print("uvicorn main:app --reload")
    print("\nAPI will be available at: http://localhost:8000")
    print("API docs will be available at: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
