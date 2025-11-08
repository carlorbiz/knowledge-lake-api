# Railway Deployment Guide for MCP Servers

## Overview

Deploy both DocsAutomator and Gamma MCP servers to Railway as separate projects for production use with n8n.

## Step 1: Push to GitHub

Each server needs its own repository or can be in subdirectories of a monorepo.

```bash
# Option A: Separate repos (recommended)
cd mcp_servers/docsautomator
git init
git add .
git commit -m "Initial DocsAutomator MCP server"
# Create repo on GitHub, then:
git remote add origin https://github.com/carlorbiz/docsautomator-mcp.git
git push -u origin main

cd ../gamma
git init
git add .
git commit -m "Initial Gamma MCP server"
# Create repo on GitHub, then:
git remote add origin https://github.com/carlorbiz/gamma-mcp.git
git push -u origin main
```

## Step 2: Deploy DocsAutomator MCP to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `carlorbiz/docsautomator-mcp` (or your repo name)
5. Railway will auto-detect Python and use the Procfile
6. Add environment variable:
   - Key: `DOCSAUTOMATOR_API_KEY`
   - Value: `3e634bb0-452f-46b8-9ed2-d19ba4e0c1dc`
7. Click "Deploy"
8. Once deployed, go to "Settings" > "Networking" > "Generate Domain"
9. Copy the URL (e.g., `https://docsautomator-mcp-production.up.railway.app`)

## Step 3: Deploy Gamma MCP to Railway

1. Click "New Project" again
2. Select "Deploy from GitHub repo"
3. Choose `carlorbiz/gamma-mcp` (or your repo name)
4. Railway will auto-detect Python and use the Procfile
5. Add environment variable:
   - Key: `GAMMA_API_KEY`
   - Value: `sk-gamma-O6q9C8hKRZr8yNERNEP283NZu5POux7Ya2O1HvjuE`
6. Click "Deploy"
7. Generate domain and copy URL

## Step 4: Test the Endpoints

### Test DocsAutomator MCP

```bash
curl -X POST "https://your-docsautomator-url.railway.app/create_document" \
  -H "Content-Type: application/json" \
  -d '{
    "docId": "68d7b000c2fc16ccc70abdac",
    "documentName": "Test Document",
    "data": {
      "document_title": "Test Title",
      "main_content": "This is a test document"
    }
  }'
```

### Test Gamma MCP

```bash
curl -X POST "https://your-gamma-url.railway.app/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "inputText": "Create a presentation about AI automation",
    "format": "presentation",
    "numCards": 8
  }'
```

## Step 5: Update n8n Workflows

Once deployed, update your n8n workflow to call the Railway URLs instead of localhost.

### n8n HTTP Request Node Configuration

**For DocsAutomator:**
- Method: POST
- URL: `https://your-docsautomator-url.railway.app/create_document`
- Body: JSON
```json
{
  "docId": "{{$json.docId}}",
  "documentName": "{{$json.title}}",
  "data": {
    "document_title": "{{$json.title}}",
    "main_content": "{{$json.content}}"
  }
}
```

**For Gamma:**
- Method: POST
- URL: `https://your-gamma-url.railway.app/generate`
- Body: JSON
```json
{
  "inputText": "{{$json.prompt}}",
  "format": "presentation",
  "numCards": 12
}
```

## Monitoring

Railway provides:
- Real-time logs
- Metrics (CPU, memory, network)
- Automatic HTTPS
- Custom domains (if needed)

Access logs: Project > Deployments > Click on deployment > Logs

## Cost

Railway free tier includes:
- $5 credit per month
- 3 projects
- 512MB RAM per service
- Should be sufficient for these lightweight MCP servers

## Troubleshooting

**If deployment fails:**
1. Check Railway logs for errors
2. Verify environment variables are set
3. Ensure requirements.txt is in root directory
4. Check that Procfile or railway.json exists

**If endpoints return errors:**
1. Check Railway logs for API errors
2. Verify API keys are correct
3. Test the underlying APIs directly (DocsAutomator, Gamma)
4. Check request payload format
