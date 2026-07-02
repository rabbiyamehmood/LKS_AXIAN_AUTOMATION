import ExcelJS from 'exceljs';
import path    from 'path';
import fs      from 'fs';

interface NotifTestCase {
  tcId:           string;
  module:         string;
  role:           string;
  testType:       'Positive' | 'Negative';
  description:    string;
  preconditions:  string;
  testData:       string;
  testSteps:      string;
  expectedResult: string;
  status:         'PASS' | 'FAIL' | 'N/A';
}

const testCases: NotifTestCase[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // POSITIVE
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_NOTIF_001',
    module:        'Notification Template — Create & Approve',
    role:          'Labesh_Maker → LabeshChecker',
    testType:      'Positive',
    description:   'Maker creates notification template and Checker approves it',
    preconditions: 'Labesh_Maker and LabeshChecker accounts are active.',
    testData:      'Template Name: AutoTest_Template_<timestamp>\nEvent Type: LOGIN_ALERT\nChannel: EMAIL\nSubject: Login email alert\nBody: Hi {{userName}}, Welcome to the portal. Login at {{date}}\nApproval Comment: Notification Template Approved',
    testSteps:
      '1. Login as Labesh_Maker\n2. Go to Notifications Management → Notifications List\n3. Click Add Notifications\n4. Fill Template Name, Event Type, Channel, Subject, Body\n5. Click Save\n6. Assert "Processed OK" toast\n7. Close toast and Logout\n8. Login as LabeshChecker\n9. Go to Inbox → Pending Processes\n10. Assert NOTIFICATION CREATION row visible\n11. Click Review\n12. Click Approve → enter comment → Confirm\n13. Assert "Process approved successfully"\n14. Close toast and Logout',
    expectedResult: 'Template created with "Processed OK" toast.\nChecker sees NOTIFICATION CREATION in Pending Processes.\nApproval succeeds with "Process approved successfully" toast.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_002',
    module:        'Notification Template — View',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'View notification template details and Go Back returns to list',
    preconditions: 'At least one notification template exists in the list.',
    testData:      'N/A',
    testSteps:
      '1. Login as Labesh_Maker\n2. Go to Notifications Management → Notifications List\n3. Click View icon on first template\n4. Assert "View Notification Template" heading is visible\n5. Click Go Back\n6. Assert "Notification Templates" heading is visible',
    expectedResult: 'Template detail page opens.\nGo Back returns user to Notification Templates list.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_003',
    module:        'Notification Template — Update & Approve',
    role:          'Labesh_Maker → LabeshChecker → Labesh_Maker',
    testType:      'Positive',
    description:   'Maker updates template body and status to Inactive, Checker approves, Maker verifies Inactive in list',
    preconditions: 'At least one template exists.',
    testData:      'Body: Hi {{userName}}, Welcome to the portal.\nNew Status: Inactive\nApproval Comment: update approve by checker',
    testSteps:
      '1. Login as Labesh_Maker → Go to Notifications List\n2. Click Edit on first template\n3. Clear Body and fill with new body\n4. Change Status to Inactive\n5. Click Update → Assert "Processed OK" → Logout\n6. Login as LabeshChecker\n7. Go to Inbox → Pending Processes\n8. Assert NOTIFICATION UPDATE row\n9. Click Review → Approve → enter comment → Confirm\n10. Assert "Process approved successfully" → Logout\n11. Login as Labesh_Maker → Go to Notifications List\n12. Assert Inactive status visible in list',
    expectedResult: 'Template updated with "Processed OK".\nChecker approves.\nMaker sees Inactive status in list.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_004',
    module:        'Notification Template — Create & Reject',
    role:          'Labesh_Maker → LabeshChecker → Labesh_Maker',
    testType:      'Positive',
    description:   'Maker creates template, Checker rejects, Maker acknowledges rejection in Maker Pending Process',
    preconditions: 'Labesh_Maker and LabeshChecker accounts are active.',
    testData:      'Template Name: RejectCreate_<timestamp>\nEvent Type: LOGIN_ALERT\nChannel: PUSH\nSubject: Test reject create\nRejection Comment: Notification Template rejected by checker\nMaker Acknowledgement: Rejection acknowledged by Maker',
    testSteps:
      '1. Login as Labesh_Maker → Create template → Assert "Processed OK" → Logout\n2. Login as LabeshChecker\n3. Go to Inbox → Pending Processes → Assert NOTIFICATION CREATION\n4. Click Review → Reject → enter comment → Confirm\n5. Assert "Process rejected successfully" → Logout\n6. Login as Labesh_Maker\n7. Go to Inbox → Maker Pending Process\n8. Assert NOTIFICATION CREATION row\n9. Click Review → Reject → enter acknowledgement comment → Confirm\n10. Assert "Process rejected successfully"',
    expectedResult: 'Checker rejects with "Process rejected successfully".\nMaker sees rejection in Maker Pending Process.\nMaker confirms with "Process rejected successfully".',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_005',
    module:        'Notification Template — Update & Reject',
    role:          'Labesh_Maker → LabeshChecker → Labesh_Maker',
    testType:      'Positive',
    description:   'Maker updates template, Checker rejects, Maker acknowledges rejection',
    preconditions: 'At least two templates exist in the list.',
    testData:      'Body: Dear {{userName}}, your login was recorded at {{date}} from {{ipAddress}} ({{location}}).\nRejection Comment: update reject by checker\nMaker Comment: rejection approved by maker',
    testSteps:
      '1. Login as Labesh_Maker → Edit 2nd template with valid body → Click Update\n2. Assert "Processed OK" → Logout\n3. Login as LabeshChecker → Pending Processes → Assert NOTIFICATION UPDATE\n4. Click Review → Reject → enter comment → Confirm\n5. Assert "Process rejected successfully" → Logout\n6. Login as Labesh_Maker → Maker Pending Process\n7. Assert NOTIFICATION UPDATE → Click Review → Reject → enter comment → Confirm\n8. Assert "Process rejected successfully"',
    expectedResult: 'Checker rejects update.\nMaker acknowledges in Maker Pending Process.\nBoth "Process rejected successfully" toasts appear.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_006',
    module:        'Notification Template — Filters',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'Filters: Event Type (LOGIN_ALERT), Channel (EMAIL), Date Range (yesterday → today) return correct results',
    preconditions: 'Templates with LOGIN_ALERT event type and EMAIL channel exist.',
    testData:      'Event Type: LOGIN_ALERT\nChannel: EMAIL\nFrom Date: yesterday\nTo Date: today',
    testSteps:
      '1. Login as Labesh_Maker → Go to Notifications List\n2. Click Filter\n3. Select Event Type: LOGIN_ALERT → Apply Filters\n4. Assert table visible, LOGIN_ALERT cell visible → Reset\n5. Select Channel: EMAIL → Apply Filters\n6. Assert table visible, EMAIL cell visible → Reset\n7. Select From Date (yesterday) and To Date (today) → Apply Filters\n8. Assert table visible → Reset',
    expectedResult: 'Each filter returns matching results.\nReset restores full list after each filter.',
    status: 'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEGATIVE — CREATE FORM VALIDATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_NOTIF_NEG_001',
    module:        'Notification Template — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Save with all fields empty shows validation errors',
    preconditions: 'Create Notification Template form is open.',
    testData:      'All fields: (empty)',
    testSteps:
      '1. Login as Labesh_Maker → Open Create form\n2. Leave all fields empty\n3. Click Save\n4. Assert template name required error visible\n5. Assert "Processed OK" NOT visible',
    expectedResult: 'Validation errors shown. Form not submitted.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_NEG_002',
    module:        'Notification Template — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Missing template name shows validation error',
    preconditions: 'Create Notification Template form is open.',
    testData:      'Template Name: (empty)\nAll other fields: valid',
    testSteps:
      '1. Open Create form\n2. Fill Event Type, Channel, Subject, Body — leave Template Name empty\n3. Click Save\n4. Assert template name required error\n5. Assert "Processed OK" NOT visible',
    expectedResult: '"Template name is required" error shown. Template not created.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_NEG_003',
    module:        'Notification Template — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Subject with less than 3 characters shows validation error',
    preconditions: 'Create Notification Template form is open.',
    testData:      'Subject: AB (2 chars — below minimum 3)',
    testSteps:
      '1. Open Create form\n2. Fill all fields with valid data\n3. Enter Subject: "AB" (2 chars)\n4. Click Save\n5. Assert "Minimum 3" or similar error visible\n6. Assert "Processed OK" NOT visible',
    expectedResult: 'Subject length validation error shown. Template not created.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_NEG_004',
    module:        'Notification Template — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Missing body template shows validation error',
    preconditions: 'Create Notification Template form is open.',
    testData:      'Body Template: (empty)\nAll other fields: valid',
    testSteps:
      '1. Open Create form\n2. Fill Template Name, Event Type, Channel, Subject — leave Body empty\n3. Click Save\n4. Assert body required error visible\n5. Assert "Processed OK" NOT visible',
    expectedResult: '"Body template is required" error shown. Template not created.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_NEG_005',
    module:        'Notification Template — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'No Event Type selected shows validation error',
    preconditions: 'Create Notification Template form is open.',
    testData:      'Event Type: (not selected)\nAll other fields: valid',
    testSteps:
      '1. Open Create form\n2. Fill all fields except Event Type\n3. Click Save\n4. Assert event type required error visible\n5. Assert "Processed OK" NOT visible',
    expectedResult: '"Event type is required" error shown. Template not created.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_NEG_006',
    module:        'Notification Template — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'No Channel selected shows validation error',
    preconditions: 'Create Notification Template form is open.',
    testData:      'Channel: (not selected)\nAll other fields: valid',
    testSteps:
      '1. Open Create form\n2. Fill all fields except Channel\n3. Click Save\n4. Assert channel required error visible\n5. Assert "Processed OK" NOT visible',
    expectedResult: '"Channel is required" error shown. Template not created.',
    status: 'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEGATIVE — CHECKER VALIDATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_NOTIF_NEG_007',
    module:        'Notification Template — Checker Validation (Negative)',
    role:          'Labesh_Maker → LabeshChecker',
    testType:      'Negative',
    description:   'Checker cannot Approve notification template without a comment — Confirm is disabled',
    preconditions: 'A pending NOTIFICATION CREATION exists in Checker Pending Processes.',
    testData:      'Comments: (empty)',
    testSteps:
      '1. Maker creates template → Logout\n2. Login as LabeshChecker → Pending Processes\n3. Assert NOTIFICATION CREATION row\n4. Click Review → Click Approve\n5. Leave Comments empty\n6. Assert Confirm button is disabled\n7. Assert "Process approved successfully" NOT visible\n8. Cancel → Click Reject → enter cleanup comment → Confirm',
    expectedResult: 'Confirm button is disabled when comment is empty.\nApproval cannot proceed without a comment.',
    status: 'PASS',
  },
  {
    tcId:          'TC_NOTIF_NEG_008',
    module:        'Notification Template — Checker Validation (Negative)',
    role:          'Labesh_Maker → LabeshChecker',
    testType:      'Negative',
    description:   'Checker cannot Reject notification template without a comment — Confirm is disabled',
    preconditions: 'A pending NOTIFICATION CREATION exists in Checker Pending Processes.',
    testData:      'Comments: (empty)',
    testSteps:
      '1. Maker creates template → Logout\n2. Login as LabeshChecker → Pending Processes\n3. Assert NOTIFICATION CREATION row\n4. Click Review → Click Reject\n5. Leave Comments empty\n6. Assert Confirm button is disabled\n7. Assert "Process rejected successfully" NOT visible\n8. Fill comment → Confirm → cleanup',
    expectedResult: 'Confirm button is disabled when comment is empty.\nRejection cannot proceed without a comment.',
    status: 'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEGATIVE — FILTER VALIDATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_NOTIF_NEG_009',
    module:        'Notification Template — Filters (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Filter with future date range shows "No data found"',
    preconditions: 'No templates created in future dates (2030).',
    testData:      'From Date: 2030-01-01\nTo Date: 2030-01-31',
    testSteps:
      '1. Login as Labesh_Maker → Go to Notifications List\n2. Click Filter\n3. Enter From Date: 2030-01-01 and To Date: 2030-01-31\n4. Click Apply Filters\n5. Assert "No data found" is visible\n6. Click Reset',
    expectedResult: '"No data found" message is shown. Table is empty.',
    status: 'PASS',
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Excel Generation
// ══════════════════════════════════════════════════════════════════════════════

async function generateNotificationTemplateReport() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook   = new ExcelJS.Workbook();
  workbook.creator = 'AXIAN Automation';
  workbook.created = new Date();

  // ── Sheet 1: All Test Cases ────────────────────────────────────────────────
  const sheet = workbook.addWorksheet('Notification Template Tests');

  sheet.columns = [
    { header: 'TC ID',           key: 'tcId',           width: 22 },
    { header: 'Module',          key: 'module',         width: 38 },
    { header: 'Role',            key: 'role',           width: 32 },
    { header: 'Test Type',       key: 'testType',       width: 13 },
    { header: 'Description',     key: 'description',    width: 52 },
    { header: 'Pre-conditions',  key: 'preconditions',  width: 45 },
    { header: 'Test Data',       key: 'testData',       width: 42 },
    { header: 'Test Steps',      key: 'testSteps',      width: 65 },
    { header: 'Expected Result', key: 'expectedResult', width: 50 },
    { header: 'Status',          key: 'status',         width: 12 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  testCases.forEach((tc, idx) => {
    const row = sheet.addRow(tc);
    row.height = 110;

    row.eachCell(cell => {
      cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
      cell.border    = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      }
    });

    row.getCell('tcId').font = { bold: true };

    const typeCell = row.getCell('testType');
    typeCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    if (tc.testType === 'Positive') {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
      typeCell.font = { color: { argb: 'FF274E13' }, bold: true };
    } else {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
      typeCell.font = { color: { argb: 'FF7F6000' }, bold: true };
    }

    const statusCell = row.getCell('status');
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    if (tc.status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
      statusCell.font = { bold: true, color: { argb: 'FF1A3A00' } };
    } else if (tc.status === 'FAIL') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4C4C' } };
      statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      statusCell.font = { bold: true, color: { argb: 'FF666666' } };
    }
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  // ── Sheet 2: Summary ────────────────────────────────────────────────────────
  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 28 },
    { header: 'Value',  key: 'value',  width: 15 },
  ];

  const sumHeader = summary.getRow(1);
  sumHeader.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } };
    cell.alignment = { horizontal: 'center' };
    cell.border    = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  const total   = testCases.length;
  const passed  = testCases.filter(t => t.status === 'PASS').length;
  const failed  = testCases.filter(t => t.status === 'FAIL').length;
  const pending = testCases.filter(t => t.status === 'N/A').length;
  const ran     = total - pending;
  const pos     = testCases.filter(t => t.testType === 'Positive').length;
  const neg     = testCases.filter(t => t.testType === 'Negative').length;

  [
    { metric: 'Module',            value: 'Notification Template' },
    { metric: 'Execution Date',    value: new Date().toLocaleDateString() },
    { metric: 'Total Test Cases',  value: total },
    { metric: 'Passed',            value: passed },
    { metric: 'Failed',            value: failed },
    { metric: 'Not Yet Run (N/A)', value: pending },
    { metric: 'Pass Rate',         value: ran > 0 ? `${((passed / ran) * 100).toFixed(1)}%` : '0%' },
    { metric: 'Positive Tests',    value: pos },
    { metric: 'Negative Tests',    value: neg },
  ].forEach(d => {
    const r = summary.addRow(d);
    r.eachCell(cell => {
      cell.border    = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
    if (d.metric === 'Passed')    r.getCell('value').font = { bold: true, color: { argb: 'FF274E13' } };
    if (d.metric === 'Failed')    r.getCell('value').font = { bold: true, color: { argb: 'FFCC0000' } };
    if (d.metric === 'Pass Rate') r.getCell('value').font = { bold: true };
  });

  summary.views = [{ state: 'frozen', ySplit: 1 }];

  const timestamp = new Date().toISOString().replace(/[T:.]/g, '-').slice(0, 19);
  const filePath  = path.join(reportsDir, `Notification_Template_Report_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}`);
}

generateNotificationTemplateReport().catch(err => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
