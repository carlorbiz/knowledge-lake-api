# Carla's AI Orchestration MCP

Secure browser automation MCP that lets Claude orchestrate your AI agents (Grok, Fred, Penny, etc.) while they maintain full conversation history and memory.

## Security Features (Tier 1)

✅ **Local-Only**: stdio transport, no network exposure
✅ **No Credential Storage**: Uses your existing browser sessions
✅ **Physical Presence Required**: Only works when you're logged in locally
✅ **Domain Filtering**: Only allows whitelisted AI platforms
✅ **Rate Limiting**: Prevents abuse (20 calls/hour per agent)
✅ **Audit Logging**: Metadata only, no sensitive content

## Supported Agents

- **Grok** (X.com) - Fully implemented
- **Claude** (claude.ai) - Coming soon
- **Fred** (Google AI Studio) - Coming soon
- **Penny** (ChatGPT) - Coming soon

## Installation

### 1. Install Dependencies

```bash
cd C:\Users\carlo\Development\mem0-sync\mem0\mcp-ai-orchestration
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Build the MCP

```bash
npm run build
```

### 4. Configure Claude Code

Add to your Claude Code MCP configuration (`%APPDATA%\Claude\claude_desktop_config.json` or similar):

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

### 5. Restart Claude Code

Close and reopen VS Code or restart Claude Code to load the new MCP.

## Usage

### Ask Grok

```
Claude, please ask Grok: "What's the latest on the Aurelia AI Advisor project we've been working on?"
```

Claude will use the `ask_grok` tool, and Grok will have access to all your previous conversations about the project!

### Continue Existing Conversation

```
Claude, please continue my conversation with Grok (thread ID: abc123) and ask: "Can you elaborate on the deployment strategy?"
```

### List Recent Threads

```
Claude, show me my recent Grok conversations
```

## Configuration

Edit `src/config.ts` to customize:

```typescript
export const config = {
  browser: {
    // Your Chrome profile path
    userDataDir: 'C:\\Users\\carlo\\AppData\\Local\\Google\\Chrome\\User Data',
    profileName: 'Default', // or 'Profile 1', etc.
  },

  // Whitelist additional domains if needed
  allowedDomains: [
    'grok.x.com',
    'claude.ai',
    'aistudio.google.com',
    // Add more as needed
  ],

  // Adjust rate limits
  rateLimit: {
    maxCallsPerAgent: 20, // per hour
  }
};
```

## Security Notes

### Why This is Secure

1. **No API Keys**: Uses your existing logged-in browser sessions
2. **Local Only**: MCP runs on your machine, not accessible remotely
3. **Physical Presence**: Requires you to be logged in to your browser
4. **Domain Whitelist**: Blocks unauthorized network requests
5. **Audit Trail**: All tool calls are logged (metadata only)

### What's Logged

```json
{
  "type": "tool_call",
  "tool": "ask_grok",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "user": "carla",
  "hasThreadId": false,
  "questionLength": 45
}
```

Note: **Question content is NEVER logged**, only metadata.

### What's NOT Logged

- Question/answer content
- API keys or credentials
- Personal information
- Full URLs (only domains)

## Troubleshooting

### "Cannot find Chrome profile"

Update the `userDataDir` in `src/config.ts` to point to your actual Chrome profile:

```bash
# Find your Chrome profile
dir "%LOCALAPPDATA%\Google\Chrome\User Data"
```

### "Rate limit exceeded"

```
Claude, check my Grok rate limit status
```

Limits reset every hour. You can adjust in `config.ts`.

### "Browser automation failed"

1. Make sure you're logged into X.com in Chrome
2. Check that Chrome is using the correct profile
3. Look at logs: `logs/mcp-orchestration.log`

### DOM Selectors Out of Date

X.com may change their DOM structure. If Grok automation breaks:

1. Open an issue with error details
2. Temporarily adjust selectors in `src/agents/grok.ts`
3. We'll update the MCP

## Development

### Watch Mode

```bash
npm run dev
```

### Test with MCP Inspector

```bash
npm run inspector
```

### Add New Agent

1. Create `src/agents/your-agent.ts`
2. Implement `askYourAgent()` function
3. Add tool definition in `src/index.ts`
4. Add domain to whitelist in `src/config.ts`

## Roadmap

- [x] Grok integration
- [ ] Claude.ai integration
- [ ] Google AI Studio (Fred)
- [ ] ChatGPT (Penny)
- [ ] Automatic thread management
- [ ] Response streaming
- [ ] Screenshot capture for visual responses

## License

Private - Part of Carla's AI Automation Ecosystem (AAE)
