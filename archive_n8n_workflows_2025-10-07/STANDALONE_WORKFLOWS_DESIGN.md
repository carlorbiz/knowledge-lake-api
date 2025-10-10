# 🎯 STANDALONE WORKFLOW COMPONENTS

## 🔊 WORKFLOW 1: Audio Generation Agent

### **Sheet Structure:**
```
Col A: Slide Content (User Input)
Col B: Prepared Audio Script (OpenAI Generated)
Col C: Audio File Link (Gemini TTS Generated)
Col D: Upload Confirmation (User Checkbox)
Col E: Voice Type (Dropdown: Charon, Orus, Kore, Aoede)
Col F: Module Name (User Input)
Col G: Processing Status (Auto-updated)
```

### **n8n Workflow Architecture:**

#### **Node 1: Google Sheets Trigger**
```javascript
// Trigger: On row change in Col A (new slide content)
// Watch for: New entries or updates in Column A
// Filter: Only process rows where Col A has content AND Col B is empty
```

#### **Node 2: Data Validation & Setup**
```javascript
// Extract slide content from Col A
// Set default voice type if Col E is empty (default: "Charon")
// Set processing status: "Processing Script..."
// Update Col G with status
```

#### **Node 3: OpenAI Script Generation**
```javascript
const slideContent = $json.slideContent;
const voiceType = $json.voiceType || "Charon";

const scriptPrompt = `You are an expert audio script writer for Australian healthcare education.

SLIDE CONTENT: ${slideContent}

Create a 60-90 second audio script optimized for TTS with Australian pronunciation:

REQUIREMENTS:
- 150-180 words maximum (60-90 seconds at natural pace)
- Professional healthcare tone
- Natural flow with strategic pauses
- Australian spelling and terminology
- Clear pronunciation guides for technical terms

STRUCTURE:
- Hook opening (5-10 seconds)
- Core content delivery (45-70 seconds)
- Summary/transition (5-10 seconds)

PRONUNCIATION GUIDES:
- [AHPRA: ay-prah]
- [NMBA: en-em-bee-ay]
- Technical terms in brackets

OUTPUT FORMAT:
SCRIPT: [Your 150-180 word script here]

PRONUNCIATION: [Any technical term guides]

DURATION ESTIMATE: [XX seconds]`;

// Call OpenAI API
// Store result in Col B
```

#### **Node 4: Gemini Audio Generation**
```javascript
// Extract prepared script from Col B
// Call Knowledge Lake endpoint for audio generation
const audioRequest = {
    audio_scripts: [{
        slide_number: rowNumber,
        script: preparedScript,
        voice_type: voiceType,
        module_name: moduleName
    }]
};

// POST to Knowledge Lake: /generate-audio-batch
// Store returned audio URL in Col C
```

#### **Node 5: Completion Notification**
```javascript
// Update Col G: "Audio Ready"
// Send email/Slack notification to user
// Check if entire module is complete (all rows in module have Col C filled)
// If module complete: Send module completion notification
```

---

## 🔬 WORKFLOW 2: Research Foundation Agent

### **Sheet Structure:**
```
Col A: Course Concept + URLs (User Input)
Col B: Target Audience (Dropdown: Healthcare Clinical, Executive, etc.)
Col C: Processing Status (Auto-updated)
Col D: Research Foundation (Google Doc Link)
Col E: Completion Timestamp
```

### **n8n Workflow Architecture:**

#### **Node 1: Google Sheets Trigger**
```javascript
// Trigger: On new row or update in Col A
// Filter: Process when Col A has content AND Col D is empty
// Sort by newest entries first
```

#### **Node 2: Context Setup**
```javascript
// Extract course concept and URLs from Col A
// Get target audience from Col B
// Update Col C: "Researching..."
// Generate unique research session ID
```

#### **Node 3: Research Foundation Generation**
```javascript
const researchPrompt = `You are a research specialist creating comprehensive course foundations.

COURSE CONCEPT: ${courseConcept}
TARGET AUDIENCE: ${targetAudience}
SOURCE URLS: ${sourceUrls}

Generate a detailed research foundation document including:

1. EXECUTIVE SUMMARY
   - Course overview and rationale
   - Target audience analysis
   - Learning outcome projections

2. RESEARCH ANALYSIS
   - Comprehensive source analysis with Vancouver citations
   - Current industry trends and challenges
   - Evidence-based best practices

3. CONTENT FRAMEWORK
   - Recommended module structure (8-12 modules)
   - Learning progression pathway
   - Assessment strategy recommendations

4. REGULATORY COMPLIANCE
   - AHPRA/NMBA alignment (healthcare audiences)
   - Professional development requirements
   - Accreditation considerations

5. IMPLEMENTATION RECOMMENDATIONS
   - Delivery format suggestions
   - Resource requirements
   - Success metrics

