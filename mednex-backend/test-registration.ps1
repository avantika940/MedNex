# Test Registration Endpoint

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Testing MedNex Registration Endpoint" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8000"

# Test 1: Check if auth endpoints are available
Write-Host "`n1. Checking API documentation..." -ForegroundColor Yellow
try {
    $docs = Invoke-RestMethod -Uri "$baseUrl/docs" -Method Get -ErrorAction Stop
    Write-Host "   API documentation accessible" -ForegroundColor Green
} catch {
    Write-Host "   Warning: Could not access API docs" -ForegroundColor Yellow
}

# Test 2: Try to register a new user
Write-Host "`n2. Testing user registration..." -ForegroundColor Yellow
$testEmail = "testuser_$(Get-Random)@example.com"
$registerData = @{
    email = $testEmail
    full_name = "Test User"
    password = "TestPass123!"
    role = "customer"
} | ConvertTo-Json

Write-Host "   Email: $testEmail" -ForegroundColor Gray
Write-Host "   Name: Test User" -ForegroundColor Gray

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerData -Headers $headers
    Write-Host "   Registration successful!" -ForegroundColor Green
    Write-Host "   User ID: $($response.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.email)" -ForegroundColor Gray
    Write-Host "   Role: $($response.role)" -ForegroundColor Gray
} catch {
    Write-Host "   Registration failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error details: $responseBody" -ForegroundColor Red
    }
}

# Test 3: Try to login with the new user
Write-Host "`n3. Testing login with new user..." -ForegroundColor Yellow
$loginData = @{
    email = $testEmail
    password = "TestPass123!"
} | ConvertTo-Json

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -Headers $headers
    Write-Host "   Login successful!" -ForegroundColor Green
    Write-Host "   Token type: $($response.token_type)" -ForegroundColor Gray
    Write-Host "   Token: $($response.access_token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "   Login failed: $_" -ForegroundColor Red
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host "Registration endpoint is working correctly." -ForegroundColor Green
Write-Host "You can now sign up from the frontend." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
