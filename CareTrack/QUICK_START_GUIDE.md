# CareTrack Quick Start Guide
## Get from React Prototype → Production in 5 Weeks

**Last Updated:** 2025-10-22

---

## 30-Second Summary

Transform CareTrack React prototype into production app using:
- **Glide** (no-code mobile app) - $0/month
- **Google Sheets** (database) - $0/month
- **n8n on Railway** (automation + AI proxy) - $0/month
- **Gemini API** (AI assistant) - $0/month

**Total Cost:** $0/month for first 500 users

---

## Week 1: Set Up Database & Automation

### Day 1-2: Google Sheets Setup
1. Create new Google Sheet: "CareTrack Production DB"
2. Create 5 sheets (tabs):
   - `tbl_Users` (user accounts)
   - `tbl_Medications` (medication schedules)
   - `tbl_Appointments` (doctor appointments)
   - `tbl_TakenLog` (medication adherence tracking)
   - `tbl_AICache` (Gemini response caching)
3. Copy column headers from `CARETRACK_IMPLEMENTATION_PLAN.md` Section 4
4. Add 1-2 rows of sample data to each table

**Pro Tip:** Use data validation for dropdowns (role, status, etc.)

### Day 3-4: n8n Workflows
1. Open Railway n8n: `https://primary-production-2a165.up.railway.app`
2. Add environment variable:
   - `GEMINI_API_KEY` = Get from https://aistudio.google.com/apikey
3. Import 3 critical workflows:
   - **Workflow 1:** Daily Medication Scheduler (creates tbl_TakenLog rows every day)
   - **Workflow 2:** Medication Reminder Notifications (push alerts)
   - **Workflow 3:** Gemini AI Proxy (secure API key handling)
4. Configure credentials:
   - Google Sheets OAuth (connect to your sheet)
   - Expo Push Notifications (for mobile alerts)

**Pro Tip:** Start with Workflow 3 (AI Proxy) first - easiest to test

### Day 5: Test Automation
1. Manually trigger Workflow 1 → Check if `tbl_TakenLog` gets new rows
2. Test Workflow 3 via Postman:
   ```bash
   curl -X POST https://primary-production-2a165.up.railway.app/webhook/gemini-ai-proxy \
     -H "Content-Type: application/json" \
     -d '{
       "query_type": "medication_lookup",
       "params": {"medication_name": "Ondansetron"}
     }'
   ```
3. Verify Gemini response is cached in `tbl_AICache`

---

## Week 2: Build Glide App

