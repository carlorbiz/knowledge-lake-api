# STATUS-BASED WORKFLOW GUIDE

## 🎯 Overview

The Status column (Column O) enables **automated processing** and **progress tracking** for your slides.

**Key Feature:** Set Status = "Next" or "Pending" → Script auto-processes slides!

---

## 📊 Status Values

### Recommended Status Values

| Status | Meaning | Auto-Process |
|--------|---------|--------------|
| **Pending** | Not started yet | ✅ Batch process all |
| **Next** | Ready to process | ✅ Sequential process |
| **Content Enhanced** | Column R → B, D, M done | 🔷 Auto-set by script |
| **Audio Generated** | Audio file created | 🔷 Auto-set by script |
| **Image Generated** | Image file created | 🔷 Auto-set by script |
| **Complete** | All processing done | 🔷 Auto-set by script |
| **Error** | Processing failed | ⚠️ Review needed |

---

## 🚀 AUTO-PROCESSING WORKFLOWS

### Workflow 1: Process "Next" Slides (Sequential)

**Use case:** Process slides one at a time (like n8n Workflow 4)

**Steps:**
1. Set Status = "Next" for slides you want to process
2. Menu → **🔄 Auto-Process by Status → ▶️ Process All "Next" Slides**
3. Script processes each slide sequentially
4. Status updates to "Complete" when done

**Example:**
```
Slide 1: Status = "Next"    → Processes first
Slide 2: Status = "Next"    → Processes second
Slide 3: Status = "Pending" → Skipped (not "Next")
```

**Processing per slide:**
- Enhance content (if needed)
- Generate audio
- Generate image
- Update Status → "Complete"

**Time:** ~10 seconds per slide

---

### Workflow 2: Process "Pending" Slides (Batch)

**Use case:** Process multiple slides in batch mode

**Steps:**
1. Set Status = "Pending" for slides you want to process
2. Menu → **🔄 Auto-Process by Status → 🔄 Process All "Pending" Slides**
3. Script processes all "Pending" slides
4. Status updates to "Complete" when done

**Example:**
```
Slide 1: Status = "Pending" → Processes
Slide 2: Status = "Pending" → Processes
Slide 3: Status = "Next"    → Skipped (not "Pending")
Slide 4: Status = "Pending" → Processes
```

**Same processing as "Next"** - just processes all "Pending" at once

---

### Workflow 3: Show Processing Queue

**Check what's queued for processing**

**Steps:**
1. Menu → **🔄 Auto-Process by Status → 🔍 Show Processing Queue**
2. See breakdown by status
3. View recommended actions

**Example Output:**
```
Status Breakdown:
Next:              3 slides  → ▶️ Auto-Process Sequential
Pending:          12 slides  → 🔄 Auto-Process Batch
Complete:          8 slides
Audio Generated:   2 slides
Error:             1 slide   → ⚠️ Review Errors
```

---

## 🎓 TYPICAL WORKFLOWS

### Option A: n8n Integration (Automated)

**n8n Workflow 3 populates Audio tab:**
- Slide 1: Status = "Next"
- Slides 2-12: Status = "Pending"

**Manual action:**
- Menu → Process All "Next" Slides
- (Processes Slide 1 only)

**OR:**
- Menu → Process All "Pending" Slides
- (Processes Slides 2-12)

**Advantage:** Control over which slides to process

---

### Option B: Manual Content Creation

**User creates slides manually:**
1. Fill Column R (Raw Slide Content) for 12 slides
2. Set ALL to Status = "Pending"
3. Menu → Process All "Pending" Slides
4. Wait ~2 minutes
5. All 12 slides → Status = "Complete"

**Advantage:** One-click batch processing

---

### Option C: Sequential Processing (like n8n Workflow 4)

**Replicate n8n's sequential slide processing:**
1. n8n Workflow 3 writes:
   - Slide 1: Status = "Next"
   - Slides 2-12: Status = "Pending"
2. Menu → Process All "Next" Slides
3. Slide 1 completes → Status = "Complete"
4. **Manually** set Slide 2 Status = "Next"
5. Menu → Process All "Next" Slides
6. Slide 2 completes...
7. Repeat for all slides

**Note:** Not fully automatic - requires manual status updates between slides

**Future enhancement:** Auto-advance Status = "Next" to next pending slide (not implemented yet)

---

## 🔍 STATUS TRACKING

### Manual Tracking

**Use Status to track your progress:**

```
✅ Complete     → Done, nothing to do
⏸️ Pending      → Queued for later
▶️ Next         → Process this one next
⚠️ Error        → Something went wrong
🎙️ Audio Only   → Has audio, needs image
🎨 Image Only   → Has image, needs audio
```

**Custom statuses work too!** Script only auto-processes "Next" and "Pending"

---

### Auto-Tracking

**Script automatically updates Status:**

1. **Content Enhanced** - After enhancing Column R
2. **Audio Generated** - After generating audio (if no image)
3. **Image Generated** - After generating image (if no audio)
4. **Complete** - After generating both audio + image
5. **Error** - If processing fails

**You can override these** - they're just helpful defaults

---

## 📋 DATA VALIDATION SETUP

### Recommended Setup

**In Google Sheets:**
1. Select Column O (Status)
2. Data → Data validation
3. Criteria: **List of items**
4. Items (comma-separated):
   ```
   Pending,Next,Content Enhanced,Audio Generated,Image Generated,Complete,Error
   ```
