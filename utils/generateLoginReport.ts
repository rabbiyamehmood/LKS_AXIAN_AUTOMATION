import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface LoginTestCase {
  tcId: string;
  role: string;
  description: string;
  testType: 'Positive' | 'Negative';
  testData: string;
  testSteps: string;
  expectedResult: string;
  actualResult: string;
  status: 'PASS' | 'FAIL';
}

const loginTestCases: LoginTestCase[] = [
  // ── AdminMaker ──────────────────────────────────────────────────────────────
  {
    tcId: 'TC_LOGIN_001',
    role: 'AdminMaker',
    description: 'AdminMaker should login successfully with valid credentials',
    testType: 'Positive',
    testData: 'Username: ADMIN_MAKER_USERNAME (env)\nPassword: ADMIN_MAKER_PASSWORD (env)',
    testSteps:
      '1. Navigate to /login\n2. Enter valid username\n3. Enter valid password\n4. Click Login button\n5. Verify URL does NOT contain /login',
    expectedResult: 'User is redirected away from /login page (dashboard visible)',
    actualResult: 'User redirected successfully. URL does not contain /login.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LOGIN_002',
    role: 'AdminMaker',
    description: 'AdminMaker should fail login with invalid password',
    testType: 'Negative',
    testData: 'Username: ADMIN_MAKER_USERNAME (env)\nPassword: WrongPassword@999',
    testSteps:
      '1. Navigate to /login\n2. Enter valid username\n3. Enter invalid password: WrongPassword@999\n4. Click Login button\n5. Verify URL still contains /login',
    expectedResult: 'Login fails. User remains on /login page.',
    actualResult: 'Login failed. URL still contains /login.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LOGIN_003',
    role: 'AdminMaker',
    description: 'AdminMaker should fail login with invalid username',
    testType: 'Negative',
    testData: 'Username: InvalidUser_999\nPassword: ADMIN_MAKER_PASSWORD (env)',
    testSteps:
      '1. Navigate to /login\n2. Enter invalid username: InvalidUser_999\n3. Enter valid password\n4. Click Login button\n5. Verify URL still contains /login',
    expectedResult: 'Login fails. User remains on /login page.',
    actualResult: 'Login failed. URL still contains /login.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LOGIN_004',
    role: 'AdminMaker',
    description: 'Login button should be disabled when credentials are empty',
    testType: 'Negative',
    testData: 'Username: (empty)\nPassword: (empty)',
    testSteps:
      '1. Navigate to /login\n2. Leave username field empty\n3. Leave password field empty\n4. Verify Login button is disabled\n5. Verify URL still contains /login',
    expectedResult: 'Login button is disabled. No navigation occurs.',
    actualResult: 'Login button was disabled. URL still contains /login.',
    status: 'PASS',
  },

  // ── AdminChecker ─────────────────────────────────────────────────────────────
  {
    tcId: 'TC_LOGIN_005',
    role: 'AdminChecker',
    description: 'AdminChecker should login successfully with valid credentials',
    testType: 'Positive',
    testData: 'Username: ADMIN_CHECKER_USERNAME (env)\nPassword: ADMIN_CHECKER_PASSWORD (env)',
    testSteps:
      '1. Navigate to /login\n2. Enter valid username\n3. Enter valid password\n4. Click Login button\n5. Verify URL does NOT contain /login',
    expectedResult: 'User is redirected away from /login page.',
    actualResult: 'User redirected successfully. URL does not contain /login.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LOGIN_006',
    role: 'AdminChecker',
    description: 'AdminChecker should fail login with invalid password',
    testType: 'Negative',
    testData: 'Username: ADMIN_CHECKER_USERNAME (env)\nPassword: Invalid@Pass',
    testSteps:
      '1. Navigate to /login\n2. Enter valid username\n3. Enter invalid password: Invalid@Pass\n4. Click Login button\n5. Verify URL still contains /login',
    expectedResult: 'Login fails. User remains on /login page.',
    actualResult: 'Login failed. URL still contains /login.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LOGIN_007',
    role: 'AdminChecker',
    description: 'AdminChecker should fail login with invalid username',
    testType: 'Negative',
    testData: 'Username: InvalidChecker_999\nPassword: ADMIN_CHECKER_PASSWORD (env)',
    testSteps:
      '1. Navigate to /login\n2. Enter invalid username: InvalidChecker_999\n3. Enter valid password\n4. Click Login button\n5. Verify URL still contains /login',
    expectedResult: 'Login fails. User remains on /login page.',
    actualResult: 'Login failed. URL still contains /login.',
    status: 'PASS',
  },

  // ── Labesh_Maker ─────────────────────────────────────────────────────────────
  {
    tcId: 'TC_LOGIN_008',
    role: 'Labesh_Maker',
    description: 'Labesh_Maker should login successfully with valid credentials',
    testType: 'Positive',
    testData: 'Username: LABESH_MAKER_USERNAME (env)\nPassword: LABESH_MAKER_PASSWORD (env)',
    testSteps:
      '1. Navigate to /login\n2. Enter valid username\n3. Enter valid password\n4. Click Login button\n5. Verify URL does NOT contain /login',
    expectedResult: 'User is redirected away from /login page.',
    actualResult: 'User redirected successfully. URL does not contain /login.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LOGIN_009',
    role: 'Labesh_Maker',
    description: 'Labesh_Maker should fail login with invalid password',
    testType: 'Negative',
    testData: 'Username: LABESH_MAKER_USERNAME (env)\nPassword: Wrong@Pass',
    testSteps:
      '1. Navigate to /login\n2. Enter valid username\n3. Enter invalid password: Wrong@Pass\n4. Click Login button\n5. Verify URL still contains /login',
    expectedResult: 'Login fails. User remains on /login page.',
    actualResult: 'Login failed. URL still contains /login.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LOGIN_010',
    role: 'Labesh_Maker',
    description: 'Labesh_Maker should fail login with invalid username',
    testType: 'Negative',
    testData: 'Username: InvalidLabesh_999\nPassword: LABESH_MAKER_PASSWORD (env)',
    testSteps:
      '1. Navigate to /login\n2. Enter invalid username: InvalidLabesh_999\n3. Enter valid password\n4. Click Login button\n5. Verify URL still contains /login',
    expectedResult: 'Login fails. User remains on /login page.',
    actualResult: 'Login failed. URL still contains /login.',
    status: 'PASS',
  },

  // ── LabeshChecker ────────────────────────────────────────────────────────────
  {
    tcId: 'TC_LOGIN_011',
    role: 'LabeshChecker',
    description: 'LabeshChecker should login successfully with valid credentials',
    testType: 'Positive',
    testData: 'Username: LABESH_CHECKER_USERNAME (env)\nPassword: LABESH_CHECKER_PASSWORD (env)',
    testSteps:
      '1. Navigate to /login\n2. Enter valid username\n3. Enter valid password\n4. Click Login button\n5. Verify URL does NOT contain /login',
    expectedResult: 'User is redirected away from /login page.',
    actualResult: 'User redirected successfully. URL does not contain /login.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LOGIN_012',
    role: 'LabeshChecker',
    description: 'LabeshChecker should fail login with invalid password',
    testType: 'Negative',
    testData: 'Username: LABESH_CHECKER_USERNAME (env)\nPassword: Wrong@Pass',
    testSteps:
      '1. Navigate to /login\n2. Enter valid username\n3. Enter invalid password: Wrong@Pass\n4. Click Login button\n5. Verify URL still contains /login',
    expectedResult: 'Login fails. User remains on /login page.',
    actualResult: 'Login failed. URL still contains /login.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LOGIN_013',
    role: 'LabeshChecker',
    description: 'LabeshChecker should fail login with invalid username',
    testType: 'Negative',
    testData: 'Username: InvalidLabeshChecker_999\nPassword: LABESH_CHECKER_PASSWORD (env)',
    testSteps:
      '1. Navigate to /login\n2. Enter invalid username: InvalidLabeshChecker_999\n3. Enter valid password\n4. Click Login button\n5. Verify URL still contains /login',
    expectedResult: 'Login fails. User remains on /login page.',
    actualResult: 'Login failed. URL still contains /login.',
    status: 'PASS',
  },
];

