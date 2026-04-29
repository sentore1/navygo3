# Test AI Access for stokeoriginal@gmail.com
# PowerShell version

# Get password
$UserPassword = Read-Host "Enter password for stokeoriginal@gmail.com" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($UserPassword)
$Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

if ([string]::IsNullOrEmpty($Password)) {
    Write-Host "❌ Password is required" -ForegroundColor Red
    exit 1
}

# Authenticate
Write-Host ""
Write-Host "🔐 Authenticating user..." -ForegroundColor Cyan

$authBody = @{
    email = "stokeoriginal@gmail.com"
    password = $Password
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "https://rilhdwxirwxqfgsqpiww.supabase.co/auth/v1/token?grant_type=password" `
    -Method Post `
    -Headers @{
        "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc"
        "Content-Type" = "application/json"
    } `
    -Body $authBody

if ($null -eq $authResponse.access_token) {
    Write-Host "❌ Authentication failed" -ForegroundColor Red
    Write-Host $authResponse
    exit 1
}

Write-Host "✅ Authenticated successfully" -ForegroundColor Green
Write-Host "Token: $($authResponse.access_token.Substring(0, 30))..."

# Test AI Goal Creation
Write-Host ""
Write-Host "🤖 Testing AI goal creation..." -ForegroundColor Cyan

$aiBody = @{
    prompt = "I want to learn Spanish in 3 months"
    difficulty = "medium"
} | ConvertTo-Json

try {
    $aiResponse = Invoke-RestMethod -Uri "https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/supabase-functions-generate-ai-goal" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $($authResponse.access_token)"
            "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk3MjEsImV4cCI6MjA1ODU5NTcyMX0.d--8e7E2KzW2oeUSxe1m_i3ZPkRy-kPgww1XsKsFZFc"
            "Content-Type" = "application/json"
        } `
        -Body $aiBody

    Write-Host ""
    Write-Host "📋 Response:" -ForegroundColor Cyan
    $aiResponse | ConvertTo-Json -Depth 10

    # Analyze
    Write-Host ""
    Write-Host "🔍 Analysis:" -ForegroundColor Cyan
    Write-Host "============================================"

    if ($aiResponse.error) {
        Write-Host "❌ ERROR FOUND: $($aiResponse.error)" -ForegroundColor Red
        Write-Host ""
        
        if ($aiResponse.requiresSubscription -eq $true) {
            Write-Host "🔍 DIAGNOSIS: Subscription check failed" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "💡 ROOT CAUSE:" -ForegroundColor Yellow
            Write-Host "   The Edge Function couldn't find an active subscription."
            Write-Host "   This is most likely due to TYPE MISMATCH:"
            Write-Host "   - users.id is UUID"
            Write-Host "   - subscriptions.user_id is TEXT"
            Write-Host "   - They can't be joined, so subscription check fails"
            Write-Host ""
            Write-Host "✅ SOLUTION:" -ForegroundColor Green
            Write-Host "   Run FIX_STEP_BY_STEP.sql in Supabase SQL Editor"
            Write-Host "   This will convert subscriptions.user_id from TEXT to UUID"
        }
    }
    elseif ($aiResponse.title) {
        Write-Host "✅ SUCCESS: AI goal created!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Title: $($aiResponse.title)"
        Write-Host "📊 Milestones: $($aiResponse.milestones.Count)"
        Write-Host ""
        
        $firstMilestone = $aiResponse.milestones[0].title
        
        if ($firstMilestone -match "Step|Milestone") {
            Write-Host "⚠️  WARNING: Milestones look generic (fallback mode)" -ForegroundColor Yellow
            Write-Host "   First milestone: $firstMilestone"
            Write-Host ""
            Write-Host "💡 This means AI is disabled or API key not configured"
        }
        else {
            Write-Host "✅ Milestones look specific and relevant!" -ForegroundColor Green
            Write-Host "   First milestone: $firstMilestone"
            Write-Host ""
            Write-Host "🎉 AI goal creation is working correctly!" -ForegroundColor Green
        }
    }
}
catch {
    Write-Host "❌ Error calling AI function:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "============================================"
Write-Host "TEST COMPLETE"
Write-Host "============================================"
