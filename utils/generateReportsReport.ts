import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface ReportsTestCase {
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
  status: 'PASS' | 'FAIL';
  remarks: string;
}

const testCases: ReportsTestCase[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // POSITIVE SCENARIOS
  // ════════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_RPT_001',
    module: 'Reports — Transaction Summary',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Transaction Summary Report generates successfully with valid date range',
    preconditions:
      'AdminMaker logged into MMP.\nJasper Reports portal accessible via Reports link.\nJasper login: jasperadmin / jasperadmin.',
    testData: 'FROM_DATE: April 1, 2026\nTO_DATE: Current date/time (Now)',
    testSteps:
      '1. Login to MMP as AdminMaker\n2. Click Reports link — Jasper opens in popup\n3. Login to Jasper with valid credentials\n4. Click report panel (handler2)\n5. Select Transaction_Summary_Report\n6. Set FROM_DATE: April (month=3), Day=1\n7. Set TO_DATE: Now\n8. Click Apply\n9. Wait for report to load\n10. Assert report title "Merchant Transaction Summary" is visible\n11. Assert today\'s date appears in report timestamp',
    expectedResult:
      'Report loads successfully.\nTitle "Merchant Transaction Summary" is visible.\nCurrent date appears in generated timestamp.',
    actualResult:
      'Report loaded successfully. Title and timestamp verified.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_RPT_002',
    module: 'Reports — Transaction Detail',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Transaction Detail Report generates with MID, Aggregator, Status and Transaction Type filters',
    preconditions:
      'Continuing from TC_RPT_001 Jasper session.\nMID 000921773937631 exists in system.',
    testData:
      'MID: 000921773937631\nAGGREGATOR: AXIAN\nSTATUS: ALL\nTRANSACTION_CATEGORY: SEND_MONEY\nFROM_DATE: April 1, 2026\nTO_DATE: Now',
    testSteps:
      '1. Close previous report\n2. Select Transaction_Detail_Report\n3. Fill MID: 000921773937631\n4. Select AGGREGATOR_NAME: AXIAN\n5. Select STATUS: ALL\n6. Set FROM_DATE: April (month=3), Day=1\n7. Set TO_DATE: Now\n8. Select TRANSACTION_CATEGORY: SEND_MONEY\n9. Click Apply\n10. Assert title "Merchant Transaction Report"\n11. Assert today\'s date in timestamp\n12. Assert columns: MID, Aggregator, Category, Status\n13. Assert filter values: 000921773937631, AXIAN, SEND_MONEY, SUCCESS',
    expectedResult:
      'Report loads with correct filter values reflected.\nAll column headers visible.\nMID, Aggregator, Category, Status values match input filters.',
    actualResult:
      'Report loaded. All assertions passed.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_RPT_003',
    module: 'Reports — Pending Payments',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Pending Payments Report generates successfully with valid date range',
    preconditions: 'Continuing from previous Jasper session.',
    testData: 'FROM_DATE: April 1, 2026\nTO_DATE: Now',
    testSteps:
      '1. Close previous report\n2. Select Pending_Payments_Report\n3. Set FROM_DATE: April (month=3), Day=1\n4. Set TO_DATE: Now\n5. Click Apply\n6. Assert title "Pending Amounts & Aging Report"\n7. Assert today\'s date in timestamp\n8. Assert column "Pending Count" is visible',
    expectedResult:
      'Report loads. Title "Pending Amounts & Aging Report" visible.\n"Pending Count" column visible. Timestamp matches today.',
    actualResult:
      'Report loaded. All assertions passed.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_RPT_004',
    module: 'Reports — Failed Payments',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Failed Payments Report generates with Aggregator and Merchant filters set to ALL',
    preconditions: 'Continuing from previous Jasper session.',
    testData:
      'AGGREGATOR_NAME: ALL\nMERCHANT_NAME: ALL\nFROM_DATE: April 1, 2026\nTO_DATE: Now',
    testSteps:
      '1. Close previous report\n2. Select Failed_Payments_Report\n3. Set FROM_DATE: April (month=3), Day=1 (cell picker)\n4. Set TO_DATE: Now\n5. Confirm AGGREGATOR_NAME: ALL\n6. Confirm MERCHANT_NAME: ALL\n7. Click Apply\n8. Assert title "Merchant Failure Analysis"\n9. Assert today\'s date in timestamp',
    expectedResult:
      'Report loads. Title "Merchant Failure Analysis" visible. Timestamp matches today.',
    actualResult:
      'Report loaded. All assertions passed.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_RPT_005',
    module: 'Reports — Audit Logs',
    role: 'AdminMaker',
    testType: 'Positive',
    description: 'Audit Logs Report generates successfully with valid start and end dates',
    preconditions: 'Continuing from previous Jasper session.',
    testData: 'STARTDATE: April 2026 (month=3)\nENDDATE: Now\nSTATUS: ALL',
    testSteps:
      '1. Close previous report\n2. Select Audit Logs\n3. Set STARTDATE: month=3 (April)\n4. Set ENDDATE: Now\n5. Select STATUS: ALL\n6. Click Apply\n7. Assert title "System Audit Log Report"\n8. Assert today\'s date in timestamp',
    expectedResult:
      'Report loads. Title "System Audit Log Report" visible. Timestamp matches today.',
    actualResult:
      'Report loaded. All assertions passed.',
    status: 'PASS',
    remarks: '',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // NEGATIVE SCENARIOS
  // ════════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_RPT_NEG_001',
    module: 'Reports — Jasper Login',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Jasper login fails with invalid credentials (fakeuser / fakepass)',
    preconditions:
      'AdminMaker logged into MMP.\nJasper popup opened via Reports link.',
    testData: 'Jasper Username: fakeuser\nJasper Password: fakepass',
    testSteps:
      '1. Login to MMP as AdminMaker\n2. Click Reports — Jasper opens in popup\n3. Enter Username: fakeuser\n4. Enter Password: fakepass\n5. Click Login\n6. Assert login button is still visible (not redirected)\n7. Assert error message appears in body\n8. Assert Reports panel is NOT visible',
    expectedResult:
      'Login fails. Error message visible. Reports panel not accessible.',
    actualResult:
      'Login rejected. Error message shown. Reports panel not accessible.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_RPT_NEG_002',
    module: 'Reports — Transaction Summary',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'FROM date set after TO date — app should show date range error but shows empty report instead',
    preconditions:
      'AdminMaker logged into MMP. Jasper session active with valid login.',
    testData: 'FROM_DATE: May 7, 2026\nTO_DATE: April 1, 2026 (FROM > TO — invalid range)',
    testSteps:
      '1. Select Transaction_Summary_Report\n2. Set FROM_DATE: May 7, 2026\n3. Set TO_DATE: April 1, 2026 (before FROM)\n4. Click Apply\n5. Assert error message about invalid date range is shown',
    expectedResult:
      'App should display a date range validation error (e.g. "FROM date cannot be after TO date").',
    actualResult:
      'App silently shows an empty report with no error message. BUG — no validation performed.',
    status: 'FAIL',
    remarks: 'Known bug: app accepts inverted date range without any error message. Defect to be raised.',
  },
  {
    tcId: 'TC_RPT_NEG_003',
    module: 'Reports — Transaction Detail',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Invalid MID format (special characters + extra digits) — app should show validation error',
    preconditions:
      'AdminMaker logged into MMP. Jasper session active with valid login.',
    testData:
      'MID: 000921773937631111@@@\nAGGREGATOR: AXIAN\nFROM_DATE: April 1, 2026\nTO_DATE: Now',
    testSteps:
      '1. Close previous report\n2. Select Transaction_Detail_Report\n3. Enter MID: 000921773937631111@@@\n4. Select AGGREGATOR: AXIAN\n5. Set FROM_DATE and TO_DATE\n6. Click Apply\n7. Assert MID format validation error is shown',
    expectedResult:
      'App should display a MID format validation error (e.g. "Invalid MID format").',
    actualResult:
      'App silently shows an empty report with no error message. BUG — no MID format validation.',
    status: 'FAIL',
    remarks: 'Known bug: app accepts invalid MID without any validation error. Defect to be raised.',
  },
  {
    tcId: 'TC_RPT_NEG_004',
    module: 'Reports — Audit Logs',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Audit Logs: clicking Apply without entering mandatory STARTDATE and ENDDATE',
    preconditions:
      'AdminMaker logged into MMP. Jasper session active with valid login.',
    testData: 'STARTDATE: (empty)\nENDDATE: (empty)',
    testSteps:
      '1. Close previous report\n2. Select Audit Logs\n3. Do NOT fill STARTDATE or ENDDATE\n4. Click Apply\n5. Assert "This field is mandatory so you must enter data." error is visible',
    expectedResult:
      '"This field is mandatory so you must enter data." shown for both STARTDATE and ENDDATE.',
    actualResult:
      'Mandatory field error displayed correctly for both date fields.',
    status: 'PASS',
    remarks: '',
  },
];

