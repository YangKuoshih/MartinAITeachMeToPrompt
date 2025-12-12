# Testing with Ollama (Free Local AI)

## Step 1: Install Ollama

### Windows
```powershell
# Download from https://ollama.ai/download
# Or use winget
winget install Ollama.Ollama
```

### Linux/macOS
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## Step 2: Download a Model

```bash
# Recommended: Llama 2 (7B - fast, good quality)
ollama pull llama2

# Alternative: Mistral (7B - better for coding)
ollama pull mistral

# Alternative: CodeLlama (7B - specialized for code)
ollama pull codellama

# Larger model (13B - better quality, slower)
ollama pull llama2:13b
```

## Step 3: Verify Ollama is Running

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Should return list of installed models
```

## Step 4: Configure Backend

Update `backend-php/.env`:

```env
# Database config (same as before)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=promptwars
DB_USER=promptwars_user
DB_PASSWORD=your_password

# JWT config (same as before)
JWT_SECRET=your_secret_key
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=2592000

# Ollama Configuration
LITELLM_API_KEY=ollama
LITELLM_BASE_URL=http://localhost:11434/v1
LITELLM_MODEL=llama2

# App config
APP_ENV=development
APP_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Email (optional for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@promptwars.com
SMTP_FROM_NAME=PromptWARS
```

## Step 5: Start Services

### Terminal 1: Start Ollama (if not auto-started)
```bash
ollama serve
```

### Terminal 2: Start PHP Server
```bash
cd backend-php/public
php -S localhost:8000
```

### Terminal 3: Test API
```bash
# Login first
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Save the token
TOKEN="your_access_token_here"

# Test challenge generation
curl -X POST http://localhost:8000/challenges/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"topic":"basic-prompt-engineering","difficulty":"beginner"}'

# Test playground
curl -X POST http://localhost:8000/prompt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt":"Write a haiku about coding","temperature":0.7,"max_tokens":100}'
```

## Step 6: PowerShell Testing (Windows)

```powershell
# Login
$loginBody = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $login.accessToken

# Test challenge generation
$challengeBody = @{
    topic = "basic-prompt-engineering"
    difficulty = "beginner"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
}

$challenge = Invoke-RestMethod -Uri "http://localhost:8000/challenges/generate" -Method Post -Body $challengeBody -ContentType "application/json" -Headers $headers

Write-Host "Generated Challenge:" -ForegroundColor Green
$challenge | ConvertTo-Json -Depth 5

# Test playground
$promptBody = @{
    prompt = "Write a haiku about coding"
    temperature = 0.7
    max_tokens = 100
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/prompt" -Method Post -Body $promptBody -ContentType "application/json" -Headers $headers

Write-Host "`nAI Response:" -ForegroundColor Green
$response.response
```

## Model Recommendations

### For Testing (Fast)
- **llama2** (7B) - Good balance of speed and quality
- **mistral** (7B) - Better instruction following

### For Better Quality (Slower)
- **llama2:13b** (13B) - More accurate evaluations
- **mixtral** (8x7B) - Best quality, requires more RAM

### For Code-Specific Tasks
- **codellama** (7B) - Specialized for code generation
- **deepseek-coder** (6.7B) - Good for technical content

## Troubleshooting

### Issue: "Connection refused"
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve
```

### Issue: "Model not found"
```bash
# List installed models
ollama list

# Pull the model
ollama pull llama2
```

### Issue: Slow responses
- Use smaller model: `llama2` instead of `llama2:13b`
- Reduce max_tokens in requests
- Close other applications to free RAM

### Issue: Out of memory
- Use smaller model (7B instead of 13B)
- Restart Ollama: `ollama serve`
- Check available RAM: `ollama ps`

## Performance Tips

1. **Keep Ollama running** - First request loads model into memory (slow), subsequent requests are fast

2. **Use appropriate model size**:
   - 8GB RAM: llama2 (7B)
   - 16GB RAM: llama2:13b or mixtral
   - 32GB+ RAM: Any model

3. **Adjust parameters**:
   ```env
   LITELLM_MODEL=llama2  # Faster
   # vs
   LITELLM_MODEL=llama2:13b  # Better quality
   ```

## Switching to Cloud API Later

When you get an API key, just update `.env`:

```env
# Switch to OpenAI
LITELLM_API_KEY=sk-your-openai-key
LITELLM_BASE_URL=https://api.openai.com/v1
LITELLM_MODEL=gpt-4

# Or Anthropic
LITELLM_API_KEY=sk-ant-your-anthropic-key
LITELLM_BASE_URL=https://api.anthropic.com/v1
LITELLM_MODEL=claude-3-sonnet-20240229
```

No code changes needed!