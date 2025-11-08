# Google Recorder → Whisper → Claude → Manuscript Automation

Complete setup guide for automated podcast-to-book workflow.

## Architecture Overview

```
📱 Google Recorder (Record interview)
    ↓ (auto-backup enabled)
Google Drive: /Recorder folder
    ↓ (Push notification)
n8n Webhook
    ↓
OpenAI Whisper API (Transcription)
    ↓
Save raw transcript to Drive
    ↓
Claude Desktop via Zapier MCP (Enhancement)
    ↓
Google Docs (Manuscript draft)
    ↓
Notion (Book Manuscripts database)
```

## Prerequisites

- ✅ Google Recorder app with "Back up & sync" enabled
- ✅ OpenAI API key (for Whisper transcription)
- ✅ Claude Desktop with Zapier MCP configured
- ✅ n8n instance running
- ✅ Google Drive, Google Docs, Notion integrations in n8n

## Setup Steps

### 1. Enable Google Recorder Backup

On your Android device:
1. Open Google Recorder app
2. Go to Settings → Back up & sync
3. Enable "Back up & sync"
4. Confirm recordings are syncing to Google Drive

### 2. Create Google Drive Folders

Create these folders in your Google Drive:
```
/Recorder (auto-created by Google Recorder)
/Transcripts (for raw Whisper transcripts)
/Book Drafts (for manuscript Google Docs)
```

Note the folder IDs from the URL:
- Drive folder URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

### 3. Set Up Google Drive Push Notifications

**Option A: Using n8n Google Drive Trigger (Recommended)**

n8n has a built-in Google Drive trigger that watches for new files:

1. In n8n, replace the Webhook trigger with "Google Drive Trigger"
2. Configure:
   - **Trigger on**: File Created
   - **Folder**: Select "/Recorder" folder
   - **Filter**: File type contains "audio"

**Option B: Manual Webhook Setup (Advanced)**

Follow Google's Drive Push Notifications documentation:
https://developers.google.com/drive/api/guides/push

1. Set up HTTPS endpoint (use ngrok for local testing)
2. Create watch request:
```bash
curl -X POST \
  https://www.googleapis.com/drive/v3/files/FOLDER_ID/watch \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "google-recorder-watch",
    "type": "web_hook",
    "address": "https://your-n8n-domain.com/webhook/google-drive-recorder"
  }'
```

### 4. Configure n8n Workflow

1. Import `n8n-podcast-to-manuscript-workflow.json` into n8n
2. Update these node parameters:

**Google Drive nodes:**
- Add your Google Drive credentials
- Update folder IDs:
  - `transcripts-folder-id` → Your /Transcripts folder ID
  - `book-drafts-folder-id` → Your /Book Drafts folder ID

**OpenAI Whisper node:**
- Add OpenAI API credentials
- Model: `whisper-1` (default, good quality)
- Optional: Set `language: "en"` for faster processing

**Claude Enhancement node:**
Choose one of these methods:

**Method A: Via Zapier MCP (Recommended)**
1. Create a Zapier action that calls Claude Desktop
2. Configure in n8n HTTP Request node:
```json
{
  "url": "https://mcp.zapier.com/api/mcp/mcp",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_ZAPIER_TOKEN"
  },
  "body": {
    "action": "chatgpt_openai_conversation",
    "instructions": "Use Claude Sonnet 4",
    "prompt": "{{ $json.prompt }}"
  }
}
```

**Method B: Direct OpenAI API (Alternative)**
- Use GPT-4 for manuscript enhancement
- Configure in existing OpenAI node

**Notion node:**
- Add Notion credentials
- Database ID: Your "Book Manuscripts" database
- Map properties:
  - Status → "Draft"
  - Recording Date → Current date
  - Duration → From Whisper metadata
  - Manuscript Link → Google Docs URL
  - Raw Transcript → Transcript file URL

### 5. Test the Workflow

**Manual Test:**
1. In n8n, click "Execute Workflow" manually
2. Use test data or trigger with an existing recording
3. Verify each node executes successfully

**End-to-End Test:**
1. Record a 30-second test on Google Recorder
2. Wait for sync to Google Drive (~1-2 minutes)
3. Check n8n execution log
4. Verify:
   - ✅ Raw transcript in /Transcripts
   - ✅ Manuscript draft in /Book Drafts
   - ✅ Notion page created with links

### 6. Activate Workflow

1. In n8n, set workflow to "Active"
2. The workflow will now run automatically when new recordings sync

