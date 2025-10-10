# PHOENIX SIMPLIFIED WORKFLOW - N8N IMPLEMENTATION
## Course Recommendation → Google Doc → Sheet Trigger → Knowledge Lake

### WORKFLOW OVERVIEW
Streamlined Phoenix workflow that removes IF branching complexity and focuses on: Course Recommendation generation → Google Docs creation → Google Sheets trigger setup → Knowledge Lake storage.

---

## N8N NODE STRUCTURE

### 1. GOOGLE SHEETS TRIGGER
**Node Type**: Google Sheets Trigger
**Configuration**:
- **Spreadsheet**: Phoenix Course Generation Master Sheet
- **Sheet**: Form responses 1
- **Event**: On Row Added
- **Columns to Monitor**: A (Course Concept), B (Audience Type), C (Source URLs)

**Output Mapping**:
```json
{
  "course_concept": "{{ $json.course_concept }}",
  "audience_type": "{{ $json.audience_type }}",
  "source_urls": "{{ $json.source_urls }}",
  "timestamp": "{{ $json.timestamp }}",
  "row_number": "{{ $json.row_number }}"
}
```

---

### 2. SET INITIAL CONTEXT
**Node Type**: Set
**Purpose**: Initialize variables and format data for downstream processing

**Variables to Set**:
```javascript
course_id = "course_" + new Date().toISOString().replace(/[-:]/g, '').substring(0, 15)
processing_timestamp = new Date().toISOString()
course_concept = {{ $node["Google Sheets Trigger"].json["course_concept"] }}
audience_type = {{ $node["Google Sheets Trigger"].json["audience_type"] }}
source_urls = {{ $node["Google Sheets Trigger"].json["source_urls"] }}
sheet_row = {{ $node["Google Sheets Trigger"].json["row_number"] }}
```

---

### 3. SORT NEWEST (OPTIONAL FILTER)
**Node Type**: Item Lists
**Operation**: Sort
**Purpose**: Ensure only the latest request is processed if multiple triggers occur

**Configuration**:
- **Field to Sort By**: timestamp
- **Sort Order**: Descending
- **Limit**: 1

---

### 4. COURSE RECOMMENDATION GENERATION
**Node Type**: HTTP Request
**Method**: POST
**URL**: `http://localhost:5001/course-architect`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Body**:
```json
{
  "course_concept": "{{ $json.course_concept }}",
  "audience_type": "{{ $json.audience_type }}",
  "source_urls": "{{ $json.source_urls }}"
}
```

**Expected Response**:
```json
{
  "success": true,
  "course_architecture": "detailed course recommendation content",
  "knowledge_id": "generated_id",
  "course_data": {
    "title": "course title",
    "modules": [...],
    "assessment_strategy": "...",
    "implementation_guidance": "..."
  }
}
```

---

### 5. CREATE GOOGLE DOC
**Node Type**: HTTP Request (DocsAutomator API)
**Method**: POST
**URL**: `https://api.docsautomator.co/api/create-document`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {{ $credentials.docsautomator.access_token }}"
}
```

**Body**:
```json
{
  "template_id": "course_recommendation_template",
  "document_title": "Course Recommendation: {{ $json.course_concept }}",
  "data": {
    "course_concept": "{{ $json.course_concept }}",
    "audience_type": "{{ $json.audience_type }}",
    "course_architecture": "{{ $node['Course Recommendation Generation'].json['course_architecture'] }}",
    "generation_date": "{{ $json.processing_timestamp }}",
    "course_id": "{{ $json.course_id }}"
  }
}
```

**Alternative Simple Approach** (if DocsAutomator unavailable):
```json
{
  "document_title": "Course Recommendation: {{ $json.course_concept }}",
  "content": "# COURSE RECOMMENDATION\n\n**Course Concept**: {{ $json.course_concept }}\n**Target Audience**: {{ $json.audience_type }}\n**Generated**: {{ $json.processing_timestamp }}\n\n## Course Architecture\n\n{{ $node['Course Recommendation Generation'].json['course_architecture'] }}\n\n---\n\n**Course ID**: {{ $json.course_id }}\n**Knowledge Lake Reference**: {{ $node['Course Recommendation Generation'].json['knowledge_id'] }}"
}
```

---

### 6. UPDATE GOOGLE SHEETS WITH DOC LINK
**Node Type**: Google Sheets
**Operation**: Update
**Configuration**:
- **Spreadsheet**: Phoenix Course Generation Master Sheet
- **Sheet**: Form responses 1
- **Row**: {{ $node["Set Initial Context"].json["sheet_row"] }}

**Updates**:
```json
{
  "course_id": "{{ $json.course_id }}",
  "google_doc_url": "{{ $node['Create Google Doc'].json['document_url'] }}",
  "status": "Course Recommendation Generated",
  "knowledge_lake_id": "{{ $node['Course Recommendation Generation'].json['knowledge_id'] }}",
  "next_step": "Ready for Module Generation"
}
```

---

### 7. TRIGGER MODULE GENERATION WORKFLOW
**Node Type**: Google Sheets
**Operation**: Append
**Configuration**:
- **Spreadsheet**: Phoenix Course Generation Master Sheet
- **Sheet**: Form responses 2 (Module Generation Triggers)

**Data to Append**:
```json
{
  "course_id": "{{ $json.course_id }}",
  "course_concept": "{{ $json.course_concept }}",
  "audience_type": "{{ $json.audience_type }}",
  "google_doc_url": "{{ $node['Create Google Doc'].json['document_url'] }}",
  "knowledge_lake_id": "{{ $node['Course Recommendation Generation'].json['knowledge_id'] }}",
  "trigger_timestamp": "{{ $json.processing_timestamp }}",
  "status": "Ready for Module Generation"
}
```

---

### 8. LOG TO KNOWLEDGE LAKE (EXISTING NODE)
**Node Type**: HTTP Request
**Method**: POST
**URL**: `http://localhost:5001/knowledge/store`