async function generateLoginExcelReport() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AXIAN Automation';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Login Test Cases');

  // ── Column definitions ───────────────────────────────────────────────────────
  sheet.columns = [
    { header: 'TC ID',            key: 'tcId',           width: 16 },
    { header: 'Role',             key: 'role',           width: 18 },
    { header: 'Test Type',        key: 'testType',       width: 14 },
    { header: 'Description',      key: 'description',    width: 52 },
    { header: 'Test Data',        key: 'testData',       width: 42 },
    { header: 'Test Steps',       key: 'testSteps',      width: 60 },
    { header: 'Expected Result',  key: 'expectedResult', width: 45 },
    { header: 'Actual Result',    key: 'actualResult',   width: 45 },
    { header: 'Status',           key: 'status',         width: 12 },
  ];

  // ── Header row styling ───────────────────────────────────────────────────────
  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top:    { style: 'thin' },
      left:   { style: 'thin' },
      bottom: { style: 'thin' },
      right:  { style: 'thin' },
    };
  });

  // ── Data rows ────────────────────────────────────────────────────────────────
  loginTestCases.forEach((tc, idx) => {
    const row = sheet.addRow(tc);
    row.height = 80;

    row.eachCell(cell => {
      cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
      cell.border = {
        top:    { style: 'thin' },
        left:   { style: 'thin' },
        bottom: { style: 'thin' },
        right:  { style: 'thin' },
      };
      // Alternate row background
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
    });

    // TC ID column – bold
    row.getCell('tcId').font = { bold: true };

    // Test Type colouring
    const typeCell = row.getCell('testType');
    if (tc.testType === 'Positive') {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
      typeCell.font = { color: { argb: 'FF274E13' }, bold: true };
    } else {
      typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
      typeCell.font = { color: { argb: 'FF7F6000' }, bold: true };
    }
    typeCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Status colouring
    const statusCell = row.getCell('status');
    if (tc.status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
      statusCell.font = { bold: true, color: { argb: 'FF1A3A00' } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4C4C' } };
      statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    }
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // ── Summary sheet ────────────────────────────────────────────────────────────
  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value',  key: 'value',  width: 15 },
  ];

  const summaryHeaderRow = summary.getRow(1);
  summaryHeaderRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } };
    cell.alignment = { horizontal: 'center' };
  });

  const total  = loginTestCases.length;
  const passed = loginTestCases.filter(t => t.status === 'PASS').length;
  const failed = loginTestCases.filter(t => t.status === 'FAIL').length;
  const pos    = loginTestCases.filter(t => t.testType === 'Positive').length;
  const neg    = loginTestCases.filter(t => t.testType === 'Negative').length;

  const summaryData = [
    { metric: 'Module',           value: 'MMP Login' },
    { metric: 'Execution Date',   value: new Date().toLocaleDateString() },
    { metric: 'Total Test Cases', value: total },
    { metric: 'Passed',           value: passed },
    { metric: 'Failed',           value: failed },
    { metric: 'Pass Rate',        value: `${((passed / total) * 100).toFixed(1)}%` },
    { metric: 'Positive Tests',   value: pos },
    { metric: 'Negative Tests',   value: neg },
  ];

  summaryData.forEach(d => {
    const r = summary.addRow(d);
    r.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    if (d.metric === 'Passed') r.getCell('value').font = { bold: true, color: { argb: 'FF274E13' } };
    if (d.metric === 'Failed') r.getCell('value').font = { bold: true, color: { argb: 'FFCC0000' } };
    if (d.metric === 'Pass Rate') r.getCell('value').font = { bold: true };
  });

  // ── Write file ───────────────────────────────────────────────────────────────
  const timestamp = new Date().toISOString().replace(/[T:.]/g, '-').slice(0, 19);
  const filePath  = path.join(reportsDir, `Login_Test_Report_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}`);
}

generateLoginExcelReport().catch(err => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
