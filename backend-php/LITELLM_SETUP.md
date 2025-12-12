# LiteLLM Setup Guide

## What is LiteLLM?

LiteLLM is a unified API that lets you call 100+ LLM providers (OpenAI, Anthropic, Azure, etc.) using the OpenAI format. You only need ONE API key and can switch providers by changing the model name.

## Quick Setup

### Option 1: Use OpenAI Directly (Easiest)

1. Get OpenAI API key from https://platform.openai.com/api-keys

2. Update `.env`:
```env
LITELLM_API_KEY=sk-your-openai-key-here
LITELLM_BASE_URL=https://api.openai.com/v1
LITELLM_MODEL=gpt-4
```

### Option 2: Use Anthropic (Claude)

1. Get Anthropic API key from https://console.anthropic.com/

2. Update `.env`:
```env
LITELLM_API_KEY=sk-ant-your-anthropic-key-here
LITELLM_BASE_URL=https://api.anthropic.com/v1
LITELLM_MODEL=claude-3-sonnet-20240229
```

### Option 3: Use LiteLLM Proxy (Advanced)

LiteLLM Proxy lets you manage multiple providers, rate limiting, and caching.

1. Install LiteLLM:
```bash
pip install litellm
```

2. Create `litellm_config.yaml`:
```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: sk-your-openai-key
  - model_name: claude
    litellm_params:
      model: anthropic/claude-3-sonnet-20240229
      api_key: sk-ant-your-anthropic-key
```

3. Start proxy:
```bash
litellm --config litellm_config.yaml --port 8001
```

4. Update `.env`:
```env
LITELLM_API_KEY=anything
LITELLM_BASE_URL=http://localhost:8001
LITELLM_MODEL=gpt-4
```

## Testing Without API Key

For development/testing without an API key, you can use mock responses:

1. Update `.env`:
```env
LITELLM_API_KEY=mock
LITELLM_BASE_URL=http://localhost:8001
LITELLM_MODEL=mock
```

2. The service will return placeholder responses for testing.

## Supported Models

### OpenAI
- `gpt-4` - Most capable
- `gpt-3.5-turbo` - Faster, cheaper

### Anthropic
- `claude-3-opus-20240229` - Most capable
- `claude-3-sonnet-20240229` - Balanced
- `claude-3-haiku-20240307` - Fastest

### Azure OpenAI
```env
LITELLM_BASE_URL=https://your-resource.openai.azure.com
LITELLM_MODEL=azure/gpt-4
```

### Local Models (Ollama)
```env
LITELLM_BASE_URL=http://localhost:11434
LITELLM_MODEL=ollama/llama2
```

## Cost Estimates

### OpenAI GPT-4
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- ~$0.10 per challenge evaluation

### OpenAI GPT-3.5-Turbo
- Input: $0.0015 per 1K tokens
- Output: $0.002 per 1K tokens
- ~$0.01 per challenge evaluation

### Anthropic Claude 3 Sonnet
- Input: $0.003 per 1K tokens
- Output: $0.015 per 1K tokens
- ~$0.02 per challenge evaluation

## Troubleshooting

### Error: "AI service unavailable"
- Check API key is valid
- Verify base URL is correct
- Check internet connection
- Review logs: `tail -f /var/log/apache2/error.log`

### Error: "Rate limit exceeded"
- Wait a few minutes
- Upgrade API plan
- Use LiteLLM proxy with rate limiting

### Error: "Invalid model"
- Check model name matches provider
- Verify model is available in your region

## Next Steps

1. Get an API key from your preferred provider
2. Update `.env` with your configuration
3. Test with: `curl -X POST http://localhost:8000/challenges/generate -H "Authorization: Bearer YOUR_JWT" -d '{"topic":"basic","difficulty":"beginner"}'`