## Usage

### Recording a Podcast Interview

1. **Start Recording**: Open Google Recorder on your phone
2. **Record Interview**: Have your conversation with Fredo
3. **Stop Recording**: Tap stop when finished
4. **Auto-Sync**: Wait 1-2 minutes for backup to complete
5. **Automated Processing**:
   - Transcription: ~2-5 minutes for 1-hour recording
   - Claude enhancement: ~3-7 minutes
   - Total: ~5-12 minutes end-to-end

6. **Review Output**:
   - Check Notion "Book Manuscripts" database
   - Open manuscript draft in Google Docs
   - Edit and refine as needed

### Estimated Costs

**For a 1-hour podcast interview:**

- OpenAI Whisper: $0.006/min × 60 = $0.36
- Claude processing (via Zapier): ~$0.10-0.50 depending on complexity
- **Total per hour**: ~$0.50

**For a 50-hour audiobook project:**
- Transcription: $18
- Claude processing: $25-50
- **Total**: ~$43-68 (vs. Turboscribe $120/month)

## Troubleshooting

### Recording not syncing
- Check Google Recorder → Settings → Back up & sync is enabled
- Verify Google Drive has available storage
- Check internet connection on phone

### Transcription fails
- Verify OpenAI API key is valid and has credits
- Check audio file format (should be .m4a or .wav)
- Review Whisper API rate limits (50 requests/min)

### Claude enhancement timeout
- For very long recordings (>2 hours), split into chunks
- Increase n8n execution timeout in Settings
- Consider using Claude's extended thinking mode

### Notion page not created
- Verify Notion database ID is correct
- Check property names match your database schema
- Ensure Notion integration has write permissions

## Advanced Enhancements

### 1. Speaker Diarization

Add speaker labels to identify who said what:

```javascript
// In Whisper API call, add:
{
  "diarize": true,
  "num_speakers": 2  // Carla + Fredo
}
```

### 2. Multi-Pass Claude Processing

Split enhancement into stages:
- Pass 1: Clean transcript (remove fillers)
- Pass 2: Convert to narrative prose
- Pass 3: Add chapter structure
- Pass 4: Final polish

### 3. Automated Chapter Detection

Use Claude to identify natural chapter breaks:

```
Prompt: "Analyze this transcript and suggest 8-12 chapter divisions based on topic shifts. For each chapter, provide:
1. Suggested chapter title
2. Page/timestamp range
3. 2-sentence summary
4. Key themes covered"
```

### 4. Fact-Checking Integration

Add a node that:
1. Extracts factual claims from transcript
2. Sends to Perplexity API for verification
3. Flags statements needing sources
4. Adds footnotes to manuscript

### 5. Email Notifications

Add Notification node at the end:

```
To: your-email@example.com
Subject: ✅ Manuscript ready: {{ $json.recordingName }}
Body:
Your manuscript draft is ready!
📄 View in Google Docs: {{ $json.manuscriptLink }}
📊 Track in Notion: {{ $json.notionLink }}
```

## Integration with Existing AAE

This workflow complements your existing AI Automation Ecosystem:

```
Claude Desktop (Coordination Hub)
├─ Zapier MCP → LLM coordination
├─ Native integrations → Notion, Drive, Gmail
└─ This workflow → Podcast processing

Claude Code (VS Code)
├─ Docker MCP → Secure development
└─ Webhook → n8n task automation

n8n (Orchestration)
├─ Podcast workflow (this)
├─ Slack integration
└─ Course generation workflows
```

## Backup & Recovery

**Automatic Backups:**
- Raw recordings: Google Drive /Recorder (permanent)
- Transcripts: Google Drive /Transcripts (permanent)
- Manuscripts: Google Drive /Book Drafts (versioned)
- Metadata: Notion database (permanent)

**Manual Recovery:**
If workflow fails mid-process:
1. Find recording in Google Drive /Recorder
2. Manually trigger n8n workflow with file ID
3. Or use Claude Desktop Zapier MCP directly

## Next Steps

Once this workflow is running smoothly:

1. **Scale up**: Record longer interviews (2-3 hours)
2. **Batch process**: Upload existing recordings for backfilling
3. **Refine prompts**: Customize Claude's enhancement instructions for your voice
4. **Add review stage**: Insert human review before final manuscript
5. **Integrate editing**: Connect to your book editor for professional polish

---

**Questions or Issues?**
Check the n8n execution logs for detailed error messages.
Most issues are related to API credentials or folder permissions.
