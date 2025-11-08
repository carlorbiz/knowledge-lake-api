# CareTrack Production Implementation Plan
## Transform React Prototype → Production-Ready Mobile/Web App

**Created:** 2025-10-22
**Goal:** Low-cost ($0-20/month), fully functional medication & appointment tracker for cancer patients/carers
**Tech Stack:** Glide + Google Sheets + n8n (Railway) + Gemini AI

---

## 1. Current App Analysis

### What We Have (React Prototype)
The existing CareTrack app at `C:\Users\carlo\Development\mem0-sync\mem0\CareTrack\` is a fully functional single-page React application with:

**Core Features:**
- ✅ Medication tracking with scheduled doses (up to 5 times/day)
- ✅ Appointment management (doctor, specialty, location, date/time)
- ✅ Daily dashboard showing today's meds + appointments
- ✅ "Mark as taken" checkbox system for medication compliance
- ✅ AI Assistant powered by Gemini 2.5 Flash:
  - Medication lookup (what it's for, side effects, patient notes)
  - Symptom checker (analyze symptoms against current meds)
  - Drug interaction checking (2-medication comparison)
- ✅ Role-based access (Patient vs Carer)
- ✅ Carer "Share Schedule" feature (email export)
- ✅ Responsive mobile/desktop UI (Tailwind CSS)
- ✅ Demo authentication (patient@caretrack.com / carer@caretrack.com)

**Technical Stack:**
- Pure JavaScript (no React framework - uses import maps for Gemini SDK)
- Tailwind CSS (CDN)
- Google Gemini AI (`@google/genai` SDK)
- LocalStorage for data persistence
- markdown-it for AI response rendering

### Critical Limitations for Production

**Data Storage:**
- ❌ All data in browser localStorage (not shareable, not synced across devices)
- ❌ Carer can only manage ONE patient (hardcoded `user-patient-01`)
- ❌ No data backup or export
- ❌ No medication history/compliance tracking over time

**Authentication & Security:**
- ❌ Demo-only auth (no real user accounts)
- ❌ Gemini API key exposed in client code (won't work - `process.env.API_KEY` doesn't exist in browser)
- ❌ No password reset, no email verification

**Functionality Gaps:**
- ❌ No medication reminders (push notifications)
- ❌ No recurring appointments
- ❌ No prescription refill tracking
- ❌ No doctor/pharmacy contact info
- ❌ No medication adherence analytics
- ❌ No family sharing (multiple carers per patient)

**Mobile/Deployment:**
- ❌ PWA only (not native app store presence)
- ❌ No offline support
- ❌ No cross-device sync

---

## 2. Production Requirements & User Flows

### User Personas

**Primary: Cancer Patient (Emma, 52)**
- Undergoing chemotherapy, takes 8+ medications daily
- Struggles to remember which pills to take when
- Frequently experiences side effects, unsure if medication-related
- Needs: Simple interface, large buttons, medication reminders, symptom tracking

**Secondary: Family Carer (Michael, 48)**
- Manages medications for his wife Emma
- Needs to coordinate with multiple doctors
- Wants to share schedule with other family members
- Needs: Multi-patient support, appointment coordination, easy sharing

**Tertiary: Doctor/Clinic Portal (Future Phase)**
- Reviews patient medication adherence
- Receives alerts for missed doses
- Adjusts prescriptions remotely

### Core User Flows

**Flow 1: Patient Daily Routine**
1. Wake up → Open CareTrack app
2. View "Today" dashboard showing morning medications
3. Take medications → Tap checkboxes to mark as taken
4. Experience nausea → Open AI Assistant → Check if side effect of current meds
5. Receive push notification at 2pm for afternoon dose
6. View upcoming doctor appointment tomorrow

**Flow 2: Carer Managing Patient**
1. Patient returns from doctor with new prescription
2. Carer opens CareTrack → Switch to Patient profile
3. Add new medication (name, dosage, 3x daily schedule)
4. Take photo of prescription bottle (OCR future feature)
5. Share updated medication schedule with spouse via email/SMS
6. Set up appointment for follow-up in 2 weeks

**Flow 3: AI Assistant Interaction**
1. Patient experiences unusual symptom (severe headache)
2. Open AI Assistant → "Symptom Checker" tab
3. Enter: "Severe headache, sensitivity to light"
4. AI analyzes against current meds, flags potential interaction
5. AI advises: "Contact doctor immediately - possible serious interaction"
6. Patient contacts doctor, adjusts medication

**Flow 4: Medication Adherence Review**
1. Doctor asks about medication compliance
2. Patient opens "History" view
3. Shows 85% adherence over last 30 days
4. Identifies pattern: frequently misses evening dose
5. Adjust schedule to move evening dose earlier

---

## 3. Low-Cost Tech Stack Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
├──────────────────────┬──────────────────────────────────────┤
│  Glide App (PWA)     │  - iOS/Android/Web access           │
│  Free Plan           │  - Native mobile UI components      │
│  $0/month            │  - Offline-ready with sync          │
└──────────────────────┴──────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   DATA STORAGE LAYER                         │
├──────────────────────┬──────────────────────────────────────┤
│  Google Sheets       │  - 5 sheets (Users, Medications,    │
│  Free Plan           │    Appointments, TakenLog, AICache) │
│  $0/month            │  - 5M cells limit (plenty!)         │
└──────────────────────┴──────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  AUTOMATION & AI LAYER                       │
├──────────────────────┬──────────────────────────────────────┤
│  n8n (Railway)       │  - Gemini AI proxy (API key secure) │
│  Free Tier           │  - Push notifications (scheduled)   │
│  $0-5/month          │  - Data sync & backups              │
│                      │  - Email/SMS alerts                 │
└──────────────────────┴──────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
├──────────────────────┬──────────────────────────────────────┤
│  Gemini 2.5 Flash    │  - Free tier: 1500 req/day         │
│  Free API            │  - Perfect for medication lookups   │
│  $0/month            │                                     │
├──────────────────────┼──────────────────────────────────────┤
│  Twilio (Optional)   │  - SMS reminders for critical meds  │
│  Pay-as-you-go       │  - ~$0.01/SMS                       │
│  ~$5-10/month        │  - Only if user enables SMS         │
└──────────────────────┴──────────────────────────────────────┘
```

### Why This Stack?

**Glide vs Alternatives:**
| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| **Glide** ✅ | $0-25/mo | No-code, beautiful mobile UI, offline sync | 500 row limit (free), branding |
| Softr | $0-49/mo | Good for web apps | Not mobile-optimized |
| Adalo | $0-45/mo | Native mobile | Expensive, clunky UI |
| FlutterFlow | $0-30/mo | True native apps | Requires some coding |

**Decision: Glide Free Plan → Upgrade to $25/month if >500 patients**

