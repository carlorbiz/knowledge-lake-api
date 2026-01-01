/**
 * CORRECTED TTS SHEET STRUCTURE - Exact Specifications
 * 
 * CRITICAL CORRECTION: Your TTS sheet must have EXACTLY these 10 columns in this order:
 * A = Module Name
 * B = Slide#
 * C = Slide Content (extended sophisticated content for voiceover script development)
 * D = Voiceover Scripts (preferred name for Speaker Notes)
 * E = Duration (estimated length of that slide's voiceover)
 * F = Slides (PPT-ready) - Google Slides file linked at row 1 after menu #6
 * G = Audio (WAV) - TTS files linked for each slide after menu #8
 * H = Image Prompt (generated for each slide when TTS tab is created)
 * I = Notes (filler column due to dependencies on column J)
 * J = Alternate Slide Content (critical for slide generation workflow)
 * 
 * Audio Status purpose: Menu item #9 - when user chooses "uploaded", 
 * signifies audio file can be deleted safely when #9 is run.
 */

/**
 * CORRECTED ensureTTSSheet - Exact 10-column structure
 */
function ensureTTSSheet(concept){
  const ss = SpreadsheetApp.getActive();
  let tts = ss.getSheetByName(`TTS-${concept}`);
  if (!tts) {
    tts = ss.insertSheet(`TTS-${concept}`);
    
    // EXACT HEADER STRUCTURE - Must match your workflow exactly
    const headers = [
      'Module Name',           // A - Module identifier
      'Slide#',                // B - Slide sequence number
      'Slide Content',         // C - Extended sophisticated content for voiceover development
      'Voiceover Scripts',     // D - Speaker notes (preferred name)
      'Duration',              // E - Estimated voiceover length
      'Slides (PPT-ready)',    // F - Google Slides file link (row 1 after menu #6)
      'Audio (WAV)',          // G - TTS files for each slide (after menu #8)
      'Image Prompt',         // H - Generated for each slide during creation
      'Notes',                // I - Filler column (due to col J dependencies)
      'Alternate Slide Content' // J - Critical for slide generation workflow
    ];
    
    tts.getRange(1, 1, 1, 10).setValues([headers]).setFontWeight('bold');
    
    // Enhanced column width settings matching your workflow needs
    tts.setColumnWidth(1, 150);  // A - Module Name
    tts.setColumnWidth(2, 80);   // B - Slide#
    tts.setColumnWidth(3, 400);  // C - Slide Content (WIDE for sophisticated content)
    tts.setColumnWidth(4, 300);  // D - Voiceover Scripts (WIDE for script development)
    tts.setColumnWidth(5, 100);  // E - Duration
    tts.setColumnWidth(6, 150);  // F - Slides (PPT-ready)
    tts.setColumnWidth(7, 150);  // G - Audio (WAV)
    tts.setColumnWidth(8, 250);  // H - Image Prompt (WIDE for detailed prompts)
    tts.setColumnWidth(9, 120);  // I - Notes (minimal - filler)
    tts.setColumnWidth(10, 350); // J - Alternate Slide Content (WIDE for formatted content)
    
    // Add header formatting
    const headerRange = tts.getRange(1, 1, 1, 10);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setBorder(true, true, true, true, true, true);
    
    // Freeze header row
    tts.setFrozenRows(1);
    
    Logger.log(`Created TTS sheet for ${concept} with exact 10-column structure (A-J)`);
  }
  return tts;
}

/**
 * CORRECTED seedTTSFromSpecs - Works with exact 10-column structure
 */
