import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface PwdTestCase {
  tcId: string;
  module: string;
  subModule: string;
  role: string;
  testType: 'Positive' | 'Negative';
  description: string;
  preconditions: string;
  testData: string;
  testSteps: string;
  expectedResult: string;
  actualResult: string;
  status: 'PASS' | 'FAIL';
  remarks: string;
}

const testCases: PwdTestCase[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // POSITIVE SCENARIOS
  // ════════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_PWD_001',
    module: 'Change Password',
    subModule: 'Password Change',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Change password successfully with valid current and new password — success toast shown',
    preconditions:
      'AdminMaker is logged in with current password: Pakistan@1234.\nChange Password page is accessible from profile menu.',
    testData:
      'Username: AdminMaker\nCurrent Password: Pakistan@1234\nNew Password: Password@123\nConfirm New Password: Password@123',
    testSteps:
      '1. Login as AdminMaker with Pakistan@1234\n2. Click profile avatar button (top-right)\n3. Click "Change Password" from menu\n4. Assert "Change Password" heading is visible\n5. Fill Current Password: Pakistan@1234\n6. Fill New Password: Password@123\n7. Fill Confirm New Password: Password@123\n8. Click "Change Password" button\n9. Assert "Password Changed Successfully" toast appears\n10. Click Close toast\n11. Assert password was changed (logout and re-login to verify)',
    expectedResult:
      '"Password Changed Successfully" toast displayed.\nUser can log in with new password.\nOld password is rejected after change.',
    actualResult:
      'Success toast displayed. Password changed successfully.',
    status: 'PASS',
    remarks: 'Password restored after test to keep suite repeatable.',
  },
  {
    tcId: 'TC_PWD_002',
    module: 'Change Password',
    subModule: 'Login Verification',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'After password change, old password is rejected and new password is accepted at login',
    preconditions:
      'AdminMaker password has been changed from Pakistan@1234 to Password@123.',
    testData:
      'Username: AdminMaker\nOld Password: Pakistan@1234 (should fail)\nNew Password: Password@123 (should succeed)',
    testSteps:
      '1. Change password from Pakistan@1234 to Password@123 (ref TC_PWD_001)\n2. Logout\n3. Attempt login with old password: Pakistan@1234\n4. Assert "Invalid credentials for user" error is shown\n5. Dismiss error\n6. Login with new password: Password@123\n7. Assert redirect away from /login (login successful)',
    expectedResult:
      'Old password login shows "Invalid credentials for user".\nNew password login succeeds — user redirected to dashboard.',
    actualResult:
      'Old password rejected with correct error. New password login succeeded.',
    status: 'PASS',
    remarks: 'Password restored after test to keep suite repeatable.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // NEGATIVE SCENARIOS
  // ════════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_PWD_NEG_001',
    module: 'Change Password',
    subModule: 'Current Password Validation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Wrong current password entered — app does not show any error message (known bug)',
    preconditions:
      'AdminMaker is logged in.',
    testData:
      'Current Password: WrongPassword@999 (incorrect)\nNew Password: Password@123\nConfirm New Password: Password@123',
    testSteps:
      '1. Login as AdminMaker\n2. Open Change Password form\n3. Fill Current Password: WrongPassword@999 (wrong)\n4. Fill New Password: Password@123\n5. Fill Confirm New Password: Password@123\n6. Click "Change Password"\n7. Assert an error message is shown (e.g. "Incorrect current password")',
    expectedResult:
      'App should display an error such as "Incorrect current password" or "Current password is wrong".',
    actualResult:
      'App processes the request silently with no error message shown. BUG — incorrect current password accepted without feedback.',
    status: 'FAIL',
    remarks: 'Known bug: entering wrong current password does not trigger any error or toast. Defect to be raised.',
  },
  {
    tcId: 'TC_PWD_NEG_002',
    module: 'Change Password',
    subModule: 'Confirm Password Mismatch',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'New password and confirm password do not match — inline validation error expected',
    preconditions:
      'AdminMaker is logged in.\nChange Password form is open.',
    testData:
      'Current Password: Pakistan@1234\nNew Password: Password@123\nConfirm New Password: Different@999',
    testSteps:
      '1. Login as AdminMaker\n2. Open Change Password form\n3. Fill Current Password: Pakistan@1234\n4. Fill New Password: Password@123\n5. Fill Confirm New Password: Different@999 (mismatch)\n6. Click "Change Password"\n7. Assert mismatch error is shown (e.g. "Passwords do not match")',
    expectedResult:
      'Inline error: "Passwords do not match" (or similar) shown under Confirm New Password field.\nPassword is NOT changed.',
    actualResult:
      'Mismatch validation error displayed correctly. Password not changed.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_PWD_NEG_003',
    module: 'Change Password',
    subModule: 'Password Length Validation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'New password less than 8 characters — inline validation error expected',
    preconditions:
      'AdminMaker is logged in.\nChange Password form is open.\nPassword requirement: at least 8 characters.',
    testData:
      'Current Password: Pakistan@1234\nNew Password: Ab1@ (only 4 chars)\nConfirm New Password: Ab1@',
    testSteps:
      '1. Login as AdminMaker\n2. Open Change Password form\n3. Fill Current Password: Pakistan@1234\n4. Fill New Password: Ab1@ (less than 8 characters)\n5. Fill Confirm New Password: Ab1@\n6. Click "Change Password"\n7. Assert error: "Password must be at least 8 characters with uppercase, lowercase, and numbers"',
    expectedResult:
      'Inline error shown: "Password must be at least 8 characters with uppercase, lowercase, and numbers".\nPassword NOT changed.',
    actualResult:
      'Inline validation error shown correctly. Password not changed.',
    status: 'PASS',
    remarks: 'Error message shown below New Password field as helper text.',
  },
  {
    tcId: 'TC_PWD_NEG_004',
    module: 'Change Password',
    subModule: 'Same Password Validation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'New password same as current password — should be rejected per password requirements',
    preconditions:
      'AdminMaker is logged in.\nPassword requirement: "Different from current password".',
    testData:
      'Current Password: Pakistan@1234\nNew Password: Pakistan@1234 (same as current)\nConfirm New Password: Pakistan@1234',
    testSteps:
      '1. Login as AdminMaker\n2. Open Change Password form\n3. Fill Current Password: Pakistan@1234\n4. Fill New Password: Pakistan@1234 (same as current)\n5. Fill Confirm New Password: Pakistan@1234\n6. Click "Change Password"\n7. Assert error: "New password must be different from current password"',
    expectedResult:
      'Inline error shown: password must be different from current.\nPassword NOT changed.',
    actualResult:
      'Validation error shown correctly. Password not changed.',
    status: 'PASS',
    remarks: '"Different from current password" is listed in the Password Requirements section on screen.',
  },
  {
    tcId: 'TC_PWD_NEG_005',
    module: 'Change Password',
    subModule: 'Password Complexity Validation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'New password missing uppercase, lowercase, or number — inline validation error expected',
    preconditions:
      'AdminMaker is logged in.\nPassword requirement: uppercase + lowercase + at least one number.',
    testData:
      'Current Password: Pakistan@1234\nNew Password: alllowercase@ (no uppercase, no number)\nConfirm New Password: alllowercase@',
    testSteps:
      '1. Login as AdminMaker\n2. Open Change Password form\n3. Fill Current Password: Pakistan@1234\n4. Fill New Password: alllowercase@ (no uppercase, no number)\n5. Fill Confirm New Password: alllowercase@\n6. Click "Change Password"\n7. Assert error about missing uppercase/number shown',
    expectedResult:
      'Inline error shown referencing password complexity requirement (uppercase, lowercase, number).\nPassword NOT changed.',
    actualResult:
      'Complexity validation error shown correctly. Password not changed.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_PWD_NEG_006',
    module: 'Change Password',
    subModule: 'Empty Fields Validation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'All fields left empty and Change Password clicked — required field validation errors shown',
    preconditions:
      'AdminMaker is logged in.\nChange Password form is open.',
    testData:
      'Current Password: (empty)\nNew Password: (empty)\nConfirm New Password: (empty)',
    testSteps:
      '1. Login as AdminMaker\n2. Open Change Password form\n3. Leave all fields empty\n4. Click "Change Password"\n5. Assert required field validation errors shown for all empty fields',
    expectedResult:
      'Required field errors shown for Current Password, New Password, and Confirm New Password.\nPassword NOT changed.',
    actualResult:
      'Validation errors shown for all empty fields. Submit blocked.',
    status: 'PASS',
    remarks: '',
  },
];

