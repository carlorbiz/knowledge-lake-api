# Gmail Notification Implementation Guide

## Overview

Replace the "Send a message" (Slack) node with Gmail notifications to receive task confirmations via email instead of Slack.

---

## Why Gmail Instead of Slack?

**Benefits**:
- ✅ Less Slack clutter in #ai-commands
- ✅ Email provides permanent record outside Slack
- ✅ Can include richer formatting and attachments
- ✅ Easier to forward/archive task confirmations
- ✅ Better for audit trail

---

## Implementation Steps

### Step 1: Delete "Send a message" Node

1. Open workflow in n8n
2. Find the "Send a message" node (after Create Github Issue)
3. Delete it
4. **Important**: Note which node it was connected to (should be "Create Notion Entry")

---

### Step 2: Add Gmail Node

1. Click **+ Add Node** where "Send a message" was
2. Search for **Gmail**
3. Select **Gmail → Send Email**
4. Configure:

**Credentials**: Add your Gmail OAuth2 credential or Gmail service account

**Resource**: Message

**Operation**: Send

---

### Step 3: Configure Gmail Node Settings

#### To:
```
carla@carlorbiz.com.au
```
(or whatever email you want notifications sent to)

#### Subject:
```
={{ $('Format for Github').item.json.processed_by_manus
  ? '📄 Manus Created Document: ' + $('Format for Github').item.json.original_command.substring(0, 50)
  : '✅ CC Task Queued: ' + $('Format for Github').item.json.original_command.substring(0, 50) }}
```

#### Message Type: HTML

#### Message (Body):
```html
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

<h2 style="color: #2563eb;">
  {{ $('Format for Github').item.json.processed_by_manus ? '📄 Document Created' : '✅ Task Queued' }}
</h2>

<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
  <strong>Original Command:</strong><br>
  {{ $('Format for Github').item.json.original_command }}
</div>

<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">

<h3 style="color: #4b5563;">Task Details</h3>

<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="padding: 8px; width: 150px;"><strong>Agent:</strong></td>
    <td style="padding: 8px;">{{ $('Format for Github').item.json.agent }}</td>
  </tr>
  <tr>
    <td style="padding: 8px;"><strong>Category:</strong></td>
    <td style="padding: 8px;">{{ $('Format for Github').item.json.category }}</td>
  </tr>
  <tr>
    <td style="padding: 8px;"><strong>Priority:</strong></td>
    <td style="padding: 8px;">{{ $('Format for Github').item.json.priority }}</td>
  </tr>
  <tr>
    <td style="padding: 8px;"><strong>Requested By:</strong></td>
    <td style="padding: 8px;">{{ $('Format for Github').item.json.user_name }}</td>
  </tr>
  <tr>
    <td style="padding: 8px;"><strong>Timestamp:</strong></td>
    <td style="padding: 8px;">{{ $('Format for Github').item.json.timestamp }}</td>
  </tr>
</table>

<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">

{{ $('Format for Github').item.json.processed_by_manus
  ? '<h3 style="color: #059669;">🧠 Processed by Manus</h3><div style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;"><p><strong>Google Doc:</strong><br><a href="' + $('Format for Github').item.json.documentUrl + '" style="color: #2563eb; text-decoration: none;">' + $('Format for Github').item.json.documentUrl + '</a></p><p><strong>Template Used:</strong> ' + ($('Format for Github').item.json.template_used || 'Unknown') + '</p><p><strong>Reasoning:</strong> ' + ($('Format for Github').item.json.manus_reasoning || 'N/A') + '</p></div>'
  : '<h3 style="color: #7c3aed;">🤖 Queued for ' + $('Format for Github').item.json.agent + '</h3><div style="background: #ede9fe; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed;"><p>Your task has been queued and will be processed shortly. You will receive updates as work progresses.</p></div>' }}

<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">

<h3 style="color: #4b5563;">Quick Links</h3>

<ul style="list-style: none; padding: 0;">
  <li style="margin: 10px 0;">
    <a href="{{ $('Create Github Issue for CC').item.json.html_url }}"
       style="display: inline-block; padding: 10px 15px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
      📋 View GitHub Issue #{{ $('Create Github Issue for CC').item.json.number }}
    </a>
  </li>
  <li style="margin: 10px 0;">
    <a href="{{ $('Create Notion Entry').item.json.url }}"
       style="display: inline-block; padding: 10px 15px; background: #000000; color: white; text-decoration: none; border-radius: 6px;">
      📒 View Notion Entry
    </a>
  </li>
  {{ $('Format for Github').item.json.processed_by_manus
    ? '<li style="margin: 10px 0;"><a href="' + $('Format for Github').item.json.documentUrl + '" style="display: inline-block; padding: 10px 15px; background: #059669; color: white; text-decoration: none; border-radius: 6px;">📄 Open Google Doc</a></li>'
    : '' }}
</ul>

<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">

<p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
  This is an automated notification from your AI Command Centre workflow.<br>
  Workflow executed at {{ $now.toISO() }}
</p>

</body>
</html>
```

---

### Step 4: Connect Gmail Node

**Input**: From "Create Github Issue for CC"
**Output**: To "Create Notion Entry"

The Gmail node slots in between GitHub and Notion, replacing the Slack node.

---

### Step 5: Update Error Handling (Optional)

Add these settings to the Gmail node:

