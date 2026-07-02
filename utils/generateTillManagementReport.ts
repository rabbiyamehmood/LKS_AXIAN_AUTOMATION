import ExcelJS from 'exceljs';
import path    from 'path';
import fs      from 'fs';

interface TillTestCase {
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

const testCases: TillTestCase[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // POSITIVE — CRUD + MAKER/CHECKER FLOWS
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_TILL_001',
    module:        'Till Management — Create & Approve',
    role:          'Labesh_Maker → Labesh_Checker',
    testType:      'Positive',
    description:   'Create terminal and Checker approves it',
    preconditions: 'Labesh_Maker and Labesh_Checker accounts are active. Merchant "touseefullah (25570000550)" exists.',
    testData:      'Terminal Name: AutoTerminalApprove\nEmail: autoapprove@yopmail.com\nMobile: 700000044\nLocation: Africa\nMerchant: touseefullah (25570000550)\nApproval Comment: Terminal creation approved',
    testSteps:
      '1. Login as Labesh_Maker\n2. Go to Till Management → Till List\n3. Click Add Till\n4. Fill all required fields\n5. Select merchant\n6. Click Save\n7. Assert "Processed OK" toast\n8. Close toast and Logout\n9. Login as Labesh_Checker\n10. Go to Inbox → Pending Processes\n11. Assert "TERMINAL CREATION" row is visible\n12. Click Review\n13. Click Approve\n14. Enter comment\n15. Click Confirm\n16. Assert "Process approved successfully"\n17. Close toast and Logout',
    expectedResult: 'Terminal created with "Processed OK" toast.\nChecker sees it in Pending Processes.\nApproval succeeds with "Process approved successfully" toast.\nBoth users logged out.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_002',
    module:        'Till Management — Update & Approve',
    role:          'Labesh_Maker → Labesh_Checker',
    testType:      'Positive',
    description:   'Update terminal and Checker approves — verify updated name & Inactive status in list',
    preconditions: 'At least one terminal exists in Till List.',
    testData:      'Updated Terminal Name: TermUpdated_<timestamp>\nNew Status: Inactive\nApproval Comment: Terminal update accepted',
    testSteps:
      '1. Login as Labesh_Maker\n2. Go to Till Management → Till List\n3. Click Edit on first terminal\n4. Clear name and fill with unique updated name\n5. Change Status to Inactive\n6. Click Update\n7. Assert "Processed OK" toast\n8. Close toast and Logout\n9. Login as Labesh_Checker\n10. Go to Inbox → Pending Processes\n11. Assert "TERMINAL UPDATE" row visible\n12. Click Review\n13. Click Approve → enter comment → Confirm\n14. Assert "Process approved successfully"\n15. Close toast and Logout\n16. Login as Labesh_Maker\n17. Go to Till List\n18. Assert updated terminal name is visible\n19. Assert row shows Inactive status\n20. Logout',
    expectedResult: 'Terminal updated with "Processed OK" toast.\nChecker approves with "Process approved successfully".\nMaker verifies updated name and Inactive status in list.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_003',
    module:        'Till Management — Create & Reject',
    role:          'Labesh_Maker → Labesh_Checker → Labesh_Maker',
    testType:      'Positive',
    description:   'Create terminal, Checker rejects, Maker confirms rejection in Maker Pending Process',
    preconditions: 'Labesh_Maker and Labesh_Checker accounts are active.',
    testData:      'Terminal Name: TerminalRejectFlow\nEmail: termreject2@yopmail.com\nMobile: 700000055\nLocation: Africa\nRejection Comment: Terminal rejected by checker\nMaker Acknowledgement: Terminal rejection acknowledged by Maker',
    testSteps:
      '1. Login as Labesh_Maker → Go to Till List\n2. Add Terminal with given data → Assert "Processed OK" → Logout\n3. Login as Labesh_Checker\n4. Go to Inbox → Pending Processes\n5. Assert TERMINAL CREATION row → Click Review\n6. Click Reject → enter comment → Confirm\n7. Assert "Process rejected successfully" → Close toast → Logout\n8. Login as Labesh_Maker\n9. Go to Inbox → Maker Pending Process\n10. Assert TERMINAL CREATION row visible\n11. Click Review → Click Reject\n12. Enter acknowledgement comment → Click Confirm\n13. Assert "Process rejected successfully"',
    expectedResult: 'Checker rejects with "Process rejected successfully".\nMaker sees rejection in Maker Pending Process.\nMaker confirms with "Process rejected successfully".',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_004',
    module:        'Till Management — View',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'View terminal details and Go Back returns to Terminal List',
    preconditions: 'At least one terminal exists in Till List.',
    testData:      'N/A',
    testSteps:
      '1. Login as Labesh_Maker\n2. Go to Till Management → Till List\n3. Click Actions dropdown on first row\n4. Click View\n5. Assert terminal detail heading is visible\n6. Click Go Back\n7. Assert Terminal List heading is visible',
    expectedResult: 'Terminal details page opens successfully.\nGo Back returns user to Terminal List page.',
    status:        'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // POSITIVE — FILTER TESTS
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_TILL_005',
    module:        'Till Management — Filters',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'Filter by Owner MSISDN returns matching results',
    preconditions: 'Terminal with Owner MSISDN 255675288586 exists.',
    testData:      'Owner MSISDN: 255675288586',
    testSteps:
      '1. Login as Labesh_Maker → Go to Till List\n2. Click Filter\n3. Enter Owner MSISDN: 255675288586\n4. Click Apply Filters\n5. Assert table visible and "No data found" not visible\n6. Click Reset\n7. Assert full list is restored',
    expectedResult: 'Table shows terminals matching the given Owner MSISDN.\nReset restores the full list.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_006',
    module:        'Till Management — Filters',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'Filter by Merchant Name returns matching results',
    preconditions: 'Terminal linked to merchant "Touseef Naveed" exists.',
    testData:      'Merchant Name: Touseef Naveed',
    testSteps:
      '1. Login → Go to Till List\n2. Click Filter\n3. Enter Merchant Name: Touseef Naveed\n4. Apply Filters → Assert results visible\n5. Reset → Assert full list',
    expectedResult: 'Table shows terminals for "Touseef Naveed".\nReset restores the full list.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_007',
    module:        'Till Management — Filters',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'Filter by Entity MSISDN returns matching results',
    preconditions: 'Terminal with Entity MSISDN 25570000550 exists.',
    testData:      'Entity MSISDN: 25570000550',
    testSteps:
      '1. Login → Go to Till List\n2. Click Filter\n3. Enter Entity MSISDN: 25570000550\n4. Apply Filters → Assert results visible\n5. Reset → Assert full list',
    expectedResult: 'Table shows terminals with Entity MSISDN 25570000550.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_008',
    module:        'Till Management — Filters',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'Filter by Source MID returns matching results',
    preconditions: 'Terminal with Source MID 000921778084667 exists.',
    testData:      'Source MID: 000921778084667',
    testSteps:
      '1. Login → Go to Till List\n2. Click Filter\n3. Enter Source MID: 000921778084667\n4. Apply Filters → Assert results visible\n5. Reset → Assert full list',
    expectedResult: 'Table shows terminals with given Source MID.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_009',
    module:        'Till Management — Filters',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'Filter by Source TID returns only matching terminal [KNOWN BUG — returns full list]',
    preconditions: 'Terminal with Source TID 00000116 exists.',
    testData:      'Source TID: 00000116',
    testSteps:
      '1. Login → Go to Till List\n2. Click Filter\n3. Enter Source TID: 00000116\n4. Apply Filters\n5. Assert table shows only 1 row (the specific terminal)',
    expectedResult: 'Only the terminal with Source TID 00000116 should appear.',
    status:        'FAIL',
  },
  {
    tcId:          'TC_TILL_010',
    module:        'Till Management — Filters',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'Filter by Alias Code returns matching terminal [KNOWN BUG — returns No data found]',
    preconditions: 'Terminal with Alias Code 00000116 exists.',
    testData:      'Alias Code: 00000116',
    testSteps:
      '1. Login → Go to Till List\n2. Click Filter\n3. Enter Alias Code: 00000116\n4. Apply Filters\n5. Assert terminal is visible in results',
    expectedResult: 'Terminal with Alias Code 00000116 should appear in results.',
    status:        'FAIL',
  },
  {
    tcId:          'TC_TILL_011',
    module:        'Till Management — Filters',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'Filter by Terminal Name returns exact matching terminal',
    preconditions: 'Terminal named "TestTerminal" exists.',
    testData:      'Terminal Name: TestTerminal',
    testSteps:
      '1. Login → Go to Till List\n2. Click Filter\n3. Enter Terminal Name: TestTerminal\n4. Apply Filters\n5. Assert "TestTerminal" text visible in results\n6. Reset → Assert full list',
    expectedResult: '"TestTerminal" appears in filtered results.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_012',
    module:        'Till Management — Filters',
    role:          'Labesh_Maker',
    testType:      'Positive',
    description:   'Filter by Date Range (yesterday → today) returns terminals created in range',
    preconditions: 'At least one terminal was created within yesterday–today range.',
    testData:      'From Date: yesterday\nTo Date: today (dynamic)',
    testSteps:
      '1. Login → Go to Till List\n2. Click Filter\n3. Click From Date → select yesterday from calendar\n4. Click To Date → select today from calendar\n5. Apply Filters\n6. Assert table visible and results shown\n7. Reset → Assert full list',
    expectedResult: 'Table shows terminals created within the selected date range.',
    status:        'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEGATIVE — CREATE FORM VALIDATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_TILL_NEG_001',
    module:        'Till Management — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Save Add Terminal form with all fields empty — validation errors shown',
    preconditions: 'Labesh_Maker logged in. Add Terminal form is open.',
    testData:      'All fields: (empty)',
    testSteps:
      '1. Login as Labesh_Maker → Go to Till List\n2. Click Add Till\n3. Leave all fields empty\n4. Click Save\n5. Assert "Terminal name is required" visible\n6. Assert email/mobile required errors visible\n7. Assert "Processed OK" NOT visible',
    expectedResult: 'Validation errors shown for all required fields. Form not submitted.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_NEG_002',
    module:        'Till Management — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Invalid email format shows validation error',
    preconditions: 'Add Terminal form is open.',
    testData:      'Terminal Name: NegTestTerminal\nEmail: notanemail\nMobile: 700000099\nLocation: TestCity',
    testSteps:
      '1. Open Add Terminal form\n2. Fill name, invalid email, mobile, location\n3. Click Save\n4. Assert "Invalid email" error visible\n5. Assert "Processed OK" NOT visible',
    expectedResult: '"Invalid email format" error shown. Terminal not created.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_NEG_003',
    module:        'Till Management — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Non-numeric mobile number — field silently rejects alphabets, stays empty',
    preconditions: 'Add Terminal form is open.',
    testData:      'Mobile Number: ABCDEFGH',
    testSteps:
      '1. Open Add Terminal form\n2. Type "ABCDEFGH" in Mobile Number field\n3. Assert field value is empty (alphabets rejected)\n4. Click Save\n5. Assert mobile required error visible\n6. Assert "Processed OK" NOT visible',
    expectedResult: 'Mobile field rejects alphabets → stays empty → "Mobile number is required" shown.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_NEG_004',
    module:        'Till Management — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'No merchant selected — validation error shown',
    preconditions: 'Add Terminal form is open.',
    testData:      'Terminal Name: NegNoMerchant\nEmail: negmerchant@yopmail.com\nMobile: 700000088\nLocation: TestCity\nMerchant: (not selected)',
    testSteps:
      '1. Open Add Terminal form\n2. Fill all fields except Merchant\n3. Click Save\n4. Assert merchant required error visible\n5. Assert "Processed OK" NOT visible',
    expectedResult: '"Merchant is required" or similar error shown. Terminal not created.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_NEG_005',
    module:        'Till Management — Create (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Terminal name missing — "Terminal name is required" error shown',
    preconditions: 'Add Terminal form is open.',
    testData:      'Terminal Name: (empty)\nEmail: negname@yopmail.com\nMobile: 700000077\nLocation: TestCity\nMerchant: touseefullah',
    testSteps:
      '1. Open Add Terminal form\n2. Leave Terminal Name empty\n3. Fill all other fields including merchant\n4. Click Save\n5. Assert "Terminal name is required" visible\n6. Assert "Processed OK" NOT visible',
    expectedResult: '"Terminal name is required" error shown. Terminal not created.',
    status:        'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEGATIVE — UPDATE FORM VALIDATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_TILL_NEG_006',
    module:        'Till Management — Update (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Clearing terminal name on Edit form shows validation error',
    preconditions: 'At least one terminal exists. Edit Terminal form is open.',
    testData:      'Terminal Name: (cleared)',
    testSteps:
      '1. Login as Labesh_Maker → Go to Till List\n2. Click Edit on first terminal\n3. Clear the Terminal Name field\n4. Click Update\n5. Assert "Terminal name is required" visible\n6. Assert "Processed OK" NOT visible',
    expectedResult: '"Terminal name is required" error shown. Update not submitted.',
    status:        'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEGATIVE — CHECKER VALIDATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_TILL_NEG_007',
    module:        'Till Management — Checker Validation (Negative)',
    role:          'Labesh_Maker → Labesh_Checker',
    testType:      'Negative',
    description:   'Checker cannot Approve terminal without a comment — Confirm is disabled',
    preconditions: 'A pending TERMINAL CREATION exists in Checker Pending Processes.',
    testData:      'Comments: (empty)',
    testSteps:
      '1. Maker creates a terminal → Logout\n2. Login as Labesh_Checker\n3. Go to Inbox → Pending Processes\n4. Assert TERMINAL CREATION row\n5. Click Review\n6. Click Approve\n7. Leave Comments empty\n8. Assert Confirm button is disabled\n9. Assert "Process approved successfully" NOT visible\n10. Cancel modal → Click Reject → enter cleanup comment → Confirm',
    expectedResult: 'Confirm button is disabled when comment is empty.\nApproval cannot proceed without a comment.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_NEG_008',
    module:        'Till Management — Checker Validation (Negative)',
    role:          'Labesh_Maker → Labesh_Checker',
    testType:      'Negative',
    description:   'Checker cannot Reject terminal without a comment — Confirm is disabled',
    preconditions: 'A pending TERMINAL CREATION exists in Checker Pending Processes.',
    testData:      'Comments: (empty)',
    testSteps:
      '1. Maker creates a terminal → Logout\n2. Login as Labesh_Checker\n3. Go to Inbox → Pending Processes\n4. Click Review\n5. Click Reject\n6. Leave Comments empty\n7. Assert Confirm button is disabled\n8. Assert "Process rejected successfully" NOT visible\n9. Fill comment → Confirm → cleanup',
    expectedResult: 'Confirm button is disabled when comment is empty.\nRejection cannot proceed without a comment.',
    status:        'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEGATIVE — FILTER VALIDATION
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId:          'TC_TILL_NEG_009',
    module:        'Till Management — Filters (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Filter by non-existent Owner MSISDN shows "No data found"',
    preconditions: 'No terminal exists with MSISDN 999999999999999.',
    testData:      'Owner MSISDN: 999999999999999',
    testSteps:
      '1. Login → Go to Till List\n2. Click Filter\n3. Enter Owner MSISDN: 999999999999999\n4. Apply Filters\n5. Assert "No data found" is visible\n6. Reset',
    expectedResult: '"No data found" message is shown. Table is empty.',
    status:        'PASS',
  },
  {
    tcId:          'TC_TILL_NEG_010',
    module:        'Till Management — Filters (Negative)',
    role:          'Labesh_Maker',
    testType:      'Negative',
    description:   'Filter by non-existent Terminal Name shows "No data found"',
    preconditions: 'No terminal named "XXXXXXXXXNONEXISTENT" exists.',
    testData:      'Terminal Name: XXXXXXXXXNONEXISTENT',
    testSteps:
      '1. Login → Go to Till List\n2. Click Filter\n3. Enter Terminal Name: XXXXXXXXXNONEXISTENT\n4. Apply Filters\n5. Assert "No data found" is visible\n6. Reset',
    expectedResult: '"No data found" message is shown. Table is empty.',
    status:        'PASS',
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Excel Generation
// ══════════════════════════════════════════════════════════════════════════════

async function generateTillManagementReport() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook      = new ExcelJS.Workbook();
  workbook.creator    = 'AXIAN Automation';
  workbook.created    = new Date();

  // ── Sheet 1: All Test Cases ────────────────────────────────────────────────
  const sheet = workbook.addWorksheet('Till Management Tests');

  sheet.columns = [
    { header: 'TC ID',           key: 'tcId',           width: 22 },
    { header: 'Module',          key: 'module',         width: 35 },
    { header: 'Role',            key: 'role',           width: 32 },
    { header: 'Test Type',       key: 'testType',       width: 13 },
    { header: 'Description',     key: 'description',    width: 52 },
    { header: 'Pre-conditions',  key: 'preconditions',  width: 45 },
    { header: 'Test Data',       key: 'testData',       width: 42 },
    { header: 'Test Steps',      key: 'testSteps',      width: 65 },
    { header: 'Expected Result', key: 'expectedResult', width: 50 },
    { header: 'Status',          key: 'status',         width: 12 },
  ];

  // Header row styling
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

    // Test Type colour coding
    const typeCell = row.getCell('testType');
    typeCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    if (tc.testType === 'Positive') {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
      typeCell.font = { color: { argb: 'FF274E13' }, bold: true };
    } else {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
      typeCell.font = { color: { argb: 'FF7F6000' }, bold: true };
    }

    // Status colour coding
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

  // Freeze header row
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
    { metric: 'Module',            value: 'Till Management' },
    { metric: 'Execution Date',    value: new Date().toLocaleDateString() },
    { metric: 'Total Test Cases',  value: total },
    { metric: 'Passed',            value: passed },
    { metric: 'Failed',            value: failed },
    { metric: 'Not Yet Run (N/A)', value: pending },
    { metric: 'Pass Rate',         value: ran > 0 ? `${((passed / ran) * 100).toFixed(1)}%` : '0%' },
    { metric: 'Positive Tests',    value: pos },
    { metric: 'Negative Tests',    value: neg },
    { metric: 'Known Bugs',        value: 2 },
    { metric: 'Bug IDs',           value: 'TC_TILL_009, TC_TILL_010' },
  ].forEach(d => {
    const r = summary.addRow(d);
    r.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
    if (d.metric === 'Passed')    r.getCell('value').font = { bold: true, color: { argb: 'FF274E13' } };
    if (d.metric === 'Failed')    r.getCell('value').font = { bold: true, color: { argb: 'FFCC0000' } };
    if (d.metric === 'Pass Rate') r.getCell('value').font = { bold: true };
    if (d.metric === 'Known Bugs') r.getCell('value').font = { bold: true, color: { argb: 'FFCC0000' } };
  });

  summary.views = [{ state: 'frozen', ySplit: 1 }];

  const timestamp = new Date().toISOString().replace(/[T:.]/g, '-').slice(0, 19);
  const filePath  = path.join(reportsDir, `Till_Management_Report_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}`);
}

generateTillManagementReport().catch(err => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
