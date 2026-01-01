# Concept-to-Course Administrator Guide

## Technical Maintenance & Troubleshooting Manual

---

### Administrator Overview

This guide is for **Carla Taylor (Administrator)** and covers technical maintenance, troubleshooting, system configuration, and user support for the Concept-to-Course professional tool.

**Key Principle:** Users should focus on content creation, not technical troubleshooting. All system-level issues should be handled by the administrator.

---

## System Architecture

### Core Components

**Google Apps Script Foundation:**
- Main script file: `CTscript_Concept2Course_[date].txt`
- Configuration management via Script Properties
- API integration with Gemini 2.5 Flash and TTS
- Drive and Slides API for file management
- Error logging and progress tracking

**Required Script Properties:**
```
GEMINI_API_KEY: AI model access key
DRIVE_FOLDER_ID: Root folder for all course projects  
SLIDES_TEMPLATE_ID: Master presentation template
BATCH_SIZE: Processing batch size (optional, default: 3)
REGENERATE_TTS: Audio regeneration flag (optional)
```

**Spreadsheet Structure:**
- **Mapping Sheet:** Course configuration and module tracking
- **Module-Resources-{Concept}:** Content development workspace  
- **TTS-{Concept}:** Audio generation management
- **How to Use:** User instruction interface
- **Status:** System operation logging

### API Dependencies

**Gemini API Limits:**
- Rate limiting: 10 requests/minute, 1M tokens/day
- Retry logic with exponential backoff
- Usage tracking in Script Properties
- Automatic quota monitoring

**Google Drive API:**
- File creation, organisation, and management
- Folder structure maintenance
- Template copying and customisation
- Archive and cleanup operations

**Google Slides API:**
- Presentation creation from templates
- Content population and formatting
- Link generation and file management

---

## Installation & Configuration

### Initial Setup Process

1. **Script Deployment:**
   - Copy complete script code to new Google Apps Script project
   - Enable required APIs (Drive, Slides, Advanced Drive Service)
   - Set up Script Properties via Setup Wizard or manual configuration

2. **API Configuration:**
   - Obtain Gemini API key from Google AI Studio
   - Test API connectivity with validation function
   - Configure rate limiting and usage tracking

3. **Drive Structure:**
   - Verify main project folder access permissions
   - Test subfolder creation and file management
   - Validate template accessibility

### Setup Wizard Implementation

The enhanced setup wizard (`launchSetupWizard()`) provides guided configuration:

**Wizard Flow:**
1. Configuration detection and validation
2. API key input and testing  
3. Drive folder selection or creation
4. Slides template configuration or generation
5. Initial worksheet creation
6. Complete system validation

**Error Handling:**
- Each step includes validation and rollback capability
- Clear error messages with escalation guidance
- Configuration state tracking for partial completions

---

## User Support Protocols

### Issue Classification

**User Handles (No Admin Intervention):**
- Content quality review and refinement
- Module sequencing and educational design decisions
- Audio voice selection and branding choices
- Normal workflow progression and quality checks

**Administrator Handles (Immediate Escalation Required):**
- Script errors or Google Apps Script issues
- API connectivity or authentication problems
- File access permission issues
- Configuration errors or missing properties
- System performance or timeout issues
- Data corruption or worksheet problems

### Support Response Framework

**Immediate Response Required:**
- Script execution errors
- Data loss or corruption issues
- Complete system failure
- API quota exceeded warnings

**Standard Response Timeline:**
- Configuration issues: Within 2 hours
- Workflow guidance: Within 4 hours  
- Enhancement requests: Within 24 hours
- Documentation updates: Within 48 hours

### Diagnostic Information Collection

When users report issues, collect:
```
1. Error message (exact text if available)
2. Current step in workflow
3. Course concept and module being processed
4. Approximate time of error occurrence
5. Browser and device information
6. Recent actions performed
```

---

## Monitoring & Maintenance

### System Health Checks

**Daily Monitoring:**
- API usage tracking and quota status
- Error log review in Status sheet
- Drive storage utilisation
- Script execution performance

**Weekly Maintenance:**
- Configuration validation across all instances
- User activity and success metrics
- API key rotation if required
- Backup verification

**Monthly Review:**
- System performance optimisation
- User feedback integration
- Feature usage analytics
- Documentation updates

### Performance Optimisation

**API Efficiency:**
- Batch processing configuration (`CFG.setBatchSize()`)
- Rate limiting adjustment based on usage patterns
- Request caching for repeated operations
- Usage distribution across time periods

