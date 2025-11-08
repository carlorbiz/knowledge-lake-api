# Fix Trigger for Agent-to-Agent Communication

## The Problem

Current trigger: **Webhook** (slash command `/ai`)
- ❌ Only humans can send slash commands
- ❌ Bots can't trigger it
- ❌ Manus/Fred/Claude GUI can't call CC

## The Solution

Replace with: **Slack Trigger** (monitors channel messages)
- ✅ Any bot or human can send
- ✅ Monitors #ai-commands channel
- ✅ Looks for specific patterns: "CC:" or "cc -" or "@CC"

---

## Step-by-Step Fix

### Step 1: Delete Current Webhook Trigger

1. Open your workflow in n8n
2. Click the **Webhook** node
3. Press Delete/Backspace
4. Confirm deletion

---

### Step 2: Add New Slack Trigger

1. Click **+ Add Node** where the webhook was
2. Search for **Slack**
3. Select **Slack Trigger**
4. Configure:

**Credentials**: Select your existing Slack OAuth credential (`n8n Railway Slack OAuth`)

**Event**: `message`

**Channel**: Select `#ai-commands` (or the channel you want to monitor)

**Options**:
- ✅ Include Bot Messages: **Yes** (critical!)
- ✅ Resolve Data: **Yes**

---

### Step 3: Update "Parse Slack Command" Node

The Slack trigger outputs different data structure than the webhook. Update the code:

**Replace entire JavaScript code with**:

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
  userName = message.bot_id; // Bot name
}

// Check if this is a CC command
const ccPatterns = [
  /^cc[:\s-]/i,           // "CC:" or "cc -" or "cc "
  /^@cc\s+/i,             // "@CC "
  /^hey cc[,\s]/i,        // "hey cc, "
  /^\/?ai\s+cc\s+/i       // "/ai cc " or "ai cc "
];

const isCCCommand = ccPatterns.some(pattern => pattern.test(text));

if (!isCCCommand) {
  // Not a CC command, skip this message
  return null;
}

// Extract the actual command after the CC trigger
let commandText = text;

// Remove the trigger prefix
for (const pattern of ccPatterns) {
  commandText = commandText.replace(pattern, '');
}

commandText = commandText.trim();

// If empty after removing prefix, skip
if (!commandText || commandText.length < 3) {
  return null;
}

// Remove fluff but keep substance
const fluffPatterns = [
  /^(hey|hi|hello|thanks|thank you|please|pls|plz)\\s*/gi,
  /\\s*(thanks|thank you|please|pls|plz|cheers)\\.?$/gi,
  /\\b(just|maybe|perhaps|possibly|now that I think of it|by the way|btw)\\b/gi,
  /\\s+(please|pls|plz)\\s+/gi,
];

// Apply cleaning
fluffPatterns.forEach(pattern => {
  commandText = commandText.replace(pattern, ' ');
});

// Clean up spaces
commandText = commandText.replace(/\\s+/g, ' ').trim();

// Extract metadata from text
let priority = 'normal';
let category = 'general';
let agent = 'claude-code'; // default

// Check for priority markers
if (/\\b(urgent|asap|critical|emergency)\\b/i.test(commandText)) {
  priority = 'high';
} else if (/\\b(low priority|when you can|no rush)\\b/i.test(commandText)) {
  priority = 'low';
}

// Check for explicit agent mentions
if (/\\bmanus\\b/i.test(commandText)) agent = 'manus';
if (/\\bfred\\b/i.test(commandText)) agent = 'fred';
if (/\\bpenny\\b/i.test(commandText)) agent = 'penny';
if (/\\bgemini\\b/i.test(commandText)) agent = 'gemini';
if (/\\bgrok\\b/i.test(commandText)) agent = 'grok';

// Categorize by content
if (/\\b(research|investigate|analyze|study)\\b/i.test(commandText)) category = 'research';
if (/\\b(create|build|generate|make)\\b/i.test(commandText)) category = 'creation';
if (/\\b(fix|bug|error|issue|problem)\\b/i.test(commandText)) category = 'debugging';
if (/\\b(document|docs|documentation|write up)\\b/i.test(commandText)) category = 'documentation';
if (/\\b(test|check|verify|validate)\\b/i.test(commandText)) category = 'testing';

// Determine if this needs document creation
const needsDocument = commandText.length > 1800;
const documentType = needsDocument ? 'long-form' : 'standard';

// Create short summary for Notion title
let summary = commandText;
if (summary.length > 100) {
  // Find first sentence or reasonable break point
  const firstPeriod = summary.indexOf('. ');
  if (firstPeriod > 0 && firstPeriod < 100) {
    summary = summary.substring(0, firstPeriod);
  } else {
    summary = summary.substring(0, 97) + '...';
  }
}