function seedTTSFromSpecs(concept, moduleName, specText){
  const tts = ensureTTSSheet(concept);
  const norm = s => String(s||'').replace(/\s+/g,' ').trim();

  // Keep header + rows for other modules, remove rows for this one
  const last = tts.getLastRow();
  const header = [['Module Name','Slide#','Slide Content','Voiceover Scripts','Duration','Slides (PPT-ready)','Audio (WAV)','Image Prompt','Notes', 'Alternate Slide Content']];
  
  const keep = [];
  for (let r=2; r<=last; r++){
    const mod = norm(tts.getRange(r,1).getValue());
    if (mod !== norm(moduleName)){
      // Capture exact 10 columns (A-J)
      keep.push(tts.getRange(r,1,1,10).getValues()[0]);
    }
  }
  
  tts.clearContents();
  tts.getRange(1,1,1,10).setValues(header);
  if (keep.length) tts.getRange(2,1,keep.length,10).setValues(keep);

  // ENHANCED: Generate sophisticated slide content for Column C
  const slides = parseSlideSpecs(specText);
  
  // Show progress for slide content generation
  trackProgress('Enhanced Slide Content Generation', 0, slides.length, 'Generating executive-level slide content...');
  
  const rows = [];
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    trackProgress('Enhanced Slide Content Generation', i + 1, slides.length, `Generating content for slide ${i + 1}...`);
    
    try {
      // Create sophisticated slide content using executive-level prompts
      const bulletPoints = (slide.body || []).map(b => b.replace(/^\s*[-*•]\s*/, '').trim()).join('. ');
      
      // Clean the title to remove any formatting artifacts
      const cleanTitle = slide.title.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/^SLIDE TITLE:\s*/i, '').trim();
      
      const slideContentPrompt = brandHeader_() + `
Create sophisticated, executive-level slide content for a healthcare professional development presentation. This is slide ${i+1} in the "${concept}" module "${moduleName}".

USE THIS EXACT TITLE: ${cleanTitle}
CONCEPTS TO TRANSFORM INTO SOPHISTICATED CONTENT: ${bulletPoints}

REQUIREMENTS FOR EXECUTIVE SLIDE CONTENT:

1. FORMAT: Create Title + Body format content (completely transform bullet points):
   - Start with a clear, professional title
   - Follow with 2-3 cohesive paragraphs that flow naturally  
   - Transform the concepts into a sophisticated narrative discussion
   - Eliminate all bullet point formatting and structure

2. CONTENT SOPHISTICATION: Write for senior healthcare professionals:
   - Assume advanced clinical knowledge
   - Focus on practical application and systems thinking
   - Include leadership and supervision implications where relevant

3. NO CITATIONS OR REFERENCES: This is slide content, not academic material:
   - Do NOT include any numbered citations [1], [2], [3]
   - Do NOT reference specific guidelines by name and number
   - Do NOT include bibliographic information
   - Focus on principles and concepts without academic citations

4. AUSTRALIAN HEALTHCARE CONTEXT: Reference concepts naturally:
   - Mention general practice standards and frameworks
   - Reference supervision principles and best practices
   - Include Australian healthcare context without specific citations
   - Focus on practical application in Australian settings

5. PROFESSIONAL TONE: Use authoritative yet accessible language:
   - Write for peer-to-peer professional communication
   - Include relevant clinical scenarios or practice examples
   - Reference contemporary challenges in Australian healthcare
   - Avoid academic language - focus on practical wisdom

6. ENGAGEMENT: Include elements that prompt professional reflection:
   - Connect principles to practical application
   - Reference implications for practice improvement
   - Draw on established best practices without citing sources

7. LENGTH: Aim for 120-150 words of substantive content for voiceover development.

8. FORMATTING REQUIREMENTS:
   - NO citations, references, or numbered sources
   - NO Markdown formatting (**, ##, etc.) - use plain text only
   - NO meta-commentary or introductory phrases
   - Return ONLY the slide content - no explanatory text

9. CRITICAL TITLE FORMATTING:
   - Start with a clean, simple title (no "SLIDE TITLE:", no "**", no "##")
   - Use the original slide title from the specifications without modification
   - Follow title immediately with body paragraphs
   - Example format: "Coaching Techniques for IMGs" (not "SLIDE TITLE: Coaching Techniques for IMGs")

10. CRITICAL: DO NOT USE BULLET POINTS IN OUTPUT:
    - Transform all concepts into flowing paragraphs
    - Use sophisticated prose, not lists or bullet structures
    - Create cohesive narrative content suitable for executive presentation

11. FOCUS ON PRACTICAL WISDOM:
    - Emphasise actionable insights and applications
    - Use conversational authority rather than academic citations
    - Reference established principles without formal documentation

Generate slide content that demonstrates practical wisdom and professional insight without academic references. This content will be displayed on slides, not in research papers. 

CRITICAL: Begin your response with the exact title provided above ("${cleanTitle}") followed immediately by the body content. Do not modify, format, or add prefixes to the title.

Return ONLY the slide content with no additional commentary.`;

      // Generate enhanced slide content for Column C (extended sophisticated content)
      const enhancedContent = au(callGeminiWithRetry(slideContentPrompt, 1500));
      const slideContent = String(enhancedContent || slide.title).trim();
      
      // Generate image prompt for this slide (Column H)
      const imagePrompt = generateImagePrompt(slideContent, concept, moduleName);
      
      // Estimate duration for voiceover (Column E)
      // More detailed calculation: 150 words per minute for Australian English
      const wordCount = slideContent.split(/\s+/).length;
      const estimatedSeconds = Math.round((wordCount / 150) * 60);
      const minutes = Math.floor(estimatedSeconds / 60);
      const seconds = estimatedSeconds % 60;
      const durationDisplay = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
      
      // Create row with EXACT 10 columns (A-J)
      rows.push([
        moduleName,              // A - Module Name
        i+1,                    // B - Slide#
        slideContent,           // C - Slide Content (extended sophisticated for voiceover)
        '',                     // D - Voiceover Scripts (to be developed from Column C)
        durationDisplay,        // E - Duration (estimated voiceover length)
        '',                     // F - Slides (PPT-ready) - linked at row 1 after menu #6
        '',                     // G - Audio (WAV) - TTS files after menu #8
        imagePrompt,            // H - Image Prompt (generated during creation)
        '',                     // I - Notes (filler due to J dependencies)
        ''                      // J - Alternate Slide Content (populated by populateAlternateSlideContent)
      ]);
      
      // Rate limiting between slides
      if (i < slides.length - 1) {
        Utilities.sleep(6000); // 6 seconds between requests
      }
      
    } catch (error) {
      console.error(`Error generating content for slide ${i+1}:`, error.message);
      // Fallback to improved bullet format if AI generation fails
      const fallbackContent = `${slide.title}\n\n${(slide.body || []).map(b => b.replace(/^\s*[-*•]\s*/, '').trim()).join('. ')}`;
      const fallbackImagePrompt = generateImagePrompt(fallbackContent, concept, moduleName);
      const wordCount = fallbackContent.split(/\s+/).length;
      const estimatedSeconds = Math.round((wordCount / 150) * 60);
      const minutes = Math.floor(estimatedSeconds / 60);
      const seconds = estimatedSeconds % 60;
      const durationDisplay = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
      
      rows.push([
        moduleName,              // A - Module Name
        i+1,                    // B - Slide#
        fallbackContent,        // C - Slide Content (fallback)
        '',                     // D - Voiceover Scripts
        durationDisplay,        // E - Duration
        '',                     // F - Slides (PPT-ready)
        '',                     // G - Audio (WAV)
        fallbackImagePrompt,    // H - Image Prompt
        'Fallback content',     // I - Notes
        ''                      // J - Alternate Slide Content
      ]);
    }
  }
  
  if (rows.length){
    const start = tts.getLastRow()+1;
    tts.getRange(start,1,rows.length,10).setValues(rows);
  }
  
  trackProgress('Enhanced Slide Content Generation', slides.length, slides.length, 'Complete!');
  SpreadsheetApp.getUi().alert(`Generated ${rows.length} sophisticated slide content entries for "${moduleName}" with exact TTS workflow structure (10 columns A-J).`);
}

