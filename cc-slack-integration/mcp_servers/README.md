# Custom MCP Servers for DocsAutomator and Gamma

This guide provides instructions for setting up and running custom MCP servers to connect Manus with DocsAutomator and Gamma.

## Project Structure

```
/home/ubuntu/mcp_servers
├── docsautomator
│   ├── main.py
│   ├── mcp.yaml
│   └── requirements.txt
├── gamma
│   ├── main.py
│   ├── mcp.yaml
│   └── requirements.txt
└── README.md
```

## Setup and Configuration

### 1. Install Dependencies

For each MCP server, navigate to its directory and install the required Python packages:

**DocsAutomator:**
```bash
cd /home/ubuntu/mcp_servers/docsautomator
pip3 install -r requirements.txt
```

**Gamma:**
```bash
cd /home/ubuntu/mcp_servers/gamma
pip3 install -r requirements.txt
```

### 2. Set API Keys

The MCP servers read API keys from environment variables. You can set them in your shell or a `.env` file.

```bash
export DOCSAUTOMATOR_API_KEY="your_docsautomator_api_key"
export GAMMA_API_KEY="your_gamma_api_key"
```

### 3. Run the MCP Servers

Run each MCP server in a separate terminal session.

**DocsAutomator:**
```bash
cd /home/ubuntu/mcp_servers/docsautomator
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Gamma:**
```bash
cd /home/ubuntu/mcp_servers/gamma
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 4. Register MCP Servers with Manus

Use the `manus-mcp-cli` to register each server:

```bash
manus-mcp-cli server add --file /home/ubuntu/mcp_servers/docsautomator/mcp.yaml
manus-mcp-cli server add --file /home/ubuntu/mcp_servers/gamma/mcp.yaml
```

Once registered, you can use the `docsautomator` and `gamma` tools in Manus.
