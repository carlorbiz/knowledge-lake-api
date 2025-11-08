# Claude GUI → CC Integration: 3 Trigger Options

**Problem:** Zapier posting slash commands as text doesn't trigger n8n workflows

**Solution:** Add alternative triggers that work with bot messages

---

## 🎯 **Option 2: Message Pattern Monitoring**

### **How It Works:**
- n8n watches for messages containing "CC -" or "@cc-bot"
- Works with any bot posting messages (Zapier, Claude GUI, etc.)
- Parses the message text and routes to same workflow

### **n8n Setup:**

**Create New Workflow: "CC Message Trigger"**

#### **Node 1: Slack Trigger - "New Message Posted"**
- **Trigger:** On Message Posted
- **Channel:** Select #general (or create #cc-inbox)
- **Filters:**
  - Message contains: "CC -" OR "@cc-bot"

#### **Node 2: Code - "Parse Message"**
```javascript
const message = $input.item.json;

// Extract text
let text = message.text || '';

// Remove "CC -" or "@cc-bot" prefix
text = text.replace(/^CC\s*-\s*/i, '').trim();
text = text.replace(/@cc-bot\s*/i, '').trim();

// Get user info
const userName = message.user_name || message.username || 'claude-gui';
const channelId = message.channel || message.channel_id;

return {
  json: {
    user_name: userName,
    command_text: text,
    channel_id: channelId,
    response_url: '', // Bot messages don't have response_url
    timestamp: new Date().toISOString()
  }
};
```

#### **Node 3: Merge with Existing Workflow**
- Connect to your existing "Route to Agent" node
- Now both slash commands AND bot messages trigger the workflow!

---

## 📡 **Option 3: Event API Channel Monitor**

### **How It Works:**
- Creates dedicated #cc-inbox channel
- n8n listens for ANY message posted there
- Automatic processing without needing commands

### **Slack Setup:**

1. **Create Channel:** #cc-inbox
2. **Invite CC Bot** to the channel
3. **Tell Claude GUI/Zapier** to post tasks there

### **n8n Setup:**

**Add to Existing Workflow 1 (or create parallel workflow):**

#### **Alternative Trigger: "New Message in Channel"**
- **Channel:** #cc-inbox
- **Trigger:** Message Posted

#### **Code Node: "Parse CC Inbox Message"**
```javascript
const message = $input.item.json;

// The entire message is the task
const text = message.text || '';
const userName = message.user_name || 'claude-gui';
const channelId = message.channel;

// Optional: Parse metadata from message
let metadata = {};
if (text.includes('Priority:')) {
  const priority = text.match(/Priority:\s*(\w+)/i);
  metadata.priority = priority ? priority[1] : 'normal';
}

return {
  json: {
    user_name: userName,
    command_text: text,
    channel_id: channelId,
    response_url: '',
    timestamp: new Date().toISOString(),
    metadata: metadata
  }
};
```

#### **Benefits:**
- ✅ Simple - just post to the channel
- ✅ Visible - you can see all tasks in one place
- ✅ Flexible - any bot can post there
- ✅ History - full conversation history in channel

---

## 🔄 **Option 5: Slack Workflow Builder**

### **How It Works:**
- Native Slack workflow (no n8n needed for trigger)
- Captures messages from Zapier bot
- Forwards to n8n webhook
- Most reliable for bot messages!

### **Setup in Slack:**

#### **Step 1: Create Slack Workflow**

1. In Slack, click your workspace name → **Tools** → **Workflow Builder**
2. Click **"Create Workflow"**
3. Name it: **"CC Bot Command Handler"**

#### **Step 2: Set Trigger**

**Trigger:** Message is posted to a channel
- **Channel:** #cc-inbox (or any channel)
- **Optional filter:** Only from specific users (Zapier bot)

#### **Step 3: Add Steps**

**Step 1: Send a message**
- **To:** Same channel
- **Message:** "✅ Task received, processing..."

**Step 2: Send a webhook**
- **Webhook URL:** `https://primary-production-de49.up.railway.app/webhook/ai-command`
- **Method:** POST
- **Body:**
```json
{
  "body": {
    "user_name": "{{user_name}}",
    "text": "cc {{message_text}}",
    "channel_id": "{{channel_id}}",
    "response_url": ""
  }
}
```

**Step 3: (Optional) Add reaction**
- **Emoji:** :robot_face:
- **Message:** The triggering message

#### **Step 4: Publish Workflow**

Click **"Publish"** - now it's live!

---

## 🎯 **Recommended Approach:**

**Use ALL THREE in combination!**

### **Primary: Option 3 (Dedicated Channel)**
- Create #cc-inbox
- Claude GUI/Zapier posts there
- Clean, visible, organized

### **Backup: Option 2 (Pattern Matching)**
- Catches messages in other channels
- Flexibility for ad-hoc tasks
- Works anywhere

### **Enhancement: Option 5 (Workflow Builder)**
- Native Slack reliability
- Acknowledgment messages
- Visual feedback

---

## 📋 **Tomorrow Morning Checklist:**

### **Quick Setup (10 minutes):**

1. **Create #cc-inbox channel** in Slack
2. **Add n8n trigger** for Option 3 (channel monitor)
3. **Test:** Have Claude GUI post to #cc-inbox
4. **Verify:** Task appears in GitHub

### **Full Setup (30 minutes):**

1. Set up all 3 options
2. Test each one individually
3. Configure Claude GUI/Zapier to use #cc-inbox
4. Document which method works best

---

## 🧪 **Test Commands for Tomorrow:**

**In #cc-inbox channel:**
```
CC - test basic command from channel
```

**Or with mention:**
```
@cc-bot test mention-based trigger
```

**From Claude GUI via Zapier:**
```
CC - Update from Claude Web: [your task]
```

---

## ✅ **Success Criteria:**

- ✅ Claude GUI can trigger CC tasks via Slack messages
- ✅ No slash command required
- ✅ Same workflow handles both slash commands and messages
- ✅ Full logging and tracking maintained

---

**All three options are production-ready for tomorrow morning!** 🚀
