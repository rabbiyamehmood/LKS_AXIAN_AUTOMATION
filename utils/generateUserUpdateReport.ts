import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface UserUpdateTestCase {
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

const testCases: UserUpdateTestCase[] = [

  // ── POSITIVE ──────────────────────────────────────────────────────────────────

  {
    tcId: 'TC_USER_UPD_E2E_001',
    module: 'User Update & Approval',
    role: 'AdminMaker → AdminChecker',
    testType: 'Positive',
    description: 'Full end-to-end user update and approval flow',
    preconditions: 'At least one user exists in User List. AdminMaker & AdminChecker accounts are active.',
    testData:
      'Updated Email: userupdate<timestamp>@yopmail.com\nApproval Comment: Approved by AdminChecker - Automation Test',
    testSteps:
      '1. Navigate to /login\n2. Login as AdminMaker\n3. Go to User & Role Management → User List\n4. Click Edit on the first user\n5. Clear Email and fill with unique updated email\n6. Click Save\n7. Verify "Processed OK" toast appears\n8. Close toast and Logout\n9. Login as AdminChecker\n10. Go to Inbox → Pending Processes\n11. Click USER UPDATE row\n12. Click Review\n13. Verify "Review User" heading is visible\n14. Click Approve\n15. Enter approval comment\n16. Click Confirm\n17. Verify "Process approved successfully" toast\n18. Close toast and Logout',
    expectedResult:
      'User updated with "Processed OK" toast.\nAdminChecker sees it in Pending Processes as USER UPDATE.\nApproval succeeds with "Process approved successfully" toast.\nBoth users logged out.',
    status: 'N/A',
  },

  // ── NEGATIVE — MAKER FORM VALIDATION ─────────────────────────────────────────

  {
    tcId: 'TC_USER_UPD_NEG_001',
    module: 'User Update',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Clear Email — shows "Invalid email format"',
    preconditions: 'AdminMaker logged in. Edit User form is open.',
    testData: 'Email: (cleared)',
    testSteps:
      '1. Login as AdminMaker\n2. Go to User & Role Management → User List\n3. Click Edit on the first user\n4. Clear the Email field\n5. Click Save\n6. Assert "Invalid email format" is visible\n7. Assert "Processed OK" is NOT visible',
    expectedResult: '"Invalid email format" error shown. No update submitted.',
    status: 'N/A',
  },
  {
    tcId: 'TC_USER_UPD_NEG_002',
    module: 'User Update',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Invalid email format (missing @) — shows "Invalid email format"',
    preconditions: 'AdminMaker logged in. Edit User form is open.',
    testData: 'Email: invalidemail.com',
    testSteps:
      '1. Login as AdminMaker\n2. Click Edit on the first user\n3. Clear Email and type "invalidemail.com"\n4. Click Save\n5. Assert "Invalid email format" is visible\n6. Assert "Processed OK" is NOT visible',
    expectedResult: '"Invalid email format" error shown. No update submitted.',
    status: 'N/A',
  },
  {
    tcId: 'TC_USER_UPD_NEG_003',
    module: 'User Update',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Clear First Name — shows "First name is required"',
    preconditions: 'AdminMaker logged in. Edit User form is open.',
    testData: 'First Name: (cleared)',
    testSteps:
      '1. Login as AdminMaker\n2. Click Edit on the first user\n3. Clear the First Name field\n4. Click Save\n5. Assert "First name is required" is visible\n6. Assert "Processed OK" is NOT visible',
    expectedResult: '"First name is required" error shown. No update submitted.',
    status: 'N/A',
  },
  {
    tcId: 'TC_USER_UPD_NEG_004',
    module: 'User Update',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Clear Last Name — shows "Last name is required"',
    preconditions: 'AdminMaker logged in. Edit User form is open.',
    testData: 'Last Name: (cleared)',
    testSteps:
      '1. Login as AdminMaker\n2. Click Edit on the first user\n3. Clear the Last Name field\n4. Click Save\n5. Assert "Last name is required" is visible\n6. Assert "Processed OK" is NOT visible',
    expectedResult: '"Last name is required" error shown. No update submitted.',
    status: 'N/A',
  },
  {
    tcId: 'TC_USER_UPD_NEG_005',
    module: 'User Update',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Clear Phone — shows "Phone number is required"',
    preconditions: 'AdminMaker logged in. Edit User form is open.',
    testData: 'Phone: (cleared)',
    testSteps:
      '1. Login as AdminMaker\n2. Click Edit on the first user\n3. Clear the Phone Number field\n4. Click Save\n5. Assert "Phone number is required" is visible\n6. Assert "Processed OK" is NOT visible',
    expectedResult: '"Phone number is required" error shown. No update submitted.',
    status: 'N/A',
  },

  // ── NEGATIVE — CHECKER VALIDATION ────────────────────────────────────────────

  {
    tcId: 'TC_USER_UPD_NEG_006',
    module: 'User Update Approval',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'Checker cannot Approve user update without a comment — Confirm is disabled',
    preconditions: 'A pending USER UPDATE exists in Pending Processes.',
    testData: 'Comment: (empty)',
    testSteps:
      '1. AdminMaker submits a user update\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click USER UPDATE row\n5. Click Review\n6. Click Approve\n7. Leave Comments field empty\n8. Assert Confirm button is disabled\n9. Assert "Process approved successfully" is NOT visible',
    expectedResult: 'Confirm button is disabled when comment is empty. Approval cannot proceed.',
    status: 'N/A',
  },
  {
    tcId: 'TC_USER_UPD_NEG_007',
    module: 'User Update Approval',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'Checker cannot Reject user update without a comment — Confirm is disabled',
    preconditions: 'A pending USER UPDATE exists in Pending Processes.',
    testData: 'Comment: (empty)',
    testSteps:
      '1. AdminMaker submits a user update\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click USER UPDATE row\n5. Click Review\n6. Click Reject\n7. Leave Comments field empty\n8. Assert Confirm button is disabled\n9. Assert "Process rejected" is NOT visible',
    expectedResult: 'Confirm button is disabled when comment is empty. Rejection cannot proceed.',
    status: 'N/A',
  },
  {
    tcId: 'TC_USER_UPD_NEG_008',
    module: 'User Update Approval',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'Checker rejects user update with a valid reason',
    preconditions: 'A pending USER UPDATE exists in Pending Processes.',
    testData: 'Comment: Rejected by AdminChecker - Automation Test: Invalid user details',
    testSteps:
      '1. AdminMaker submits a user update\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click USER UPDATE row\n5. Click Review\n6. Click Reject\n7. Enter rejection comment\n8. Click Confirm\n9. Assert "Process rejected" toast appears\n10. Close toast and Logout',
    expectedResult: 'User update is rejected. "Process rejected" toast appears. Request removed from Pending Processes.',
    status: 'N/A',
  },
];

// ── Excel generation ──────────────────────────────────────────────────────────

async function generateUserUpdateReport() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AXIAN Automation';
  workbook.created = new Date();

  // ── Sheet 1: All Test Cases ──────────────────────────────────────────────────
  const sheet = workbook.addWorksheet('User Update Tests');

  sheet.columns = [
    { header: 'TC ID',           key: 'tcId',           width: 22 },
    { header: 'Module',          key: 'module',         width: 30 },
    { header: 'Role',            key: 'role',           width: 28 },
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
    row.height = 100;

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

  // ── Sheet 2: Summary ─────────────────────────────────────────────────────────
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
  });

  const total   = testCases.length;
  const passed  = testCases.filter(t => t.status === 'PASS').length;
  const failed  = testCases.filter(t => t.status === 'FAIL').length;
  const pending = testCases.filter(t => t.status === 'N/A').length;
  const pos     = testCases.filter(t => t.testType === 'Positive').length;
  const neg     = testCases.filter(t => t.testType === 'Negative').length;

  [
    { metric: 'Module',            value: 'User Update' },
    { metric: 'Execution Date',    value: new Date().toLocaleDateString() },
    { metric: 'Total Test Cases',  value: total },
    { metric: 'Passed',            value: passed },
    { metric: 'Failed',            value: failed },
    { metric: 'Not Yet Run (N/A)', value: pending },
    { metric: 'Pass Rate',         value: passed > 0 ? `${((passed / (total - pending)) * 100).toFixed(1)}%` : '0%' },
    { metric: 'Positive Tests',    value: pos },
    { metric: 'Negative Tests',    value: neg },
  ].forEach(d => {
    const r = summary.addRow(d);
    r.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    if (d.metric === 'Passed')    r.getCell('value').font = { bold: true, color: { argb: 'FF274E13' } };
    if (d.metric === 'Failed')    r.getCell('value').font = { bold: true, color: { argb: 'FFCC0000' } };
    if (d.metric === 'Pass Rate') r.getCell('value').font = { bold: true };
  });

  const timestamp = new Date().toISOString().replace(/[T:.]/g, '-').slice(0, 19);
  const filePath  = path.join(reportsDir, `User_Update_Report_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}`);
}

generateUserUpdateReport().catch(err => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
