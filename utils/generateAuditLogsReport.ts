import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface AuditLogsTestCase {
  tcId: string;
  module: string;
  role: string;
  testType: 'Positive' | 'Negative';
  description: string;
  preconditions: string;
  testData: string;
  testSteps: string;
  expectedResult: string;
  actualResult: string;
  status: 'PASS' | 'FAIL' | 'N/A';
  remarks: string;
}

const testCases: AuditLogsTestCase[] = [

  // --------------------------------------------------------------------------
  // POSITIVE SCENARIOS
  // --------------------------------------------------------------------------

  {
    tcId: 'TC_AUDITLOG_001',
    module: 'Audit Logs',
    role: 'AdminMaker / AdminChecker',
    testType: 'Positive',
    description: 'Real-time audit log: AdminChecker login captured and verified in Audit Logs',
    preconditions: 'AdminMaker and AdminChecker accounts are active.\nAdminMaker is logged in.',
    testData: 'AdminMaker credentials: AdminMaker / Pakistan@1234\nAdminChecker credentials: AdminChecker / Pakistan@1234',
    testSteps:
      '1. Login as AdminMaker\n' +
      '2. Navigate to Audit Logs\n' +
      '3. Open Filter ? Action Type = LOGIN, Username = AdminChecker ? Apply Filters\n' +
      '4. In a separate browser session login as AdminChecker\n' +
      '5. Back in AdminMaker session click Refresh\n' +
      '6. Locate AdminChecker LOGIN row\n' +
      '7. Assert: Date = today, Action = LOGIN, Username = AdminChecker, Status = Success, Endpoint = /login\n' +
      '8. Click View Details ? assert Payload modal opens\n' +
      '9. Close modal',
    expectedResult:
      'AdminChecker LOGIN entry appears with correct Date, Action, Username, Status and Endpoint.\nPayload modal opens and closes successfully.',
    actualResult:
      'AdminChecker LOGIN entry appeared with all correct data. Payload modal opened and closed.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_002',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Filter by Action Type LOGIN returns matching results',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open.',
    testData: 'Action Type: LOGIN',
    testSteps:
      '1. Click Filter button\n' +
      '2. Expand Action Type dropdown ? select LOGIN\n' +
      '3. Click Apply Filters\n' +
      '4. Assert first row in table shows LOGIN action',
    expectedResult: 'Table shows rows with Action = LOGIN. At least one row visible.',
    actualResult: 'Table displayed rows with LOGIN action.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_003',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Filter by Username AdminMaker returns matching results',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Username: AdminMaker',
    testSteps:
      '1. Type "AdminMaker" in Search by username field\n' +
      '2. Click Apply Filters\n' +
      '3. Assert Username column header is visible\n' +
      '4. Assert first row contains "AdminMaker"',
    expectedResult: 'Table shows rows where Username = AdminMaker.',
    actualResult: 'Table displayed rows with AdminMaker username.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_004',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Filter by Date Range (today to today) returns today\'s logs',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'From Date: 07/05/2026\nTo Date: 07/05/2026',
    testSteps:
      '1. Click From Date field ? select today (May 7th) from calendar\n' +
      '2. Click To Date field ? select today (May 7th) from calendar\n' +
      '3. Click Apply Filters\n' +
      '4. Assert first row contains "May 2026"',
    expectedResult: 'Table shows rows with dates in May 2026.',
    actualResult: 'Table displayed rows with May 2026 dates.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_005',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Quick filter "Today" button shows today\'s logs after Apply',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Quick select: Today',
    testSteps:
      '1. Click "Today" quick-select button\n' +
      '2. Click Apply Filters\n' +
      '3. Assert first row contains "May 2026"',
    expectedResult: 'Table shows today\'s logs only.',
    actualResult: 'Table displayed today\'s logs with May 2026 dates.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_006',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Reset Filters clears applied filter and shows all logs',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Username filter: AdminMaker',
    testSteps:
      '1. Type "AdminMaker" in Search by username\n' +
      '2. Click Apply Filters\n' +
      '3. Click Reset\n' +
      '4. Assert username input is empty\n' +
      '5. Assert table still has rows',
    expectedResult: 'Username field cleared. Table shows all unfiltered logs.',
    actualResult: 'Username field was cleared. Table showed all logs.',
    status: 'PASS',
    remarks: '',
  },

  // --------------------------------------------------------------------------
  // NEGATIVE SCENARIOS
  // --------------------------------------------------------------------------

  {
    tcId: 'TC_AUDITLOG_NEG_001',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Non-existent username shows "No data found" � no validation error displayed',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Username: jkejke9998 (does not exist)',
    testSteps:
      '1. Type "jkejke9998" in Search by username field\n' +
      '2. Click Apply Filters\n' +
      '3. Assert "No data found" message is visible\n' +
      '4. Assert no validation error text is shown',
    expectedResult:
      'App should show a validation message like "User not found".\n"No data found" alone is not sufficient � input should be validated.',
    actualResult:
      '"No data found" displayed. No username validation error shown. App accepts any string silently.',
    status: 'PASS',
    remarks: 'BUG: No username input validation. Any string accepted without error.',
  },
  {
    tcId: 'TC_AUDITLOG_NEG_002',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'To Date earlier than From Date — no validation error shown (app bug)',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'From Date: 07/05/2026\nTo Date: 01/05/2026 (earlier than From Date)',
    testSteps:
      '1. Click From Date → select May 7, 2026\n' +
      '2. Click To Date → select May 1, 2026\n' +
      '3. Click Apply Filters\n' +
      '4. Assert a date range validation error is displayed',
    expectedResult:
      'App should display: "To date must be after From date" or equivalent date range error.',
    actualResult:
      'App silently shows "No data found". No date range validation error displayed.',
    status: 'FAIL',
    remarks: 'BUG: No date range validation. To Date < From Date accepted silently. Returns empty results instead of error.',
  },

  // --------------------------------------------------------------------------
  // NEW ACTION TYPE FILTER SCENARIOS (TC_AUDITLOG_007 – 012)
  // --------------------------------------------------------------------------

  {
    tcId: 'TC_AUDITLOG_007',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Filter by Action Type ALL returns all log records',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Action Type: ALL',
    testSteps:
      '1. Click Filter button\n' +
      '2. Expand Action Type dropdown → select ALL\n' +
      '3. Click Apply Filters\n' +
      '4. Assert at least one row is visible in the table',
    expectedResult: 'Table shows all log records without restriction. At least one row visible.',
    actualResult: '',
    status: 'N/A',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_008',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Filter by Action Type AGGREGATOR_CREATION returns matching records',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Action Type: AGGREGATOR_CREATION',
    testSteps:
      '1. Click Filter button\n' +
      '2. Expand Action Type dropdown → select AGGREGATOR_CREATION\n' +
      '3. Click Apply Filters\n' +
      '4. If rows visible: assert first action badge is AGGREGATOR_CREATION\n' +
      '5. If no data: assert "No data found" message',
    expectedResult: 'Table shows only AGGREGATOR_CREATION rows, or "No data found" if no records exist.',
    actualResult: '',
    status: 'N/A',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_009',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Filter by Action Type AGGREGATOR_UPDATE returns matching records',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Action Type: AGGREGATOR_UPDATE',
    testSteps:
      '1. Click Filter button\n' +
      '2. Expand Action Type dropdown → select AGGREGATOR_UPDATE\n' +
      '3. Click Apply Filters\n' +
      '4. If rows visible: assert first action badge is AGGREGATOR_UPDATE\n' +
      '5. If no data: assert "No data found" message',
    expectedResult: 'Table shows only AGGREGATOR_UPDATE rows, or "No data found" if no records exist.',
    actualResult: '',
    status: 'N/A',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_010',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Filter by Action Type BULK_ONBOARDING returns matching records',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Action Type: BULK_ONBOARDING',
    testSteps:
      '1. Click Filter button\n' +
      '2. Expand Action Type dropdown → select BULK_ONBOARDING\n' +
      '3. Click Apply Filters\n' +
      '4. If rows visible: assert first action badge is BULK_ONBOARDING\n' +
      '5. If no data: assert "No data found" message',
    expectedResult: 'Table shows only BULK_ONBOARDING rows, or "No data found" if no records exist.',
    actualResult: '',
    status: 'N/A',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_011',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Filter by Action Type LOGOUT returns matching records',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Action Type: LOGOUT',
    testSteps:
      '1. Click Filter button\n' +
      '2. Expand Action Type dropdown → select LOGOUT\n' +
      '3. Click Apply Filters\n' +
      '4. Assert first row is visible\n' +
      '5. Assert action badge shows LOGOUT',
    expectedResult: 'Table shows rows with Action = LOGOUT. At least one row visible.',
    actualResult: '',
    status: 'N/A',
    remarks: '',
  },
  {
    tcId: 'TC_AUDITLOG_012',
    module: 'Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Filter by Action Type FIELD_VALIDATION returns matching records',
    preconditions: 'Logged in as AdminMaker. Audit Logs page open. Filter panel visible.',
    testData: 'Action Type: FIELD_VALIDATION',
    testSteps:
      '1. Click Filter button\n' +
      '2. Expand Action Type dropdown → select FIELD_VALIDATION\n' +
      '3. Click Apply Filters\n' +
      '4. If rows visible: assert first action badge is FIELD_VALIDATION\n' +
      '5. If no data: assert "No data found" message',
    expectedResult: 'Table shows only FIELD_VALIDATION rows, or "No data found" if no records exist.',
    actualResult: '',
    status: 'N/A',
    remarks: '',
  },
];

