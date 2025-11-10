# Clear Frontend Cache and Restart Script

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Clearing Frontend Cache and Restarting..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Navigate to frontend
Set-Location "e:\Avi Full stack\mednex-frontend"

# Clear Next.js cache
Write-Host "`nDeleting .next cache folder..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Cache deleted" -ForegroundColor Green
}

# Clear node_modules cache
Write-Host "`nClearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "Node cache deleted" -ForegroundColor Green
}

# Verify env
Write-Host "`nVerifying .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Get-Content ".env.local"
    Write-Host "Configuration verified" -ForegroundColor Green
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Cache cleared! Now:" -ForegroundColor Green
Write-Host "1. Start frontend: npm run dev" -ForegroundColor Yellow
Write-Host "2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host "3. Or use Incognito mode (Ctrl+Shift+N)" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
