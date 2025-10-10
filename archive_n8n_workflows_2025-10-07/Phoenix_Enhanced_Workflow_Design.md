# ENHANCED PHOENIX N8N WORKFLOW DESIGN
## Phoenix Generator with IF Branching Logic for Research Foundation Handling

### WORKFLOW OVERVIEW
Enhanced Phoenix workflow that leverages upgraded prompts and implements sophisticated branching logic for research foundation handling, with Google Sheets integration and Google Docs output generation.

### CORE WORKFLOW NODES STRUCTURE

#### 1. TRIGGER & INITIALIZATION
```
Google Sheets Trigger → Set Initial Context → Sort Newest → Research Foundation Decision (IF Node)
```

**Google Sheets Trigger**
- **Source**: "Course Requests" sheet (Tab 1)
- **Trigger**: On new row addition
- **Columns Monitored**: A (Course Concept), B (Audience Type), C (Source URLs), H (Research Foundation Upload)

**Set Initial Context**
- Extract course_concept, audience_type, source_urls from trigger data
- Initialize course_id with timestamp
- Check Column H for research foundation content
- Set workflow variables for downstream processing

**Sort Newest**
- Filter to most recent request based on timestamp
- Ensure only latest request is processed
- Pass filtered data to decision node

#### 2. RESEARCH FOUNDATION DECISION (IF NODE)
```
IF Column H (Research Foundation) IS NOT EMPTY
  → Research Foundation Validation Branch
ELSE
  → Research Foundation Generation Branch
```

### BRANCH A: RESEARCH FOUNDATION GENERATION
*Used when Column H is empty - system generates comprehensive research foundation*

#### Node Sequence:
```
Generate Research Foundation → Log to Knowledge Lake → Prepare for Course Architect
```

**Generate Research Foundation Node**
- **AI Provider**: Perplexity API
- **Prompt**: Enhanced Research Foundation from KNOWLEDGE_LAKE_PROMPTS_UPGRADED.md
- **Key Requirements**:
  - Comprehensive source analysis (500-750 words)
  - 5-10 additional peer-reviewed sources (last 5 years)
  - Vancouver citation style
  - Australian healthcare context
  - 7-section structure validation
- **Output**: Comprehensive research foundation (2000-3000 words)

**Log to Knowledge Lake**
- Store research foundation in mem0 memory
- Tag with course_id and timestamp
- Create searchable metadata for future reference

### BRANCH B: RESEARCH FOUNDATION VALIDATION
*Used when Column H contains uploaded research foundation*

#### Node Sequence:
```
Validate Research Foundation → Compliance Check → Format Verification → Log to Knowledge Lake
```

**Validate Research Foundation Node**
- **Input**: Content from Column H
- **Validation Criteria**:
  - Minimum 2000 words with academic rigor
  - All 7 required sections present
  - Vancouver-style citations for all sources
  - Australian healthcare context throughout
  - Evidence of comprehensive literature review (5+ peer-reviewed sources)
  - Clear relevance to course concept
  - Professional development focus for experienced clinicians

**Compliance Check**
- Verify Australian healthcare regulatory context (AHPRA, NMBA, RACGP, ACRRM)
- Check for cultural safety and diversity considerations
- Validate evidence-based content grounding

**Format Verification**
- Ensure structure matches expected format for downstream processing
- Validate that research foundation can map to course architecture requirements
- Check citation format compliance

### BRANCH CONVERGENCE: COURSE ARCHITECTURE GENERATION

#### Unified Processing Path:
```
Prepare for Course Architect → Call Course Architect → Generate Course Components → Create Google Docs → Update Sheets
```

**Prepare for Course Architect**
- Combine validated/generated research foundation with course parameters
- Format data for Course Architecture prompt
- Set context for comprehensive course development

**Call Course Architect**
- **AI Provider**: Claude (Anthropic) or OpenAI GPT-4
- **Prompt**: Enhanced Course Architecture from KNOWLEDGE_LAKE_PROMPTS_UPGRADED.md
- **Input**: Research foundation + course parameters
- **Output**: Complete course architecture including:
  - Course overview and objectives
  - Detailed module breakdown
  - Assessment strategy
  - Implementation timeline
  - Resource requirements

**Generate Course Components**
- **Parallel Processing Nodes**:
  1. Professional Slide Generation (using upgraded prompts)
  2. Enhanced Audio Script Generation
  3. Sophisticated Assessment Generation
  4. Professional Resources Generation
  5. Interactive Role Play Scenarios
  6. LMS Upload Text Generation

