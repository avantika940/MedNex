# Clear Frontend Cache and Restart Script

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Clearing Frontend Cache and Restarting..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Stop any running Next.js processes
Write-Host "`n1. Stopping any running Next.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*mednex-frontend*"} | Stop-Process -Force
Start-Sleep -Seconds 2

# Navigate to frontend
Set-Location "e:\Avi Full stack\mednex-frontend"

# Clear Next.js cache
Write-Host "`n2. Deleting .next cache folder..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "   ✓ Cache deleted" -ForegroundColor Green
} else {
    Write-Host "   ℹ No cache to delete" -ForegroundColor Gray
}

# Clear node_modules/.cache if exists
Write-Host "`n3. Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "   ✓ Node cache deleted" -ForegroundColor Green
} else {
    Write-Host "   ℹ No node cache found" -ForegroundColor Gray
}

# Verify .env.local
Write-Host "`n4. Verifying environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    Write-Host "   Current .env.local:" -ForegroundColor Gray
    Write-Host $envContent -ForegroundColor Gray
    if ($envContent -match "8000") {
        Write-Host "   ✓ Correct port (8000) configured" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Port configuration issue!" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ .env.local not found!" -ForegroundColor Red
}

Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "Cache cleared! Now start the frontend:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host "`nIMPORTANT: Clear your browser cache too!" -ForegroundColor Yellow
Write-Host "   Chrome: Ctrl+Shift+Delete -> Clear browsing data" -ForegroundColor Gray
Write-Host "   Or open in Incognito mode: Ctrl+Shift+N" -ForegroundColor Gray
Write-Host "=" * 60 -ForegroundColor Cyan
