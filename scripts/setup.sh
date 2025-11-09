#!/bin/bash
# Development setup script for MedNex

echo "🚀 Setting up MedNex development environment..."

# Backend setup
echo "🔧 Setting up backend..."
cd mednex-backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys before running the application"
fi

cd ..

# Frontend setup
echo "🔧 Setting up frontend..."
cd mednex-frontend

echo "Installing Node.js dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from template..."
    cp .env.local.example .env.local
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd mednex-backend && uvicorn main:app --reload"
echo "2. Frontend: cd mednex-frontend && npm run dev"
echo ""
echo "Or use the VS Code task: 'Start MedNex Development'"
