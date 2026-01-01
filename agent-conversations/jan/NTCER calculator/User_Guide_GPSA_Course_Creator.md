# GPSA Concept-to-Course Creator: User Guide

*A complete guide for creating professional healthcare courses from concept to delivery-ready materials*

---

## Quick Start Checklist

Before you begin, ensure you have:
- ✅ **Google Apps Script project** set up with the GPSA code
- ✅ **API keys and folder IDs** configured in Script Properties
- ✅ **PowerPoint template** created and accessible
- ✅ **Source materials** ready (documents, PDFs, or URLs with your course content)

*Don't worry if the technical setup isn't your forte—your IT support should handle the backend configuration. This guide focuses on the creative process of building your course.*

---

## Overview: From Concept to Course

This system transforms your educational ideas into complete, professional courses with:
- **Structured learning modules** (6-12 modules per course)
- **PowerPoint slides** with professional design
- **Australian voiceovers** for each slide
- **Resource packs** for learners
- **Assessment frameworks**

The entire process takes a course concept and supporting materials and delivers everything you need for a micro-credentialing programme.

---

## Step-by-Step Workflow

### Phase 1: Course Planning & Approval

#### Step 1: Set Up Your Course Concept
1. **Open your Google Spreadsheet** (the one with the Healthcare Course Creator menu)
2. **Click "Healthcare Course Creator" → "Setup: Create Mapping Tab"**
   - This creates a clean workspace for your course planning
3. **In the new "Mapping" tab, fill in Row 2:**
   - **Column A (Concept Name):** e.g., "Effective Feedback Skills for GP Supervisors"
   - **Column B (Resources):** Link to your Google Drive folder or document containing source materials
   - **Column C (Target Audience):** Select from Clinical/Combined/Administrative/Other
   - Leave other columns blank for now

#### Step 2: Generate Course Recommendations  
1. **Select Row 2** (the row with your course concept)
2. **Click "Healthcare Course Creator" → "1. Generate Course Recommendation"**
3. **Wait 2-3 minutes** while the system:
   - Reads your source materials
   - Analyses the content for Australian healthcare context
   - Creates a detailed course structure recommendation
   - Suggests 6-12 learning modules
4. **Review the generated document** (link appears in Column D)
   - Check the recommended modules make sense
   - Consider the learning progression
   - Ensure coverage aligns with your objectives

#### Step 3: Refine Your Course (Optional)
If you want changes to the recommended structure:
1. **In Column F (Modification Requests)**, describe what you'd like changed:
   - *"Add a module on cultural safety considerations"*
   - *"Combine modules 3 and 4 as they're too similar"*
   - *"Include more rural context examples"*
2. **Select your row** and click **"2. Process Modification Request"**
3. **Review the updated recommendation** document

#### Step 4: Approve Your Course Structure
1. **Review the final recommendation** document thoroughly
2. **Tick the checkbox in Column E (Approved)** when you're satisfied
3. **Click "3. Create Approved Course Tab"**
   - This creates two new tabs: Module-Resources-{YourConcept} and TTS-{YourConcept}

---

### Phase 2: Content Development

#### Step 5: Generate Module Content
1. **Switch to the "Module-Resources-{YourConcept}" tab**
2. **Click "4. Generate Full Module Resource Suite"**
3. **Be patient—this takes 10-20 minutes** as the system creates:
   - Detailed module descriptions
   - Key learning concepts
   - Clinical scenarios
   - Assessment methods
   - Slide specifications (8-12 slides per module)
   - Printable resource packs
4. **Monitor progress** through the toast notifications in the bottom-right corner

#### Step 6: Review and Refine Content
For each module, review the generated content in columns:
- **Column C (Module Description):** Is the scope appropriate?
- **Column D (Key Concepts):** Are the essential points covered?
- **Column E (Clinical Scenarios):** Are examples relevant and realistic?
- **Column F (Assessment Methods):** Do these align with learning objectives?
- **Column H (Slide Specs):** Will these make engaging slides?

*If content needs adjustment, you can edit directly in the cells or regenerate individual modules by re-running the suite generation for selected rows.*

---

### Phase 3: Slide Creation & Voiceovers

#### Step 7: Create Voiceover Scripts
1. **In the Module-Resources tab, select a module row** (click on the row number)
2. **Click "5. Generate AI Voiceover Scripts (per slide)"**
3. **The system creates professional scripts** for each slide with:
   - Warm, educated Australian delivery style
   - Professional healthcare terminology
   - Conversational tone appropriate for colleagues
4. **Scripts appear in the TTS-{YourConcept} tab** for review

#### Step 8: Generate PowerPoint Slides
1. **Select a module row** in Module-Resources tab
2. **Click "Slides & Presentations" → "Create Slides for Selected Row"**
   - Or use "Create Slides for All Rows" for batch processing
3. **Professional slides are created** using your template with:
   - Module content formatted appropriately
   - Consistent branding and layout
   - Ready for any final customisation you need

#### Step 9: Generate Audio Voiceovers
Choose one approach:

**Option A: Automated Audio (Gemini TTS)**
1. **Click "Voiceover (Gemini TTS)" → "Generate Audio for Selected Module"**
2. **High-quality Australian voiceover files** are created automatically
3. **Files saved to your Google Drive** and linked in the TTS tab