/**
 * CORRECTED populateAlternateSlideContent - Works with exact Column J
 * This function is called separately and populates Column J with formatted content
 */
function populateAlternateSlideContent(concept, moduleName, slideSpecs) {
  const tts = ensureTTSSheet(concept);
  const slides = parseSlideSpecs(slideSpecs);
  
  // Find rows for this module in TTS sheet
  for (let r = 2; r <= tts.getLastRow(); r++) {
    const rowModule = String(tts.getRange(r, 1).getValue()).trim();
    if (rowModule !== String(moduleName).trim()) continue;
    
    const slideNumber = tts.getRange(r, 2).getValue();
    const slideIndex = slideNumber - 1;
    
    if (slideIndex >= 0 && slideIndex < slides.length) {
      const slide = slides[slideIndex];
      
      // Build rich text content with proper formatting from slide specs
      const richTextBuilder = SpreadsheetApp.newRichTextValue();
      let fullText = '';
      
      // Add slide title (normal text)
      fullText += slide.title + '\n\n';
      
      if (slide.body && slide.body.length > 0) {
        // Process each item from slide specs (formatted as "label: content")
        slide.body.forEach(item => {
          const cleanItem = item.replace(/^\s*[-*•]\s*/, '').trim();
          
          // Process "label: content" format
          if (cleanItem.includes(':')) {
            const [label, content] = cleanItem.split(':', 2);
            fullText += label.trim() + '\n' + (content?.trim() || '') + '\n\n';
          } else {
            // Fallback for items that don't follow the format
            fullText += cleanItem + '\n\n';
          }
        });
      }
      
      // Remove trailing newlines
      fullText = fullText.trim();
      
      // Set the base text
      richTextBuilder.setText(fullText);
      
      // Apply bold formatting to labels (text before colons)
      let currentPos = 0;
      
      // Skip the title and first two newlines
      const titleEnd = slide.title.length + 2;
      currentPos = titleEnd;
      
      if (slide.body && slide.body.length > 0) {
        slide.body.forEach(item => {
          const cleanItem = item.replace(/^\s*[-*•]\s*/, '').trim();
          
          if (cleanItem.includes(':')) {
            const [label, content] = cleanItem.split(':', 2);
            const labelText = label.trim();
            
            // Find the position of this label in the full text
            const labelStart = fullText.indexOf(labelText, currentPos);
            if (labelStart >= 0) {
              const labelEnd = labelStart + labelText.length;
              
              // Apply bold formatting to the label
              richTextBuilder.setTextStyle(labelStart, labelEnd, 
                SpreadsheetApp.newTextStyle().setBold(true).build()
              );
              
              // Move current position past this label and content
              const contentText = content?.trim() || '';
              currentPos = labelEnd + contentText.length + 3; // +3 for newlines
            }
          }
        });
      }
      
      // Set the rich text value to Column J (position 10)
      tts.getRange(r, 10).setRichTextValue(richTextBuilder.build());
    }
  }
}

