# PromptWARS PHP Backend API Testing Script
# Tests Phase 4 AI Integration endpoints

$BASE_URL = "http://localhost:8000"
$TOKEN = ""

Write-Host "=== PromptWARS API Testing ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/" -Method Get
    Write-Host "✓ Server is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Server not responding" -ForegroundColor Red
    exit
}

# Test 2: Login (get token)
Write-Host "`n2. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $TOKEN = $response.accessToken
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "  Token: $($TOKEN.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Create a test user first!" -ForegroundColor Yellow
    exit
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# Test 3: Get Challenges
Write-Host "`n3. Testing GET /challenges..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/challenges" -Method Get -Headers $headers
    Write-Host "✓ Fetched $($response.Count) challenges" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Recommended Challenges
Write-Host "`n4. Testing GET /challenges/recommended..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/challenges/recommended" -Method Get -Headers $headers
    Write-Host "✓ Fetched $($response.Count) recommended challenges" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Generate Challenge
Write-Host "`n5. Testing POST /challenges/generate..." -ForegroundColor Yellow
$generateBody = @{
    topic = "basic-prompt-engineering"
    difficulty = "beginner"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/challenges/generate" -Method Post -Body $generateBody -Headers $headers
    Write-Host "✓ Generated challenge: $($response.title)" -ForegroundColor Green
    Write-Host "  ID: $($response.id)" -ForegroundColor Gray
    Write-Host "  Points: $($response.points)" -ForegroundColor Gray
    $CHALLENGE_ID = $response.id
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Evaluate Challenge (lazy prompt - should fail)
Write-Host "`n6. Testing POST /challenges/evaluate (lazy prompt)..." -ForegroundColor Yellow
$evaluateBody = @{
    challengeId = $CHALLENGE_ID
    userPrompt = "help"
    challengeObjective = "Test objective"
    challengeConstraints = @("constraint1", "constraint2")
    challengeScenario = "Test scenario"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/challenges/evaluate" -Method Post -Body $evaluateBody -Headers $headers
    Write-Host "✓ Evaluation completed" -ForegroundColor Green
    Write-Host "  Score: $($response.score)/100" -ForegroundColor $(if ($response.passed) { "Green" } else { "Red" })
    Write-Host "  Passed: $($response.passed)" -ForegroundColor $(if ($response.passed) { "Green" } else { "Red" })
    Write-Host "  Feedback: $($response.feedback)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Evaluate Challenge (good prompt - should pass)
Write-Host "`n7. Testing POST /challenges/evaluate (good prompt)..." -ForegroundColor Yellow
$evaluateBody = @{
    challengeId = $CHALLENGE_ID
    userPrompt = "You are an expert financial analyst. Analyze the following Federal Reserve data and provide insights on monetary policy trends. Focus on interest rate changes and their economic impact. Present your findings in a structured format with clear recommendations."
    challengeObjective = "Analyze Federal Reserve monetary policy"
    challengeConstraints = @("Use clear structure", "Provide recommendations")
    challengeScenario = "Federal Reserve policy analysis"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/challenges/evaluate" -Method Post -Body $evaluateBody -Headers $headers
    Write-Host "✓ Evaluation completed" -ForegroundColor Green
    Write-Host "  Score: $($response.score)/100" -ForegroundColor $(if ($response.passed) { "Green" } else { "Red" })
    Write-Host "  Passed: $($response.passed)" -ForegroundColor $(if ($response.passed) { "Green" } else { "Red" })
    Write-Host "  Feedback: $($response.feedback)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Get Progress
Write-Host "`n8. Testing GET /progress..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/progress" -Method Get -Headers $headers
    Write-Host "✓ Progress fetched" -ForegroundColor Green
    Write-Host "  Points: $($response.total_points)" -ForegroundColor Gray
    Write-Host "  Challenges: $($response.challenges_completed)" -ForegroundColor Gray
    Write-Host "  Level: $($response.current_level)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Get Leaderboard
Write-Host "`n9. Testing GET /leaderboard..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/leaderboard" -Method Get -Headers $headers
    Write-Host "✓ Leaderboard fetched ($($response.Count) users)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Get Profile
Write-Host "`n10. Testing GET /profile..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/profile" -Method Get -Headers $headers
    Write-Host "✓ Profile fetched" -ForegroundColor Green
    Write-Host "  Username: $($response.username)" -ForegroundColor Gray
    Write-Host "  Email: $($response.email)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 11: Playground Execute
Write-Host "`n11. Testing POST /prompt (playground)..." -ForegroundColor Yellow
$promptBody = @{
    prompt = "What is prompt engineering?"
    temperature = 0.7
    max_tokens = 100
    top_k = 40
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/prompt" -Method Post -Body $promptBody -Headers $headers
    Write-Host "✓ Prompt executed" -ForegroundColor Green
    Write-Host "  Response: $($response.response.Substring(0, [Math]::Min(100, $response.response.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- All Phase 4 endpoints tested" -ForegroundColor Gray
Write-Host "- Check results above for any failures" -ForegroundColor Gray
Write-Host "- Green ✓ = Success, Red ✗ = Failure" -ForegroundColor Gray