async function generateReport() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Automation QA';
  workbook.created = new Date();

  // -- Sheet 1: Test Cases ------------------------------------------------
  const sheet = workbook.addWorksheet('Audit Logs Test Cases');

  sheet.columns = [
    { header: 'TC ID',           key: 'tcId',           width: 22 },
    { header: 'Module',          key: 'module',         width: 20 },
    { header: 'Role',            key: 'role',           width: 28 },
    { header: 'Test Type',       key: 'testType',       width: 14 },
    { header: 'Description',     key: 'description',    width: 45 },
    { header: 'Preconditions',   key: 'preconditions',  width: 40 },
    { header: 'Test Data',       key: 'testData',       width: 35 },
    { header: 'Test Steps',      key: 'testSteps',      width: 55 },
    { header: 'Expected Result', key: 'expectedResult', width: 45 },
    { header: 'Actual Result',   key: 'actualResult',   width: 45 },
    { header: 'Status',          key: 'status',         width: 12 },
    { header: 'Remarks',         key: 'remarks',        width: 50 },
  ];

  // Header row style
  const headerRow = sheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  headerRow.height = 30;

  // Data rows
  testCases.forEach(tc => {
    const row = sheet.addRow(tc);
    row.height = 90;
    row.eachCell(cell => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    // Test Type colour
    const typeCell = row.getCell('testType');
    typeCell.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: tc.testType === 'Positive' ? 'FFD9EAD3' : 'FFFCE5CD' },
    };
    typeCell.font = { bold: true, color: { argb: tc.testType === 'Positive' ? 'FF274E13' : 'FF7F3F00' } };

    // Status colour
    const statusCell = row.getCell('status');
    statusCell.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: tc.status === 'PASS' ? 'FFD9EAD3' : 'FFFFC7CE' },
    };
    statusCell.font = { bold: true, color: { argb: tc.status === 'PASS' ? 'FF274E13' : 'FF9C0006' } };
    statusCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });

  // -- Sheet 2: Summary --------------------------------------------------
  const summary = workbook.addWorksheet('Summary');

  const total    = testCases.length;
  const passed   = testCases.filter(t => t.status === 'PASS').length;
  const failed   = testCases.filter(t => t.status === 'FAIL').length;
  const positive = testCases.filter(t => t.testType === 'Positive').length;
  const negative = testCases.filter(t => t.testType === 'Negative').length;

  const summaryData = [
    ['Metric',          'Count'],
    ['Total Test Cases', total],
    ['Passed',           passed],
    ['Failed',           failed],
    ['Positive Tests',   positive],
    ['Negative Tests',   negative],
    ['Pass Rate',        `${((passed / total) * 100).toFixed(1)}%`],
    ['Execution Date',   new Date().toLocaleDateString('en-GB')],
  ];

  summaryData.forEach((rowData, i) => {
    const row = summary.addRow(rowData);
    row.height = 24;
    row.eachCell(cell => {
      cell.alignment = { vertical: 'middle', horizontal: i === 0 ? 'center' : 'left' };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });
    if (i === 0) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }
  });

  summary.getColumn(1).width = 25;
  summary.getColumn(2).width = 18;

  // -- Write file ---------------------------------------------------------
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filePath  = path.join(reportsDir, `AuditLogs_Module_TestReport_${timestamp}.xlsx`);

  await workbook.xlsx.writeFile(filePath);
  console.log(`\nExcel report generated: ${filePath}\n`);
}

generateReport().catch(err => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
