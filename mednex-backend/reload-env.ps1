# Reload Backend with Fresh Environment Variables

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Reloading Backend with Fresh .env Configuration" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Navigate to backend
Set-Location "e:\Avi Full stack\mednex-backend"

# Check if .env exists
Write-Host "`n1. Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   .env file found" -ForegroundColor Green
    Write-Host "`n   Current Configuration:" -ForegroundColor Gray
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^[A-Z_]+=") {
            $key = ($_ -split "=")[0]
            if ($key -match "PASSWORD|SECRET|KEY|URI") {
                Write-Host "   $key=***HIDDEN***" -ForegroundColor Gray
            } else {
                Write-Host "   $_" -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "   ERROR: .env file not found!" -ForegroundColor Red
    exit 1
}

# Stop existing Python processes on port 8000
Write-Host "`n2. Stopping existing backend processes..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "   Stopping process $pid..." -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "   Old processes stopped" -ForegroundColor Green
} else {
    Write-Host "   No processes to stop" -ForegroundColor Gray
}

# Activate virtual environment
Write-Host "`n3. Activating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
    Write-Host "   Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Virtual environment not found!" -ForegroundColor Red
    exit 1
}

# Test MongoDB connection first
Write-Host "`n4. Testing MongoDB connection..." -ForegroundColor Yellow
$testResult = python test_mongodb_connection.py
if ($LASTEXITCODE -eq 0) {
    Write-Host "   MongoDB connection successful!" -ForegroundColor Green
} else {
    Write-Host "   WARNING: MongoDB connection test failed" -ForegroundColor Red
    Write-Host "   Check your MONGODB_URI in .env file" -ForegroundColor Red
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Ready to start backend!" -ForegroundColor Green
Write-Host "Run: python main.py" -ForegroundColor Yellow
Write-Host "Or: uvicorn main:app --reload" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
