# ==============================================================================
# CounterYield Desktop Browser Auto-Launcher
# ==============================================================================
# Purpose:
#   1. Checks and verifies backend Fastify API on http://localhost:4000.
#   2. Checks and verifies Expo Metro bundler on http://localhost:8081.
#   3. Opens the default browser at http://localhost:8081 with WebCam Face ID
#      simulation and 1-Click Desktop bypass.
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  CounterYield - Desktop Browser Auto-Launcher           " -ForegroundColor Green
Write-Host "  Delta-Neutral Carry Protocol on Monad Testnet          " -ForegroundColor DarkGreen
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

$WorkspaceRoot = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $WorkspaceRoot

# 1. Check Backend
Write-Host "[1/3] Checking Backend Service on port 4000..." -ForegroundColor Cyan
$BackendOnline = $false
try {
    $backendRes = Invoke-WebRequest -Uri "http://localhost:4000/api/v1/health" -UseBasicParsing -TimeoutSec 3
    if ($backendRes.StatusCode -eq 200) {
        $BackendOnline = $true
        Write-Host "  -> Backend API is online and healthy!" -ForegroundColor Green
    }
} catch {
    Write-Host "  -> Backend is starting in background..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$WorkspaceRoot'; npm --workspace=backend run dev`"" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

# 2. Check Metro Bundler
Write-Host "[2/3] Checking Metro Bundler on port 8081..." -ForegroundColor Cyan
$MetroOnline = $false
try {
    $metroRes = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 3
    if ($metroRes.StatusCode -eq 200) {
        $MetroOnline = $true
        Write-Host "  -> Metro Bundler is online and ready!" -ForegroundColor Green
    }
} catch {
    Write-Host "  -> Metro Bundler is starting in background..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$WorkspaceRoot\mobile'; npx expo start -c`"" -WindowStyle Minimized
    Start-Sleep -Seconds 5
}

# 3. Open Browser
Write-Host "[3/3] Opening CounterYield in laptop browser..." -ForegroundColor Cyan
Start-Process "http://localhost:8081"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  App Launched: http://localhost:8081                    " -ForegroundColor Green
Write-Host "  Features Available on Laptop:                          " -ForegroundColor Yellow
Write-Host "   - Laptop Webcam Face ID scan simulation (HTML5)       " -ForegroundColor White
Write-Host "   - 1-Click Desktop Bypass (no hardware required)       " -ForegroundColor White
Write-Host "   - Live Monad Testnet telemetry and Kuru/Perpl quotes  " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
