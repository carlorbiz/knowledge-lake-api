# GPSA Concept-to-Course System: Complete User Guide

## Overview
The GPSA Concept-to-Course system transforms educational concepts into fully-developed, professional course materials complete with PowerPoint presentations and voiceovers. This system is specifically designed for Australian healthcare education contexts.

## What the System Creates
- **Course structure recommendations** with 6-12 modules
- **Detailed module content** including learning objectives and activities
- **PowerPoint presentations** with professional slide designs
- **AI-generated voiceovers** with Australian pronunciation
- **Resource materials** including reading lists and assessment frameworks

## System Requirements
Before using the system, ensure these Script Properties are configured:
- `GEMINI_API_KEY` - Your Google AI API key
- `DRIVE_FOLDER_ID` - Google Drive folder for storing outputs
- `SLIDES_TEMPLATE_ID` - PowerPoint template file ID

## Complete Workflow

### Stage 1: Course Planning and Structure
**Purpose**: Transform your initial concept into a structured course outline

1. **Start with Course Concept Analysis**
   - Navigate to your spreadsheet
   - Click "GPSA Course Tools" menu → "Generate Course Recommendation"
   - Provide your course concept (e.g., "Clinical supervision skills for rural GPs")
   - The system analyses your concept and recommends 6-12 modules
   - Results appear in a new "Course-Recommendation-{Concept}" tab

2. **Review and Refine Structure**
   - Examine the recommended modules
   - Adjust module titles if needed
   - Ensure the progression makes educational sense
   - Consider your target audience (Clinical, Administrative, Combined, Other)

### Stage 2: Detailed Module Development
**Purpose**: Generate comprehensive content for each recommended module

3. **Generate Full Module Suite**
   - Select "GPSA Course Tools" menu → "Generate Full Module Resource Suite"
   - Choose batch processing (default: 3 modules at a time)
   - The system creates:
     - Learning objectives for each module
     - Detailed content outlines
     - Assessment criteria
     - Resource recommendations
     - Slide content specifications

4. **Monitor Progress**
   - Watch for progress notifications
   - Check the "Module-Resources-{Concept}" tab for outputs
   - Review generated content for accuracy and completeness

### Stage 3: Text-to-Speech Content Creation
**Purpose**: Prepare content optimised for voiceover generation

5. **Generate TTS Content**
   - From the Module-Resources tab, click "Generate TTS for All Modules"
   - This creates individual slide content in the "TTS-{Concept}" tab
   - Content is formatted specifically for voice synthesis
   - Australian English terminology and pronunciation guides are applied

6. **Review TTS Content**
   - Open the TTS tab to review voice-ready content
   - Each row represents one slide with optimised narration text
   - Content includes proper pacing and pronunciation notes

### Stage 4: PowerPoint Creation
**Purpose**: Generate professional presentation slides

7. **Create Presentation Slides**
   - From the TTS tab, select a module row
   - Click "GPSA Course Tools" menu → "Create Slides for Selected Row"
   - Or use "Create Slides for All Rows" to process all modules
   - Slides are created using your configured template
   - Links to presentations are saved in the TTS tab (Column F)

8. **Customise Presentations**
   - Open the generated PowerPoint presentations
   - Review slide content and formatting
   - Add images, logos, or additional branding as needed
   - Ensure slides align with GPSA/HPSA visual standards

### Stage 5: Voiceover Generation
**Purpose**: Create professional audio narration

9. **Generate Voiceovers**
   - From the TTS tab, select specific rows or entire modules
   - Click "GPSA Course Tools" menu → "Generate Audio for Selected"
   - Audio files are created with Australian English pronunciation
   - Files are saved to your configured Drive folder
   - Speaking pace is optimised for educational content (150 WPM)

10. **Audio Quality Control**
    - Listen to generated audio files
    - Check pronunciation of medical and healthcare terms
    - Verify appropriate pacing and intonation
    - Re-generate individual segments if needed

## Understanding Your Spreadsheet Tabs

### Course-Recommendation Tab
- **Column A**: Module numbers
- **Column B**: Recommended module titles
- **Column C**: Detailed course structure analysis
- **Column D**: Educational rationale

### Module-Resources Tab
- **Column A**: Module names
- **Column B**: Learning objectives
- **Column C**: Content outlines
- **Column D**: Assessment frameworks
- **Column E**: Resource lists
- **Column F**: Generated content status
- **Column G**: Slide specifications
- **Column H**: Detailed slide content (JSON format)

### TTS Tab
- **Column A**: Module names
- **Column B**: Slide numbers
- **Column C**: Voice-optimised slide content
- **Column D**: Audio generation status
- **Column E**: Audio file links
- **Column F**: PowerPoint presentation links

## Troubleshooting Common Issues

### "No slide content found in TTS tab"
**Solution**: Run "Generate Full Module Resource Suite" first to populate content

### Slide creation fails
**Solution**: 
- Check your SLIDES_TEMPLATE_ID is correct
- Ensure template is accessible in your Drive
- Verify template has proper placeholder elements

### Audio generation issues
**Solution**:
- Confirm GEMINI_API_KEY is valid and has TTS permissions
- Check API quota limits haven't been exceeded
- Ensure content isn't too long for single audio generation

### Missing or empty content
**Solution**:
- Re-run content generation for specific modules
- Check internet connectivity
- Verify Gemini API is responding

## Quality Assurance Tips

### Content Review
- Ensure Australian terminology is used consistently
- Verify healthcare concepts are accurate and current
- Check that content progression is logical
- Confirm assessment criteria align with learning objectives

### Technical Validation
- Test generated PowerPoint presentations open correctly
- Verify audio files play properly
- Check all links in spreadsheet work
- Ensure files are saved in correct Drive locations

### Educational Standards
- Confirm content meets CPD requirements
- Verify cultural safety considerations are addressed
- Check rural and remote context is appropriate
- Ensure RACGP/ACRRM alignment where relevant

## Advanced Features

### Batch Processing
- Adjust batch size using the configuration tools
- Larger batches process faster but use more API quota
- Smaller batches provide better error recovery

### Custom Templates
- Replace the default slide template with your organisation's design
- Update SLIDES_TEMPLATE_ID in Script Properties
- Ensure new templates have compatible placeholder structures

### API Quota Management
- Monitor usage through the built-in tracking system
- Adjust processing frequency during high-usage periods
- Use the quota tracking to plan large course developments

## Best Practices

### Planning Phase
1. Start with clear, specific course concepts
2. Consider your target audience from the beginning
3. Review similar existing courses for context
4. Plan for approximately 45-60 minutes per module

### Development Phase
1. Process modules in small batches initially
2. Review and refine content before proceeding to slides
3. Test slide creation with one module before processing all
4. Generate audio in small batches to manage file sizes

### Quality Control
1. Always review generated content before finalising
2. Test presentations on different devices
3. Have subject matter experts review technical content
4. Ensure accessibility considerations are met

## Support and Maintenance

### Regular Maintenance
- Check API keys remain valid
- Update Drive folder permissions as needed
- Review and update slide templates periodically
- Monitor system performance and quota usage

### System Updates
- Back up your spreadsheet before making changes
- Test new features on sample content first
- Keep records of successful configurations
- Document any customisations made

This system represents a significant advancement in automated course development for Australian healthcare education. With proper use, it can dramatically reduce course development time while maintaining high educational standards and professional presentation quality.