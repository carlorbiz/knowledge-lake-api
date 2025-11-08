# GitHub Memory Point: MCP Servers and n8n Integration

**Date:** November 5, 2025  
**Topic:** Custom MCP servers for DocsAutomator and Gamma with n8n workflow integration  
**Participants:** User (Carlo), Manus AI

## Context

The user requested a complete solution for:
1. Creating custom MCP servers to connect Manus to DocsAutomator and Gamma APIs
2. Integrating these MCP servers with n8n workflows for automation

## Key Requirements

### MCP Server Integration
- **Integration Target**: Manus environment (integrated into existing Manus setup)
- **APIs**: DocsAutomator and Gamma
- **API Keys Provided**: Both DocsAutomator and Gamma API keys available
- **Deployment**: CloudFlare Tunnel recommended for permanent accessibility

### n8n Integration
- **Authentication Method**: Custom Auth credentials using JSON configuration
- **Connection Type**: HTTP Request nodes calling MCP server endpoints
- **Workflow Automation**: Trigger document and presentation generation from n8n events

## API Research Summary

### DocsAutomator API
- **Base URL**: `https://api.docsautomator.co`
- **Authentication**: Bearer token (`Authorization: Bearer {API_KEY}`)
- **Key Endpoints**:
  - `POST /createDocument`: Generate documents from templates
  - `GET /automations`: List available automations
- **API Key**: `3e634bb0-452f-46b8-9ed2-d19ba4e0c1dc`

### Gamma API
- **Base URL**: `https://public-api.gamma.app/v0.2`
- **Authentication**: API key header (`X-API-KEY: {API_KEY}`)
- **Key Endpoints**:
  - `POST /generations`: Create presentations/documents
  - `GET /generations/{id}`: Poll for status and URLs
- **API Key**: `sk-gamma-O6q9C8hKRZr8yNERNEP283NZu5POux7Ya2O1HvjuE`
- **Rate Limit**: 50 generations/hour for Pro/Ultra users

## MCP Server Implementation

### Architecture
- **DocsAutomator MCP Server**: Python FastAPI on port 8000
- **Gamma MCP Server**: Python FastAPI on port 8001
- **Technology Stack**: Python 3.11, FastAPI, Uvicorn

### File Structure
```
/home/ubuntu/mcp_servers/
├── docsautomator/
│   ├── main.py
│   ├── mcp.yaml
│   ├── requirements.txt
│   ├── n8n_credential.json
│   └── n8n_custom_auth.json
├── gamma/
│   ├── main.py
│   ├── mcp.yaml
│   ├── requirements.txt
│   ├── n8n_credential.json
│   └── n8n_custom_auth.json
├── README.md
├── N8N_INTEGRATION_GUIDE.md
└── N8N_QUICK_START.md
```

## n8n Integration Solution

### Custom Auth Credentials

The user indicated that n8n custom credentials are configured using JSON. The solution provides two approaches:

#### DocsAutomator Custom Auth JSON
```json
{
  "headers": {
    "Authorization": "Bearer 3e634bb0-452f-46b8-9ed2-d19ba4e0c1dc",
    "Content-Type": "application/json"
  }
}
```

#### Gamma Custom Auth JSON
```json
{
  "headers": {
    "X-API-KEY": "sk-gamma-O6q9C8hKRZr8yNERNEP283NZu5POux7Ya2O1HvjuE",
    "Content-Type": "application/json"
  }
}
```

### Workflow Configuration

**DocsAutomator Workflow:**
1. HTTP Request node with DocsAutomator API credential
2. POST to `http://localhost:8000/create_document`
3. JSON body with `docId`, `documentName`, and `data` fields

**Gamma Workflow:**
1. HTTP Request node to generate (POST to `/generate`)
2. Wait node (optional, for polling delay)
3. HTTP Request node to check status (GET to `/generations/{id}`)

## Integration with AAE and Knowledge Lake

### Critical Workflow for DocsAutomator
When documents are generated:
1. Retrieve the output URL from the response
2. Alternative method: Check `My Drive/Carlorbiz/Content` folder
3. Update Notion AI Agent Universal Conversations database with the URL
4. Ensures AAE and Knowledge Lake maintain complete records

### Notion Database Update
This is an essential step for the Autonomous Agent Ecosystem to track generated content and maintain the Knowledge Lake.

## Deployment Recommendations

### CloudFlare Tunnel (Recommended)
- **Purpose**: Permanent deployment for continuous accessibility
- **Configuration**: 
  - Private access with authentication
  - No public indexing (robots.txt or noindex)
  - Expose ports 8000 and 8001
- **Benefits**: 24/7 availability, secure tunneling, no manual startup

### Alternative: Docker Containers
- Containerized deployment for isolation and portability
- Easier scaling and management
- Environment variables for API keys

## Key Technical Decisions

### Why Custom Auth in n8n?
- Simpler than creating full custom nodes
- Leverages existing HTTP Request node
- JSON-based configuration is straightforward
- No TypeScript development required

### Why Separate MCP Servers?
- **Modularity**: Each service is independent
- **Maintainability**: Easier to update and debug
- **Scalability**: Can scale services independently
- **Security**: API keys isolated per service

## Deliverables

1. **DocsAutomator MCP Server**: Complete FastAPI implementation
2. **Gamma MCP Server**: Complete FastAPI implementation
3. **MCP Configuration Files**: `mcp.yaml` for each server
4. **n8n Custom Auth JSON**: Ready-to-use credential configurations
5. **Setup Guide**: Comprehensive MCP server setup documentation
6. **n8n Integration Guide**: Detailed n8n workflow configuration
7. **n8n Quick Start**: Simplified step-by-step instructions
8. **GitHub Memory Points**: Two documents for AI oversight

## Important Notes

### Security
- API keys stored as environment variables in MCP servers
- API keys hardcoded in n8n custom auth JSON (user's choice)
- Consider using n8n environment variables for production

### Rate Limits
- Gamma: 50 generations/hour
- Polling interval: ~5 seconds recommended

### Verified n8n Configuration
- Custom Auth uses JSON with `headers`, `qs`, or `body` fields
- HTTP Request node is the standard approach for API integration
- Current n8n version supports this configuration method

## Next Steps

1. Deploy MCP servers locally or via CloudFlare Tunnel
2. Create custom credentials in n8n using provided JSON
3. Build test workflows to verify integration
4. Implement Notion database update automation
5. Monitor API usage and rate limits
6. Document any workflow-specific configurations

## References

- DocsAutomator API: https://docs.docsautomator.co/integrations-api/docsautomator-api
- Gamma API: https://developers.gamma.app/docs/getting-started
- n8n Custom Auth: https://docs.n8n.io/integrations/builtin/credentials/httprequest/
