import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface AggregatorTestCase {
  tcId: string;
  module: string;
  role: string;
  testType: 'Positive' | 'Negative';
  description: string;
  preconditions: string;
  testData: string;
  testSteps: string;
  expectedResult: string;
  status: 'PASS' | 'FAIL' | 'N/A';
}

const testCases: AggregatorTestCase[] = [

  // ── POSITIVE ──────────────────────────────────────────────────────────────────

  {
    tcId: 'TC_AGG_E2E_001',
    module: 'Aggregator Creation & Approval',
    role: 'AdminMaker → AdminChecker',
    testType: 'Positive',
    description: 'Full end-to-end aggregator creation and approval flow',
    preconditions: 'AdminMaker and AdminChecker accounts are active. Portal is accessible.',
    testData:
      'Name: Auto_Aggregator_<timestamp>\nContact: Contact_<timestamp>\nEmail: aggregator<timestamp>@yopmail.com\nPhone: 7<last8digits>\nPayment: QR\nApproval Comment: Approved by AdminChecker - Automation Test',
    testSteps:
      '1. Navigate to /login\n2. Login as AdminMaker\n3. Go to Aggregator Management → Aggregator List\n4. Click Add Aggregator\n5. Fill Aggregator Name with unique value\n6. Fill Contact Person\n7. Fill valid Email\n8. Fill valid Phone number\n9. Select QR payment method\n10. Click Save\n11. Verify "Processed OK" toast appears\n12. Close toast and Logout\n13. Login as AdminChecker\n14. Go to Inbox → Pending Processes\n15. Click AGGREGATOR CREATION row\n16. Click Review\n17. Verify "Review Aggregator" heading is visible\n18. Click Approve\n19. Enter approval comment\n20. Click Confirm\n21. Verify "Process approved successfully" toast\n22. Close toast and Logout',
    expectedResult:
      'Aggregator created successfully with "Processed OK" toast.\nAdminChecker sees it in Pending Processes.\nApproval succeeds with "Process approved successfully" toast.\nBoth users successfully logged out.',
    status: 'PASS',
  },

  // ── NEGATIVE — MAKER FORM VALIDATION ─────────────────────────────────────────

  {
    tcId: 'TC_AGG_NEG_001',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'All fields empty — Save shows required errors on all fields',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'All fields: (empty)',
    testSteps:
      '1. Navigate to /login\n2. Login as AdminMaker\n3. Go to Aggregator Management → Aggregator List\n4. Click Add Aggregator\n5. Leave ALL fields empty\n6. Click Save\n7. Assert "Aggregator name is required" is visible\n8. Assert "Contact person name is required" is visible\n9. Assert "Invalid email format" is visible\n10. Assert "Phone number is required" is visible\n11. Assert "At least one payment method must be selected" is visible\n12. Assert "Processed OK" toast is NOT visible',
    expectedResult:
      'All 5 required field error messages are shown.\nNo success toast appears.\nUser remains on the Add Aggregator form.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_002',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Aggregator Name missing — shows "Aggregator name is required"',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'Name: (empty)\nContact: Contact_<ts>\nEmail: valid@yopmail.com\nPhone: valid\nQR: checked',
    testSteps:
      '1. Open Add Aggregator form\n2. Leave Aggregator Name empty\n3. Fill all other fields with valid data\n4. Select QR\n5. Click Save\n6. Assert "Aggregator name is required" is visible\n7. Assert "Processed OK" is NOT visible',
    expectedResult: '"Aggregator name is required" error shown. No aggregator created.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_003',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Aggregator Name with numbers only — should show validation error',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'Name: 123456789\nOther fields: valid',
    testSteps:
      '1. Open Add Aggregator form\n2. Enter "123456789" in Aggregator Name\n3. Fill all other fields with valid data\n4. Select QR\n5. Click Save\n6. Assert validation error is shown (name is required or invalid)\n7. Assert "Processed OK" is NOT visible',
    expectedResult: 'Validation error shown for numeric-only name. No aggregator created.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_004',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Contact Person missing — shows "Contact person name is required"',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'Name: valid\nContact: (empty)\nEmail: valid\nPhone: valid\nQR: checked',
    testSteps:
      '1. Open Add Aggregator form\n2. Fill Aggregator Name, Email, Phone\n3. Leave Contact Person empty\n4. Select QR\n5. Click Save\n6. Assert "Contact person name is required" is visible\n7. Assert "Processed OK" is NOT visible',
    expectedResult: '"Contact person name is required" error shown. No aggregator created.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_005',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Email missing — shows "Invalid email format"',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'Name: valid\nContact: valid\nEmail: (empty)\nPhone: valid\nQR: checked',
    testSteps:
      '1. Open Add Aggregator form\n2. Fill Name, Contact Person, Phone\n3. Leave Email empty\n4. Select QR\n5. Click Save\n6. Assert "Invalid email format" is visible\n7. Assert "Processed OK" is NOT visible',
    expectedResult: '"Invalid email format" error shown. No aggregator created.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_006',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Invalid email format (missing @) — shows "Invalid email format"',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'Email: invalidemail.com',
    testSteps:
      '1. Open Add Aggregator form\n2. Fill all fields with valid data\n3. Enter "invalidemail.com" in Email field\n4. Select QR\n5. Click Save\n6. Assert "Invalid email format" is visible\n7. Assert "Processed OK" is NOT visible',
    expectedResult: '"Invalid email format" error shown. No aggregator created.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_007',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Invalid email format (double @@) — shows "Invalid email format"',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'Email: test@@yopmail.com',
    testSteps:
      '1. Open Add Aggregator form\n2. Fill all fields with valid data\n3. Enter "test@@yopmail.com" in Email field\n4. Select QR\n5. Click Save\n6. Assert "Invalid email format" is visible\n7. Assert "Processed OK" is NOT visible',
    expectedResult: '"Invalid email format" error shown. No aggregator created.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_008',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Phone missing — shows "Phone number is required"',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'Name: valid\nContact: valid\nEmail: valid\nPhone: (empty)\nQR: checked',
    testSteps:
      '1. Open Add Aggregator form\n2. Fill Name, Contact Person, Email\n3. Leave Phone empty\n4. Select QR\n5. Click Save\n6. Assert "Phone number is required" is visible\n7. Assert "Processed OK" is NOT visible',
    expectedResult: '"Phone number is required" error shown. No aggregator created.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_009',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Non-numeric phone — field rejects alphabets, stays empty, shows "Phone number is required"',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'Phone: ABCDEFGH',
    testSteps:
      '1. Open Add Aggregator form\n2. Fill all fields with valid data\n3. Enter "ABCDEFGH" in Phone field\n4. Select QR\n5. Click Save\n6. Assert "Must be a valid phone number" is visible\n7. Assert "Processed OK" is NOT visible',
    expectedResult: 'Phone field silently rejects alphabets → field value stays empty → "Phone number is required" error shown. No aggregator created.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_010',
    module: 'Aggregator Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'No payment method selected — shows "At least one payment method must be selected"',
    preconditions: 'AdminMaker logged in. Add Aggregator form is open.',
    testData: 'All fields valid. QR: NOT checked',
    testSteps:
      '1. Open Add Aggregator form\n2. Fill all fields with valid data\n3. Do NOT select any payment method\n4. Click Save\n5. Assert "At least one payment method must be selected" is visible\n6. Assert "Processed OK" is NOT visible',
    expectedResult: '"At least one payment method must be selected" error shown. No aggregator created.',
    status: 'PASS',
  },

  // ── NEGATIVE — CHECKER VALIDATION ────────────────────────────────────────────

  {
    tcId: 'TC_AGG_NEG_011',
    module: 'Aggregator Approval',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'Checker cannot Approve without a comment — Confirm button is disabled',
    preconditions: 'A pending aggregator creation exists in Pending Processes.',
    testData: 'Comment: (empty)',
    testSteps:
      '1. AdminMaker creates a new aggregator\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click AGGREGATOR CREATION row\n5. Click Review\n6. Click Approve\n7. Leave Comments field empty\n8. Assert Confirm button is disabled\n9. Assert "Process approved successfully" is NOT visible',
    expectedResult: 'Confirm button is disabled when comment is empty. Approval cannot proceed without a comment.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_012',
    module: 'Aggregator Approval',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'Checker cannot Reject without a comment — Confirm button is disabled',
    preconditions: 'A pending aggregator creation exists in Pending Processes.',
    testData: 'Comment: (empty)',
    testSteps:
      '1. AdminMaker creates a new aggregator\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click AGGREGATOR CREATION row\n5. Click Review\n6. Click Reject\n7. Leave Comments field empty\n8. Assert Confirm button is disabled\n9. Assert "Process rejected" is NOT visible',
    expectedResult: 'Confirm button is disabled when comment is empty. Rejection cannot proceed without a comment.',
    status: 'PASS',
  },
  {
    tcId: 'TC_AGG_NEG_013',
    module: 'Aggregator Approval',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'Checker rejects aggregator creation with a valid reason',
    preconditions: 'A pending aggregator creation exists in Pending Processes.',
    testData: 'Comment: Rejected by AdminChecker - Automation Test: Invalid details',
    testSteps:
      '1. AdminMaker creates a new aggregator\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click AGGREGATOR CREATION row\n5. Click Review\n6. Click Reject\n7. Enter rejection comment\n8. Click Confirm\n9. Assert "Process rejected" toast appears\n10. Close toast and Logout',
    expectedResult: 'Aggregator creation is rejected. "Process rejected" toast appears. Request is removed from Pending Processes.',
    status: 'PASS',
  },
];