**Google Sheets vs Alternatives:**
| Database | Cost | Pros | Cons |
|----------|------|------|------|
| **Google Sheets** ✅ | Free | Glide native integration, easy backups, familiar | 5M cell limit |
| Airtable | $0-20/mo | Better database features | 1,200 row limit (free) |
| Notion | $0-8/mo | Great UI, relational | Glide integration limited |
| Supabase | $0-25/mo | Real PostgreSQL | Requires custom API setup |

**Decision: Google Sheets (keeps everything in Google ecosystem)**

**n8n (Railway) vs Alternatives:**
| Automation | Cost | Pros | Cons |
|----------|------|------|------|
| **n8n (Railway)** ✅ | $0-5/mo | Self-hosted, unlimited workflows | Need to maintain |
| Zapier | $20-50/mo | Easy, reliable | Expensive for multiple zaps |
| Make (Integromat) | $9-29/mo | Visual, powerful | Learning curve |
| Pipedream | $0-19/mo | Developer-friendly | Less GUI workflows |

**Decision: n8n on Railway (already set up, powerful, cheap)**

---

## 4. Database Schema (Google Sheets)

### Sheet 1: `tbl_Users`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `user_id` | TEXT (PK) | UUID v4 | `user_a1b2c3d4` |
| `email` | TEXT | User email (unique) | `emma.patient@gmail.com` |
| `password_hash` | TEXT | Bcrypt hash (handled by Glide auth) | `$2b$10$...` |
| `full_name` | TEXT | Display name | `Emma Thompson` |
| `role` | TEXT | `patient` or `carer` | `patient` |
| `phone` | TEXT | For SMS reminders (optional) | `+61412345678` |
| `linked_patient_id` | TEXT | For carers: which patient they manage | `user_a1b2c3d4` |
| `created_at` | DATETIME | Account creation | `2025-10-22 10:30:00` |
| `last_login` | DATETIME | Last app access | `2025-10-22 14:20:00` |
| `timezone` | TEXT | User timezone for reminders | `Australia/Sydney` |
| `push_token` | TEXT | For push notifications | `ExponentPushToken[...]` |

**Indexes:** `user_id`, `email`

### Sheet 2: `tbl_Medications`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `med_id` | TEXT (PK) | UUID v4 | `med_x9y8z7w6` |
| `patient_id` | TEXT (FK) | User who takes this med | `user_a1b2c3d4` |
| `medication_name` | TEXT | Drug name | `Ondansetron` |
| `dosage` | TEXT | Strength/quantity | `8mg tablet` |
| `frequency` | TEXT | How often | `3x daily` |
| `time_1` | TIME | First scheduled time | `08:00` |
| `time_2` | TIME | Second scheduled time (nullable) | `14:00` |
| `time_3` | TIME | Third scheduled time (nullable) | `20:00` |
| `time_4` | TIME | Fourth scheduled time (nullable) | `null` |
| `time_5` | TIME | Fifth scheduled time (nullable) | `null` |
| `notes` | TEXT | Patient/doctor notes | `Take with food` |
| `prescribing_doctor` | TEXT | Who prescribed | `Dr. Sarah Chen` |
| `start_date` | DATE | When started taking | `2025-10-15` |
| `end_date` | DATE | When to stop (nullable) | `2025-11-15` |
| `is_active` | BOOLEAN | Currently taking? | `TRUE` |
| `refill_reminder_days` | INTEGER | Alert N days before runs out | `7` |
| `quantity_remaining` | INTEGER | Pills left (optional tracking) | `45` |
| `created_at` | DATETIME | Record creation | `2025-10-22 10:35:00` |
| `created_by` | TEXT (FK) | User who added (patient or carer) | `user_b2c3d4e5` |

**Indexes:** `med_id`, `patient_id`, `is_active`

### Sheet 3: `tbl_Appointments`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `appt_id` | TEXT (PK) | UUID v4 | `appt_p9o8i7u6` |
| `patient_id` | TEXT (FK) | User with appointment | `user_a1b2c3d4` |
| `doctor_name` | TEXT | Healthcare provider | `Dr. Sarah Chen` |
| `specialty` | TEXT | Type of doctor | `Oncology` |
| `clinic_name` | TEXT | Facility name (optional) | `City Cancer Centre` |
| `location` | TEXT | Address | `123 Medical St, Sydney` |
| `appointment_date` | DATE | When | `2025-10-25` |
| `appointment_time` | TIME | What time | `14:30` |
| `duration_minutes` | INTEGER | Expected length | `60` |
| `appointment_type` | TEXT | Type | `Consultation`, `Chemotherapy`, `Scan` |
| `notes` | TEXT | Patient notes | `Bring recent blood test results` |
| `is_recurring` | BOOLEAN | Repeating appointment? | `FALSE` |
| `recurrence_rule` | TEXT | iCal-style RRULE (if recurring) | `FREQ=WEEKLY;BYDAY=TU` |
| `reminder_hours_before` | INTEGER | When to remind | `24` |
| `status` | TEXT | Appointment state | `Scheduled`, `Completed`, `Cancelled` |
| `created_at` | DATETIME | Record creation | `2025-10-22 11:00:00` |
| `created_by` | TEXT (FK) | User who added | `user_b2c3d4e5` |

**Indexes:** `appt_id`, `patient_id`, `appointment_date`

### Sheet 4: `tbl_TakenLog`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `log_id` | TEXT (PK) | UUID v4 | `log_m8n7b6v5` |
| `med_id` | TEXT (FK) | Which medication | `med_x9y8z7w6` |
| `patient_id` | TEXT (FK) | Who should have taken it | `user_a1b2c3d4` |
| `scheduled_date` | DATE | Day it was scheduled | `2025-10-22` |
| `scheduled_time` | TIME | Time it was scheduled | `08:00` |
| `taken_datetime` | DATETIME | When actually taken (nullable) | `2025-10-22 08:15:00` |
| `was_taken` | BOOLEAN | Did they take it? | `TRUE` |
| `logged_by` | TEXT (FK) | Who marked it (patient or carer) | `user_a1b2c3d4` |
| `notes` | TEXT | Optional note | `Took late, was sleeping` |
| `created_at` | DATETIME | When log entry created | `2025-10-22 08:15:00` |

**Indexes:** `log_id`, `med_id`, `patient_id`, `scheduled_date`

**How This Works:**
- n8n creates a `tbl_TakenLog` row every day for each scheduled medication dose
- Glide app shows unchecked checkbox if `was_taken = FALSE`
- User taps checkbox → Glide updates `was_taken = TRUE`, `taken_datetime = NOW()`
- This gives us historical adherence data!

