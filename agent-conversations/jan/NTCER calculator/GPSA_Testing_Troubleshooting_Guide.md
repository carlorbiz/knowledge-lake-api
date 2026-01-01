# GPSA Course Creation System: Testing & Troubleshooting Guide

## Pre-Implementation Testing Checklist

### 1. Configuration Validation
Before running any course generation, verify:

```
✓ GEMINI_API_KEY is set and valid
✓ DRIVE_FOLDER_ID points to an accessible folder
✓ SLIDES_TEMPLATE_ID references a working PowerPoint template
✓ Template has proper title and body placeholders
✓ Google Apps Script permissions are granted
```

**Test Command**: Run "Validate Configuration" from GPSA Course Tools menu

### 2. API Connectivity Test
```
✓ Gemini API responds to test requests
✓ Google Drive API can create files
✓ Google Slides API can duplicate templates
✓ Text-to-Speech API generates audio
```

**Test Method**: Generate a single-module test course with concept "Test Module"

### 3. Template Compatibility Check
```
✓ Template opens in Google Slides
✓ Title placeholder accepts text
✓ Body placeholder accepts text
✓ Template can be duplicated
✓ Slides can be removed from duplicated presentations
```

## Step-by-Step Testing Protocol

### Phase 1: Basic Functionality Test

1. **Create Test Concept**
   - Use simple concept: "Basic Clinical Skills"
   - Run "Generate Course Recommendation"
   - **Expected Result**: 6-8 modules recommended
   - **Check**: Course-Recommendation tab created with sensible modules

2. **Generate Single Module**
   - Select first recommended module
   - Run "Generate Full Module Resource Suite" with batch size 1
   - **Expected Result**: Module-Resources tab populated
   - **Check**: Learning objectives, content, assessments generated

3. **Create TTS Content**
   - Run "Generate TTS for All Modules" 
   - **Expected Result**: TTS tab created with slide-by-slide content
   - **Check**: Content is properly formatted for speech

4. **Test Slide Creation**
   - Select one row in TTS tab
   - Run "Create Slides for Selected Row"
   - **Expected Result**: PowerPoint created, link in Column F
   - **Check**: Slides contain expected content, no template slides remain

### Phase 2: Error Recovery Testing

5. **API Quota Simulation**
   - Set artificially low batch size (1)
   - Generate multiple modules rapidly
   - **Expected Result**: Graceful handling with retry mechanisms
   - **Check**: Progress tracking works, no data loss

6. **Template Error Simulation**
   - Temporarily change SLIDES_TEMPLATE_ID to invalid ID
   - Attempt slide creation
   - **Expected Result**: Clear error message
   - **Check**: System doesn't crash, provides actionable feedback

7. **Content Parsing Test**
   - Manually edit TTS content to include unusual formatting
   - Create slides from modified content
   - **Expected Result**: Slides created despite formatting variations
   - **Check**: Content appears correctly in slides

## Common Error Messages and Solutions

### Configuration Errors

**Error**: `Set GEMINI_API_KEY in Script Properties`
- **Cause**: Missing or invalid API key
- **Solution**: Go to Script Editor → Settings → Script Properties → Add property
- **Test Fix**: Run configuration validation

**Error**: `Cannot access Drive folder`
- **Cause**: Folder ID incorrect or permissions missing
- **Solution**: Verify folder exists, check sharing permissions
- **Test Fix**: Try creating a test file in the folder

**Error**: `Cannot access slides template`
- **Cause**: Template ID incorrect or not accessible
- **Solution**: Check template exists, verify permissions
- **Test Fix**: Try opening template directly in Google Slides

### Runtime Errors

**Error**: `pres.removeSlide is not a function`
- **Cause**: Google Slides API method mismatch
- **Solution**: Apply the fixes in lines 1416 and 1458 (use `s.remove()` instead)
- **Test Fix**: Run slide creation after applying fixes

**Error**: `No slide content found in TTS tab`
- **Cause**: Attempting to create slides before generating TTS content
- **Solution**: Run "Generate Full Module Resource Suite" first
- **Test Fix**: Verify TTS tab has content in Column C

**Error**: `Could not set title/body content`
- **Cause**: Template placeholder compatibility issues
- **Solution**: Check template has proper TITLE and BODY placeholders
- **Test Fix**: Try with different template or simplified content

### API-Related Errors

**Error**: `API quota exceeded`
- **Cause**: Too many requests to Gemini API
- **Solution**: Wait for quota reset or reduce batch sizes
- **Test Fix**: Run small test with single module

