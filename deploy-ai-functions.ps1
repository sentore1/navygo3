# Deploy AI goal generation functions with subscription checks
Write-Host "Deploying AI goal generation functions..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Deploying supabase-functions-generate-ai-goal..." -ForegroundColor Yellow
supabase functions deploy supabase-functions-generate-ai-goal

Write-Host ""
Write-Host "2. Deploying supabase-functions-openai-goal..." -ForegroundColor Yellow
supabase functions deploy supabase-functions-openai-goal

Write-Host ""
Write-Host "✅ All AI functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "These functions now include:" -ForegroundColor White
Write-Host "  - Admin role check" -ForegroundColor Gray
Write-Host "  - Active subscription verification (Stripe or Polar)" -ForegroundColor Gray
Write-Host "  - Trial access support" -ForegroundColor Gray
Write-Host ""
Write-Host "Users without Pro access will see: 'AI goal creation requires a Pro subscription'" -ForegroundColor Yellow
