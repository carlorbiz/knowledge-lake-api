# Gamma MCP Server

FastAPI server that wraps the Gamma API for use with Manus and n8n.

## Railway Deployment

1. Create new Railway project from this directory
2. Set environment variable: `GAMMA_API_KEY=sk-gamma-O6q9C8hKRZr8yNERNEP283NZu5POux7Ya2O1HvjuE`
3. Railway will auto-detect Python and deploy using Procfile
4. Note the generated URL (e.g., `https://your-app.railway.app`)

## Endpoints

- `POST /generate` - Create presentation/document/social post
- `GET /generations/{generation_id}` - Get generation status and URLs

## Testing Locally

```bash
export GAMMA_API_KEY="sk-gamma-O6q9C8hKRZr8yNERNEP283NZu5POux7Ya2O1HvjuE"
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

## n8n Integration

Use HTTP Request node:
- Method: POST
- URL: `https://your-app.railway.app/generate`
- Body: JSON with `inputText`, `format`, `numCards`, etc.