### GOOGLE DOCS INTEGRATION

**Create Hybrid Documents Node**
- **API**: DocsAutomator
- **Document Types**:
  1. Course Overview Document
  2. Research Foundation Document
  3. Course Architecture Document
  4. Module Content Documents (1 per module)
  5. Assessment Documents
  6. Resource Library Document

**Document Structure per Type**:
- **Course Overview**: Executive summary, learning objectives, target audience, duration
- **Research Foundation**: Complete 7-section research foundation with citations
- **Course Architecture**: Module breakdown, assessment strategy, implementation guide
- **Module Documents**: Learning objectives, content outline, activities, assessments per module

### GOOGLE SHEETS UPDATE

**Update Course Requests Sheet**
- Column I: Research Foundation Status (Generated/Validated)
- Column J: Course Architecture Status (Complete)
- Column K: Google Docs Links (JSON array of all document URLs)
- Column L: Knowledge Lake ID
- Column M: Processing Timestamp
- Column N: Next Workflow Trigger Flag

**Trigger Next Workflow**
- Set flag in "Audio Generation Requests" sheet (Tab 2)
- Pass course_id and Knowledge Lake references
- Enable continuation to Audio workflow

### ERROR HANDLING & VALIDATION

**Research Foundation Validation Failures**
- Log specific validation failures
- Update Sheet with error details
- Send notification for manual review requirement
- Halt workflow progression until resolved

**API Failures**
- Implement retry logic (3 attempts)
- Fallback AI providers for redundancy
- Log errors to dedicated error tracking sheet
- Maintain workflow state for recovery

**Google Docs Creation Failures**
- Retry with exponential backoff
- Log document creation status
- Provide alternative text-based outputs
- Update sheets with creation status

### WORKFLOW CONFIGURATION

**Environment Variables Required**:
```
PERPLEXITY_API_KEY=your_perplexity_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_SHEETS_CREDENTIALS=your_sheets_credentials
DOCSAUTOMATOR_API_KEY=your_docs_key
KNOWLEDGE_LAKE_URL=http://localhost:5001
```

**Workflow Settings**:
- **Timeout**: 300 seconds per node
- **Retry Logic**: 3 attempts with exponential backoff
- **Error Handling**: Continue on recoverable errors, halt on critical failures
- **Logging Level**: Detailed for debugging and audit trail

### KNOWLEDGE LAKE INTEGRATION

**Memory Storage Structure**:
```json
{
  "course_id": "course_20250930_143713_64525a02",
  "research_foundation": "complete_research_content",
  "course_architecture": "complete_architecture_content",
  "processing_metadata": {
    "research_source": "generated|uploaded",
    "validation_status": "passed|failed",
    "google_docs_urls": ["url1", "url2", ...],
    "processing_timestamp": "2025-09-30T14:37:13Z"
  }
}
```

**Query Capabilities**:
- Retrieve course data by course_id
- Search across research foundations
- Find similar course architectures
- Access processing history and metadata

### SUCCESS CRITERIA

**Workflow Completion Indicators**:
1. Research foundation generated/validated successfully
2. Course architecture created with all components
3. Google Docs created and accessible
4. Knowledge Lake storage completed
5. Google Sheets updated with all references
6. Next workflow triggered successfully

**Quality Assurance Checks**:
- Research foundation meets all 7-section requirements
- Course architecture aligns with Australian healthcare standards
- All citations follow Vancouver style
- Cultural safety considerations included
- Professional development focus maintained
- Evidence-based content throughout

### NEXT WORKFLOW TRIGGERS

**Audio Generation Workflow** (Tab 2)
- Triggered by completion flag in Course Requests sheet
- Inherits course_id and Knowledge Lake references
- Processes audio script generation using enhanced prompts

**Module Creation Workflow** (Tab 3)
- Triggered by Audio workflow completion
- Creates detailed module content using sophisticated prompts
- Generates interactive assessments and role-play scenarios

**Gamma Deck Workflow** (Future Integration)
- Triggered by Module workflow completion
- Creates presentation decks using text-to-image prompts
- Generates promotional materials for course marketing

This enhanced Phoenix workflow design ensures comprehensive research foundation handling, leverages all upgraded prompts, maintains Australian healthcare context throughout, and provides robust error handling and quality assurance at every stage.