**Error**: `Network timeout`
- **Cause**: Slow internet or API response delays
- **Solution**: Retry operation, check internet connection
- **Test Fix**: Run individual components separately

**Error**: `Content generation failed`
- **Cause**: Gemini API couldn't process request
- **Solution**: Simplify concept, check content for policy violations
- **Test Fix**: Try with different, simpler course concept

## Performance Testing

### Load Testing Protocol

1. **Small Scale Test**
   - Generate 3-module course
   - Measure completion time
   - Check memory usage
   - **Target**: <5 minutes total

2. **Medium Scale Test**
   - Generate 8-module course
   - Monitor API quota usage
   - Check error rates
   - **Target**: <15 minutes total

3. **Large Scale Test**
   - Generate 12-module course
   - Test batch processing efficiency
   - Monitor system stability
   - **Target**: <25 minutes total

### Performance Benchmarks
- **Course Recommendation**: <30 seconds
- **Single Module Generation**: <45 seconds
- **TTS Content Creation**: <20 seconds per module
- **Slide Creation**: <10 seconds per module
- **Audio Generation**: <30 seconds per slide

## Quality Assurance Testing

### Content Quality Checks

1. **Australian Context Validation**
   ```
   ✓ Uses "general practice" not "family medicine"
   ✓ References RACGP/ACRRM appropriately
   ✓ Includes rural/remote considerations
   ✓ Uses Australian English spelling
   ```

2. **GPSA Brand Consistency**
   ```
   ✓ Professional, supportive tone
   ✓ Focus on supervision and learning
   ✓ Cultural safety considerations
   ✓ Evidence-based content
   ```

3. **Educational Quality**
   ```
   ✓ Clear learning objectives
   ✓ Appropriate assessment criteria
   ✓ Logical content progression
   ✓ Practical, applicable content
   ```

### Technical Quality Checks

1. **PowerPoint Validation**
   ```
   ✓ Slides display correctly
   ✓ Text is readable and well-formatted
   ✓ Images (if any) display properly
   ✓ Template branding maintained
   ```

2. **Audio Quality**
   ```
   ✓ Clear pronunciation
   ✓ Appropriate pace (150 WPM)
   ✓ Correct Australian accent
   ✓ Medical terms pronounced correctly
   ```

## Regression Testing Suite

### Monthly System Health Check

1. **Configuration Integrity**
   - Verify all Script Properties remain valid
   - Test API key functionality
   - Check Drive folder accessibility

2. **Core Workflow Test**
   - Run complete workflow with test concept
   - Verify all tabs created correctly
   - Check all outputs generated properly

3. **Error Handling Validation**
   - Test with invalid inputs
   - Verify graceful error messages
   - Check system recovery capabilities

## Debugging Tools and Techniques

### Logging and Monitoring

1. **Console Logging**
   - Enable detailed logging in Script Editor
   - Monitor API call patterns
   - Track processing times

2. **Error Tracking**
   - Note exact error messages
   - Record steps leading to errors
   - Document successful workarounds

3. **Performance Monitoring**
   - Track API quota usage
   - Monitor memory consumption
   - Measure processing times

### Diagnostic Commands

```javascript
// Test configuration
CFG.validateConfiguration();

// Check API connectivity
callGeminiWithRetry('test', 'Simple test prompt');

// Validate template
createDeckFromTemplate('Test Presentation');

// Test slide creation
buildSlidesFromTTSContent(testPresentation, ['Test Slide\nTest content']);
```

## Recovery Procedures

### Data Recovery

1. **Corrupted Spreadsheet**
   - Revert to previous version via Google Sheets history
   - Export data before attempting repairs
   - Recreate tabs using backed-up configurations

2. **Lost Generated Content**
   - Check Drive folder for orphaned files
   - Re-run generation for missing modules
   - Use cached data from successful runs

3. **API Quota Exhaustion**
   - Wait for quota reset (usually 24 hours)
   - Implement smaller batch sizes
   - Process modules individually

### System Recovery

1. **Script Corruption**
   - Restore from backup version
   - Re-apply critical fixes (lines 1416, 1458)
   - Test with simple concept before full deployment

2. **Permission Issues**
   - Re-authorise Google Apps Script
   - Check Drive folder sharing settings
   - Verify API key permissions

This comprehensive testing approach ensures your GPSA Course Creation System operates reliably and produces high-quality educational content consistently.