// ── Excel Generator ────────────────────────────────────────────────────────────

async function generateReportsTestReport() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Automation Suite';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Reports Module Test Cases', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // ── Column definitions ──────────────────────────────────────────────────────
  sheet.columns = [
    { header: 'TC ID',            key: 'tcId',           width: 18  },
    { header: 'Module',           key: 'module',         width: 30  },
    { header: 'Role',             key: 'role',           width: 16  },
    { header: 'Test Type',        key: 'testType',       width: 14  },
    { header: 'Description',      key: 'description',    width: 45  },
    { header: 'Preconditions',    key: 'preconditions',  width: 40  },
    { header: 'Test Data',        key: 'testData',       width: 40  },
    { header: 'Test Steps',       key: 'testSteps',      width: 60  },
    { header: 'Expected Result',  key: 'expectedResult', width: 45  },
    { header: 'Actual Result',    key: 'actualResult',   width: 45  },
    { header: 'Status',           key: 'status',         width: 12  },
    { header: 'Remarks',          key: 'remarks',        width: 45  },
  ];

  // ── Header row style ────────────────────────────────────────────────────────
  const headerRow = sheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = {
      top:    { style: 'thin' }, bottom: { style: 'thin' },
      left:   { style: 'thin' }, right:  { style: 'thin' },
    };
  });
  headerRow.height = 28;

  // ── Data rows ───────────────────────────────────────────────────────────────
  testCases.forEach(tc => {
    const row = sheet.addRow(tc);
    row.height = 80;

    row.eachCell(cell => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border    = {
        top:    { style: 'thin' }, bottom: { style: 'thin' },
        left:   { style: 'thin' }, right:  { style: 'thin' },
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

    // TC ID bold
    row.getCell('tcId').font = { bold: true };
  });

  // ── Summary sheet ───────────────────────────────────────────────────────────
  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Category',   key: 'category', width: 25 },
    { header: 'Count',      key: 'count',    width: 12 },
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

  const summaryRows = [
    { category: 'Total Test Cases',     count: total    },
    { category: 'Positive Scenarios',   count: positive },
    { category: 'Negative Scenarios',   count: negative },
    { category: 'PASS',                 count: passed   },
    { category: 'FAIL',                 count: failed   },
    { category: 'Module',               count: 'Reports (Jasper)' },
    { category: 'Executed By',          count: 'Automation Suite' },
    { category: 'Execution Date',       count: new Date().toLocaleDateString() },
  ];

  summaryRows.forEach(r => {
    const row = summary.addRow(r);
    row.eachCell(cell => {
      cell.alignment = { horizontal: 'left' };
      cell.border    = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });
  });

  // ── Save file ───────────────────────────────────────────────────────────────
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filePath  = path.join(reportsDir, `Reports_Module_TestReport_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}\n`);
}

generateReportsTestReport().catch(console.error);
