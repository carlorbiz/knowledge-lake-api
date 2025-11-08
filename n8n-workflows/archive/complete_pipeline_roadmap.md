# Complete Course Generation Pipeline - Theory to Practice

## 🎯 **GOAL**: Google Sheets Entry → Professional Course with Audio Files

## **Current System Architecture:**

### **1. Phoenix Orchestrator (Master Controller)**
**Google Sheets Trigger** → **Research Foundation** → **Course Architect** → **Module Generator** → **Audio Generator**

### **2. Research Foundation Generator**
- **Input**: Course concept, source URLs
- **Process**: Perplexity research + evidence gathering
- **Output**: Research foundation stored in Knowledge Lake

### **3. Course Architect**
- **Input**: Research foundation
- **Process**: Course structure, learning objectives, modules outline
- **Output**: Complete course architecture

### **4. Module Generator**
- **Input**: Module specifications from Course Architect
- **Process**: 10-12 slides, assessments, role plays, workbooks
- **Output**: Complete module content

### **5. Audio Generator** (✅ WORKING!)
- **Input**: Slide content + voice selection
- **Process**: Fred script generation → Carlorbiz TTS Generator
- **Output**: Professional .wav files with Australian accent

### **6. Knowledge Lake** (✅ WORKING!)
- **Storage**: All content, research, modules, audio URLs
- **API**: http://192.168.68.61:5000

## **🔍 CURRENT STATUS CHECK:**

### ✅ **WORKING COMPONENTS:**
1. **Carlorbiz TTS Generator** - Deployed and tested
2. **Knowledge Lake API** - Running and accessible
3. **Audio Generator workflow** - Fixed and ready
4. **n8n infrastructure** - Docker running

### ❓ **COMPONENTS TO VERIFY:**
1. **Phoenix Orchestrator webhook** - Is it active?
2. **Module Generator webhook** - Is it active?
3. **Course Architect webhook** - Is it active?
4. **Google Sheets trigger** - Is it connected?
5. **Workflow connections** - Are they calling each other?

## **🚀 BEST APPROACH: Theory to Practice**

### **Phase 1: Component Testing (Now)**
Test each workflow individually with pinned data:

1. **Test Audio Generator** (✅ Done)
2. **Test Module Generator** with sample slide data
3. **Test Course Architect** with sample research
4. **Test Phoenix Orchestrator** with sample Google Sheets entry

### **Phase 2: Integration Testing**
Connect workflows step by step:

1. **Module Generator → Audio Generator** (for each slide)
2. **Course Architect → Module Generator** (for each module)
3. **Phoenix Orchestrator → Course Architect** (complete flow)

### **Phase 3: End-to-End Testing**
Complete Google Sheets → Audio files pipeline

## **🛠️ IMMEDIATE NEXT STEPS:**

### **Step 1: Get Webhook URLs**
- Phoenix Orchestrator production webhook
- Course Architect production webhook
- Module Generator production webhook
- Audio Generator production webhook (have this)

### **Step 2: Create Test Data Chain**
```
Google Sheets Entry:
Course Concept: "Clinical Reasoning for Emergency Nurses"
Source URLs: "https://pubmed.ncbi.nlm.nih.gov"
Audience: "Registered Nurses"
Voice: "Kore"
```

### **Step 3: Manual Workflow Testing**
Test each webhook manually with curl/Postman before connecting them

### **Step 4: Connect and Automate**
Link workflows together once each piece works individually

## **🎯 SUCCESS CRITERIA:**
- Google Sheets entry triggers complete course generation
- Research foundation created and stored
- Course structure with 3-5 modules
- Each module has 10-12 slides with professional audio
- All content stored in Knowledge Lake
- Final course package ready for LMS

## **🔧 DEBUGGING STRATEGY:**
1. **Test backwards** - Start with working components (Audio Generator)
2. **Work upstream** - Module Generator → Course Architect → Phoenix
3. **Use Knowledge Lake logs** - Check what's being stored
4. **Pin test data** - Use consistent test data for each workflow
5. **Monitor n8n execution logs** - Check for failures

## **❓ KEY QUESTIONS TO RESOLVE:**
1. What are the active webhook URLs for each workflow?
2. Are all workflows activated (not just saved)?
3. Is the Google Sheets trigger properly configured?
4. Are the workflow connections using correct webhook URLs?
5. Are all API keys and credentials working?

**RECOMMENDATION: Start with Step 1 - get all webhook URLs and test each workflow individually with pinned data. Once each piece works, connect them together.**