**Option B: External Professional Voiceover**
1. **Click "Voiceover (External TTS)" → "Export CSV for Selected Module"**
2. **Send the CSV file** to your preferred voiceover service
3. **Upload completed audio files** to your Drive folder when ready

---

### Phase 4: Final Production

#### Step 10: Export Presentation Files
1. **Click "Slides & Presentations" → "Export PPTX for Selected Row"**
   - Or "Export All Decks to PPTX" for complete course
2. **Download the PowerPoint files** for final editing and delivery
3. **Add voiceover files** to slides if using external audio

#### Step 11: Quality Review
1. **Click "Data Integrity & Maintenance" → "Validate Data Integrity"**
2. **Review any flagged issues** and address them
3. **Test a sample presentation** to ensure everything works smoothly

---

## Understanding the Workspace

### Tab Functions
- **Mapping:** Course planning and approval workflow
- **Module-Resources-{Concept}:** Detailed content for each module
- **TTS-{Concept}:** Voiceover scripts and audio file links
- **IMG-{Concept}:** Image prompts for visual content (optional)

### Key Columns Explained

**Module-Resources Tab:**
- **A:** Module name (e.g., "Building Rapport and Trust")
- **B:** Course name (auto-populated)
- **C:** Module description (200-300 words)
- **D:** Key concepts (bullet points)
- **E:** Clinical scenarios (realistic examples)
- **F:** Assessment methods (how learning is evaluated)
- **G:** Resource pack link (printable materials)
- **H:** Slide specifications (detailed slide content)

**TTS Tab:**
- **A:** Module name
- **B:** Slide number
- **C:** Voiceover script (professional, conversational)
- **D:** Speaker notes (additional guidance)
- **E:** Duration estimate
- **F:** Slides link (PowerPoint presentation)
- **G:** Audio file link (WAV format)

---

## Tips for Success

### Content Quality
- **Start with comprehensive source materials** - the richer your input, the better the output
- **Include Australian guidelines and examples** where possible
- **Review and edit generated content** to match your specific requirements
- **Consider your audience's experience level** when reviewing module complexity

### Workflow Efficiency
- **Work through one complete module first** to understand the process
- **Use batch operations** (All Rows functions) once you're confident with the system
- **Save regularly** - the system creates backups, but manual saves are good practice
- **Allow adequate time** - a complete 8-module course typically takes 2-3 hours to generate

### Technical Considerations
- **Monitor your API usage** through the "View API Usage Stats" menu
- **Create manual backups** before major changes using the maintenance menu
- **If you encounter errors**, check the "Validate Configuration" option first

### Australian Healthcare Context
The system is specifically designed for Australian healthcare education and automatically:
- **Uses Australian English spelling** throughout
- **Incorporates RACGP/ACRRM terminology** where relevant
- **Considers rural and remote contexts**
- **Emphasises cultural safety** including Aboriginal and Torres Strait Islander health
- **Maintains professional, supportive tone** consistent with GPSA/HPSA standards

---

## Troubleshooting Common Issues

### "Configuration Error" Messages
- **Contact your IT support** to check Script Properties settings
- **Ensure all required IDs and keys** are properly configured

### "No modules detected" or Empty Results
- **Check your source materials** are accessible via the link in Column B
- **Verify the materials contain substantial content** (not just file lists)
- **Try regenerating recommendations** with more detailed source materials

### Slides Not Creating Properly
- **Ensure your PowerPoint template** is accessible and properly formatted
- **Check that slide specifications** in Column H contain proper formatting (# Slide N: Title)
- **Verify template placeholders** match the expected format

### Audio Generation Fails
- **Check API quotas** haven't been exceeded
- **Ensure voiceover scripts** are present in the TTS tab
- **Try generating one module at a time** if batch processing fails

### Performance Issues
- **Work with smaller batches** if processing large courses
- **Close other browser tabs** to free up memory
- **Allow extra time during peak usage periods**

---

## Getting Support

### Before Contacting Support
1. **Check "Validate Configuration"** in the maintenance menu
2. **Review any error messages** carefully
3. **Try regenerating just one module** to isolate issues
4. **Create a backup** before attempting fixes

### When You Need Help
Provide this information:
- **Specific error messages** (copy and paste exactly)
- **Which step** you were attempting
- **Course concept name** and which module was being processed
- **Whether this is your first time** using the system or a recurring issue

---

## Best Practices for Professional Results

### Source Material Preparation
- **Organise materials** in a dedicated Google Drive folder
- **Include recent Australian guidelines** where relevant
- **Add context documents** explaining your specific requirements
- **Ensure all linked resources** are accessible to the system

### Content Review Process
- **Review module descriptions first** - these drive all other content
- **Check clinical scenarios** for realism and relevance
- **Ensure slide specifications** will create engaging presentations
- **Validate assessment methods** align with learning objectives

### Final Quality Assurance
- **Test voiceover quality** on a sample before generating all modules
- **Check PowerPoint compatibility** with your presentation systems
- **Review resource packs** for completeness and usefulness
- **Conduct a dry run** of one complete module before course delivery

---

*This system is designed to handle the technical complexity while you focus on educational excellence. The AI maintains consistent quality while you provide the expertise and vision that makes each course uniquely valuable for Australian healthcare professionals.*