**Body**:
```json
{
  "content": "{{ $node['Course Recommendation Generation'].json['course_architecture'] }}",
  "metadata": {
    "type": "course_recommendation",
    "course_concept": "{{ $json.course_concept }}",
    "audience_type": "{{ $json.audience_type }}",
    "course_id": "{{ $json.course_id }}",
    "google_doc_url": "{{ $node['Create Google Doc'].json['document_url'] }}",
    "workflow_step": "phoenix_simplified"
  }
}
```

---

## WORKFLOW ERROR HANDLING

### Error Scenarios & Recovery:
1. **Course Recommendation Generation Fails**:
   - Update Google Sheet with error status
   - Log error to Knowledge Lake
   - Continue to create basic doc with form data

2. **Google Doc Creation Fails**:
   - Update Google Sheet with doc creation error
   - Store content in Knowledge Lake as backup
   - Continue workflow with Knowledge Lake reference

3. **Knowledge Lake Storage Fails**:
   - Update Google Sheet with storage warning
   - Continue workflow (non-critical failure)

### Error Handling Node Configuration:
```javascript
// In each HTTP Request node, add error handling
if ({{ $responseCode }} !== 200) {
  return [{
    error: true,
    message: "{{ $response.body.error }}",
    node: "Current Node Name",
    fallback_action: "continue_with_warning"
  }];
}
```

---

## TESTING SEQUENCE

### 1. Test Course Recommendation Generation:
```bash
curl -X POST http://localhost:5001/course-architect \
  -H "Content-Type: application/json" \
  -d '{
    "course_concept": "Hand Hygiene in Healthcare",
    "audience_type": "Healthcare Clinical",
    "source_urls": "https://www.who.int/gpsc/clean_hands_protection/en/"
  }'
```

### 2. Test Google Sheets Integration:
- Add test row to Form responses 1
- Verify trigger activation
- Check data flow through all nodes

### 3. Test Google Doc Creation:
- Verify DocsAutomator API credentials
- Test document template availability
- Confirm document creation and sharing settings

### 4. Test Knowledge Lake Storage:
- Verify Knowledge Lake API availability
- Test metadata structure
- Confirm storage and retrieval

---

## DEPLOYMENT CHECKLIST

- [ ] Google Sheets API credentials configured
- [ ] DocsAutomator API credentials configured
- [ ] Knowledge Lake API endpoint accessible
- [ ] Course Recommendation API endpoint tested
- [ ] Error handling nodes implemented
- [ ] Test data prepared for validation
- [ ] Workflow execution permissions set
- [ ] Google Doc template created
- [ ] Form responses 2 sheet tab created
- [ ] Module Generation workflow trigger ready

---

## NEXT STEPS AFTER IMPLEMENTATION

1. **Module Generation Workflow**: Create separate n8n workflow triggered by Form responses 2
2. **Quality Assurance**: Implement content validation nodes
3. **Notification System**: Add email/webhook notifications for completion
4. **Analytics Tracking**: Add workflow performance monitoring
5. **Scale Testing**: Test with multiple concurrent requests

This simplified workflow removes the complexity of IF branching while maintaining the core functionality needed for your Phoenix course generation system.