**Drive Management:**
- Folder structure organisation
- File cleanup and archive processes
- Permission management and sharing settings
- Storage quota monitoring

**Script Performance:**
- Execution time monitoring
- Memory usage optimisation  
- Error rate tracking and reduction
- User experience improvement

---

## Troubleshooting Guide

### Common Issues and Solutions

**1. API Authentication Failures**
```
Symptoms: "Invalid API key" or authentication errors
Diagnosis: Check Script Properties GEMINI_API_KEY
Resolution: 
- Validate API key format and permissions
- Test with simple callGemini() function
- Regenerate API key if necessary
- Update Script Properties with new key
```

**2. Drive Access Issues**
```
Symptoms: "Cannot access folder" or permission errors
Diagnosis: Check DRIVE_FOLDER_ID and permissions
Resolution:
- Verify folder exists and is accessible
- Check sharing permissions (edit required)
- Update DRIVE_FOLDER_ID if folder moved
- Test with DriveApp.getFolderById() directly
```

**3. Content Generation Failures**
```
Symptoms: Empty responses or generation timeouts
Diagnosis: Check API quota and source materials
Resolution:
- Review daily API usage in Script Properties
- Validate source material accessibility
- Implement retry logic if not functioning
- Break large requests into smaller batches
```

**4. Audio Generation Problems**
```
Symptoms: TTS failures or audio file corruption
Diagnosis: Check Gemini TTS API and file creation
Resolution:
- Verify TTS API endpoint and parameters
- Test audio blob creation and Drive storage
- Check WAV conversion functionality
- Validate file permissions and naming
```

**5. Worksheet Corruption**
```
Symptoms: Missing data or formatting issues
Diagnosis: Check sheet structure and data integrity
Resolution:
- Backup current data before repairs
- Recreate sheets using template functions
- Restore data from Status sheet logs
- Implement additional validation checks
```

### Advanced Diagnostics