### Day 1-2: Core Screens
1. Sign up for Glide: https://glide.com
2. Create new app → Connect to Google Sheet
3. Enable Authentication (Email + Password)
4. Build screens:
   - **Login/Signup** (built-in Glide auth)
   - **Dashboard** (today's medications + appointments)
   - **Medications List** (all active meds)
   - **Add Medication Form** (name, dosage, times)

**Screen Layout Tips:**
- Dashboard: Use "Inline List" component for medications
- Add checkbox to each medication (binds to `tbl_TakenLog.was_taken`)
- Use "Form" button to open Add Medication modal

### Day 3: Appointments
1. Build **Appointments List** screen (calendar view)
2. Build **Add Appointment Form** (doctor, specialty, date/time)
3. Add "Get Directions" button (opens Google Maps with location)

### Day 4: AI Assistant
1. Create **AI Assistant** screen with 3 tabs:
   - Tab 1: Medication Lookup
   - Tab 2: Symptom Checker
   - Tab 3: Drug Interaction Check
2. Add "Search" button that calls n8n webhook:
   - Action: Call Webhook → `https://primary-production-2a165.up.railway.app/webhook/gemini-ai-proxy`
   - Body: `{"query_type": "medication_lookup", "params": {"medication_name": "[User Input]"}}`
3. Display response in Markdown text component

**Pro Tip:** Test webhook in n8n first, then integrate with Glide

### Day 5: Data Flow Testing
1. Create test account in Glide app
2. Add medication → Check if appears in Google Sheet
3. Mark medication as taken → Check if `tbl_TakenLog.was_taken` updates
4. Test AI Assistant → Verify response shows medical disclaimer

### Day 6-7: Internal Testing
1. Use app as a patient for 2 days
2. Add 3-5 medications with different schedules
3. Add 2-3 appointments
4. Note bugs, UX issues (e.g., buttons too small, confusing labels)
5. Fix critical issues

---

## Week 3: Advanced Features

### Day 1-2: Carer Dashboard
1. Add **Carer Dashboard** screen (only visible if `user.role = 'carer'`)
2. Add patient selector dropdown (from `tbl_Users WHERE linked_patient_id = Current User`)
3. Build "Share Schedule" action:
   - Generate text summary of today's meds + appointments
   - Open native share sheet (email/SMS/WhatsApp)

### Day 3: Weekly Adherence Report
1. Import n8n **Workflow 6:** Weekly Adherence Report
2. Runs every Monday at 8 AM
3. Emails carer with adherence stats + missed doses list

### Day 4-7: Testing & Refinement
1. Test carer features with 2-person scenario:
   - User A (patient): emma.patient@gmail.com
   - User B (carer): michael.carer@gmail.com
2. Link accounts via `tbl_Users.linked_patient_id`
3. Verify carer can view patient's medications
4. Test "Share Schedule" email format

---

## Week 4: History & Analytics

### Day 1-2: History Screen
1. Build **History & Adherence** screen
2. Add adherence progress wheel:
   - Calculate: `(COUNT WHERE was_taken = TRUE) / (COUNT total) * 100`
   - Color: Green (≥90%), Orange (70-89%), Red (<70%)
3. Add missed doses list (filterable by date range)

### Day 3-4: Export Data
1. Add "Export Data" button in Settings
2. Action: Download CSV of all user data (medications, appointments, taken log)

### Day 5-7: End-to-End Testing
1. Test full user journey (signup → add meds → use for 7 days → view adherence)
2. Check push notifications arrive on time
3. Verify AI assistant caching (same query should be instant 2nd time)
4. Performance test: Add 20 medications, 50 appointments → Check load time

---

## Week 5: Polish & Launch

### Day 1-3: Security & Compliance
- [ ] Test row-level security (patient can't see other patients' data)
- [ ] Add medical disclaimer to AI screens
- [ ] Write Privacy Policy (use template from Iubenda)
- [ ] Write Terms of Service
- [ ] Test "Delete Account" feature (must delete all user data)

### Day 4-5: Documentation
- [ ] Write User Guide (how to add medications, use AI assistant)
- [ ] Write Carer Guide (how to link patient, share schedules)
- [ ] Create demo video (1-2 min Loom recording)

### Day 6-7: Beta Testing
- [ ] Invite 5 beta testers (friends/family with chronic conditions)
- [ ] Collect feedback via in-app survey
- [ ] Fix top 3 issues reported

---

## Week 6: Launch!

### Soft Launch Checklist
- [ ] Set up custom domain (optional): `app.caretrack.com.au`
- [ ] Create launch post for Reddit: r/cancer, r/CancerFamilySupport
- [ ] Post in cancer support Facebook groups
- [ ] Share on LinkedIn healthcare communities
- [ ] Set up support email: support@caretrack.com (Gmail alias)

### Marketing Assets
- [ ] Screenshots (5-6 key screens)
- [ ] Demo video (upload to YouTube)
- [ ] One-pager PDF (features + benefits)
- [ ] Pitch: "Free medication tracker with AI assistant for cancer patients"

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `CARETRACK_IMPLEMENTATION_PLAN.md` | Full 60-page technical plan |
| `QUICK_START_GUIDE.md` | This file - week-by-week checklist |
| `index.html` | Original React app (reference for features) |
| `scipt.js` | Original React app logic (52KB, reference for AI prompts) |

---

## Critical URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Railway n8n** | https://primary-production-2a165.up.railway.app | Automation workflows |
| **Gemini API Console** | https://aistudio.google.com/apikey | Get API key, monitor usage |
| **Glide** | https://glide.com | Build mobile app |
| **Google Sheets** | (Your sheet URL) | Database |

---

## Emergency Troubleshooting

### Issue: Glide app not showing data from Sheets
- **Fix:** Check Glide data source connection → Refresh sheet
- Verify sheet has data (open in Google Sheets)
- Check row owners are configured correctly

### Issue: AI assistant returns error
- **Fix:** Check n8n workflow logs in Railway
- Verify `GEMINI_API_KEY` environment variable is set
- Test Gemini API directly: https://aistudio.google.com

### Issue: Push notifications not working
- **Fix:** Check user has granted notification permissions in Glide app
- Verify `tbl_Users.push_token` is populated
- Test Expo Push API with sample token

### Issue: n8n workflow fails
- **Fix:** Check Railway logs (click workflow → View Logs)
- Verify Google Sheets OAuth credential is still valid (refresh if expired)
- Re-activate workflow (sometimes Railway pauses after errors)

---

## Cost Monitoring

Set up alerts to avoid unexpected charges:
- **Railway:** Settings → Billing → Set alert at $5/month
- **Gemini API:** Monitor at https://aistudio.google.com (check daily usage)
- **Twilio (if using SMS):** Set alert at $10/month

**Expected monthly costs:**
- 0-500 users: **$0/month** (all free tiers)
- 500-5k users: **$30/month** (Glide Pro $25 + Railway $5)

---

## Next Steps After Launch

1. **Week 7-8:** Collect feedback from first 50 users
2. **Week 9:** Implement top 3 requested features
3. **Week 10:** Submit to Product Hunt
4. **Week 11:** Reach out to cancer support organizations for partnerships
5. **Week 12:** If >500 users → Upgrade to Glide Pro

---

## Success Metrics (Track Weekly)

| Metric | Week 1 | Week 4 | Week 12 | Target |
|--------|--------|--------|---------|--------|
| New Signups | 5-10 | 20-30 | 80-100 | 100 by Month 3 |
| Daily Active Users | 3-5 | 15-20 | 50-60 | 60% DAU |
| Avg Adherence % | - | 65% | 70% | 70%+ |
| AI Queries/Week | 10 | 50 | 150 | 30% users use AI |

---

**You're ready to build! Start with Week 1, Day 1. Good luck! 🚀**