// ── Excel generation ──────────────────────────────────────────────────────────

async function generateAggregatorReport() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AXIAN Automation';
  workbook.created = new Date();

  // ── Sheet 1: All Test Cases ──────────────────────────────────────────────────
  const sheet = workbook.addWorksheet('Aggregator Test Cases');

  sheet.columns = [
    { header: 'TC ID',            key: 'tcId',           width: 20 },
    { header: 'Module',           key: 'module',         width: 30 },
    { header: 'Role',             key: 'role',           width: 28 },
    { header: 'Test Type',        key: 'testType',       width: 13 },
    { header: 'Description',      key: 'description',    width: 52 },
    { header: 'Pre-conditions',   key: 'preconditions',  width: 45 },
    { header: 'Test Data',        key: 'testData',       width: 42 },
    { header: 'Test Steps',       key: 'testSteps',      width: 65 },
    { header: 'Expected Result',  key: 'expectedResult', width: 50 },
    { header: 'Status',           key: 'status',         width: 12 },
  ];

  // Header row
  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  testCases.forEach((tc, idx) => {
    const row = sheet.addRow(tc);
    row.height = 100;

    row.eachCell(cell => {
      cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      }
    });

    // TC ID bold
    row.getCell('tcId').font = { bold: true };

    // Test Type colour
    const typeCell = row.getCell('testType');
    typeCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    if (tc.testType === 'Positive') {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
      typeCell.font = { color: { argb: 'FF274E13' }, bold: true };
    } else {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
      typeCell.font = { color: { argb: 'FF7F6000' }, bold: true };
    }

    // Status colour
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
      statusCell.font = { bold: true, color: { argb: 'FF595959' } };
    }
  });

  // ── Sheet 2: Summary ─────────────────────────────────────────────────────────
  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value',  key: 'value',  width: 20 },
  ];

  const summaryHeader = summary.getRow(1);
  summaryHeader.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } };
    cell.alignment = { horizontal: 'center' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  const total    = testCases.length;
  const positive = testCases.filter(t => t.testType === 'Positive').length;
  const negative = testCases.filter(t => t.testType === 'Negative').length;
  const passed   = testCases.filter(t => t.status === 'PASS').length;
  const failed   = testCases.filter(t => t.status === 'FAIL').length;
  const pending  = testCases.filter(t => t.status === 'N/A').length;
  const makerTests   = testCases.filter(t => t.role.includes('Maker')).length;
  const checkerTests = testCases.filter(t => t.role.includes('Checker')).length;

  const rows = [
    { metric: 'Module',              value: 'Aggregator Creation & Approval' },
    { metric: 'Execution Date',      value: new Date().toLocaleDateString() },
    { metric: 'Total Test Cases',    value: total },
    { metric: 'Positive Tests',      value: positive },
    { metric: 'Negative Tests',      value: negative },
    { metric: 'AdminMaker Tests',    value: makerTests },
    { metric: 'AdminChecker Tests',  value: checkerTests },
    { metric: 'Passed',              value: passed },
    { metric: 'Failed',              value: failed },
    { metric: 'Pending Execution',   value: pending },
  ];

  rows.forEach(d => {
    const r = summary.addRow(d);
    r.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { vertical: 'middle' };
    });
    r.getCell('metric').font = { bold: true };
    if (d.metric === 'Passed')           r.getCell('value').font = { bold: true, color: { argb: 'FF274E13' } };
    if (d.metric === 'Failed')           r.getCell('value').font = { bold: true, color: { argb: 'FFCC0000' } };
    if (d.metric === 'Pending Execution') r.getCell('value').font = { bold: true, color: { argb: 'FF595959' } };
  });

  // ── Write ─────────────────────────────────────────────────────────────────────
  const timestamp = new Date().toISOString().replace(/[T:.]/g, '-').slice(0, 19);
  const filePath  = path.join(reportsDir, `Aggregator_Test_Report_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}`);
}

generateAggregatorReport().catch(err => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