**API Usage Analysis:**
```javascript
// Check current API usage
function checkApiUsage() {
  const props = PropertiesService.getScriptProperties();
  const today = new Date().toDateString();
  const usageKey = `gemini_tokens_${today}`;
  const usage = parseInt(props.getProperty(usageKey) || '0');
  console.log(`Today's usage: ${usage} tokens`);
  return usage;
}
```

**Configuration Validation:**
```javascript
// Comprehensive configuration check
function validateSystemConfiguration() {
  try {
    CFG.validateConfiguration();
    console.log('✓ Configuration valid');
    return { valid: true };
  } catch (error) {
    console.error('✗ Configuration error:', error.message);
    return { valid: false, error: error.message };
  }
}
```

**Drive Structure Audit:**
```javascript
// Verify folder structure integrity
function auditDriveStructure() {
  const folder = DriveApp.getFolderById(CFG.DRIVE_FOLDER_ID);
  const subfolders = folder.getFolders();
  const structure = [];
  
  while (subfolders.hasNext()) {
    const subfolder = subfolders.next();
    structure.push({
      name: subfolder.getName(),
      id: subfolder.getId(),
      files: subfolder.getFiles().hasNext()
    });
  }
  
  console.log('Folder structure:', structure);
  return structure;
}
```

---

## Security & Access Management

### API Key Management

**Security Protocols:**
- API keys stored only in Script Properties (never in code)
- Regular key rotation schedule (quarterly recommended)
- Access logging and monitoring
- Immediate revocation capability for compromised keys

**Key Rotation Process:**
1. Generate new API key in Google AI Studio
2. Test new key in isolated environment
3. Update Script Properties with new key
4. Verify functionality across all features
5. Revoke old API key
6. Document rotation date and reason

### User Access Control

**Permission Levels:**
- **View Only:** Can observe workflow, cannot execute functions
- **Content Creator:** Full workflow access, no configuration changes
- **Administrator:** Complete system access and configuration control

**Access Monitoring:**
- Track user activity through Status sheet logging
- Monitor API usage by user/session
- Regular access review and cleanup
- Automated alerts for unusual activity patterns

### Data Protection

**Content Security:**
- Source materials handled according to confidentiality requirements
- Generated content includes appropriate copyright notices
- User data segregation in separate Drive folders
- Regular backup and disaster recovery procedures

**Compliance Considerations:**
- Healthcare content compliance with professional standards
- Citation accuracy and research integrity
- Australian privacy and data protection requirements
- Professional development record keeping standards

---

## System Updates & Enhancement

### Version Control

**Script Versioning:**
- Date-stamped filenames for major releases
- Changelog documentation for all modifications
- Rollback procedures for failed updates
- Feature flag management for gradual rollouts

**Update Process:**
1. Test changes in development environment
2. Create backup of current production version
3. Deploy updates during low-usage periods
4. Validate all functions post-deployment
5. Monitor for 24 hours after major updates
6. Document changes and user communication

### Feature Enhancement

**User Request Processing:**
1. Evaluate technical feasibility and resource requirements
2. Assess impact on existing functionality
3. Design implementation with backward compatibility
4. Test thoroughly in isolated environment
5. Create user documentation and training materials
6. Deploy with appropriate change management

**Performance Monitoring:**
- Execution time tracking for optimization opportunities
- User satisfaction metrics and feedback collection
- Error rate analysis and reduction strategies
- API efficiency improvements and cost management

---

## Backup & Disaster Recovery

### Backup Strategy

**Daily Backups:**
- Script Properties export to secure storage
- Critical spreadsheet templates and configurations
- User project folder structure documentation
- API usage and performance metrics

**Weekly Backups:**
- Complete script code archive
- User data and project backups
- Configuration documentation updates
- System performance baseline records

**Recovery Procedures:**
1. **Script Failure:** Restore from last known good version
2. **Configuration Loss:** Restore Script Properties from backup
3. **Data Corruption:** Restore user projects from Drive backups  
4. **API Issues:** Switch to backup API keys or alternative services
5. **Complete System Failure:** Full rebuild from documentation and backups

### Business Continuity

**Service Continuity Planning:**
- Alternative API providers identification and testing
- Manual workflow procedures for critical functions
- User communication protocols during outages
- Priority user identification and support procedures

**Recovery Time Objectives:**
- Script restoration: 4 hours maximum
- Configuration recovery: 2 hours maximum
- User data recovery: 6 hours maximum
- Full service restoration: 8 hours maximum

---

## Documentation Management

### User Documentation

**Maintenance Schedule:**
- Monthly review of user guide accuracy
- Quarterly update of workflow documentation
- Annual complete review and revision
- Immediate updates for feature changes

**Version Control:**
- Document versioning aligned with script releases
- Change tracking and approval processes
- User notification of documentation updates
- Archive management for historical reference

### Technical Documentation

**Code Documentation:**
- Inline comments for all major functions
- API integration documentation
- Configuration change procedures
- Troubleshooting step-by-step guides

**System Architecture:**
- Current state documentation maintenance
- Change impact assessment procedures
- Integration point documentation
- Performance baseline documentation

---

## Analytics & Reporting

### Usage Metrics

**User Activity Tracking:**
- Course generation frequency and success rates
- Feature utilisation patterns and preferences
- Error frequency and resolution times
- User satisfaction and feedback trends

**System Performance:**
- API response times and success rates
- Script execution performance metrics
- Resource utilisation and optimization opportunities
- Cost analysis and budget management

### Reporting Framework

**Daily Reports:**
- System health and error summary
- API usage and quota status
- User activity and support requests
- Critical issue identification and response

**Weekly Reports:**
- Performance trend analysis
- User success metrics and feedback
- System optimization opportunities
- Enhancement request priorities

**Monthly Reports:**
- Comprehensive system performance review
- User satisfaction and retention metrics
- Cost analysis and budget projections
- Strategic improvement recommendations

---

## Contact & Escalation

### Internal Support Structure

**Primary Administrator:** Carla Taylor  
**Backup Support:** [To be designated]  
**Technical Escalation:** Google Workspace Admin  
**Business Escalation:** GPSA Executive Team  

### External Support Resources

**Google Cloud Support:** API and infrastructure issues  
**Google Workspace Support:** Core platform issues  
**Development Community:** Google Apps Script forums and resources  
**Professional Networks:** Healthcare IT and educational technology contacts  

---

## Conclusion

The Concept-to-Course administrator role requires proactive monitoring, rapid issue resolution, and continuous system improvement. Success depends on maintaining high availability, supporting user productivity, and ensuring the tool continues to meet professional healthcare education standards.

**Key Success Metrics:**
- 99%+ system uptime and availability
- <2 hour response time for critical issues  
- High user satisfaction and adoption rates
- Continuous improvement in system performance and capabilities

**Remember:** Users should focus on educational excellence while administrators ensure the technical foundation supports their success without interruption.

---

*Administrator Guide - Concept-to-Course Professional Tool*  
*Version 2.0 - September 2024*  
*Confidential - Administrator Use Only*