### Sheet 5: `tbl_AICache`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `cache_id` | TEXT (PK) | UUID v4 | `cache_k7j6h5g4` |
| `query_type` | TEXT | Type of AI query | `medication_lookup`, `symptom_check`, `interaction_check` |
| `query_hash` | TEXT | MD5 of query params | `a1b2c3d4e5f6...` |
| `query_params` | JSON | Original query | `{"med_name": "Ondansetron"}` |
| `response_markdown` | TEXT | Gemini response | `### What it's for\nOndansetron is...` |
| `created_at` | DATETIME | When cached | `2025-10-22 12:00:00` |
| `expires_at` | DATETIME | Cache expiry (30 days) | `2025-11-21 12:00:00` |
| `access_count` | INTEGER | How many times used | `5` |

**Purpose:** Cache AI responses to save Gemini API quota and improve speed

---

## 5. n8n Automation Workflows

All workflows run on **Railway n8n** (already deployed at `https://primary-production-2a165.up.railway.app`)

### Workflow 1: Daily Medication Scheduler

**Trigger:** Schedule (runs every day at 12:01 AM in each user's timezone)

**Flow:**
```
[Schedule Trigger: Daily 12:01 AM]
    ↓
[Google Sheets: Read tbl_Medications WHERE is_active = TRUE]
    ↓
[Split Out: For each medication]
    ↓
[Function: Generate tbl_TakenLog rows for each scheduled time]
    ↓
[Google Sheets: Batch insert into tbl_TakenLog]
    ↓
[Set: Update workflow status]
```

**Why:** Pre-populate the taken log so patients see checkboxes for today's doses

---

### Workflow 2: Medication Reminder Push Notifications

**Trigger:** Schedule (runs every 15 minutes)

**Flow:**
```
[Schedule Trigger: Every 15 min]
    ↓
[Google Sheets: Read tbl_TakenLog WHERE scheduled_date = TODAY AND was_taken = FALSE]
    ↓
[Join: tbl_Medications (get med details) + tbl_Users (get push_token)]
    ↓
[Filter: Check if current time = scheduled_time ± 5 min]
    ↓
[IF: User has push_token?]
    ├─ YES → [HTTP: Send push notification via Expo Push API]
    └─ NO → [Skip]
    ↓
[Google Sheets: Log notification sent timestamp]
```

**Push Notification Payload:**
```json
{
  "to": "ExponentPushToken[...]",
  "sound": "default",
  "title": "💊 Time for Ondansetron",
  "body": "Take 8mg tablet now (8:00 AM dose)",
  "data": {
    "type": "medication_reminder",
    "med_id": "med_x9y8z7w6",
    "log_id": "log_m8n7b6v5"
  },
  "priority": "high"
}
```

---

### Workflow 3: Gemini AI Proxy

**Trigger:** Webhook (called from Glide app)

**URL:** `https://primary-production-2a165.up.railway.app/webhook/gemini-ai-proxy`

**Input:**
```json
{
  "query_type": "medication_lookup",
  "params": {
    "medication_name": "Ondansetron"
  },
  "user_id": "user_a1b2c3d4"
}
```

**Flow:**
```
[Webhook Trigger]
    ↓
[Function: Create MD5 hash of query params]
    ↓
[Google Sheets: Check tbl_AICache for existing response (not expired)]
    ↓
[IF: Cache hit?]
    ├─ YES → [Return cached response]
    └─ NO ↓
        [HTTP: Call Gemini API with prompt]
        ↓
        [Google Sheets: Save response to tbl_AICache]
        ↓
        [Return: AI response as JSON]
```

**Gemini API Call:**
```javascript
// n8n Code Node
const apiKey = '{{ $env.GEMINI_API_KEY }}';
const medicationName = $input.item.json.params.medication_name;

const prompt = `You are a helpful assistant providing information for cancer patients and their carers. Your tone should be clear, empathetic, and easy to understand, avoiding overly technical jargon. Provide a summary for the medication: **${medicationName}**. Structure your response with the following sections using markdown headings:

### What it's for
### Common Side Effects
### Important Notes for Patients & Carers

CRITICAL: Start your entire response with the following disclaimer, exactly as written, inside a blockquote:
> **Disclaimer:** This information is for educational purposes only and is not a substitute for professional medical advice. Always consult with your doctor or a qualified healthcare provider with any questions you may have regarding a medical condition or treatment.`;

const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  })
});

const data = await response.json();
const aiText = data.candidates[0].content.parts[0].text;

return { response_markdown: aiText };
```

**Why This Approach:**
- ✅ Gemini API key stays secure on server (not exposed in Glide app)
- ✅ Caching reduces API calls (Gemini free tier = 1500/day)
- ✅ Centralized AI logic (easy to upgrade to different model)

---

### Workflow 4: Appointment Reminder

**Trigger:** Schedule (runs every hour)

**Flow:**
```
[Schedule Trigger: Every hour]
    ↓
[Google Sheets: Read tbl_Appointments WHERE status = 'Scheduled']
    ↓
[Join: tbl_Users (get phone, email, push_token)]
    ↓
[Filter: Check if reminder_hours_before matches]
    ↓
[Split By Method:]
    ├─ Push Notification → [HTTP: Expo Push API]
    ├─ Email → [SMTP: Send email with appointment details]
    └─ SMS (if enabled) → [Twilio: Send SMS]
    ↓
[Google Sheets: Log reminder sent]
```

---

### Workflow 5: Medication Refill Alert

**Trigger:** Schedule (runs daily at 9:00 AM)

**Flow:**
```
[Schedule Trigger: Daily 9 AM]
    ↓
[Google Sheets: Read tbl_Medications WHERE quantity_remaining <= refill_reminder_days]
    ↓
[Join: tbl_Users]
    ↓
[For Each: Medication needing refill]
    ↓
[Push Notification: "Time to refill Ondansetron - only 5 pills left"]
    ↓
[Google Sheets: Update last_refill_reminder_sent]
```

---

### Workflow 6: Weekly Adherence Report (For Carers)

**Trigger:** Schedule (runs every Monday at 8:00 AM)

**Flow:**
```
[Schedule Trigger: Weekly Monday 8 AM]
    ↓
[Google Sheets: Read tbl_Users WHERE role = 'carer']
    ↓
[For Each Carer:]
    ↓
    [Google Sheets: Read tbl_TakenLog for linked_patient_id (last 7 days)]
    ↓
    [Function: Calculate adherence percentage]
    ↓
    [IF: Adherence < 80%]
        └─ [Email: Send alert to carer with missed doses list]
    ↓
    [Google Sheets: Log report sent]
```

**Email Template:**
```
Subject: Weekly CareTrack Report for Emma Thompson

Hi Michael,

Here's Emma's medication adherence for the past week:

Overall Adherence: 78% (22 doses taken out of 28 scheduled)

Missed Doses:
- Ondansetron (8mg): Wednesday 8:00 PM, Friday 8:00 PM
- Paracetamol (500mg): Thursday 2:00 PM

Most adherent: Morphine (100% - all 7 doses taken)

Recommendation: Consider setting additional reminders for evening doses.

View full report in CareTrack: [Open App Button]
```

---

## 6. Glide App Structure

### 6.1 Data Tables Setup in Glide

**Connect Google Sheets:**
- Add Google Sheets integration in Glide
- Import all 5 sheets as Glide Tables
- Set up relationships:
  - `tbl_Medications.patient_id` → `tbl_Users.user_id`
  - `tbl_Appointments.patient_id` → `tbl_Users.user_id`
  - `tbl_TakenLog.med_id` → `tbl_Medications.med_id`
  - `tbl_TakenLog.patient_id` → `tbl_Users.user_id`

**User Rows:**
- Enable "User-specific columns" on `tbl_Users`
- Set row ownership: `email` column
- This ensures patients only see their own data

---

### 6.2 App Screens Structure

#### **Screen 1: Login/Signup**
- **Type:** Built-in Glide Authentication
- **Fields:**
  - Email (required)
  - Password (required, min 8 chars)
  - Full Name (required)
  - Role selector: Patient or Carer
  - [If Carer] Linked Patient Email (optional - can add later)
- **Action:** Create row in `tbl_Users`, set role, redirect to Dashboard

---

#### **Screen 2: Dashboard (Home)**
- **Components:**
  - **Header:**
    - Welcome message: "Good morning, Emma"
    - Date: "Tuesday, 22 October 2025"
  - **Today's Medications Card:**
    - List: `tbl_TakenLog` filtered by:
      - `patient_id = Current User ID`
      - `scheduled_date = TODAY`
    - Sort by: `scheduled_time ASC`
    - Item Layout:
      - Checkbox (bound to `was_taken`)
      - Medication name (from related `tbl_Medications`)
      - Dosage (from related `tbl_Medications`)
      - Scheduled time (formatted as "8:00 AM")
      - Taken time (if `was_taken = TRUE`, show actual time)
    - **Action on Checkbox Tap:**
      - Update `was_taken = TRUE`
      - Set `taken_datetime = NOW()`
      - Set `logged_by = Current User ID`
  - **Today's Appointments Card:**
    - List: `tbl_Appointments` filtered by:
      - `patient_id = Current User ID`
      - `appointment_date = TODAY`
      - `status = 'Scheduled'`
    - Sort by: `appointment_time ASC`
    - Item Layout:
      - Doctor icon
      - Doctor name + specialty
      - Time
      - Location (if exists)
      - [Button] "Get Directions" (opens Maps)

---

#### **Screen 3: Medications (Full List)**
- **Components:**
  - **Add Medication FAB** (Floating Action Button)
  - **Medication List:**
    - Data: `tbl_Medications` WHERE `is_active = TRUE`
    - Filter by `patient_id = Current User ID`
    - Sort by: `medication_name ASC`
    - Item Layout (Card):
      - Medication name (large, bold)
      - Dosage
      - Frequency badge (e.g., "3x daily")
      - Scheduled times (pills icons with times)
      - Notes (expandable)
      - Prescribing doctor
      - [Button] "Edit" → Edit Screen
      - [Button] "Delete" → Confirmation + Set `is_active = FALSE`

---

#### **Screen 4: Add/Edit Medication Form**
- **Fields:**
  - Medication Name (text, required)
  - Dosage (text, required) - e.g., "8mg tablet"
  - Frequency dropdown: 1x, 2x, 3x, 4x, 5x daily
  - Time Picker 1 (required)
  - Time Picker 2 (conditional: if frequency >= 2)
  - Time Picker 3 (conditional: if frequency >= 3)
  - Time Picker 4 (conditional: if frequency >= 4)
  - Time Picker 5 (conditional: if frequency = 5)
  - Notes (text area, optional)
  - Prescribing Doctor (text, optional)
  - Start Date (date picker, default = today)
  - End Date (date picker, optional - for short-term meds)
  - Refill Reminder (number, default = 7 days)
- **Actions:**
  - **Save Button:**
    - Create row in `tbl_Medications`
    - Set `patient_id = Current User ID`
    - Set `created_by = Current User ID`
    - Set `is_active = TRUE`
    - Navigate back to Medications list

---

#### **Screen 5: Appointments (Full List)**
- **Components:**
  - **Add Appointment FAB**
  - **Filter Chips:**
    - "Upcoming" (default)
    - "Past"
    - "All"
  - **Appointment List:**
    - Data: `tbl_Appointments` filtered by `patient_id`
    - Sort by: `appointment_date ASC, appointment_time ASC`
    - Group by: Month (e.g., "October 2025", "November 2025")
    - Item Layout (Card):
      - Date + Time (large)
      - Doctor name + specialty
      - Clinic name
      - Location with map thumbnail
      - Notes (expandable)
      - Status badge (Scheduled/Completed/Cancelled)
      - [Button] "Edit" → Edit Screen
      - [Button] "Cancel Appointment" → Set status = 'Cancelled'

---

#### **Screen 6: Add/Edit Appointment Form**
- **Fields:**
  - Doctor Name (text, required)
  - Specialty (dropdown or text, required)
    - Options: Oncology, General Practice, Radiology, Pathology, Cardiology, Other
  - Clinic Name (text, optional)
  - Location (text with Google Maps autocomplete, optional)
  - Date (date picker, required)
  - Time (time picker, required)
  - Duration (number, default = 60 minutes)
  - Appointment Type (dropdown)
    - Options: Consultation, Chemotherapy, Radiation, Scan/Imaging, Blood Test, Other
  - Notes (text area, optional)
  - Reminder (dropdown)
    - Options: 1 hour, 24 hours, 2 days, 1 week before
- **Actions:**
  - **Save Button:**
    - Create row in `tbl_Appointments`
    - Set `patient_id = Current User ID`
    - Set `created_by = Current User ID`
    - Set `status = 'Scheduled'`
    - Navigate back to Appointments list

---

#### **Screen 7: AI Assistant**
- **Tabs:**
  - **Tab 1: Medication Lookup**
    - Text input: "Enter medication name"
    - [Button] "Search"
    - **Action:**
      - Call n8n webhook: `https://primary-production-2a165.up.railway.app/webhook/gemini-ai-proxy`
      - Send: `{ "query_type": "medication_lookup", "params": { "medication_name": "[input]" } }`
      - Show loading spinner
      - Display response (markdown formatted)
  - **Tab 2: Symptom Checker**
    - Text area: "Describe your symptoms"
    - Display current medications list (read-only)
    - [Button] "Check Symptoms"
    - **Action:**
      - Collect user's current medications from `tbl_Medications`
      - Call n8n webhook with `query_type = "symptom_check"`
      - Send: `{ "symptoms": "[input]", "medications": [{...}] }`
      - Display analysis with color-coded severity:
        - Green: Common, manageable side effects
        - Orange: Moderate concern - monitor closely
        - Red: Serious - contact doctor immediately
  - **Tab 3: Drug Interaction Check**
    - Medication 1 (text input or dropdown from user's meds)
    - Medication 2 (text input or dropdown from user's meds)
    - [Button] "Check Interactions"
    - **Action:**
      - Call n8n webhook with `query_type = "interaction_check"`
      - Display interaction analysis (markdown)

**AI Response Display:**
- Markdown rendering (Glide supports this natively)
- Medical disclaimer always visible
- [Button] "Save to Notes" (optional - add to appointment or medication notes)

---

#### **Screen 8: History & Adherence**
- **Filters:**
  - Date range picker (default = last 30 days)
  - Medication filter (dropdown: All, or specific med)
- **Components:**
  - **Adherence Chart (Progress Wheel):**
    - Calculate: `(COUNT WHERE was_taken = TRUE) / (COUNT total doses) * 100`
    - Color-coded:
      - Green: ≥90%
      - Orange: 70-89%
      - Red: <70%
  - **Calendar View (Optional in Glide):**
    - Heatmap showing adherence by day
    - Green = 100%, Yellow = 50-99%, Red = <50%
  - **Missed Doses List:**
    - Data: `tbl_TakenLog` WHERE `was_taken = FALSE` AND `scheduled_date < TODAY`
    - Sort by: `scheduled_date DESC`
    - Item Layout:
      - Medication name
      - Scheduled date + time
      - [Button] "Mark as Taken" (updates log, sets `taken_datetime = NOW()`)
      - [Button] "Not Taken" (just confirms skip)

---

#### **Screen 9: Settings & Profile**
- **Sections:**
  - **Personal Info:**
    - Full Name (editable)
    - Email (read-only)
    - Phone (editable - for SMS reminders)
    - Timezone (dropdown)
  - **Notifications:**
    - Toggle: Enable Push Notifications
    - Toggle: Enable Email Reminders
    - Toggle: Enable SMS Reminders (if phone provided)
    - Medication Reminder Lead Time (dropdown: 0 min, 15 min, 30 min before)
  - **For Carers:**
    - [Button] "Manage Patients"
      - Screen showing linked patients
      - [Button] "Add Patient" (enter patient email to link accounts)
      - [Button] "Switch to [Patient Name]" (changes context to view their data)
  - **Data Management:**
    - [Button] "Export My Data" (generates CSV download)
    - [Button] "Delete Account" (confirmation dialog)
  - **About:**
    - App version
    - Terms of Service link
    - Privacy Policy link
    - [Button] "Contact Support" (opens email to support@caretrack.com)

---

#### **Screen 10: Carer Dashboard (Role-Specific)**
- **Only visible if `Current User role = 'carer'`**
- **Patient Selector:**
  - Dropdown: List of linked patients (from `tbl_Users WHERE linked_patient_id = Current User ID`)
  - Selected patient context applies to rest of app
- **Quick Actions:**
  - [Button] "Add Medication for [Patient Name]"
  - [Button] "Add Appointment for [Patient Name]"
  - [Button] "View Adherence Report"
- **Weekly Summary Card:**
  - Adherence percentage (last 7 days)
  - Missed doses count
  - Upcoming appointments (next 2 weeks)
  - [Button] "Share Schedule" →
    - Generate email/SMS with today's schedule (same as React app)
    - Action: Open native share dialog

---

### 6.3 Glide Actions & Workflows

**Action 1: Mark Medication as Taken**
- **Trigger:** User taps checkbox on Today's Medications
- **Steps:**
  1. Set Column: `tbl_TakenLog.was_taken = TRUE`
  2. Set Column: `tbl_TakenLog.taken_datetime = NOW()`
  3. Set Column: `tbl_TakenLog.logged_by = Current User ID`
  4. Show Notification: "✅ Ondansetron marked as taken"

**Action 2: Call Gemini AI**
- **Trigger:** User taps "Search" on AI Assistant tab
- **Steps:**
  1. Show Spinner (loading state)
  2. Call Webhook: `https://primary-production-2a165.up.railway.app/webhook/gemini-ai-proxy`
  3. Wait for Response
  4. Set Column: `tbl_AICache.response_markdown = Response`
  5. Show Component: Markdown text with response
  6. Hide Spinner

**Action 3: Share Schedule**
- **Trigger:** Carer taps "Share Today's Schedule"
- **Steps:**
  1. Read Collection: `tbl_TakenLog` (today's doses)
  2. Read Collection: `tbl_Appointments` (today's appointments)
  3. Format as Text (template):
     ```
     Today's Schedule for Emma Thompson (22 Oct 2025)

     Medications:
     - Ondansetron 8mg at 8:00 AM ✅
     - Paracetamol 500mg at 2:00 PM
     - Morphine 10mg at 8:00 PM

     Appointments:
     - Dr. Sarah Chen (Oncology) at 2:30 PM
       Location: City Cancer Centre, 123 Medical St

     Generated by CareTrack
     ```
  4. Open Share Sheet (native iOS/Android share)
  5. User selects: Email, SMS, WhatsApp, etc.

---

## 7. Deployment Architecture & Hosting

### 7.1 Environment Setup

**Google Sheets Preparation:**
1. Create new Google Sheet: "CareTrack Production DB"
2. Create 5 sheets (tabs): `tbl_Users`, `tbl_Medications`, `tbl_Appointments`, `tbl_TakenLog`, `tbl_AICache`
3. Add column headers exactly as defined in schema (Section 4)
4. Set up data validation:
   - `role` column: dropdown (patient, carer)
   - `status` column: dropdown (Scheduled, Completed, Cancelled)
5. Create sample data for testing (1 patient, 1 carer, 2 medications, 1 appointment)

**Glide App Setup:**
1. Sign up for Glide: https://glide.com
2. Create new app: "CareTrack"
3. Connect to Google Sheets (select "CareTrack Production DB")
4. Enable Authentication → Email + Password
5. Set User Profile Column → `tbl_Users.email`
6. Configure user roles → `tbl_Users.role`

**n8n Configuration (Railway):**
1. Already deployed: `https://primary-production-2a165.up.railway.app`
2. Add environment variable in Railway dashboard:
   - `GEMINI_API_KEY = [your Gemini API key]`
3. Import workflows (6 workflows from Section 5)
4. Configure credentials:
   - Google Sheets OAuth (same sheet as Glide)
   - Twilio (if using SMS)
   - SMTP (for email alerts)
5. Activate workflows

**Gemini API Key:**
1. Go to https://aistudio.google.com/apikey
2. Create new API key (free tier = 1500 requests/day)
3. Add to Railway n8n environment variables

---

### 7.2 Security Configuration

**Google Sheets Access:**
- Share "CareTrack Production DB" with:
  - Glide service account (auto-generated when connecting)
  - n8n service account (from OAuth setup)
- Set permissions: Editor (both need write access)
- Enable "Restrict access to domain" if using Google Workspace

**Glide App Security:**
- Enable Row Owners on `tbl_Users` (email column)
  - Ensures patients only see their own medications/appointments
- Enable Row Owners on `tbl_Medications`, `tbl_Appointments`, `tbl_TakenLog` (patient_id column)
- Set up Privacy Rules:
  - Carers can view linked patient data (via `linked_patient_id`)
  - Patients cannot view carer accounts

**n8n Webhooks:**
- Enable authentication on webhooks (n8n setting)
- Use API key in webhook URL: `?apiKey=[secret]`
- Glide sends API key in webhook calls
- Rotate API key monthly

**Gemini API:**
- API key stored in Railway environment variables (not in Glide)
- n8n acts as proxy (Glide never directly calls Gemini)
- Implement rate limiting in n8n (max 100 requests/hour per user)

---

### 7.3 Mobile App Deployment

**PWA (Progressive Web App):**
- Glide automatically generates PWA
- URL: `https://caretrack.glideapp.io` (or custom domain)
- Users can "Add to Home Screen" on iOS/Android
- Offline support: Glide caches data, syncs when online

**Custom Domain (Optional):**
- Purchase domain: `caretrack.app` or `caretrack.com.au`
- Configure in Glide: Settings → Custom Domain
- Add CNAME record in DNS: `app.caretrack.com.au → glide.page`
- SSL automatically provisioned by Glide

**App Store Submission (Future Phase - Requires Glide Pro Plan $99/mo):**
- Glide can generate native iOS/Android apps
- Submit to Apple App Store + Google Play Store
- Benefits:
  - True native performance
  - Push notifications more reliable
  - Better visibility (searchable in stores)
- Drawbacks:
  - Higher cost ($99/mo Glide plan + $99/year Apple Developer + $25 one-time Google Play)
  - App review process (1-2 weeks each update)

**Recommendation:** Start with PWA (free), upgrade to native apps if user base >500

---

### 7.4 Backup & Disaster Recovery

**Google Sheets Backups:**
- Google automatically versions Sheets (revision history)
- Manual backups via n8n workflow (daily at 2 AM):
  ```
  [Schedule Trigger: Daily 2 AM]
  ↓
  [Google Sheets: Export as CSV]
  ↓
  [Google Drive: Save to /CareTrack Backups/backup_YYYY-MM-DD.csv]
  ↓
  [Compress: Zip file]
  ↓
  [Keep last 30 days, delete older]
  ```

**Database Migration (If Sheets Becomes Insufficient):**
- Export from Google Sheets → CSV
- Import to Airtable (better relational features)
- Update Glide data source (Glide supports Airtable natively)
- No code changes needed in Glide app

---

## 8. Cost Breakdown

### Monthly Operating Costs

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| **Glide** | Free | $0 | Up to 500 rows, Glide branding |
| **Google Sheets** | Free | $0 | Up to 5M cells (~10k patients) |
| **n8n (Railway)** | Free Tier | $0 | $5 credit/month (enough for our workflows) |
| **Gemini API** | Free | $0 | 1500 req/day (plenty for caching strategy) |
| **Custom Domain** | (Optional) | $15/year | `caretrack.com.au` |
| **Twilio SMS** | (Optional, Pay-as-you-go) | ~$5-10 | Only if users enable SMS reminders |
| **TOTAL (Basic)** | | **$0/month** | Fully functional, limited to 500 patients |

### Scaling Costs (If Successful)

| Milestone | Services to Upgrade | New Monthly Cost | Total Users |
|-----------|---------------------|------------------|-------------|
| **>500 users** | Glide Pro ($25/mo) + Railway Starter ($5/mo) | **$30/mo** | Up to 25k rows |
| **>5k users** | Glide Business ($40/mo) + Airtable Plus ($20/mo) + Railway Hobby ($5/mo) | **$65/mo** | Up to 50k rows |
| **>20k users** | Glide Enterprise ($200/mo) + Supabase Pro ($25/mo) + Railway Pro ($20/mo) + Dedicated Gemini ($50/mo) | **$295/mo** | Unlimited |

### Cost Comparison: CareTrack vs Competitors

| App | Cost (Patient) | Features | Limitations |
|-----|----------------|----------|-------------|
| **CareTrack (Our App)** | Free | Full features, AI assistant, carer support | Glide branding, 500 user limit |
| Medisafe | Free + $5/mo premium | Medication reminders, refill tracking | No AI, no carer portal |
| MyTherapy | Free + $10/mo | Medication + activity tracking | No AI, limited customization |
| CareZone | Free + $8/mo | Medication + appointments | No AI, clunky UI |

**Competitive Advantage:**
- ✅ Only app with AI symptom checker + drug interaction analysis
- ✅ Best carer support (multi-patient management)
- ✅ Completely free tier (competitors have paywalls)
- ✅ Australian-focused (AHPRA/NMBA alignment)

---

## 9. Implementation Roadmap

### Phase 1: MVP (Weeks 1-2) - Core Features

**Week 1: Database & Backend**
- [ ] Day 1-2: Set up Google Sheets (5 tables with sample data)
- [ ] Day 3-4: Deploy 3 critical n8n workflows:
  - Workflow 1: Daily Medication Scheduler
  - Workflow 2: Medication Reminder Notifications
  - Workflow 3: Gemini AI Proxy
- [ ] Day 5: Test n8n workflows with sample data
- [ ] Day 6-7: Set up Gemini API, test caching, verify responses

**Week 2: Glide App UI**
- [ ] Day 1-2: Build core screens:
  - Login/Signup
  - Dashboard (Today's view)
  - Medications List
  - Add Medication Form
- [ ] Day 3: Build appointment screens:
  - Appointments List
  - Add Appointment Form
- [ ] Day 4: Build AI Assistant screen (3 tabs)
- [ ] Day 5: Test data flow: Glide → Google Sheets → n8n → Gemini → Glide
- [ ] Day 6: Internal testing (Emma + Michael personas)
- [ ] Day 7: Bug fixes, UI polish

**Deliverables:**
- ✅ Functional CareTrack app (PWA)
- ✅ Patients can add meds + appointments
- ✅ Daily checklist for medications
- ✅ AI Assistant for medication lookup
- ✅ Push notifications for medication reminders

---

### Phase 2: Advanced Features (Weeks 3-4)

**Week 3: Carer Features**
- [ ] Day 1-2: Build carer dashboard with patient switcher
- [ ] Day 3: Implement "Share Schedule" action
- [ ] Day 4: Build weekly adherence report workflow (n8n)
- [ ] Day 5: Add multi-patient support (carers can link multiple patients)
- [ ] Day 6-7: Testing with carer persona (Michael)

**Week 4: Analytics & History**
- [ ] Day 1-2: Build History & Adherence screen
- [ ] Day 3: Add adherence chart (progress wheel)
- [ ] Day 4: Add missed doses tracking
- [ ] Day 5: Implement "Export Data" feature (CSV download)
- [ ] Day 6-7: End-to-end testing, performance optimization

**Deliverables:**
- ✅ Full carer portal
- ✅ Weekly adherence reports
- ✅ Data export functionality
- ✅ Adherence analytics

---

### Phase 3: Polish & Launch Prep (Week 5)

**Tasks:**
- [ ] Security audit (test row-level security in Glide)
- [ ] Performance testing (50+ medications, 100+ appointments)
- [ ] Mobile responsiveness check (iOS Safari, Android Chrome)
- [ ] Accessibility improvements (screen reader support)
- [ ] Write documentation:
  - User Guide (for patients)
  - Carer Guide
  - Privacy Policy
  - Terms of Service
- [ ] Set up custom domain (if budget allows)
- [ ] Beta testing with 5 real users (friends/family)

**Deliverables:**
- ✅ Production-ready app
- ✅ Documentation complete
- ✅ Beta feedback incorporated

---

### Phase 4: Launch & Growth (Week 6+)

**Week 6: Soft Launch**
- [ ] Announce on Reddit: r/cancer, r/CancerFamilySupport
- [ ] Post on cancer support Facebook groups
- [ ] Share on LinkedIn (healthcare tech communities)
- [ ] Create demo video (1-2 min walkthrough)
- [ ] Set up support email: support@caretrack.com

**Week 7-8: Marketing & Feedback**
- [ ] Collect user feedback (in-app survey after 7 days)
- [ ] Fix bugs reported by early users
- [ ] Add requested features (top 3 from feedback)
- [ ] Write blog post: "How We Built CareTrack for $0/month"
- [ ] Submit to Product Hunt

**Week 9-12: Iterate & Scale**
- [ ] Monitor usage: Glide analytics dashboard
- [ ] Optimize n8n workflows (reduce execution time)
- [ ] Add new AI features (e.g., prescription OCR)
- [ ] Explore partnerships (cancer support organizations)
- [ ] If >500 users → Upgrade to Glide Pro

---

## 10. Success Metrics & KPIs

### User Acquisition
- **Goal:** 100 users in first 3 months
- **Metric:** New signups per week
- **Target:** 8-10 signups/week by Month 3

### User Engagement
- **Goal:** 60% daily active users (DAU)
- **Metric:** Users who log in daily
- **Target:** 60 out of 100 users check app daily

### Medication Adherence
- **Goal:** Improve adherence by 20%
- **Metric:** `(Taken doses / Scheduled doses) * 100`
- **Benchmark:** Industry average = 50% for chronic conditions
- **Target:** CareTrack users achieve 70%+ average

### AI Assistant Usage
- **Goal:** 30% of users use AI assistant weekly
- **Metric:** AI query count per user
- **Target:** 30 users make 1+ AI query per week

### Carer Satisfaction
- **Goal:** 80% of carers find app "very helpful"
- **Metric:** In-app survey (1-5 star rating)
- **Target:** Average rating ≥4.0 stars

### Cost Efficiency
- **Goal:** Maintain $0 monthly cost until 500 users
- **Metric:** Monthly infrastructure bill
- **Target:** Stay on free tiers (Glide Free, Railway Free, Gemini Free)

---

## 11. Risk Analysis & Mitigation

### Technical Risks

**Risk 1: Google Sheets Performance Degradation**
- **Impact:** App becomes slow with >1000 users
- **Likelihood:** Medium (Sheets has 5M cell limit, but complex queries slow down)
- **Mitigation:**
  - Implement pagination in Glide (show max 100 rows at a time)
  - Archive old data (medications/appointments >1 year old) to separate "Archive" sheet
  - If persistent issues → Migrate to Airtable or Supabase (Glide supports both)

**Risk 2: Gemini API Rate Limits**
- **Impact:** AI assistant stops working (1500 requests/day limit)
- **Likelihood:** Low (caching reduces actual API calls significantly)
- **Mitigation:**
  - Aggressive caching strategy (30-day TTL on medication lookups)
  - Fallback to cached library of top 100 cancer medications
  - If limit hit → Show message "AI assistant temporarily unavailable, try again in 1 hour"
  - Upgrade to Gemini Pro API ($0.00025/request) if needed (~$10/month for 40k requests)

**Risk 3: n8n Workflow Failures**
- **Impact:** Medication reminders not sent, critical safety issue
- **Likelihood:** Low (Railway uptime = 99.9%)
- **Mitigation:**
  - Set up n8n error notifications (email to admin if workflow fails)
  - Build redundancy: if push notification fails, send email backup
  - Monitor Railway logs daily
  - Keep critical workflows simple (fewer nodes = fewer failure points)

---

### Legal & Compliance Risks

**Risk 4: Medical Liability**
- **Impact:** User relies on AI advice, experiences adverse outcome, sues
- **Likelihood:** Low (clear disclaimers on every AI response)
- **Mitigation:**
  - Prominent medical disclaimer on all AI screens
  - Terms of Service clearly state "Not a substitute for medical advice"
  - Add "Emergency" button that directly calls 000 (Australia) or links to doctor
  - Consider insurance: Professional Liability Insurance for Health Apps (~$500/year)

**Risk 5: Data Privacy (GDPR/Australian Privacy Act)**
- **Impact:** Violation of privacy laws, fines up to $50M AUD
- **Likelihood:** Low (no data sharing, user controls own data)
- **Mitigation:**
  - Privacy Policy written by lawyer (use template from Iubenda)
  - Implement "Delete Account" feature (must delete all user data from Sheets)
  - No third-party analytics (avoid Google Analytics, use privacy-first Plausible)
  - Encrypt sensitive data in Google Sheets (use Glide encrypted columns for notes)
  - Annual privacy audit (checklist-based)

**Risk 6: Therapeutic Goods Administration (TGA) Regulation**
- **Impact:** App classified as "Medical Device" in Australia, requires TGA approval ($10k+ cost)
- **Likelihood:** Low (CareTrack is "wellness app", not diagnostic tool)
- **Mitigation:**
  - Never claim app "diagnoses", "treats", or "prevents" disease
  - Position as "medication reminder and information tool"
  - Consult TGA guidelines for digital health apps (free webinar: tga.gov.au)
  - If unsure → Get 30-min legal consultation ($300)

---

### Business Risks

**Risk 7: Low User Adoption**
- **Impact:** App doesn't reach critical mass (100 users), project abandoned
- **Likelihood:** Medium (health apps have high competition)
- **Mitigation:**
  - Targeted marketing in cancer-specific communities (Reddit, Facebook groups)
  - Partner with cancer support orgs (e.g., Cancer Council Australia)
  - Offer white-label version to clinics (they promote to patients)
  - Add unique feature competitors lack (e.g., AI symptom checker)

**Risk 8: Cost Overruns**
- **Impact:** Unexpected costs >$50/month, project unsustainable
- **Likelihood:** Low (all services have free tiers)
- **Mitigation:**
  - Set up billing alerts in Railway (notify if >$5/month)
  - Monitor Gemini API usage daily (dashboard at aistudio.google.com)
  - If SMS costs spike → Disable SMS, use push notifications only
  - Glide free tier sufficient until 500 users (long runway)

---

## 12. Future Enhancements (Post-Launch)

### Phase 5: Advanced AI Features (Month 4-6)

**Prescription OCR:**
- User takes photo of prescription bottle
- n8n workflow sends to Google Cloud Vision API (OCR)
- Extracts: medication name, dosage, frequency
- Auto-populates "Add Medication" form
- Cost: Google Cloud Vision = 1000 free OCR/month, then $1.50/1000

**Symptom Severity Prediction:**
- Use Gemini + historical symptom logs to predict severity trends
- Example: "Your nausea has been worsening over 3 days, consider contacting doctor"
- Requires: New `tbl_Symptoms` sheet to log symptoms daily

**Medication Interaction Auto-Check:**
- When patient adds new medication, auto-run interaction check against all current meds
- Show warning modal if serious interaction detected
- Requires: Gemini API call in background (n8n webhook triggered by Glide "Add Med" action)

---

### Phase 6: Healthcare Provider Portal (Month 7-9)

**Doctor Dashboard (Separate Glide App):**
- Doctors/clinics can view aggregated patient data (with consent)
- See adherence statistics for all their patients
- Adjust medication schedules remotely
- Send messages to patients (in-app chat)

**Implementation:**
- New Google Sheet: `tbl_Providers` (doctor accounts)
- New relationship: `tbl_Users.primary_doctor_id` → `tbl_Providers.provider_id`
- New Glide app: "CareTrack Provider Portal" (separate app, same database)
- Privacy: Patients must explicitly grant access (consent checkbox)

**Business Model:**
- Free for individual doctors
- $50/month for clinics (up to 10 doctors, 500 patients)
- Revenue potential: 10 clinics = $500/month

---

### Phase 7: Pharmacy Integration (Month 10-12)

**Prescription Refill Automation:**
- Partner with local pharmacies (e.g., Chemist Warehouse Australia)
- When medication runs low (7 days remaining), send refill request to pharmacy
- Pharmacy prepares prescription, notifies patient when ready
- Patient picks up medication

**Implementation:**
- Partner with pharmacy chains (API access needed)
- n8n workflow sends refill request via pharmacy API
- Requires: Pharmacy partnership agreements (revenue share?)

---

### Phase 8: Wearable Integration (Future)

**Apple Health / Google Fit Sync:**
- Import heart rate, sleep data from wearables
- Correlate with medication side effects (e.g., insomnia after evening dose)
- Suggest schedule adjustments

**Smartwatch Reminders:**
- Push medication reminders to Apple Watch / Wear OS
- One-tap "Take Medication" button on watch face

---

## 13. Conclusion & Next Steps

### What We've Designed

This implementation plan transforms the CareTrack React prototype into a **production-ready, scalable, low-cost mobile/web application** that:

✅ **Maintains all current features** (medications, appointments, AI assistant, carer support)
✅ **Adds critical missing features** (push notifications, adherence tracking, multi-patient support)
✅ **Runs on $0/month** (free tiers: Glide + Google Sheets + Railway + Gemini)
✅ **Scales to 500+ users** without code changes
✅ **Works on iOS, Android, Web** (Glide PWA)
✅ **Keeps data secure** (row-level security, encrypted sensitive fields)
✅ **Complies with Australian regulations** (privacy, medical disclaimers)

### Total Implementation Time

- **Phase 1 (MVP):** 2 weeks
- **Phase 2 (Advanced):** 2 weeks
- **Phase 3 (Polish):** 1 week
- **Phase 4 (Launch):** Ongoing

**Total to MVP:** 5 weeks (working solo, part-time ~10 hours/week)

### Immediate Next Steps

1. **Validate concept** with 3-5 cancer patients/carers (informal interviews)
   - Question: "Would you use this app? What features matter most?"
2. **Set up Google Sheet** (30 minutes)
   - Create 5 tables with sample data
3. **Deploy n8n workflows** (2 hours)
   - Import Workflow 1 (Daily Scheduler) + Workflow 3 (Gemini Proxy)
   - Test with sample medication data
4. **Build Glide MVP** (1 week)
   - Focus on: Dashboard + Add Medication + AI Assistant
   - Get it to "minimally functional" state
5. **Test with yourself** (1 week)
   - Pretend you're a patient, add real medications, use for 7 days
   - Note bugs, UX friction points
6. **Share with 5 beta testers** (2 weeks)
   - Friends/family with chronic conditions
   - Collect feedback, iterate
7. **Soft launch** (Reddit post, Facebook groups)

### Key Success Factors

- **Keep it simple:** MVP doesn't need every feature (focus on core pain: medication reminders)
- **Talk to users early:** Build what they actually need, not what we think they need
- **Monitor costs obsessively:** Set up alerts before hitting paid tiers
- **Prioritize security:** Healthcare data is sensitive, one breach = end of project
- **Iterate fast:** Weekly releases, small improvements

---

## Appendix A: Tech Stack Reference Links

- **Glide:** https://glide.com
- **Google Sheets:** https://sheets.google.com
- **n8n (Railway):** https://railway.app/template/n8n
- **Gemini API:** https://aistudio.google.com/apikey
- **Twilio (SMS):** https://twilio.com
- **Expo Push Notifications:** https://docs.expo.dev/push-notifications/overview/

---

## Appendix B: Sample Data for Testing

### Sample Patient (tbl_Users)
```
user_id: user_emma_01
email: emma.patient@gmail.com
full_name: Emma Thompson
role: patient
phone: +61412345678
timezone: Australia/Sydney
```

### Sample Medications (tbl_Medications)
```
med_id: med_ondansetron_01
patient_id: user_emma_01
medication_name: Ondansetron
dosage: 8mg tablet
frequency: 3x daily
time_1: 08:00
time_2: 14:00
time_3: 20:00
notes: Take with food
is_active: TRUE
```

### Sample Appointment (tbl_Appointments)
```
appt_id: appt_chen_01
patient_id: user_emma_01
doctor_name: Dr. Sarah Chen
specialty: Oncology
location: City Cancer Centre, 123 Medical St, Sydney
appointment_date: 2025-10-25
appointment_time: 14:30
status: Scheduled
```

---

**END OF IMPLEMENTATION PLAN**

*This document is a living roadmap. Update as we learn from real users.*
