# PHOENIX NOTION WORKFLOW - N8N IMPLEMENTATION
## Notion Database → AI Document Analysis → Course Recommendation → Google Sheets → Knowledge Lake

### WORKFLOW OVERVIEW
Enhanced Phoenix workflow using Notion MCP integration with "On app event" trigger. Users upload research foundations to a shared Notion database, triggering automated course architecture generation and Google Sheets population for downstream module creation workflows.

---

## NOTION DATABASE STRUCTURE

### Phoenix Course Requests Database
**Required Properties:**
- **Course Concept** (Title) - Main course topic
- **Audience Type** (Select) - Healthcare Clinical, Operational Staff, Management, etc.
- **Source URLs** (URL) - Reference materials
- **Research Foundation** (Files & Media) - Uploaded PDF/document files
- **Status** (Status) - New Request, Processing, Course Generated, Complete
- **Course ID** (Formula) - Auto-generated unique identifier
- **Google Doc URL** (URL) - Generated course recommendation document
- **Knowledge Lake ID** (Text) - Reference for stored course data
- **Generated Date** (Created time) - Timestamp
- **Processing Notes** (Rich text) - AI analysis results

---

## N8N NODE STRUCTURE

### 1. NOTION APP EVENT TRIGGER
**Node Type**: Notion Trigger
**Configuration**:
- **Database**: Phoenix Course Requests Database
- **Events**: Page Created, Page Updated
- **Filters**: Status = "New Request"

**Output Mapping**:
```json
{
  "page_id": "{{ $json.id }}",
  "course_concept": "{{ $json.properties.course_concept.title[0].text.content }}",
  "audience_type": "{{ $json.properties.audience_type.select.name }}",
  "source_urls": "{{ $json.properties.source_urls.url }}",
  "research_files": "{{ $json.properties.research_foundation.files }}",
  "created_time": "{{ $json.created_time }}"
}
```

---

### 2. SET INITIAL CONTEXT
**Node Type**: Set
**Purpose**: Initialize variables and process Notion page data

**Variables to Set**:
```javascript
course_id = "course_" + new Date().toISOString().replace(/[-:]/g, '').substring(0, 15)
processing_timestamp = new Date().toISOString()
notion_page_id = {{ $node["Notion App Event"].json["page_id"] }}
course_concept = {{ $node["Notion App Event"].json["course_concept"] }}
audience_type = {{ $node["Notion App Event"].json["audience_type"] }}
source_urls = {{ $node["Notion App Event"].json["source_urls"] }}
research_files = {{ $node["Notion App Event"].json["research_files"] }}
has_research_foundation = {{ $node["Notion App Event"].json["research_files"].length > 0 }}
```

---

### 3. UPDATE NOTION STATUS TO PROCESSING
**Node Type**: Notion
**Operation**: Update Page
**Configuration**:
- **Page ID**: {{ $json.notion_page_id }}

**Properties to Update**:
```json
{
  "status": {
    "status": {
      "name": "Processing"
    }
  },
  "course_id": {
    "rich_text": [
      {
        "text": {
          "content": "{{ $json.course_id }}"
        }
      }
    ]
  },
  "processing_notes": {
    "rich_text": [
      {
        "text": {
          "content": "AI analysis started at {{ $json.processing_timestamp }}"
        }
      }
    ]
  }
}
```

---

### 4. AI DOCUMENT ANALYSIS (IF RESEARCH FOUNDATION UPLOADED)
**Node Type**: HTTP Request
**Method**: POST
**URL**: `http://localhost:5001/course-architect-from-research`

**Condition**: {{ $json.has_research_foundation === true }}

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
  "source_urls": "{{ $json.source_urls }}",
  "research_file_url": "{{ $json.research_files[0].file.url }}",
  "research_file_name": "{{ $json.research_files[0].name }}"
}
```

**AI Document Analysis Prompt** (embedded in endpoint):
```
DOCUMENT ANALYSIS FOR COURSE ARCHITECTURE

Analyze the uploaded research foundation document and extract:

1. **Course Concept Validation**: Does the document align with "{{ course_concept }}" for "{{ audience_type }}" audience?

2. **Research Foundation Quality**: Evaluate if the document meets our standards:
   - Comprehensive literature review (5+ peer-reviewed sources)
   - Australian healthcare context and compliance considerations
   - Evidence-based frameworks and methodologies
   - Professional development focus for experienced clinicians
   - Vancouver citation style references

