# n8n Quick Start Guide for MCP Servers

**Author:** Manus AI  
**Date:** November 5, 2025

## Quick Setup Instructions

This is a simplified guide to quickly connect your n8n workflows to the DocsAutomator and Gamma MCP servers using Custom Auth credentials.

## Step 1: Create Custom Credentials in n8n

### For DocsAutomator

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for and select **HTTP Request**
3. Choose **Custom Auth** from the Authentication dropdown
4. Paste this JSON into the configuration field:

```json
{
  "headers": {
    "Authorization": "Bearer 3e634bb0-452f-46b8-9ed2-d19ba4e0c1dc",
    "Content-Type": "application/json"
  }
}
```

5. Name it **DocsAutomator API** and save

### For Gamma

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for and select **HTTP Request**
3. Choose **Custom Auth** from the Authentication dropdown
4. Paste this JSON into the configuration field:

```json
{
  "headers": {
    "X-API-KEY": "sk-gamma-O6q9C8hKRZr8yNERNEP283NZu5POux7Ya2O1HvjuE",
    "Content-Type": "application/json"
  }
}
```

5. Name it **Gamma API** and save

## Step 2: Use in Workflows

### DocsAutomator Example

Add an **HTTP Request** node with these settings:

- **Authentication**: Select your **DocsAutomator API** credential
- **Method**: `POST`
- **URL**: `http://localhost:8000/create_document` (or your MCP server URL)
- **Body Content Type**: `JSON`
- **Body**:
```json
{
  "docId": "your_automation_id",
  "documentName": "My Document",
  "data": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

### Gamma Example - Generate Presentation

Add an **HTTP Request** node with these settings:

- **Authentication**: Select your **Gamma API** credential
- **Method**: `POST`
- **URL**: `http://localhost:8001/generate` (or your MCP server URL)
- **Body Content Type**: `JSON`
- **Body**:
```json
{
  "inputText": "Create a pitch deck about sustainable energy",
  "format": "presentation",
  "numCards": 10
}
```

### Gamma Example - Check Status

Add another **HTTP Request** node:

- **Authentication**: Select your **Gamma API** credential
- **Method**: `GET`
- **URL**: `http://localhost:8001/generations/{{ $json.generationId }}`

## Step 3: Test Your Workflow

Execute your workflow and check the output. The MCP servers will return the generated document URLs or presentation links.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Ensure MCP servers are running on ports 8000 and 8001 |
| 401 Unauthorized | Verify API keys in the custom auth JSON |
| Missing generationId | Check the response from the first Gamma node |

## Next Steps

- Deploy MCP servers permanently using CloudFlare Tunnel
- Integrate with your existing n8n workflows
- Update Notion database with generated content URLs
