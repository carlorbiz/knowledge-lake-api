# Trigger Fix - Copy & Paste Version

## Quick 3-Step Fix

### Step 1: Replace Webhook with Slack Trigger

1. **Delete** the "Webhook" node
2. **Add** → **Slack Trigger** node
3. Configure:

**Event**: `message`

**Channel**: Select `#ai-commands`

**Options**:
- ✅ **Include Bot Messages**: Yes
- ✅ **Resolve Data**: Yes

**Credentials**: `n8n Railway Slack OAuth` (your existing credential)

---

### Step 2: Update "Parse Slack Command" Code

**Replace entire JavaScript code**:

```javascript
// Handle Slack trigger message format
const message = $input.first().json;

// Extract message data
const text = message.text || '';
const userId = message.user || message.bot_id || 'unknown';
const channelId = message.channel || 'unknown';
const timestamp = message.ts || new Date().toISOString();

// Try to get user info
let userName = 'unknown';
if (message.user_profile) {
  userName = message.user_profile.real_name || message.user_profile.name || 'unknown';
} else if (message.username) {
  userName = message.username;
} else if (message.bot_id) {
  userName = message.bot_id;
}

// Check if this is a CC command
const ccPatterns = [
  /^cc[:\s-]/i,
  /^@cc\s+/i,
  /^hey cc[,\s]/i,
  /^\/?ai\s+cc\s+/i
];

const isCCCommand = ccPatterns.some(pattern => pattern.test(text));

if (!isCCCommand) {
  return null;
}

// Extract the actual command after the CC trigger
let commandText = text;

for (const pattern of ccPatterns) {
  commandText = commandText.replace(pattern, '');
}

commandText = commandText.trim();

if (!commandText || commandText.length < 3) {
  return null;
}

// Remove fluff but keep substance
const fluffPatterns = [
  /^(hey|hi|hello|thanks|thank you|please|pls|plz)\s*/gi,
  /\s*(thanks|thank you|please|pls|plz|cheers)\.?$/gi,
  /\b(just|maybe|perhaps|possibly|now that I think of it|by the way|btw)\b/gi,
  /\s+(please|pls|plz)\s+/gi,
];

fluffPatterns.forEach(pattern => {
  commandText = commandText.replace(pattern, ' ');
});

commandText = commandText.replace(/\s+/g, ' ').trim();

// Extract metadata
let priority = 'normal';
let category = 'general';
let agent = 'claude-code';

if (/\b(urgent|asap|critical|emergency)\b/i.test(commandText)) {
  priority = 'high';
} else if (/\b(low priority|when you can|no rush)\b/i.test(commandText)) {
  priority = 'low';
}

if (/\bmanus\b/i.test(commandText)) agent = 'manus';
if (/\bfred\b/i.test(commandText)) agent = 'fred';
if (/\bpenny\b/i.test(commandText)) agent = 'penny';
if (/\bgemini\b/i.test(commandText)) agent = 'gemini';
if (/\bgrok\b/i.test(commandText)) agent = 'grok';

if (/\b(research|investigate|analyze|study)\b/i.test(commandText)) category = 'research';
if (/\b(create|build|generate|make)\b/i.test(commandText)) category = 'creation';
if (/\b(fix|bug|error|issue|problem)\b/i.test(commandText)) category = 'debugging';
if (/\b(document|docs|documentation|write up)\b/i.test(commandText)) category = 'documentation';
if (/\b(test|check|verify|validate)\b/i.test(commandText)) category = 'testing';

const needsDocument = commandText.length > 1800;
const documentType = needsDocument ? 'long-form' : 'standard';

let summary = commandText;
if (summary.length > 100) {
  const firstPeriod = summary.indexOf('. ');
  if (firstPeriod > 0 && firstPeriod < 100) {
    summary = summary.substring(0, firstPeriod);
  } else {
    summary = summary.substring(0, 97) + '...';
  }
}

return {
  json: {
    user_id: userId,
    user_name: userName,
    command_text: commandText,
    original_text: text,
    channel_id: channelId,
    response_url: '',
    priority: priority,
    category: category,
    agent: agent,
    timestamp: timestamp,
    needs_document: needsDocument,
    document_type: documentType,
    content_length: commandText.length,
    notion_title: `${category}: ${summary}`,
    notion_status: 'Queued',
    notion_agent: agent,
    notion_priority: priority,
    notion_category: category,
    route_to_manus: needsDocument,
    original_command: commandText,
    message_ts: message.ts,
    thread_ts: message.thread_ts || message.ts
  }
};
```

---

### Step 3: Update "Send a message" Node

**Instead of using response_url**:

**Select Channel**:
```
={{ $('Parse Slack Command').item.json.channel_id }}
```

**Message Text** (same as before):
```
={{$('Format for Github').item.json.processed_by_manus
  ? '🧠 Manus created your document!\n\n📄 View: ' + $('Format for Github').item.json.documentUrl + '\n\nLogged to Notion and GitHub for reference.'
  : '✅ Task queued for ' + $('Format for Github').item.json.agent + '. I will notify you when complete.'}}
```

**Thread TS** (reply in thread):
```
={{ $('Parse Slack Command').item.json.thread_ts }}
```

---

## Supported Command Formats

Now ANY of these will trigger the workflow:

**From humans**:
```
CC: check system status
cc - analyze logs
@CC build new feature
hey cc, can you help?
/ai cc test deployment
ai cc review code
```

**From bots** (Manus/Fred/Claude GUI/etc.):
```
CC: [any task text]
```

---

## Test Commands

### Test 1: Short task from human
```
[Post in #ai-commands]
CC: check system status
```

### Test 2: Long task from Manus
**Tell Manus to send**:
```
CC: Research AI automation trends in healthcare. Analyze adoption rates, ROI metrics, implementation challenges, regulatory requirements, best practices, vendor comparisons, deployment models, security considerations, and provide comprehensive recommendations with sources. Include specific examples from different healthcare settings and analyze both technical and organizational aspects. [continue to 2000+ chars]
```

### Test 3: Ignored (no CC prefix)
```
[Post in #ai-commands]
Hey team, how's everyone doing?
```
(Should NOT trigger workflow)

---

## What Changed

### Before:
- Webhook trigger (slash command only)
- Only humans could trigger
- Used response_url for replies

### After:
- Slack event trigger (monitors channel)
- Humans AND bots can trigger
- Posts to channel with thread support

---

## Benefits

✅ **Agent-to-Agent**: Manus can call CC directly
✅ **Bot-friendly**: No slash command restrictions
✅ **Thread organized**: Replies stay in context
✅ **Flexible patterns**: Multiple trigger formats
✅ **Same workflow**: Everything else unchanged

---

**Implementation time: 5 minutes. Ready to enable multi-agent coordination!** 🚀