3. **Content Extraction**: Extract key elements for course architecture:
   - Learning objectives and competency requirements
   - Evidence-based best practices and frameworks
   - Assessment strategies and evaluation methods
   - Implementation guidance and practical applications
   - Cultural safety and diversity considerations

4. **Course Architecture Generation**: Based on the research foundation, generate:
   - EXACTLY 10-12 comprehensive modules with learning objectives
   - Evidence-based assessment strategy using Miller's Pyramid
   - Implementation guidance incorporating latest research findings
   - Professional development pathway aligned with AHPRA/NMBA standards

Output a structured course architecture that leverages the uploaded research foundation while ensuring compliance with Australian healthcare professional development requirements.
```

---

### 5. COURSE RECOMMENDATION GENERATION (IF NO RESEARCH FOUNDATION)
**Node Type**: HTTP Request
**Method**: POST
**URL**: `http://localhost:5001/course-architect`

**Condition**: {{ $json.has_research_foundation === false }}

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

---

### 6. CREATE GOOGLE DOC
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
    "course_architecture": "{{ $node['AI Document Analysis'] ? $node['AI Document Analysis'].json['course_architecture'] : $node['Course Recommendation Generation'].json['course_architecture'] }}",
    "generation_date": "{{ $json.processing_timestamp }}",
    "course_id": "{{ $json.course_id }}",
    "research_source": "{{ $json.has_research_foundation ? 'User-provided research foundation' : 'AI-generated research foundation' }}"
  }
}
```

---

### 7. UPDATE NOTION WITH RESULTS
**Node Type**: Notion
**Operation**: Update Page
**Configuration**:
- **Page ID**: {{ $json.notion_page_id }}

**Properties to Update**:
```json
{
  "status": {
    "status": {
      "name": "Course Generated"
    }
  },
  "google_doc_url": {
    "url": "{{ $node['Create Google Doc'].json['document_url'] }}"
  },
  "knowledge_lake_id": {
    "rich_text": [
      {
        "text": {
          "content": "{{ $node['AI Document Analysis'] ? $node['AI Document Analysis'].json['knowledge_id'] : $node['Course Recommendation Generation'].json['knowledge_id'] }}"
        }
      }
    ]
  },
  "processing_notes": {
    "rich_text": [
      {
        "text": {
          "content": "Course architecture generated successfully. Document: {{ $node['Create Google Doc'].json['document_url'] }}. Ready for module generation workflow."
        }
      }
    ]
  }
}
```

---

### 8. TRIGGER GOOGLE SHEETS FOR MODULE GENERATION
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
  "knowledge_lake_id": "{{ $node['AI Document Analysis'] ? $node['AI Document Analysis'].json['knowledge_id'] : $node['Course Recommendation Generation'].json['knowledge_id'] }}",
  "notion_page_id": "{{ $json.notion_page_id }}",
  "research_source": "{{ $json.has_research_foundation ? 'User-provided' : 'AI-generated' }}",
  "trigger_timestamp": "{{ $json.processing_timestamp }}",
  "status": "Ready for Module Generation"
}
```

---

### 9. LOG TO KNOWLEDGE LAKE
**Node Type**: HTTP Request
**Method**: POST
**URL**: `http://localhost:5001/knowledge/store`

**Body**:
```json
{
  "content": "{{ $node['AI Document Analysis'] ? $node['AI Document Analysis'].json['course_architecture'] : $node['Course Recommendation Generation'].json['course_architecture'] }}",
  "metadata": {
    "type": "course_recommendation",
    "course_concept": "{{ $json.course_concept }}",
    "audience_type": "{{ $json.audience_type }}",
    "course_id": "{{ $json.course_id }}",
    "google_doc_url": "{{ $node['Create Google Doc'].json['document_url'] }}",
    "notion_page_id": "{{ $json.notion_page_id }}",
    "research_source": "{{ $json.has_research_foundation ? 'user_provided' : 'ai_generated' }}",
    "workflow_step": "phoenix_notion_integration"
  }
}
```

---

## ERROR HANDLING & RECOVERY

### Error Scenarios:
1. **Notion File Access Fails**:
   - Fall back to course generation without research foundation
   - Update Notion with warning message
   - Continue workflow with AI-generated research

2. **AI Document Analysis Fails**:
   - Switch to standard course architect endpoint
   - Log error details in Notion processing notes
   - Notify user of fallback approach

3. **Google Doc Creation Fails**:
   - Store course content directly in Knowledge Lake
   - Update Notion with alternative access method
   - Continue workflow with knowledge reference