5. Show dropdown: **Yes**
6. Reject invalid input: **No** (allows custom values)

**Now you have a dropdown for easy status selection!**

---

## 🎯 USE CASES

### Use Case 1: Process One Slide at a Time

**Scenario:** Test content before processing all slides

**Workflow:**
1. Set Slide 1 Status = "Next"
2. Process → Review output → Adjust if needed
3. Set Slide 2 Status = "Next"
4. Process → Review...
5. Repeat

---

### Use Case 2: Batch Process All Slides

**Scenario:** You have 12 slides ready to go

**Workflow:**
1. Set all 12 slides Status = "Pending"
2. Menu → Process All "Pending" Slides
3. Walk away for 2-3 minutes
4. Come back → All done!

---

### Use Case 3: Selective Processing

**Scenario:** Only process slides 3, 7, and 11

**Workflow:**
1. Set Slides 3, 7, 11 Status = "Pending"
2. Menu → Process All "Pending" Slides
3. Only those 3 process

**OR:**
1. Manually select rows 3, 7, 11
2. Menu → ⚡ AUTO: Full Pipeline (selected rows only)

---

### Use Case 4: Error Recovery

**Scenario:** Some slides failed with Status = "Error"

**Workflow:**
1. Menu → Show Processing Queue
2. See "Error: 3 slides"
3. Find error slides in sheet
4. Fix issue (add missing content, check API quota, etc.)
5. Set Status = "Next" or "Pending"
6. Re-process

---

## 🔄 STATUS LIFECYCLE

### Typical Lifecycle

```
User sets:   Pending
             ↓
User action: Menu → Process Pending
             ↓
Script sets: Content Enhanced (after enhancement)
             ↓
Script sets: Audio Generated (after audio)
             ↓
Script sets: Image Generated (after image)
             ↓
Script sets: Complete (all done)
```

**OR (if enhancement not needed):**
```
User sets:   Next
             ↓
User action: Menu → Process Next
             ↓
Script sets: Complete (audio + image generated)
```

---

## 🆚 "Next" vs "Pending"

### When to Use "Next"

✅ Process one slide at a time (sequential)
✅ Test/review before processing more
✅ Replicate n8n Workflow 4 behavior
✅ Process priority slide first

### When to Use "Pending"

✅ Batch process multiple slides
✅ Queue slides for later processing
✅ Process all slides at once
✅ Set and forget

### Difference in Practice

**"Next" processing:**
- Finds all slides with Status = "Next"
- Processes them one by one
- Updates each to "Complete" as it goes

**"Pending" processing:**
- Finds all slides with Status = "Pending"
- Processes them one by one
- Updates each to "Complete" as it goes

**They're functionally the same!** The names just help you organize your queue.

---

## 💡 PRO TIPS

1. **Use "Next" for immediate processing** - Clear signal this slide is ready
2. **Use "Pending" for future batch** - Queue up multiple slides
3. **Check queue before processing** - Menu → Show Processing Queue
4. **Custom statuses work** - Add "Review", "Draft", "Approved", etc.
5. **Status is optional** - You can still use manual selection + menu items
6. **Error status helps debugging** - Script sets this when processing fails

---

## 🚨 IMPORTANT NOTES

### Auto-Processing vs Manual Selection

**Auto-processing (by Status):**
- Menu → Process All "Next" Slides
- Processes ALL slides with Status = "Next"
- Don't need to select rows

**Manual selection:**
- Select rows manually
- Menu → ▶️ STEP 2: Generate Audio
- Processes ONLY selected rows (ignores Status)

**Both work!** Use what fits your workflow.

---

### Status Updates

**Script updates Status automatically:**
- ✅ After content enhancement
- ✅ After audio generation
- ✅ After image generation
- ✅ On errors

**You can override** - Script won't fight you if you change Status manually

---

### Rate Limiting Still Applies

**Even with auto-processing:**
- 2 seconds between API requests
- 3 seconds between slides
- 1 concurrent request at a time

**This prevents API quota exhaustion**

---

## 📚 RELATED FEATURES

### Combine with Voice Selection

**Set Status + Voice together:**
1. Set Slides 1-6: Voice = "Charon", Status = "Pending"
2. Set Slides 7-12: Voice = "Aoede", Status = "Pending"
3. Process all → First 6 use Charon, last 6 use Aoede

---

### Combine with Content Enhancement

**Auto-enhancement when processing:**
1. Fill Column R (Raw Content)
2. Set Status = "Pending"
3. Process → Script auto-enhances, generates audio + images
4. Done!

**No need to run enhancement separately** - auto-processing does it all

---

## 🎉 SUMMARY

**Status column enables:**
- ✅ Automated processing based on status
- ✅ Progress tracking (what's done, what's pending)
- ✅ Queue management (what to process next)
- ✅ Error tracking (what failed)
- ✅ Selective processing (only process certain slides)

**Three new menu items:**
1. **▶️ Process All "Next" Slides** - Sequential processing
2. **🔄 Process All "Pending" Slides** - Batch processing
3. **🔍 Show Processing Queue** - View status breakdown

**Replicate n8n Workflow 4 behavior** - but with manual control!

---

*Status Workflow Guide*
*Date: 2025-10-07*
*Compatible with Audio_Tab_Complete.gs v2.1*