**On Error**: Continue
**Retry on Fail**: Yes
**Max Tries**: 2
**Wait Between Tries**: 2000ms

This ensures workflow continues even if Gmail fails (e.g., network issues).

---

## Alternative: Simple Plain Text Email

If you prefer plain text instead of HTML:

**Message Type**: Text

**Message (Body)**:
```
{{ $('Format for Github').item.json.processed_by_manus ? '📄 DOCUMENT CREATED BY MANUS' : '✅ TASK QUEUED' }}

Original Command:
{{ $('Format for Github').item.json.original_command }}

───────────────────────────────────

TASK DETAILS

Agent: {{ $('Format for Github').item.json.agent }}
Category: {{ $('Format for Github').item.json.category }}
Priority: {{ $('Format for Github').item.json.priority }}
Requested By: {{ $('Format for Github').item.json.user_name }}
Timestamp: {{ $('Format for Github').item.json.timestamp }}

───────────────────────────────────

{{ $('Format for Github').item.json.processed_by_manus
  ? '🧠 PROCESSED BY MANUS\n\nGoogle Doc: ' + $('Format for Github').item.json.documentUrl + '\n\nTemplate Used: ' + ($('Format for Github').item.json.template_used || 'Unknown') + '\n\nReasoning: ' + ($('Format for Github').item.json.manus_reasoning || 'N/A')
  : '🤖 QUEUED FOR ' + $('Format for Github').item.json.agent.toUpperCase() + '\n\nYour task has been queued and will be processed shortly. You will receive updates as work progresses.' }}

───────────────────────────────────

QUICK LINKS

GitHub Issue: {{ $('Create Github Issue for CC').item.json.html_url }}
Notion Entry: {{ $('Create Notion Entry').item.json.url }}
{{ $('Format for Github').item.json.processed_by_manus ? 'Google Doc: ' + $('Format for Github').item.json.documentUrl : '' }}

───────────────────────────────────

This is an automated notification from your AI Command Centre workflow.
Workflow executed at {{ $now.toISO() }}
```

---

## Testing

### Test 1: Standard CC Task
```
[Post in #ai-commands]
CC: check system status and report any issues
```

**Expected Gmail**:
- Subject: ✅ CC Task Queued: check system status and report any issues
- Body: Shows task details, GitHub issue link, Notion link
- Agent: claude-code
- No Manus section

---

### Test 2: Manus Document Task (from bot)
**Have Manus send**:
```
CC: [2000+ character research request about AI automation best practices]
```

**Expected Gmail**:
- Subject: 📄 Manus Created Document: [first 50 chars]
- Body: Shows Manus processing details
- Includes Google Doc link in green box
- Shows template used and reasoning

---

## Benefits of This Approach

✅ **Permanent Record**: Emails archived outside Slack
✅ **Rich Formatting**: HTML emails with color coding and structure
✅ **Direct Links**: One-click access to GitHub, Notion, Google Docs
✅ **No Slack Noise**: #ai-commands stays cleaner
✅ **Searchable**: Can search Gmail for past tasks
✅ **Forwarding**: Easy to forward confirmations to others
✅ **Mobile Friendly**: Gmail notifications on phone

---

## Workflow Architecture After Change

```
Slack Trigger (#ai-commands)
    ↓
Parse Slack Command
    ↓
Check if needs document (IF)
    ↓
[Manus Path OR Standard Path]
    ↓
Query Knowledge Lake
    ↓
Format for Github
    ↓
Create Github Issue
    ↓
📧 GMAIL (NEW) ← replaces Slack node
    ↓
Create Notion Entry
    ↓
Log to Knowledge Lake
```

**Key Change**: Gmail notification instead of Slack reply

---

## Alternative: Keep Both Slack AND Gmail

If you want notifications in BOTH places:

1. **Don't delete "Send a message" node**
2. **Add Gmail node in parallel** (not series)
3. Both nodes connect from "Create Github Issue"
4. Both nodes output to "Create Notion Entry"

This way you get:
- Slack reply in thread (for context)
- Gmail notification (for record keeping)

---

## Gmail Credential Setup

If you don't have Gmail credentials configured in n8n:

1. Go to n8n **Settings** → **Credentials**
2. Click **+ New Credential**
3. Search for **Gmail OAuth2**
4. Follow OAuth flow to authorize access
5. Select the credential in the Gmail node

**Scopes Needed**:
- `https://www.googleapis.com/auth/gmail.send`

---

## Troubleshooting

### Issue: "Could not send email"
**Fix**: Check Gmail credential is authorized and hasn't expired

### Issue: HTML not rendering
**Fix**: Ensure "Message Type" is set to "HTML" in Gmail node

### Issue: Links not working in email
**Fix**: Verify expressions have data:
```
{{ $('Create Github Issue for CC').item.json.html_url }}
{{ $('Create Notion Entry').item.json.url }}
```

### Issue: Email not received
**Fix**:
1. Check spam folder
2. Verify "To" email address is correct
3. Check Gmail API quota limits (shouldn't be an issue at your volume)

---

## Implementation Time

**Estimated**: 3 minutes
1. Delete Slack node (10 sec)
2. Add Gmail node (30 sec)
3. Configure credential (30 sec - if already exists)
4. Copy-paste HTML body (1 min)
5. Connect nodes (10 sec)
6. Test (1 min)

---

**Ready to implement? This gives you professional HTML email notifications for every AI task!** 📧✨
