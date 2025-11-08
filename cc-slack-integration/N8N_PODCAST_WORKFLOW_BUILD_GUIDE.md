# n8n Podcast-to-Manuscript Workflow - Build Guide

**Build this workflow manually in n8n UI for best compatibility**

## Overview

This workflow automatically converts Google Recorder audio files into polished manuscript drafts.

**Flow:**
```
Google Drive Trigger → Download Audio → Whisper Transcription → Save Transcript → Claude Enhancement → Google Doc → Notion Entry
```

**Estimated build time:** 15-20 minutes

---

## Prerequisites Checklist

Before you start, have these ready:

- [ ] Google Drive folder ID for `/Recorder` (auto-created by Google Recorder app)
- [ ] Google Drive folder ID for `/Transcripts` (create this manually)
- [ ] Google Drive folder ID for `/Book Drafts` (create this manually)
- [ ] OpenAI API key: `sk-proj-[REDACTED]`
- [ ] Notion Database ID for "Book Manuscripts" database
- [ ] n8n running and accessible

---

## Step 1: Create New Workflow

1. Open n8n at `http://localhost:5678`
2. Click **+ New Workflow**
3. Name it: `Podcast to Manuscript (Recorder → Whisper → Claude)`
4. Save the empty workflow

---

## Step 2: Add Google Drive Trigger Node

**This watches your /Recorder folder for new audio files**