return {
  json: {
    // Core fields
    user_id: userId,
    user_name: userName,
    command_text: commandText,
    original_text: text,

    // Channel info
    channel_id: channelId,
    response_url: '', // Not available for regular messages, will need to post to channel

    // Metadata
    priority: priority,
    category: category,
    agent: agent,
    timestamp: timestamp,

    // Document handling
    needs_document: needsDocument,
    document_type: documentType,
    content_length: commandText.length,

    // Notion-ready fields
    notion_title: `${category}: ${summary}`,
    notion_status: 'Queued',
    notion_agent: agent,
    notion_priority: priority,
    notion_category: category,

    // For routing
    route_to_manus: needsDocument,
    original_command: commandText,

    // Slack message reference
    message_ts: message.ts,
    thread_ts: message.thread_ts || message.ts
  }
};
```

---

### Step 4: Update "Send a message" Node

Since we're not using slash commands, we need to post to the channel instead of using response_url.

**Update the Slack node**:

**Instead of**: Using response_url

**Use**:
- **Channel**: `={{ $('Parse Slack Command').item.json.channel_id }}`
- **Text**: Same as before
- **Thread TS** (optional): `={{ $('Parse Slack Command').item.json.thread_ts }}`

This will reply in the same thread as the original message.

---

## Trigger Patterns Supported

The workflow will now respond to any of these formats:

### From Humans:
```
CC: please check system status
cc - investigate error logs
@CC analyze the latest metrics
hey cc, can you help with deployment?
/ai cc build the new feature
```

### From Bots (Manus, Fred, Claude GUI, etc.):
```
CC: [task details from Manus]
cc - [task from Fred]
@CC [task from Claude GUI]
```

**Key**: Bots just need to post a message in #ai-commands that starts with one of these patterns!

---

## Example Bot Message from Manus

Manus can now send (via Zapier or direct Slack API):

```
CC: Research AI automation best practices for healthcare.
Analyze current market solutions, regulatory requirements,
and provide comprehensive recommendations. This is a
complex research task requiring deep analysis across
multiple dimensions including technical feasibility,
compliance, cost-benefit, and implementation timelines.
[... 2000+ characters ...]
```

The workflow will:
1. ✅ Detect the "CC:" prefix
2. ✅ Extract the command text
3. ✅ See it's > 1800 chars
4. ✅ Route to Manus Call
5. ✅ Get back documentUrl
6. ✅ Create GitHub issue
7. ✅ Reply in Slack thread
8. ✅ Log to Notion and Knowledge Lake

---

## Configuration Summary

### Slack Trigger Node:
```
Event: message
Channel: #ai-commands
Include Bot Messages: Yes
Resolve Data: Yes
Credentials: n8n Railway Slack OAuth
```

### Parse Slack Command Node:
- Updated code to handle Slack message format
- Detects CC patterns
- Filters out non-CC messages (returns null)
- Extracts command after prefix

### Send a message Node:
```
Channel: ={{ $('Parse Slack Command').item.json.channel_id }}
Thread TS: ={{ $('Parse Slack Command').item.json.thread_ts }}
Text: [same as before - handles both Manus and standard paths]
```

---

## Testing After Changes

### Test 1: Human sends CC command
```
[In #ai-commands]
CC: check system status
```

**Expected**: Workflow triggers, creates GitHub issue, replies in thread

### Test 2: Bot sends CC command

**Have Manus/Fred/Claude GUI send**:
```
CC: analyze the deployment logs from yesterday
```

**Expected**: Same behavior - workflow triggers, processes, replies

### Test 3: Non-CC message ignored
```
[In #ai-commands]
Hey everyone, how's it going?
```

**Expected**: Workflow does NOT trigger (no CC pattern)

---

## Response Format for Agents

When an agent (Manus/Fred/etc.) wants to delegate to CC, they should format like:

**Short task** (< 1800 chars):
```
CC: [concise task description]
```

**Long task** (>= 1800 chars):
```
CC: [comprehensive detailed requirements that will trigger Manus intelligent routing and document generation]
```

The workflow automatically:
- Routes short to GitHub → CC processing
- Routes long to Manus → Document generation
- Replies with status in the same thread
- Logs everything to Notion and Knowledge Lake

---

## Benefits of This Approach

✅ **Agent-to-Agent**: Any AI agent can call CC
✅ **Thread-based**: Replies keep conversation organized
✅ **Pattern matching**: Flexible trigger formats
✅ **Bot-friendly**: No slash command limitations
✅ **Audit trail**: All logged to GitHub, Notion, Knowledge Lake
✅ **Backward compatible**: Humans can still use "CC:" format

---

## Implementation Time

**Estimated**: 5 minutes
1. Delete webhook trigger (30 sec)
2. Add Slack trigger (1 min)
3. Update Parse Slack Command code (2 min)
4. Update Send a message node (1 min)
5. Test with bot message (30 sec)

---

**Ready to make the change? This enables true multi-agent coordination!** 🤖🔗🤖
