# Polar Sandbox + ngrok Setup Script (PowerShell)
# This script helps you set up ngrok for testing Polar payments

Write-Host "🚀 Polar Sandbox + ngrok Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok:" -ForegroundColor Yellow
    Write-Host "  1. Visit: https://ngrok.com/download"
    Write-Host "  2. Download and extract ngrok.exe"
    Write-Host "  3. Add ngrok to your PATH"
    Write-Host "  4. Run: ngrok config add-authtoken YOUR_TOKEN"
    Write-Host ""
    exit 1
}

Write-Host "✅ ngrok is installed" -ForegroundColor Green
Write-Host ""

# Check if dev server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Development server is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Development server is not running on port 3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please start your dev server first:" -ForegroundColor Yellow
    Write-Host "  npm run dev"
    Write-Host ""
    Write-Host "Then run this script again."
    exit 1
}

Write-Host ""

# Start ngrok
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop ngrok" -ForegroundColor Yellow
Write-Host ""
Write-Host "After ngrok starts:" -ForegroundColor Cyan
Write-Host "  1. Copy the https://....ngrok-free.app URL"
Write-Host "  2. Update .env.local with NEXT_PUBLIC_SITE_URL"
Write-Host "  3. Configure Polar webhook: https://sandbox.polar.sh"
Write-Host "  4. Restart your dev server"
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

ngrok http 3000