### Error Handling Configuration:
```javascript
// Add to each HTTP Request node
if ({{ $responseCode }} !== 200) {
  // Update Notion with error status
  notion.update_page(notion_page_id, {
    status: "Error",
    processing_notes: "Error in {{ node_name }}: {{ $response.body.error }}"
  });

  // Return fallback data
  return [{
    error: true,
    message: "{{ $response.body.error }}",
    fallback_action: "continue_with_alternative"
  }];
}
```

---

## REQUIRED API ENDPOINT ADDITIONS

### New Endpoint: `/course-architect-from-research`
Add to `simple_api_server.py`:

```python
@app.route('/course-architect-from-research', methods=['POST'])
def course_architect_from_research():
    """
    PHOENIX NOTION WORKFLOW ENDPOINT
    Analyzes uploaded research foundation and generates course architecture
    """
    try:
        data = request.get_json()
        course_concept = data.get('course_concept')
        audience_type = data.get('audience_type')
        source_urls = data.get('source_urls', '')
        research_file_url = data.get('research_file_url')
        research_file_name = data.get('research_file_name')

        # Download and analyze research document
        research_content = download_and_extract_text(research_file_url)

        # Use existing parse_research_into_modules function
        course_architecture = parse_research_into_modules(
            research_content,
            course_concept,
            audience_type
        )

        # Store in Knowledge Lake
        knowledge_id = store_in_knowledge_lake(course_architecture, {
            'type': 'course_recommendation',
            'course_concept': course_concept,
            'audience_type': audience_type,
            'research_source': 'user_provided',
            'research_file': research_file_name
        })

        return jsonify({
            'success': True,
            'course_architecture': course_architecture,
            'knowledge_id': knowledge_id,
            'research_analysis': f'Analyzed user-provided research foundation: {research_file_name}',
            'source': 'notion_research_upload'
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
```

---

## NOTION SETUP REQUIREMENTS

### Database Configuration:
1. **Create Phoenix Course Requests Database** in shared workspace
2. **Set Properties** as specified above
3. **Configure Permissions** for n8n integration access
4. **Create Templates** for consistent data entry
5. **Set Up Views** for status tracking and management

### Integration Setup:
1. **Install Notion MCP** in n8n (already completed)
2. **Authenticate Notion** workspace access
3. **Test Database** read/write permissions
4. **Configure Webhook** endpoints for real-time triggers

---

## TESTING SEQUENCE

### 1. Test Notion Integration:
- Upload research foundation file to Notion database
- Verify n8n trigger activation
- Check data extraction and processing

### 2. Test AI Document Analysis:
```bash
curl -X POST http://localhost:5001/course-architect-from-research \
  -H "Content-Type: application/json" \
  -d '{
    "course_concept": "Advanced Wound Care Management",
    "audience_type": "Healthcare Clinical",
    "source_urls": "https://www.wounds.org.au/professional-development/",
    "research_file_url": "https://notion-file-url.com/research.pdf",
    "research_file_name": "wound_care_research_foundation.pdf"
  }'
```

### 3. Test Google Sheets Integration:
- Verify Module Generation trigger sheet population
- Check data flow to downstream workflows

### 4. Test Knowledge Lake Storage:
- Confirm course architecture storage
- Verify metadata structure and searchability

---

## DEPLOYMENT ADVANTAGES

### Benefits of Notion Integration:
1. **Native File Support**: Notion handles PDF/document uploads natively
2. **Real-time Triggers**: "On app event" provides immediate workflow activation
3. **User-Friendly Interface**: Familiar Notion UI for research foundation uploads
4. **Version Control**: Notion tracks document changes and updates
5. **Collaboration**: Multiple users can contribute research foundations
6. **Mobile Access**: Users can upload research from mobile devices
7. **Rich Metadata**: Notion properties provide structured data extraction

### Workflow Improvements:
1. **Simplified User Experience**: Drag-and-drop file uploads
2. **Better Error Handling**: Notion status updates provide clear feedback
3. **Enhanced Tracking**: Full audit trail of course generation process
4. **Scalable Architecture**: Handles multiple concurrent requests efficiently

---

## NEXT STEPS AFTER IMPLEMENTATION

1. **Module Generation Workflow**: Update to read from Google Sheets triggers
2. **Quality Validation**: Add research foundation quality scoring
3. **Notification System**: Notion-based status updates and alerts
4. **Analytics Dashboard**: Track usage patterns and success metrics
5. **Content Templates**: Pre-structured Notion templates for different course types

This Notion-based workflow eliminates the Dropbox integration complexity while providing a superior user experience and more reliable trigger mechanism.