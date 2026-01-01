/**
 * CORRECTED setupMappingTab FUNCTION
 * 
 * This creates the proper Mapping tab structure that matches
 * Carla's actual workflow requirements.
 */

function setupMappingTab(){
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName('Mapping');
  if (!sh){ 
    sh = ss.insertSheet('Mapping'); 
  }

  // CORRECT headers matching Carla's actual workflow
  const headers = [
    'Course Concept',                    // A
    'Resources Folder Link',             // B (Course Drive folder)
    'Target Audience',                   // C (dropdown must be active)
    'Recommendation',                    // D (linked AI-generated doc)
    'Approved',                         // E (checkbox must be active)
    'Modifications Requests',           // F
    'Module List',                      // G
    'Module 1', 'Module 2', 'Module 3', 'Module 4',   // H, I, J, K
    'Module 5', 'Module 6', 'Module 7', 'Module 8',   // L, M, N, O
    'Module 9', 'Module 10', 'Module 11', 'Module 12', // P, Q, R, S
    'Course Drive Folder'               // T
  ];

  // Write headers into row 1 where empty; don't overwrite existing labels
  const existing = sh.getRange(1, 1, 1, headers.length).getValues()[0];
  const out = existing.slice();
  headers.forEach((h, i) => { 
    if (!String(existing[i] || '').trim()) out[i] = h; 
  });
  sh.getRange(1, 1, 1, headers.length).setValues([out]);

  // Set up Target Audience dropdown in column C
  const targetAudienceOptions = [
    'General Practitioners',
    'GP Registrars',
    'Medical Students',
    'Specialists - General',
    'Specialists - Emergency Medicine',
    'Specialists - Internal Medicine',
    'Specialists - Paediatrics',
    'Specialists - Surgery',
    'Allied Health - General',
    'Allied Health - Nursing',
    'Allied Health - Pharmacy',
    'Allied Health - Physiotherapy',
    'Allied Health - Psychology',
    'Mixed Healthcare Professionals'
  ];
  
  const audienceRange = sh.getRange('C2:C1000'); // Apply to many rows
  const audienceRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(targetAudienceOptions)
    .setAllowInvalid(false)
    .setHelpText('Select the target audience for this course')
    .build();
  audienceRange.setDataValidation(audienceRule);

  // Set up Approved checkbox in column E
  const approvedRange = sh.getRange('E2:E1000'); // Apply to many rows
  const checkboxRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .setAllowInvalid(false)
    .setHelpText('Check when course is approved')
    .build();
  approvedRange.setDataValidation(checkboxRule);

  // Format headers
  const headerRange = sh.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold')
            .setBackground('#4285f4')
            .setFontColor('white')
            .setHorizontalAlignment('center');

  // Set column widths for better visibility
  sh.setColumnWidth(1, 200);  // Course Concept
  sh.setColumnWidth(2, 250);  // Resources Folder Link
  sh.setColumnWidth(3, 180);  // Target Audience
  sh.setColumnWidth(4, 200);  // Recommendation
  sh.setColumnWidth(5, 80);   // Approved
  sh.setColumnWidth(6, 200);  // Modifications Requests
  sh.setColumnWidth(7, 150);  // Module List
  
  // Module columns H-S (8-19)
  for (let i = 8; i <= 19; i++) {
    sh.setColumnWidth(i, 120);
  }
  
  sh.setColumnWidth(20, 250); // Course Drive Folder (T)

  // Add instruction note
  sh.getRange('A1').setNote(
    'Course Concept: Enter your course topic or concept here\n' +
    'Target Audience: Select from dropdown (Column C)\n' +
    'Approved: Use checkbox when ready (Column E)\n' +
    'Modules: Individual module names go in columns H-S\n' +
    'Course Drive Folder: Final folder link goes in Column T'
  );

  SpreadsheetApp.getUi().alert(
    'Mapping Tab Setup Complete',
    'Your Mapping sheet has been set up with:\n\n' +
    '✓ Correct column headers (A-T)\n' +
    '✓ Target Audience dropdown (Column C)\n' +
    '✓ Approved checkbox (Column E)\n' +
    '✓ Module columns (H-S)\n' +
    '✓ Proper formatting and column widths\n\n' +
    'You can now start entering your course concept and selecting target audience.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}