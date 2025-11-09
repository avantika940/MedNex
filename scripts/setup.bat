@echo off
REM Development setup script for MedNex (Windows)

echo 🚀 Setting up MedNex development environment...

REM Backend setup
echo 🔧 Setting up backend...
cd mednex-backend

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your API keys before running the application
)

cd ..

REM Frontend setup
echo 🔧 Setting up frontend...
cd mednex-frontend

echo Installing Node.js dependencies...
npm install

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local file from template...
    copy .env.local.example .env.local
)

cd ..

echo ✅ Setup complete!
echo.
echo To start the application:
echo 1. Backend: cd mednex-backend ^&^& uvicorn main:app --reload
echo 2. Frontend: cd mednex-frontend ^&^& npm run dev
echo.
echo Or use the VS Code task: 'Start MedNex Development'
pause