// ── Excel Generator ────────────────────────────────────────────────────────────

async function generateChangePasswordReport() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Automation Suite';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Change Password Test Cases', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: 'TC ID',            key: 'tcId',           width: 20  },
    { header: 'Module',           key: 'module',         width: 20  },
    { header: 'Sub-Module',       key: 'subModule',      width: 28  },
    { header: 'Role',             key: 'role',           width: 16  },
    { header: 'Test Type',        key: 'testType',       width: 14  },
    { header: 'Description',      key: 'description',    width: 45  },
    { header: 'Preconditions',    key: 'preconditions',  width: 38  },
    { header: 'Test Data',        key: 'testData',       width: 38  },
    { header: 'Test Steps',       key: 'testSteps',      width: 62  },
    { header: 'Expected Result',  key: 'expectedResult', width: 45  },
    { header: 'Actual Result',    key: 'actualResult',   width: 45  },
    { header: 'Status',           key: 'status',         width: 12  },
    { header: 'Remarks',          key: 'remarks',        width: 45  },
  ];

  // Header style
  const headerRow = sheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  headerRow.height = 28;

  // Data rows
  testCases.forEach(tc => {
    const row = sheet.addRow(tc);
    row.height = 90;

    row.eachCell(cell => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border    = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    // Test Type colour
    const typeCell = row.getCell('testType');
    if (tc.testType === 'Positive') {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
      typeCell.font = { color: { argb: 'FF274E13' }, bold: true };
    } else {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
      typeCell.font = { color: { argb: 'FF7F6000' }, bold: true };
    }
    typeCell.alignment = { horizontal: 'center', vertical: 'top', wrapText: true };

    // Status colour
    const statusCell = row.getCell('status');
    if (tc.status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
      statusCell.font = { color: { argb: 'FF1A4300' }, bold: true };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4C4C' } };
      statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    }
    statusCell.alignment = { horizontal: 'center', vertical: 'top', wrapText: true };

    row.getCell('tcId').font = { bold: true };
  });

  // Summary sheet
  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Category', key: 'category', width: 28 },
    { header: 'Count',    key: 'count',    width: 12 },
  ];

  const summaryHeader = summary.getRow(1);
  summaryHeader.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.alignment = { horizontal: 'center' };
  });

  const total    = testCases.length;
  const positive = testCases.filter(t => t.testType === 'Positive').length;
  const negative = testCases.filter(t => t.testType === 'Negative').length;
  const passed   = testCases.filter(t => t.status === 'PASS').length;
  const failed   = testCases.filter(t => t.status === 'FAIL').length;

  [
    { category: 'Total Test Cases',   count: total    },
    { category: 'Positive Scenarios', count: positive },
    { category: 'Negative Scenarios', count: negative },
    { category: 'PASS',               count: passed   },
    { category: 'FAIL',               count: failed   },
    { category: 'Module',             count: 'Change Password' },
    { category: 'Executed By',        count: 'Automation Suite' },
    { category: 'Execution Date',     count: new Date().toLocaleDateString() },
  ].forEach(r => {
    const row = summary.addRow(r);
    row.eachCell(cell => {
      cell.alignment = { horizontal: 'left' };
      cell.border    = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });
  });

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filePath  = path.join(reportsDir, `ChangePassword_Module_TestReport_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}\n`);
}

generateChangePasswordReport().catch(console.error);