/**
 * Helper function: removeBulletsPreserveFormatting (included for completeness)
 */
function removeBulletsPreserveFormatting(content) {
  if (!content || !String(content).trim()) return '';
  
  const text = String(content).trim();
  const lines = text.split('\n');
  const processedLines = [];
  
  for (let line of lines) {
    let cleanedLine = line
      .replace(/^\s*[-•*▪▫◦‣⁃]\s*/, '') // Remove bullet points
      .replace(/^\s*\d+\.\s*/, '') // Remove numbered lists  
      .replace(/^\s*[a-zA-Z]\.\s*/, '') // Remove letter lists
      .replace(/^\s*[ivxIVX]+\.\s*/, '') // Remove roman numerals
      .trim();
    
    if (cleanedLine.length > 0 || line.trim() === '') {
      processedLines.push(cleanedLine);
    }
  }
  
  return processedLines.join('\n');
}

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. BACKUP your current TTS-related functions
 * 2. REPLACE ensureTTSSheet() with this corrected 10-column version
 * 3. REPLACE seedTTSFromSpecs() with this corrected version
 * 4. VERIFY populateAlternateSlideContent() matches your existing function
 * 5. TEST by creating a new TTS sheet - verify exact column structure (A-J)
 * 
 * CRITICAL CORRECTIONS:
 * - Restored exact 10-column structure (A-J) your workflow depends on
 * - Column C: Extended sophisticated content for voiceover script development
 * - Column D: "Voiceover Scripts" (preferred name)
 * - Column E: Duration with proper time formatting (mm:ss or Xs)
 * - Column F: Slides (PPT-ready) - for Google Slides link at row 1 after menu #6
 * - Column G: Audio (WAV) - for TTS files after menu #8
 * - Column H: Image Prompt - generated during creation
 * - Column I: Notes - filler due to Column J dependencies
 * - Column J: Alternate Slide Content - critical for slide generation workflow
 * 
 * This structure supports:
 * - Menu #6: Google Slides generation (links in F1)
 * - Menu #8: TTS audio generation (links in G column)
 * - Menu #9: Audio cleanup (uses audio status for deletion safety)
 * - Slide generation workflow using Column J formatted content
 * - Voiceover script development from Column C extended content
 */