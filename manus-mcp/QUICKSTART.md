# Quick Start Guide - Manus MCP Server

Get up and running with the Manus MCP Server in 5 minutes!

## Prerequisites

- Python 3.10 or higher
- VSCode with Claude Code extension installed
- Basic command line knowledge

## Installation Steps

### 1. Download and Setup

```bash
# Navigate to your preferred directory
cd ~/Documents  # or wherever you want to install

# If you received this as a zip file, extract it
# Otherwise, clone from repository
# git clone <repository-url>

cd manus-mcp-server

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Test the Server

```bash
# Run the test script to verify everything works
python test_server.py
```

You should see "All tests passed! ✅" at the end.

### 3. Get the Absolute Path

```bash
# While still in the manus-mcp-server directory
pwd
```

Copy the output (e.g., `/home/username/Documents/manus-mcp-server`)

### 4. Configure Claude Code

#### Option A: VSCode Settings (Recommended)

1. Open VSCode
2. Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux) to open Settings
3. Click the "Open Settings (JSON)" icon in the top right
4. Add this configuration (replace the path with your actual path):

```json
{
  "mcp": {
    "servers": {
      "manus-task-manager": {
        "command": "python3",
        "args": [
          "/REPLACE/WITH/YOUR/ACTUAL/PATH/manus-mcp-server/manus_server.py"
        ]
      }
    }
  }
}
```

#### Option B: Workspace Settings

1. In your VSCode project, create `.vscode/mcp.json`
2. Add the configuration above

### 5. Restart VSCode

Close and reopen VSCode to load the new MCP server.

### 6. Verify in Claude Code

1. Open Claude Code in VSCode
2. Start a conversation
3. Ask: "Can you list my tasks?"

If Claude Code can see and use the `list_my_tasks` tool, you're all set! 🎉

## Quick Usage Examples

### Example 1: Assign a Task

```
You: "Create a task for Manus to build a weather dashboard with Python and Flask"

Claude Code will use the assign_task tool and give you a task ID.
```

### Example 2: Check Status

```
You: "What's the status of task abc123?"

Claude Code will use get_task_status to check.
```

### Example 3: List Tasks

```
You: "Show me all my pending tasks"

Claude Code will use list_my_tasks with status_filter="pending".
```

### Example 4: Get Results

```
You: "Get the result of task abc123"

Claude Code will use get_task_result to retrieve the output.
```

## Troubleshooting

### Server Not Found

**Problem:** Claude Code doesn't see the MCP server

**Solutions:**
1. Check the path in your configuration is correct (use absolute path)
2. Verify Python 3.10+ is installed: `python3 --version`
3. Make sure you restarted VSCode after configuration
4. Check the VSCode output panel for MCP errors

### Import Errors

**Problem:** "ModuleNotFoundError: No module named 'mcp'"

**Solution:**
```bash
cd manus-mcp-server
source venv/bin/activate
pip install -r requirements.txt
```

### Permission Errors

**Problem:** "Permission denied" when running the server

**Solution:**
```bash
chmod +x manus_server.py
```

### Wrong Python Version

**Problem:** Using Python 3.9 or earlier

**Solution:**
- Install Python 3.10 or higher
- Update your configuration to use the correct Python:
```json
{
  "command": "/usr/local/bin/python3.11",  // or wherever your Python 3.10+ is
  "args": ["..."]
}
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the [Architecture](#architecture) section to understand how it works
- Explore advanced configuration options
- Integrate with your existing workflows

## Getting Help

If you encounter issues:

1. Run the test script: `python test_server.py`
2. Check the logs in VSCode's Output panel (select "MCP" from dropdown)
3. Review the troubleshooting section in README.md
4. Verify your Python version and dependencies

## What's Next?

Now that your MCP server is running, you can:

- **Delegate complex tasks** from Claude Code to Manus
- **Monitor task progress** in real-time
- **Retrieve results** when tasks complete
- **Manage multiple tasks** with priority levels

The server runs locally and securely - no network access required for STDIO mode!

---

**Need more help?** Check the full [README.md](README.md) for comprehensive documentation.