1. Click **Add first step** → Search for "Google Drive Trigger"
2. Select **Google Drive Trigger** node
3. Configure:
   - **Trigger On**: `File Created`
   - **Drive**: Select your Google Drive (you'll need to authenticate)
   - **Folder**: Browse to `/Recorder` folder (or paste folder ID)
   - **Options** → **Simple**: Enable this
   - **Watch** → Add condition:
     - **Field**: `mimeType`
     - **Condition**: `contains`
     - **Value**: `audio`

4. **Add Google Drive Credentials:**
   - Click **Select Credential** → **+ Create New**
   - Choose **OAuth2** authentication
   - Click **Connect my account**
   - Sign in with your Google account
   - Grant permissions
   - Test and Save

5. **Test the trigger:**
   - Click **Listen for Test Event**
   - Upload a test audio file to your Google Drive /Recorder folder
   - You should see the file appear in the trigger output

6. Position this node at the left side of canvas

---

## Step 3: Add Google Drive Download Node

**Downloads the audio file that triggered the workflow**

1. Click the **+** button on the trigger node
2. Search for "Google Drive"
3. Select **Google Drive** node (not trigger)
4. Configure:
   - **Resource**: `File`
   - **Operation**: `Download`
   - **File ID**: Click in field → Select **Expression** tab → Enter:
     ```
     {{ $json.id }}
     ```
   - **Options**: Leave default

5. Credentials: Select same Google Drive credential from Step 2
6. Connect this node to the trigger node

---

## Step 4: Add Filter Node (Audio Files Only)

**Extra safety to ensure only audio files proceed**

1. Click **+** on Google Drive Download node
2. Search for "IF"
3. Select **IF** node
4. Configure:
   - **Conditions**:
     - Click **Add Condition** → **String**
     - **Value 1**: Click expression → Enter:
       ```
       {{ $json.mimeType }}
       ```
     - **Operation**: `Contains`
     - **Value 2**: `audio`

5. We'll only use the **true** output (green dot)
6. Rename node to: `Filter: Audio Only`

---

## Step 5: Add OpenAI Whisper Node

**Transcribes the audio file**

1. Click **+** on the IF node's **true** output
2. Search for "HTTP Request"
3. Select **HTTP Request** node
4. Configure:
   - **Method**: `POST`
   - **URL**: `https://api.openai.com/v1/audio/transcriptions`
   - **Authentication**: `Generic Credential Type`
   - **Generic Auth Type**: `Header Auth`

5. **Set up Authentication:**
   - Click **Credential for Header Auth** → **+ Create New**
   - **Name**: `Authorization`
   - **Value**: `Bearer sk-proj-[REDACTED]`
   - Save credential

6. **Configure Request Body:**
   - **Send Body**: Enable ✅
   - **Body Content Type**: `Multipart/Form-Data`
   - **Specify Body** → **Using Fields**
   - Add these parameters:

   **Parameter 1:**
   - Name: `file`
   - Input Data Field Name: `data`

   **Parameter 2:**
   - Name: `model`
   - Value: `whisper-1`

   **Parameter 3:**
   - Name: `language`
   - Value: `en`

   **Parameter 4:**
   - Name: `response_format`
   - Value: `verbose_json`

7. Rename node to: `Whisper: Transcribe Audio`

---

## Step 6: Add Code Node (Extract Transcript)

**Prepares the transcript data for saving**

1. Click **+** on Whisper node
2. Search for "Code"
3. Select **Code** node
4. Configure:
   - **Mode**: `Run Once for All Items`
   - **Language**: `JavaScript`
   - **Code**:
   ```javascript
   // Extract transcript from Whisper response
   const whisperOutput = $input.all()[0].json;

   return [{
     json: {
       transcript: whisperOutput.text,
       duration: whisperOutput.duration,
       language: whisperOutput.language,
       fileName: $('Google Drive').item.json.name
     }
   }];
   ```

5. Rename node to: `Extract Transcript Data`

---

## Step 7: Add Google Drive Create Text File Node

**Saves raw transcript to /Transcripts folder**

1. Click **+** on Extract Transcript Data node
2. Search for "Google Drive"
3. Select **Google Drive** node
4. Configure:
   - **Resource**: `File`
   - **Operation**: `Upload`
   - **Drive**: Select your drive
   - **Folder**: Browse to `/Transcripts` folder (or paste folder ID)
   - **File Name**: Click expression tab → Enter:
     ```
     {{ $json.fileName.replace('.m4a', '').replace('.wav', '') }}-transcript.txt
     ```
   - **Binary Data**: Toggle OFF (we're creating from text)
   - **File Content** → Click expression → Enter:
     ```
     Recording: {{ $json.fileName }}
     Duration: {{ Math.round($json.duration / 60) }} minutes
     Language: {{ $json.language }}

     ---

     {{ $json.transcript }}
     ```

5. Credentials: Use same Google Drive credential
6. Rename node to: `Save Raw Transcript`

---

## Step 8: Add Set Node (Prepare for Claude)

**Organizes data for Claude enhancement**

1. Click **+** on Save Raw Transcript node
2. Search for "Edit Fields (Set)"
3. Select **Edit Fields (Set)** node
4. Configure - Add these assignments:

   **Assignment 1:**
   - **Name**: `recordingName`
   - **Value** (expression):
     ```
     {{ $('Extract Transcript Data').item.json.fileName }}
     ```

   **Assignment 2:**
   - **Name**: `transcript`
   - **Value** (expression):
     ```
     {{ $('Extract Transcript Data').item.json.transcript }}
     ```

   **Assignment 3:**
   - **Name**: `duration`
   - **Value** (expression):
     ```
     {{ $('Extract Transcript Data').item.json.duration }}
     ```

   **Assignment 4:**
   - **Name**: `transcriptFileUrl`
   - **Value** (expression):
     ```
     {{ $('Save Raw Transcript').item.json.webViewLink }}
     ```

5. Rename node to: `Prepare for Claude`

---

## Step 9A: Add Claude Enhancement Node (Option 1 - Direct OpenAI)

**Uses GPT-4 to enhance transcript into manuscript**

*Note: This uses GPT-4 instead of Claude. For actual Claude, see Option 2 below.*

1. Click **+** on Prepare for Claude node
2. Search for "HTTP Request"
3. Select **HTTP Request** node
4. Configure:
   - **Method**: `POST`
   - **URL**: `https://api.openai.com/v1/chat/completions`
   - **Authentication**: Use same Header Auth credential from Step 5
   - **Send Body**: Enable ✅
   - **Body Content Type**: `JSON`
   - **Specify Body**: `Using JSON`
   - **JSON**:
   ```json
   {
     "model": "gpt-4o",
     "messages": [
       {
         "role": "system",
         "content": "You are an expert book editor specializing in transforming podcast interviews into compelling manuscript drafts. You excel at maintaining authentic voice while elevating conversational content to publication-ready prose."
       },
       {
         "role": "user",
         "content": "=TRANSCRIPT TO ENHANCE:\n\nRecording: {{ $json.recordingName }}\nDuration: {{ Math.round($json.duration / 60) }} minutes\n\n---\n\n{{ $json.transcript }}\n\n---\n\nPlease perform the following tasks:\n\n1. CLEAN THE TRANSCRIPT:\n   - Remove filler words (um, uh, like, you know, etc.)\n   - Fix grammar and punctuation\n   - Correct obvious transcription errors\n   - Maintain speaker intent and meaning\n\n2. CONVERT TO NARRATIVE PROSE:\n   - Transform conversational dialogue into flowing narrative\n   - Maintain first-person perspective (Carla's voice)\n   - Preserve key insights and anecdotes from Fredo\n   - Add paragraph breaks for readability\n\n3. IDENTIFY CHAPTER STRUCTURE:\n   - Suggest logical chapter breaks based on topic shifts\n   - Provide chapter titles\n   - Note any sections that need further development\n\n4. ADD CONTEXT:\n   - Where Fredo references acronyms or jargon, add brief clarifications\n   - Flag any statements that need fact-checking\n   - Suggest areas where more detail would enhance the narrative\n\nOutput the enhanced manuscript draft ready for book publication."
       }
     ],
     "temperature": 0.7,
     "max_tokens": 4000
   }
   ```

5. Rename node to: `GPT-4: Enhance to Manuscript`

---

## Step 9B: Add Claude Enhancement Node (Option 2 - Via Zapier MCP)

**Alternative: Use Claude Desktop via Zapier MCP**

*Only use this if you want actual Claude instead of GPT-4*

1. Click **+** on Prepare for Claude node
2. Search for "HTTP Request"
3. Select **HTTP Request** node
4. Configure:
   - **Method**: `POST`
   - **URL**: `https://mcp.zapier.com/api/mcp/mcp`
   - **Authentication**: `Generic Credential Type`
   - **Generic Auth Type**: `Header Auth`

5. **Set up Zapier Auth:**
   - Click **+ Create New Credential**
   - **Name**: `Authorization`
   - **Value**: `Bearer ZTJkYTY2OTctMTAyZC00MmE2LWI2YWItN2Q4NWMzYWQ0OWNhOmQwMDI0NGIxLWE0MGEtNGI1NS1hMmUzLTUxZTNkM2QyYWU2MA==`
   - Save

6. **Configure Body:**
   - **Send Body**: Enable ✅
   - **Body Content Type**: `JSON`
   - **Specify Body**: `Using JSON`
   - **JSON**:
   ```json
   {
     "action": "chatgpt_openai_conversation",
     "instructions": "Use Claude Sonnet 4",
     "user_message": "=TRANSCRIPT TO ENHANCE:\n\nRecording: {{ $json.recordingName }}\nDuration: {{ Math.round($json.duration / 60) }} minutes\n\n---\n\n{{ $json.transcript }}\n\n---\n\nPlease perform the following tasks:\n\n1. CLEAN THE TRANSCRIPT:\n   - Remove filler words (um, uh, like, you know, etc.)\n   - Fix grammar and punctuation\n   - Correct obvious transcription errors\n   - Maintain speaker intent and meaning\n\n2. CONVERT TO NARRATIVE PROSE:\n   - Transform conversational dialogue into flowing narrative\n   - Maintain first-person perspective (Carla's voice)\n   - Preserve key insights and anecdotes from Fredo\n   - Add paragraph breaks for readability\n\n3. IDENTIFY CHAPTER STRUCTURE:\n   - Suggest logical chapter breaks based on topic shifts\n   - Provide chapter titles\n   - Note any sections that need further development\n\n4. ADD CONTEXT:\n   - Where Fredo references acronyms or jargon, add brief clarifications\n   - Flag any statements that need fact-checking\n   - Suggest areas where more detail would enhance the narrative\n\nOutput the enhanced manuscript draft ready for book publication."
   }
   ```

7. Rename node to: `Claude: Enhance to Manuscript`

**Choose either 9A or 9B**, not both!

---

## Step 10: Add Google Docs Create Node

**Creates the manuscript document**

1. Click **+** on your enhancement node (9A or 9B)
2. Search for "Google Docs"
3. Select **Google Docs** node
4. Configure:
   - **Resource**: `Document`
   - **Operation**: `Create`
   - **Title**: Click expression → Enter:
     ```
     {{ $('Prepare for Claude').item.json.recordingName.replace('.m4a', '').replace('.wav', '') }} - Manuscript Draft
     ```
   - **Body**: Click expression → Enter:

     **If using GPT-4 (9A):**
     ```
     {{ $json.choices[0].message.content }}
     ```

     **If using Claude/Zapier (9B):**
     ```
     {{ $json.response }}
     ```

   - **Options** → **Folder**:
     - **Folder Type**: `ID`
     - **Folder ID**: Your `/Book Drafts` folder ID

5. **Add Google Docs Credentials:**
   - Click **Select Credential** → **+ Create New**
   - **Authentication**: `OAuth2`
   - Click **Connect my account**
   - Sign in and grant permissions
   - Save

6. Rename node to: `Create Google Doc Manuscript`

---

## Step 11: Add Notion Create Database Page Node

**Links manuscript to Notion database**

1. Click **+** on Create Google Doc node
2. Search for "Notion"
3. Select **Notion** node
4. Configure:
   - **Resource**: `Database Page`
   - **Operation**: `Create`
   - **Database**: Select your "Book Manuscripts" database (or paste ID)
   - **Title**: Click expression → Enter:
     ```
     {{ $('Prepare for Claude').item.json.recordingName.replace('.m4a', '').replace('.wav', '') }}
     ```

5. **Add Custom Properties** (adjust based on your database schema):

   **Property 1: Status (Select)**
   - Key: `Status`
   - Value: `Draft`

   **Property 2: Recording Date (Date)**
   - Key: `Recording Date`
   - Value (expression):
     ```
     {{ $now.toISO() }}
     ```

   **Property 3: Duration (Number)**
   - Key: `Duration (min)`
   - Value (expression):
     ```
     {{ Math.round($('Prepare for Claude').item.json.duration / 60) }}
     ```

   **Property 4: Manuscript Link (URL)**
   - Key: `Manuscript Link`
   - Value (expression):
     ```
     {{ $('Create Google Doc Manuscript').item.json.documentId }}
     ```

   **Property 5: Raw Transcript (URL)**
   - Key: `Raw Transcript`
   - Value (expression):
     ```
     {{ $('Prepare for Claude').item.json.transcriptFileUrl }}
     ```

6. **Add Notion Credentials:**
   - Click **+ Create New Credential**
   - Go to https://www.notion.so/my-integrations
   - Create new integration
   - Copy Internal Integration Token
   - Paste in n8n
   - Save
   - **Important**: Share your "Book Manuscripts" database with this integration in Notion!

7. Rename node to: `Create Notion Entry`

---

## Step 12: Add Optional Notification Node

**Sends you a notification when complete**

1. Click **+** on Create Notion Entry node
2. Choose your preferred notification method:

**Option A: No Operation (just log completion)**
- Search for "No Op"
- Add a label: "✅ Manuscript Complete"

**Option B: Email notification**
- Search for "Send Email"
- Configure with your email settings

**Option C: Slack notification**
- Search for "Slack"
- Send message to yourself

3. Rename to: `Completion Notification`

---

## Step 13: Save and Test

1. **Save the workflow** - Click **Save** button (top right)

2. **Activate the workflow** - Toggle the switch to **Active**

3. **Test end-to-end:**
   - Record a 30-second test message on Google Recorder
   - Wait 1-2 minutes for sync to Google Drive
   - Watch the workflow execute in n8n
   - Check the execution log for any errors

4. **Verify outputs:**
   - [ ] Raw transcript in `/Transcripts` folder
   - [ ] Manuscript doc in `/Book Drafts` folder
   - [ ] Notion page created with all links

---

## Troubleshooting

### Workflow doesn't trigger
- Check Google Drive Trigger is listening
- Verify file is syncing to correct /Recorder folder
- Check file MIME type contains "audio"

### Whisper API fails
- Verify OpenAI API key is correct
- Check you have API credits available
- Ensure audio file is supported format (m4a, wav, mp3)

### Claude/GPT enhancement timeout
- For recordings >1 hour, increase node timeout
- Or split into chunks in Code node before enhancement

### Notion page creation fails
- Verify integration is shared with database
- Check all property names match your database schema
- Ensure required fields are populated

### Google Docs creation fails
- Check folder ID is correct
- Verify Google Docs credentials have write permission
- Make sure you have storage space in Drive

---

## Cost Estimates

**For a 1-hour podcast recording:**
- Whisper transcription: $0.36
- GPT-4 enhancement: ~$0.20-0.50
- **Total per hour**: ~$0.50-$0.85

**Much cheaper than Turboscribe annual plan for moderate usage!**

---

## Next Steps

Once this workflow is working:

1. **Customize enhancement prompt** - Adjust Step 9 to match your writing style
2. **Add speaker diarization** - Use `whisper-1` with speaker labels
3. **Multi-pass enhancement** - Add multiple Claude/GPT nodes for deeper editing
4. **Chapter detection** - Add Code node to split long transcripts
5. **Fact-checking** - Add Perplexity node to verify claims

---

**Questions?** Check n8n execution logs for detailed error messages!
