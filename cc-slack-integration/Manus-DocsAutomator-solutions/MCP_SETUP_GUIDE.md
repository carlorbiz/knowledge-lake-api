# Custom MCP Server Setup Guide for DocsAutomator and Gamma

**Author:** Manus AI  
**Date:** November 5, 2025

## Overview

This guide provides comprehensive instructions for creating and deploying custom Model Context Protocol (MCP) servers that connect Manus to **DocsAutomator** and **Gamma** APIs. These MCP servers enable seamless integration of document automation and AI-powered presentation generation capabilities directly within the Manus environment.

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [DocsAutomator MCP Server](#docsautomator-mcp-server)
5. [Gamma MCP Server](#gamma-mcp-server)
6. [Deployment Options](#deployment-options)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)
9. [References](#references)

## Introduction

The Model Context Protocol (MCP) allows external services to be integrated with Manus through a standardized interface. By creating custom MCP servers for DocsAutomator and Gamma, you can leverage their powerful APIs to automate document generation and create AI-powered presentations directly from within Manus workflows.

**DocsAutomator** is a flexible no-code document automation tool based on Google Docs that natively integrates with various data sources and offers a flexible API to integrate document creation into any application. The output can be PDF or optionally a Google Doc for further editing.

**Gamma** is an AI-powered design partner that helps create professional-looking presentations, documents, and social posts quickly using AI-generated content and images. The Gamma API extends this functionality to developers and automation tools, allowing integration of Gamma's content generation capabilities into custom applications and workflows.

## Architecture Overview

The custom MCP servers act as middleware between Manus and the external APIs. Each server exposes RESTful endpoints that Manus can call through the MCP protocol, which in turn make authenticated requests to the DocsAutomator and Gamma APIs.

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| DocsAutomator MCP Server | Python (FastAPI) | 8000 | Document automation interface |
| Gamma MCP Server | Python (FastAPI) | 8001 | Presentation generation interface |
| Manus | MCP Client | N/A | Orchestrates API calls through MCP |

## Prerequisites

Before setting up the MCP servers, ensure you have the following:

1. **Python 3.11+** installed on your system
2. **API Keys** for both services:
   - DocsAutomator API Key (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - Gamma API Key (format: `sk-gamma-xxxxxxxxxxxxxxxxxxxxxxxxxx`)
3. **Access to the Manus environment** with MCP integration enabled
4. **Basic knowledge** of Python, REST APIs, and command-line operations

## DocsAutomator MCP Server

### API Capabilities

The DocsAutomator API provides the following key capabilities:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/createDocument` | POST | Generate documents from templates with dynamic data |
| `/automations` | GET | List all available automations and templates |
| `/updateAutomation` | PUT | Update automation configurations |
| `/deleteAutomation` | DELETE | Remove automations |

### Server Implementation

The DocsAutomator MCP server is implemented as a FastAPI application that wraps the DocsAutomator REST API. The server handles authentication using Bearer token authorization and provides two primary endpoints for Manus to interact with.

**Key Features:**

- **Document Creation**: Generate PDFs and Google Docs from templates with dynamic placeholder data
- **Template Management**: List and retrieve available automation templates
- **Line Items Support**: Handle dynamic tables and repeating data structures
- **Error Handling**: Comprehensive error responses with HTTP status codes

### Configuration

The server reads the API key from an environment variable `DOCSAUTOMATOR_API_KEY`. This approach ensures sensitive credentials are not hardcoded in the source code.

### Installation Steps

Navigate to the DocsAutomator server directory and install the required dependencies:

```bash
cd /home/ubuntu/mcp_servers/docsautomator
pip3 install -r requirements.txt
```

The `requirements.txt` file includes:
- `fastapi`: Modern web framework for building APIs
- `requests`: HTTP library for making API calls
- `uvicorn`: ASGI server for running FastAPI applications

### Running the Server

Start the DocsAutomator MCP server with the following command:

```bash
export DOCSAUTOMATOR_API_KEY="3e634bb0-452f-46b8-9ed2-d19ba4e0c1dc"
cd /home/ubuntu/mcp_servers/docsautomator
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will be accessible at `http://localhost:8000` and will provide two endpoints:
- `POST /create_document`: Create a new document from a template
- `GET /get_automations`: Retrieve all available automations

## Gamma MCP Server

### API Capabilities

The Gamma Generate API provides the following key capabilities:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/generations` | POST | Create presentations, documents, or social posts |
| `/generations/{id}` | GET | Poll for generation status and retrieve URLs |

### Server Implementation

The Gamma MCP server is implemented as a FastAPI application that wraps the Gamma Generate API. The server handles authentication using API key headers and provides endpoints for creating and retrieving AI-generated content.

**Key Features:**

- **Versatile Content Creation**: Generate presentations, documents, and social posts in various sizes and styles
- **AI-Powered Design**: Thoughtfully designed content with customizable themes and AI-generated images
- **Multi-Language Support**: Support for 60+ languages for global accessibility
- **Export Options**: Direct export to PDF or PPTX via API
- **Customization**: Define tone, audience, and detail level for fine-tuned output

### Configuration

The server reads the API key from an environment variable `GAMMA_API_KEY`. The API key is passed in the `X-API-KEY` header for all requests to the Gamma API.

### Installation Steps

Navigate to the Gamma server directory and install the required dependencies:

```bash
cd /home/ubuntu/mcp_servers/gamma
pip3 install -r requirements.txt
```

### Running the Server

Start the Gamma MCP server with the following command:

```bash
export GAMMA_API_KEY="sk-gamma-O6q9C8hKRZr8yNERNEP283NZu5POux7Ya2O1HvjuE"
cd /home/ubuntu/mcp_servers/gamma
uvicorn main:app --host 0.0.0.0 --port 8001
```

The server will be accessible at `http://localhost:8001` and will provide two endpoints:
- `POST /generate`: Create a new presentation, document, or social post
- `GET /generations/{generation_id}`: Get the status and URLs of a generation request

### Rate Limits

The Gamma API has the following rate limits during the beta period:
- **Pro and Ultra users**: 50 generations per hour
- **Polling recommendation**: ~5 second intervals when checking generation status

## Deployment Options

### Option 1: Local Development

For local development and testing, run the MCP servers on your local machine using the commands provided above. This approach is suitable for development and testing but requires the servers to be running whenever you want to use them with Manus.

### Option 2: CloudFlare Tunnel (Recommended)

For permanent deployment and continuous accessibility, deploy the MCP servers using CloudFlare Tunnel. This ensures the servers are always available for Manus and other AI agents without requiring manual startup.

**Benefits of CloudFlare Tunnel deployment:**

- **Continuous Availability**: Servers remain accessible 24/7 without manual intervention
- **Private Access**: Configure password protection, IP restriction, or authentication
- **No Public Indexing**: Prevent search engines from discovering the endpoints
- **Secure Tunneling**: Encrypted connection between your server and CloudFlare

**Deployment Steps:**

1. Install CloudFlare Tunnel on your server
2. Configure the tunnel to expose ports 8000 and 8001
3. Set up authentication and access controls
4. Configure the tunnel to start automatically on system boot

### Option 3: Docker Containers

For containerized deployment, create Docker images for each MCP server. This approach provides isolation, portability, and easier scaling.

**Example Dockerfile for DocsAutomator:**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY main.py .
ENV DOCSAUTOMATOR_API_KEY=""
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Usage Examples

### DocsAutomator: Create a Document

Once the MCP server is registered with Manus, you can use the `manus-mcp-cli` to create documents:

```bash
manus-mcp-cli tool call create_document --server docsautomator --input '{
  "docId": "your_doc_id",
  "documentName": "Invoice_2025_001",
  "data": {
    "customer_name": "Acme Corp",
    "invoice_number": "INV-2025-001",
    "total_amount": "1500.00",
    "line_items_1": [
      {
        "description": "Consulting Services",
        "quantity": "10",
        "price": "150.00"
      }
    ]
  }
}'
```

**Response:**

```json
{
  "pdfUrl": "https://firebasestorage.googleapis.com/...",
  "googleDocUrl": "https://docs.google.com/document/d/...",
  "savePdfGoogleDriveFolderId": "..."
}
```

### Gamma: Generate a Presentation

Use the Gamma MCP server to create an AI-powered presentation:

```bash
manus-mcp-cli tool call generate_gamma --server gamma --input '{
  "inputText": "Create a pitch deck about sustainable energy solutions for urban environments",
  "format": "presentation",
  "numCards": 12,
  "additionalInstructions": "Make the titles catchy and use a professional tone",
  "exportAs": "pdf"
}'
```

**Response:**

```json
{
  "generationId": "abc123xyz"
}
```

**Check Generation Status:**

```bash
manus-mcp-cli tool call get_generation --server gamma --input '{
  "generation_id": "abc123xyz"
}'
```

**Response:**

```json
{
  "generationId": "abc123xyz",
  "status": "completed",
  "gammaUrl": "https://gamma.app/docs/yyyyyyyyyy",
  "pdfUrl": "https://...",
  "credits": {
    "deducted": 150,
    "remaining": 3000
  }
}
```

## Troubleshooting

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Server fails to start | Port already in use | Use a different port or kill the process using the port |
| Authentication errors | Invalid API key | Verify the API key is correct and has not expired |
| Connection refused | Server not running | Ensure the MCP server is running before making requests |
| Rate limit exceeded | Too many requests | Wait for the rate limit window to reset (1 hour for Gamma) |

### Debugging Tips

Enable verbose logging in FastAPI by running the server with the `--log-level debug` flag:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug
```

Check the server logs for detailed error messages and request/response information.

### Integration with Notion and Knowledge Lake

Based on your Autonomous Agent Ecosystem (AAE) architecture, when documents are generated using DocsAutomator, the output URL should be retrieved and stored in the Notion AI Agent Universal Conversations database. A reliable method for retrieving the URL for DocsAutomator outputs is to check the folder `My Drive/Carlorbiz/Content` after the file is generated and copy the URL from there. This ensures the AAE and Knowledge Lake maintain a complete record of generated content and its location.

## References

[1]: DocsAutomator API Documentation - https://docs.docsautomator.co/integrations-api/docsautomator-api  
[2]: Gamma Generate API Documentation - https://developers.gamma.app/docs/getting-started  
[3]: Gamma API Reference - https://developers.gamma.app/reference/generate-a-gamma  
[4]: Model Context Protocol Specification - https://modelcontextprotocol.io  
[5]: FastAPI Documentation - https://fastapi.tiangolo.com