Use Vancouver citation style throughout.`;

// Call Knowledge Lake research endpoint
// Generate comprehensive research document
```

#### **Node 4: Google Doc Creation**
```javascript
// Create new Google Doc with research content
// Apply professional formatting:
  // - Headers and subheaders
  // - Citation formatting
  // - Table of contents
  // - Professional styling

// Set document permissions (editable by user)
// Generate shareable link
```

#### **Node 5: Completion & Notification**
```javascript
// Update Col D with Google Doc link
// Update Col C: "Research Complete"
// Update Col E with timestamp
// Send notification with document link
```

---

## 📚 WORKFLOW 3: Module Content Generation Agent

### **Sheet Structure:**
```
Col A: Research Foundation / Course Content (User Input)
Col B: Generated Slides (Auto-populated)
Col C: Learning Objectives (Auto-populated)
Col D: Key Concepts (Auto-populated)
Col E: LMS Upload Doc (Google Doc Link)
Col F: Module Number (User Input)
Col G: Target Audience (User Input)
Col H: Processing Status (Auto-updated)
```

### **n8n Workflow Architecture:**

#### **Node 1: Google Sheets Trigger**
```javascript
// Trigger: On new content in Col A
// Filter: Process when Col A has content AND Col E is empty
// Validate module number and audience are provided
```

#### **Node 2: Content Analysis & Setup**
```javascript
// Parse research foundation content from Col A
// Extract key themes and learning requirements
// Set processing status: "Generating Module Content..."
// Determine module complexity based on content length
```

#### **Node 3: Slides Generation**
```javascript
const slidesPrompt = `Generate professional slides for this module:

FOUNDATION CONTENT: ${foundationContent}
MODULE NUMBER: ${moduleNumber}
TARGET AUDIENCE: ${targetAudience}

Create 8-12 slides with:
- Clear learning progression
- Professional healthcare formatting
- Evidence-based content with citations
- Interactive elements where appropriate
- 60-90 second audio-ready content per slide

FORMAT: JSON array of slide objects`;

// Call Course Architect (Anthropic) via Knowledge Lake
// Store formatted slides in Col B
```

#### **Node 4: Learning Objectives Generation**
```javascript
const objectivesPrompt = `Create specific, measurable learning objectives:

MODULE CONTENT: ${slideContent}
AUDIENCE: ${targetAudience}

Generate 4-6 SMART learning objectives:
- Specific and actionable
- Measurable outcomes
- Achievable for audience level
- Relevant to professional practice
- Time-bound for module completion

Use Bloom's taxonomy progression.`;

// Store objectives in Col C
```

#### **Node 5: Key Concepts Extraction**
```javascript
const conceptsPrompt = `Extract and define key concepts:

SLIDES: ${slideContent}
OBJECTIVES: ${learningObjectives}

Identify 6-8 critical concepts:
- Professional definitions
- Practical applications
- Evidence basis
- Assessment relevance

FORMAT: Concept list with definitions`;

// Store key concepts in Col D
```

#### **Node 6: LMS Upload Document Creation**
```javascript
// Combine all generated content into comprehensive LMS document
const lmsContent = `
MODULE ${moduleNumber}: [Module Title]

LEARNING OBJECTIVES:
${learningObjectives}

SLIDE CONTENT:
${formattedSlides}

KEY CONCEPTS:
${keyConcepts}

ASSESSMENT GUIDANCE:
[Generated assessment recommendations]

RESOURCES & REFERENCES:
[Vancouver-style bibliography]
`;

// Create Google Doc with professional formatting
// Apply LMS-ready structure and styling
```

#### **Node 7: Final Assembly & Notification**
```javascript
// Update all columns (B, C, D, E) simultaneously
// Set processing status: "Module Complete"
// Generate completion notification
// Check if all modules in course are complete
```

---

## 🔄 WORKFLOW INTEGRATION POINTS

### **Cross-Workflow Data Flow:**
```
Research Foundation → Module Generation → Audio Generation
     ↓                      ↓                  ↓
Google Doc            Slides/Objectives    Audio Files
     ↓                      ↓                  ↓
Manual Review         Copy to Audio        Upload to LMS
                      Generation Sheet
```

### **Shared Components:**
- **Knowledge Lake Integration**: All workflows call the same backend APIs
- **Notification System**: Consistent email/Slack notifications
- **Google Workspace**: Sheets triggers, Doc creation, Drive storage
- **Status Tracking**: Real-time processing updates across all workflows

### **User Control Points:**
1. **Input Validation**: Users control when workflows trigger
2. **Content Review**: Manual checkpoints between stages
3. **Quality Control**: User confirmation before final output
4. **Integration Flexibility**: Standalone or combined usage

This modular approach gives you complete control over each component while maintaining the sophistication of the full workflow when needed.