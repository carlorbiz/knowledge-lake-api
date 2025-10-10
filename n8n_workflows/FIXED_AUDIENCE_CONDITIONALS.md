# FIXED AUDIENCE CONDITIONALS FOR N8N
## Correct Way to Reference Audience Type in Prompts
## Date: 2025-10-02

---

## ❌ THE PROBLEM

**Wrong (doesn't work in n8n):**
```
{{ if $json.audience_type === "Healthcare Clinical" }}
```

**Why it fails:**
- `{{ if }}` is not valid n8n expression syntax
- n8n doesn't support conditional logic in prompt text
- JavaScript conditionals don't work in string templates

---

## ✅ THE SOLUTION

### **Option 1: Use JavaScript Ternary in Expression** (RECOMMENDED)

Instead of trying to put conditionals IN the prompt, build the prompt text IN CODE first:

**Create a new Code node BEFORE each AI node:**

```javascript
// Node: "Build Perplexity Prompt"
const audienceType = $('Trigger: Text Outputs Row Added').item.json['Audience Type '];

let audienceRequirements = '';
let audienceStandards = '';
let audienceTone = '';

// Build audience-specific content
if (audienceType === 'Healthcare Clinical') {
  audienceRequirements = `
- Focus on AHPRA, NMBA, NSQHS standards
- Clinical practice applications
- Evidence-based healthcare frameworks
- Patient safety and quality care
- Regulatory compliance for registered practitioners`;

  audienceStandards = 'AHPRA, NMBA, NSQHS Standards';
  audienceTone = 'clinical, evidence-based';

} else if (audienceType === 'Healthcare Operational') {
  audienceRequirements = `
- Focus on operational efficiency
- Process improvement methodologies
- Healthcare administration standards
- Team coordination and workflow optimization
- Compliance for operational roles`;

  audienceStandards = 'Australian Healthcare Operational Standards';
  audienceTone = 'operational, process-focused';

} else if (audienceType === 'Healthcare Management') {
  audienceRequirements = `
- Focus on middle management competencies
- Team leadership frameworks
- Performance management
- Resource allocation and budgeting
- Change management in healthcare`;

  audienceStandards = 'Healthcare Management Frameworks';
  audienceTone = 'leadership, management-focused';

} else if (audienceType === 'Healthcare Leadership' || audienceType === 'Executive Leadership') {
  audienceRequirements = `
- Focus on strategic leadership
- Governance and board-level decision-making
- Organizational transformation
- Executive responsibility frameworks
- Industry trends and innovation`;

  audienceStandards = audienceType.includes('Healthcare')
    ? 'Healthcare Governance Standards'
    : 'Corporate Governance Principles (ASX)';
  audienceTone = 'strategic, executive-level';

} else {
  audienceRequirements = `
- Focus on professional development
- Industry best practices
- Workplace application
- Career advancement frameworks
- Professional standards`;

  audienceStandards = 'Industry Best Practices';
  audienceTone = 'professional, practical';
}

// Build complete prompt with audience-specific sections
const fullPrompt = `You are an expert education researcher creating evidence-based content for professional development.

RESEARCH TASK: Deep analysis of "${$json.module_title}" for ${audienceType}

CONTEXT:
- Course: ${$json.course_title}
- Module: ${$json.module_title}
- Target Audience: ${audienceType}
- Research Foundation: ${$json.research_foundation}

AUDIENCE-SPECIFIC REQUIREMENTS:
${audienceRequirements}

TONE AND LANGUAGE:
Use ${audienceTone} language appropriate for ${audienceType}.

STANDARDS TO REFERENCE:
${audienceStandards}

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON
- NO <think> tags
- NO markdown code blocks

EXACT JSON STRUCTURE:
{
  "moduleNumber": ${$json.module_number},
  "moduleTitle": "${$json.module_title}",
  "enhancedSummary": "Write 350-400 words of evidence-based content for ${audienceType}. Include frameworks, ${audienceStandards}, and practical applications relevant to this audience.",
  "learningObjectives": [
    "Measurable objective 1 using Bloom's taxonomy for ${audienceType}",
    "Measurable objective 2 with clear competency outcome for this audience",
    "Measurable objective 3 aligned with ${audienceType} professional standards",
    "Measurable objective 4 focused on practical application in ${audienceType} context"
  ],
  "keyConcepts": [
    "Evidence-based concept 1 relevant to ${audienceType}",
    "Professional framework concept 2 for this audience",
    "${audienceStandards} concept 3",
    "Practical application concept 4"
  ],
  "enhancedContentAreas": [
    "Theoretical foundations relevant to ${audienceType}",
    "${audienceStandards} requirements and applications",
    "Practical implementation strategies for ${audienceType}"
  ],
  "visualOpportunities": [
    "Framework or model visualization for ${audienceType}",
    "Process or decision flow relevant to this audience"
  ],
  "professionalResources": [
    "${audienceStandards} reference or guideline",
    "Professional association resource for ${audienceType}"
  ],
  "citations": [
    "Author(s). Title. Journal/Source. Year;Volume(Issue):Pages. DOI/URL",
    "Author(s). Title. Journal/Source. Year;Volume(Issue):Pages. DOI/URL"
  ]
}

BEGIN RESEARCH AND RETURN ONLY THE JSON OBJECT ABOVE.`;

return [{
  json: {
    ....$json,
    prompt: fullPrompt,
    audience_type: audienceType,
    audience_standards: audienceStandards
  }
}];
```

**Then in Perplexity node, use:**
```
Prompt: {{ $json.prompt }}
```

---

### **Option 2: Inline Ternary (SIMPLER but Less Flexible)**

Use JavaScript ternary operators directly in n8n expressions:

**In Perplexity node prompt:**
```
=You are an expert education researcher.

RESEARCH TASK: Deep analysis of "{{ $json.module_title }}" for {{ $('Trigger: Text Outputs Row Added').item.json['Audience Type '] }}

AUDIENCE-SPECIFIC REQUIREMENTS:
{{ $('Trigger: Text Outputs Row Added').item.json['Audience Type '] === 'Healthcare Clinical' ? '- Focus on AHPRA, NMBA, NSQHS standards\n- Clinical practice applications\n- Patient safety and quality care' : $('Trigger: Text Outputs Row Added').item.json['Audience Type '] === 'Executive Leadership' ? '- Focus on strategic leadership\n- Governance and board decisions\n- Corporate governance principles' : $('Trigger: Text Outputs Row Added').item.json['Audience Type '] === 'Healthcare Management' ? '- Focus on management competencies\n- Team leadership frameworks\n- Performance management' : '- Focus on professional development\n- Industry best practices\n- Workplace application' }}

STANDARDS TO REFERENCE:
{{ $('Trigger: Text Outputs Row Added').item.json['Audience Type '] === 'Healthcare Clinical' ? 'AHPRA, NMBA, NSQHS Standards' : $('Trigger: Text Outputs Row Added').item.json['Audience Type '].includes('Healthcare') ? 'Australian Healthcare Standards' : $('Trigger: Text Outputs Row Added').item.json['Audience Type '].includes('Executive') ? 'Corporate Governance (ASX)' : 'Industry Standards' }}

[Rest of prompt using {{ $('Trigger: Text Outputs Row Added').item.json['Audience Type '] }} variable...]
```

---

### **Option 3: Switch Node (CLEANEST)**

**Add a "Switch" node after "2. Extract Individual Modules":**

1. Create Switch node
2. Mode: "Expression"
3. Add outputs for each audience type:

```
Output 1: {{ $json.audience_type === 'Healthcare Clinical' }}
  → Set audience_requirements: "AHPRA/NMBA/NSQHS..."

Output 2: {{ $json.audience_type === 'Healthcare Management' }}
  → Set audience_requirements: "Management frameworks..."

Output 3: {{ $json.audience_type === 'Executive Leadership' }}
  → Set audience_requirements: "Governance..."

Output 4 (default): {{ true }}
  → Set audience_requirements: "Professional standards..."
```

Then all outputs merge before Perplexity, and prompt uses:
```
{{ $json.audience_requirements }}
```

---

## 🎯 RECOMMENDED IMPLEMENTATION

### **Update Workflow Like This:**

```
Trigger: Text Outputs Row Added
    ↓
1. Parse Course Recommendation
    ↓
2. Extract Individual Modules
    ↓
NEW → 2b. Build Audience Context (Code)  ← ADD THIS
    ↓
3a. Enhanced Research (Perplexity)
```

**Node 2b Code:**
```javascript
// Build Audience Context
const audienceType = $('Trigger: Text Outputs Row Added').item.json['Audience Type '];

// Define audience-specific content
const audienceConfig = {
  'Healthcare Clinical': {
    requirements: '- AHPRA, NMBA, NSQHS standards\n- Clinical practice\n- Patient safety',
    standards: 'AHPRA, NMBA, NSQHS',
    tone: 'clinical, evidence-based',
    setting: 'healthcare clinical'
  },
  'Healthcare Operational': {
    requirements: '- Operational efficiency\n- Process improvement\n- Workflow optimization',
    standards: 'Healthcare Operational Standards',
    tone: 'operational, process-focused',
    setting: 'healthcare administrative'
  },
  'Healthcare Management': {
    requirements: '- Management competencies\n- Team leadership\n- Performance management',
    standards: 'Healthcare Management Frameworks',
    tone: 'leadership, management',
    setting: 'healthcare management'
  },
  'Healthcare Leadership': {
    requirements: '- Strategic leadership\n- Governance\n- Organizational transformation',
    standards: 'Healthcare Governance Standards',
    tone: 'strategic, executive',
    setting: 'healthcare boardroom'
  },
  'Executive Leadership': {
    requirements: '- Strategic planning\n- Corporate governance\n- Stakeholder management',
    standards: 'Corporate Governance (ASX)',
    tone: 'strategic, C-suite',
    setting: 'executive boardroom'
  },
  'Professional Development': {
    requirements: '- Professional development\n- Industry best practices\n- Career advancement',
    standards: 'Industry Best Practices',
    tone: 'professional, practical',
    setting: 'professional workplace'
  }
};

// Get config for this audience (fallback to Professional Development)
const config = audienceConfig[audienceType] || audienceConfig['Professional Development'];

return [{
  json: {
    ...$json,
    audience_type: audienceType,
    audience_requirements: config.requirements,
    audience_standards: config.standards,
    audience_tone: config.tone,
    audience_setting: config.setting
  }
}];
```

**Then in Perplexity prompt:**
```
AUDIENCE-SPECIFIC REQUIREMENTS:
{{ $json.audience_requirements }}

STANDARDS TO REFERENCE:
{{ $json.audience_standards }}

TONE AND LANGUAGE:
Use {{ $json.audience_tone }} language.
```

**In Gemini prompt:**
```
IMAGE PROMPT REQUIREMENTS:
Professional {{ $json.audience_setting }} image. NO TEXT visible.
```

**In Anthropic prompt:**
```
Create assessments appropriate for {{ $json.audience_type }} using {{ $json.audience_standards }}.
```

---

## 📋 COMPLETE FIX CHECKLIST

### Step 1: Add "Build Audience Context" Node
- [ ] After "2. Extract Individual Modules"
- [ ] Code node with audience config lookup
- [ ] Outputs: audience_requirements, audience_standards, audience_tone, audience_setting

### Step 2: Update Perplexity Prompt
- [ ] Replace conditionals with `{{ $json.audience_requirements }}`
- [ ] Use `{{ $json.audience_standards }}`
- [ ] Use `{{ $json.audience_tone }}`

### Step 3: Update Gemini Prompt
- [ ] Replace conditionals with `{{ $json.audience_setting }}`
- [ ] Use `{{ $json.audience_type }}` for language
- [ ] Use `{{ $json.audience_standards }}`

### Step 4: Update Anthropic Prompt
- [ ] Replace conditionals with `{{ $json.audience_standards }}`
- [ ] Use `{{ $json.audience_type }}` for context
- [ ] Adapt assessment levels per `{{ $json.audience_tone }}`

### Step 5: Test Each Audience Type
- [ ] Healthcare Clinical → Verify AHPRA/NMBA
- [ ] Executive Leadership → Verify ASX/Governance
- [ ] Healthcare Management → Verify Management frameworks
- [ ] Professional Development → Verify general standards

---

## 🚀 QUICK IMPLEMENTATION

**Add this node to your workflow JSON:**

```json
{
  "parameters": {
    "mode": "runOnceForEachItem",
    "jsCode": "[INSERT CODE FROM ABOVE]"
  },
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [450, 0],
  "id": "build-audience-context",
  "name": "2b. Build Audience Context"
}
```

**Update connections:**
```json
"2. Extract Individual Modules": {
  "main": [[{ "node": "2b. Build Audience Context", "type": "main", "index": 0 }]]
},
"2b. Build Audience Context": {
  "main": [[
    { "node": "3a. Enhanced Research (Perplexity)", "type": "main", "index": 0 },
    { "node": "5b. Assessments & Role Plays", "type": "main", "index": 0 }
  ]]
}
```

---

*Fixed Conditionals by: Claude Code*
*Now works with actual n8n expression syntax!*
