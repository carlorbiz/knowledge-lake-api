# DocsAutomator MCP Server

FastAPI server that wraps the DocsAutomator API for use with Manus and n8n.

## Railway Deployment

1. Create new Railway project from this directory
2. Set environment variable: `DOCSAUTOMATOR_API_KEY=3e634bb0-452f-46b8-9ed2-d19ba4e0c1dc`
3. Railway will auto-detect Python and deploy using Procfile
4. Note the generated URL (e.g., `https://your-app.railway.app`)

## Endpoints

- `POST /create_document` - Create document from template
- `GET /get_automations` - List all automations

## Testing Locally

```bash
export DOCSAUTOMATOR_API_KEY="3e634bb0-452f-46b8-9ed2-d19ba4e0c1dc"
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## n8n Integration

Use HTTP Request node:
- Method: POST
- URL: `https://your-app.railway.app/create_document`
- Body: JSON with `docId`, `documentName`, `data`
