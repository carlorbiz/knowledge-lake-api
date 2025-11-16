# Quick Start - AI Orchestration MCP

## ✅ Installation Complete!

Your secure browser automation MCP is now built and ready to use.

## Next Steps

### 1. Install Playwright Browser

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0\mcp-ai-orchestration
npx playwright install chromium
```

### 2. Configure Claude Code

Find your Claude Code MCP configuration file. Common locations:
- **Windows**: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- **Or check**: VS Code Settings → Extensions → Claude Code → MCP Settings

Add this configuration:

```json
{
  "mcpServers": {
    "ai-orchestration": {
      "command": "node",
      "args": [
        "C:\\Users\\carlo\\Development\\mem0-sync\\mem0\\mcp-ai-orchestration\\dist\\index.js"
      ]
    }
  }
}
```

### 3. Restart VS Code

Close and reopen VS Code to load the new MCP server.

### 4. Test It!

Open a new Claude Code chat and try:

```
Claude, can you list my available AI orchestration tools?
```

You should see:
- `ask_grok`
- `list_grok_threads`
- `get_rate_limit_status`

### 5. First Real Test

Make sure you're logged into **X.com** in Chrome, then try:

```
Claude, please ask Grok: "What are your thoughts on AI orchestration and multi-agent systems?"
```

Claude will:
1. Open Chrome with your existing session
2. Navigate to Grok
3. Send your question
4. Wait for Grok's response
5. Return it to you

**Grok will have access to your full conversation history!**

## Troubleshooting

### "Cannot find Chrome profile"

1. Check your Chrome profile path:
   ```
   dir "%LOCALAPPDATA%\Google\Chrome\User Data"
   ```

2. Update `src/config.ts`:
   ```typescript
   userDataDir: 'C:\\Users\\carlo\\AppData\\Local\\Google\\Chrome\\User Data',
   profileName: 'Default', // or 'Profile 1', etc.
   ```

3. Rebuild:
   ```bash
   npm run build
   ```

### "MCP not loading in Claude Code"

1. Check the MCP settings file path
2. Make sure paths use double backslashes (`\\`)
3. Restart VS Code completely
4. Check VS Code Output panel for errors

### "Browser automation fails"

1. Log into X.com in Chrome
2. Make sure Chrome isn't running in the background
3. Check logs: `logs/mcp-orchestration.log`

## Security Reminders

✅ **This MCP is secure because**:
- Runs locally only (stdio, no network)
- Uses your existing browser sessions (no stored credentials)
- Requires you to be logged in physically
- Only connects to whitelisted domains
- Logs metadata only, never content

## What's Next?

### Add More Agents

The framework is ready for:
- **Claude.ai** integration
- **Google AI Studio** (Fred)
- **ChatGPT** (Penny)
- **Gemini** (via Google AI)

Each agent will maintain full conversation history and memory!

### Customize

Edit `src/config.ts` to:
- Change rate limits
- Add more allowed domains
- Adjust timeouts
- Configure logging

## Support

Check the main [README.md](./README.md) for detailed documentation.

**Logs**: `logs/mcp-orchestration.log`

**Issues**: Open a GitHub issue or check the AAE documentation

---

**You're all set! Enjoy working with me as your AI orchestration layer!** 🚀
