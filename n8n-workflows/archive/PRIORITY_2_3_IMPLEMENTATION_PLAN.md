# IMPLEMENTATION PLAN: PRIORITY 2 & 3

## 🎯 PRIORITY 2: Beautiful PDF Export via DocsAutomator

### **DocsAutomator Integration Architecture:**
```
Knowledge Lake → DocsAutomator API → Beautiful PDF → Email Delivery
```

### **Implementation Steps:**

#### **2.1 DocsAutomator Template Creation**
- **Course Summary Template**: Professional course overview with branding
- **Module Templates**: Individual module documents with assessments
- **Workbook Template**: Complete premium workbook layout
- **Audio Script Template**: TTS-ready scripts with pronunciation guides

#### **2.2 Knowledge Lake Integration**
```python
def generate_course_pdf_via_docs_automator(course_data, course_id):
    """Generate beautiful PDF package using DocsAutomator"""

    # Prepare template data
    template_data = {
        "course_title": course_data['course_concept'],
        "target_audience": course_data['audience_type'],
        "modules": course_data['modules'],
        "generated_date": datetime.now().strftime('%B %d, %Y'),
        "course_id": course_id
    }

    # Call DocsAutomator API
    pdf_response = requests.post(
        f"https://api.docsautomator.co/api/v1/templates/{TEMPLATE_ID}/generate",
        headers={"Authorization": f"Bearer {DOCS_AUTOMATOR_API_KEY}"},
        json=template_data
    )

    return pdf_response.json()
```

#### **2.3 Enhanced Endpoint**
- **Route**: `/course/complete-with-pdf`
- **Process**: Generate course → Save files → Create PDF → Email delivery
- **Output**: ZIP package + Beautiful PDF + Email confirmation

### **Deliverables:**
- ✅ Professional branded course PDFs
- ✅ Individual module PDFs
- ✅ Complete workbook PDFs
- ✅ Email delivery with download links

---

## 🎯 PRIORITY 3: Notion Admin Hub

### **Notion Database Architecture:**

#### **3.1 Course Management Database**
```
- Course ID (Title/Primary Key)
- Course Concept (Text)
- Target Audience (Select)
- Status (Select: Generating, Complete, PDF Ready, Delivered, Expired)
- Created Date (Date)
- Expiry Date (Formula: Created + 30 days)
- User Email (Email)
- Download Count (Number)
- File Package URL (URL)
- PDF Package URL (URL)
- Audio Files Generated (Checkbox)
- Premium Components (Multi-select)
```

#### **3.2 Module Tracking Database**
```
- Module ID (Title)
- Course (Relation to Course Management)
- Module Number (Number)
- Module Title (Text)
- Audio Script Status (Checkbox)
- Assessment Status (Checkbox)
- Role Play Status (Checkbox)
- Audio File URL (URL)
```

#### **3.3 Admin Analytics Database**
```
- Date (Date)
- Courses Generated (Number)
- Total Modules (Number)
- Audio Files Created (Number)
- Downloads (Number)
- API Calls Used (Number)
- Storage Used (Formula)
```

### **Implementation Steps:**

#### **3.1 Notion API Integration**
```python
def create_notion_course_record(course_data, course_id):
    """Create course record in Notion"""

    notion_data = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": {
            "Course ID": {"title": [{"text": {"content": course_id}}]},
            "Course Concept": {"rich_text": [{"text": {"content": course_data['course_concept']}}]},
            "Target Audience": {"select": {"name": course_data['audience_type']}},
            "Status": {"select": {"name": "Generating"}},
            "Created Date": {"date": {"start": datetime.now().isoformat()}},
            "User Email": {"email": course_data.get('user_email', '')}
        }
    }

    response = requests.post(
        "https://api.notion.com/v1/pages",
        headers={
            "Authorization": f"Bearer {NOTION_API_KEY}",
            "Notion-Version": "2022-06-28"
        },
        json=notion_data
    )

    return response.json()
```

#### **3.2 Real-time Progress Updates**
- **Course Generation**: Update status during each step
- **Module Completion**: Track individual module progress
- **File Creation**: Log file URLs and sizes
- **Delivery Status**: Track email delivery and downloads

#### **3.3 Admin Dashboard Views**
- **Active Courses**: Currently generating courses
- **Recent Deliveries**: Last 30 days of completed courses
- **Expiring Soon**: Courses approaching 30-day limit
- **Usage Analytics**: API calls, storage, generation trends

### **n8n Integration Workflows:**

#### **Workflow 1: Course Generation Monitoring**
```
Notion Database Change → n8n Trigger → Update Progress → Send Notifications
```

#### **Workflow 2: File Cleanup Automation**
```
Notion Expiry Date → n8n Schedule → Delete Files → Update Status
```

#### **Workflow 3: Analytics Collection**
```
Daily Schedule → Collect Metrics → Update Analytics Database
```

---

## 🚀 IMPLEMENTATION TIMELINE

### **Phase 1 (Priority 2): DocsAutomator Integration - 2-3 Days**
- Day 1: Template creation and API integration
- Day 2: PDF generation endpoint implementation
- Day 3: Testing and refinement

### **Phase 2 (Priority 3): Notion Admin Hub - 3-4 Days**
- Day 1: Notion database setup and API integration
- Day 2: Real-time progress tracking implementation
- Day 3: Admin dashboard views and analytics
- Day 4: n8n automation workflows

### **Phase 3: Full Integration - 1 Day**
- Complete workflow: Sheets → Knowledge Lake → Notion → PDF → Email
- End-to-end testing with real course generation
- Production deployment

---

## 📋 IMMEDIATE NEXT STEPS FOR PRIORITY 1

1. **Add to .env file:**
   ```
   GOOGLE_APPS_SCRIPT_URL=your_apps_script_url
   DOCS_AUTOMATOR_API_KEY=your_docs_automator_key
   ```

2. **Test new endpoint:**
   ```bash
   curl -X POST http://192.168.68.61:5000/course/complete-and-deliver \
   -H "Content-Type: application/json" \
   -d '{"course_concept": "Test Course", "audience_type": "Test Audience", "user_email": "test@example.com"}'
   ```

3. **Verify file creation:**
   - Check `/course_outputs/` folder for structured files
   - Verify ZIP package creation
   - Test audio script extraction

4. **Configure Apps Script integration:**
   - Update Apps Script to accept batch audio generation
   - Test API call from Knowledge Lake to Apps Script

**PRIORITY 1 IS NOW IMPLEMENTED AND READY FOR TESTING!**