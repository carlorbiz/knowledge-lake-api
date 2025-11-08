# n8n Message Trigger Templates

**Quick copy-paste node configurations for tomorrow morning**

---

## 🔧 **Option 2: Pattern Matching Node Code**

### **Add to Existing Workflow 1 as Alternative Trigger**

**Or create as separate workflow that merges into Workflow 1**

---

### **Node 1: Slack "Message Posted" Trigger**

**Settings:**
- Trigger: Message Posted to Channel
- Channel: #general (or multiple channels)
- Event: message

**No code needed - just select the event**

---

### **Node 2: IF Node - "Contains CC Command?"**

**Condition:**
- Value 1: `{{$json.text}}`
- Operation: `contains`
- Value 2: `CC -`

**Or use regex for multiple patterns:**
- Value 1: `{{$json.text}}`
- Operation: `regex`
- Value 2: `^(CC\s*-|@cc-bot)`

---

### **Node 3: Code - "Parse Bot Message"**

**Copy this code:**

```javascript
const message = $input.item.json;

// Get the text
let text = message.text || '';

// Remove trigger patterns
text = text.replace(/^CC\s*-\s*/i, '').trim();
text = text.replace(/@cc-bot\s*/i, '').trim();
text = text.replace(/^\/ai\s+cc\s*/i, '').trim();

// Get user information
const userName = message.user_name || message.user || 'bot';
const channelId = message.channel || message.channel_id;
const userId = message.user_id || message.user;

return {
  json: {
    user_id: userId,
    user_name: userName,
    command_text: text,
    channel_id: channelId,
    response_url: '', // Bot messages don't have this
    timestamp: new Date().toISOString(),
    source: 'slack_message' // Track this came from message, not slash command
  }
};
```

---

### **Node 4: Connect to "Route to Agent"**

Connect this output to your existing "Route to Agent" node.

Now you have TWO triggers feeding the same workflow:
- Slash command `/ai cc` → Webhook trigger
- Bot message "CC -" → Message trigger

---

## 📡 **Option 3: Dedicated Channel Monitor**

### **Simpler - Just Watch #cc-inbox**

---

### **Node 1: Slack "Message Posted" Trigger**

**Settings:**
- Trigger: Message Posted to Channel
- **Channel:** #cc-inbox (create this channel first!)
- Event: message

---

### **Node 2: Code - "Parse Inbox Message"**

**The ENTIRE message is the task - no prefix needed!**

```javascript
const message = $input.item.json;

// The whole message is the task
const text = message.text || '';
const userName = message.user_name || message.user || 'unknown';
const channelId = message.channel;
const userId = message.user_id || message.user;

// Optional: Parse special markers
let priority = 'normal';
let agent = 'claude-code'; // Default to CC

// Check if message specifies an agent
if (text.toLowerCase().includes('agent: fred')) agent = 'fred';
if (text.toLowerCase().includes('agent: gemini')) agent = 'gemini';

// Check for priority
if (text.toLowerCase().includes('priority: high')) priority = 'high';
if (text.toLowerCase().includes('priority: urgent')) priority = 'urgent';

return {
  json: {
    user_id: userId,
    user_name: userName,
    command_text: text,
    channel_id: channelId,
    response_url: '',
    timestamp: new Date().toISOString(),
    source: 'cc_inbox',
    priority: priority,
    agent: agent
  }
};
```

---

### **Node 3: Optional - Send Acknowledgment**

**HTTP Request to Slack:**

**Method:** POST
**URL:** `https://slack.com/api/chat.postMessage`
**Authentication:** Use your Slack OAuth credential
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "channel": "{{$json.channel_id}}",
  "text": "✅ Task received from {{$json.user_name}}. Processing...",
  "thread_ts": "{{$('Slack').item.json.ts}}"
}
```

This posts acknowledgment as a thread reply!

---

### **Node 4: Route to Agent**

Use your existing "Route to Agent" logic, but it already has the agent from parsing!

```javascript
const data = $input.item.json;

// Agent might already be specified, or detect from text
let agent = data.agent || 'claude-code';
let reasoning = '';

if (agent === 'claude-code') {
  reasoning = 'Routing to Claude Code for task processing';
}

return {
  json: {
    agent: agent,
    reasoning: reasoning,
    original_command: data.command_text,
    user_name: data.user_name,
    channel_id: data.channel_id,
    response_url: data.response_url,
    timestamp: data.timestamp,
    priority: data.priority
  }
};
```

---

## 🎯 **Quick Implementation Steps for Tomorrow:**

### **Option 3 (Easiest - Start Here!):**

1. **Create #cc-inbox** channel in Slack
2. **Invite @cc-bot** to the channel
3. **In n8n:** Add Slack trigger → "Message Posted to #cc-inbox"
4. **Add the "Parse Inbox Message" code node**
5. **Connect to your existing workflow** after the parsing step
6. **Test:** Post "test task" in #cc-inbox
7. **Configure Claude GUI/Zapier** to post to #cc-inbox

**Done in 5 minutes!** ✅

---

### **Option 2 (More Flexible):**

1. **Add new trigger** to Workflow 1: "Message Posted"
2. **Add IF node:** Check for "CC -" pattern
3. **Add "Parse Bot Message" code node**
4. **Connect to "Route to Agent"**
5. **Test:** Post "CC - test" in any channel

**Takes 10 minutes** ✅

---

## 🧪 **Test Message Formats:**

**Simple:**
```
test status check
```

**With metadata:**
```
Priority: High
Agent: claude-code

Please analyze the Gamma API documentation and report back.
```

**From Claude GUI:**
```
Update from Claude Web: MCP testing successful!

TASK FOR CC:
1. Check Gamma API docs
2. Delegate to Grok for research
3. Update Notion database
```

**All formats work!** The system is flexible. 🚀

---

**Everything is ready for tomorrow morning!** Just create #cc-inbox and add the trigger. Sweet dreams! 😴✨
