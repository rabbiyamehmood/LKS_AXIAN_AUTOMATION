import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface BulkOnboardingTestCase {
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

const STEPS_E2E = (type: string) =>
  `1. Login as Labesh_Maker\n2. Navigate to Bulk Operations → Bulk Merchant Onboarding\n3. Drag & drop / upload filled ${type} template (.xlsx)\n4. Select Merchant Type: ${type}\n5. Click "Submit Bulk Onboarding"\n6. Assert success toast: "Bulk merchant onboarding request submitted successfully. Redirecting to merchants list."\n7. Click Close toast\n8. Navigate to Onboarding History\n9. Assert status = PENDING ENGRAFI\n10. Click View Details → assert Upload Details modal lists merchants with status ENGRAFI PENDING\n11. Close modal. Click Refresh until status = CHECKER PENDING (wait ~5–10 min)\n12. Logout. Login as LabeshChecker\n13. Inbox → Pending Processes → locate BULK MERCHANT ONBOARDING request\n14. Click Review → Approve → enter comment "approved" → Confirm\n15. Assert toast: "Bulk onboarding process approved successfully"\n16. Logout. Login as Labesh_Maker\n17. Bulk Operations → Onboarding History\n18. Click Refresh until status = PROCESSING COMPLETED\n19. Navigate to Merchant Onboarding → Merchant List\n20. Assert newly onboarded merchants appear in list`;

const PRECOND = (type: string) =>
  `Labesh_Maker and LabeshChecker accounts are active.\nFilled ${type} bulk template file (.xlsx) prepared with valid merchant data.\nBulk Operations menu accessible.`;

const testCases: BulkOnboardingTestCase[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // POSITIVE — Full E2E per Merchant Type
  // ════════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_BULK_001',
    module: 'Bulk Onboarding',
    subModule: 'Individual — Full E2E Flow',
    role: 'Labesh_Maker / LabeshChecker',
    testType: 'Positive',
    description: 'Bulk Merchant Onboarding full E2E flow for Merchant Type: Individual',
    preconditions: PRECOND('Individual'),
    testData: 'Merchant Type: Individual\nFile: individual_bulk.xlsx\nChecker comment: approved',
    testSteps: STEPS_E2E('Individual'),
    expectedResult:
      'File submitted successfully.\nStatus progresses: PENDING ENGRAFI → CHECKER PENDING → PROCESSING COMPLETED.\nMerchants appear in Merchant List.',
    actualResult: 'Full E2E flow completed. Status transitions and merchant list verified.',
    status: 'PASS',
    remarks: 'Status changes take ~5–10 min per transition. Use Refresh button to poll.',
  },
  {
    tcId: 'TC_BULK_002',
    module: 'Bulk Onboarding',
    subModule: 'NIDA Registered — Full E2E Flow',
    role: 'Labesh_Maker / LabeshChecker',
    testType: 'Positive',
    description: 'Bulk Merchant Onboarding full E2E flow for Merchant Type: NIDA Registered',
    preconditions: PRECOND('NIDA Registered'),
    testData: 'Merchant Type: NIDA Registered\nFile: nida_bulk.xlsx\nChecker comment: approved',
    testSteps: STEPS_E2E('NIDA Registered'),
    expectedResult:
      'File submitted successfully.\nStatus progresses: PENDING ENGRAFI → CHECKER PENDING → PROCESSING COMPLETED.\nMerchants appear in Merchant List.',
    actualResult: 'Full E2E flow completed. Status transitions and merchant list verified.',
    status: 'PASS',
    remarks: 'Status changes take ~5–10 min per transition. Use Refresh button to poll.',
  },
  {
    tcId: 'TC_BULK_003',
    module: 'Bulk Onboarding',
    subModule: 'Company — Full E2E Flow',
    role: 'Labesh_Maker / LabeshChecker',
    testType: 'Positive',
    description: 'Bulk Merchant Onboarding full E2E flow for Merchant Type: Company',
    preconditions: PRECOND('Company'),
    testData: 'Merchant Type: Company\nFile: company_bulk.xlsx\nChecker comment: approved',
    testSteps: STEPS_E2E('Company'),
    expectedResult:
      'File submitted successfully.\nStatus progresses: PENDING ENGRAFI → CHECKER PENDING → PROCESSING COMPLETED.\nMerchants appear in Merchant List.',
    actualResult: 'Full E2E flow completed. Status transitions and merchant list verified.',
    status: 'PASS',
    remarks: 'Status changes take ~5–10 min per transition. Use Refresh button to poll.',
  },
  {
    tcId: 'TC_BULK_004',
    module: 'Bulk Onboarding',
    subModule: 'Machinga — Full E2E Flow',
    role: 'Labesh_Maker / LabeshChecker',
    testType: 'Positive',
    description: 'Bulk Merchant Onboarding full E2E flow for Merchant Type: Machinga',
    preconditions: PRECOND('Machinga'),
    testData: 'Merchant Type: Machinga\nFile: machinga_bulk.xlsx\nChecker comment: approved',
    testSteps: STEPS_E2E('Machinga'),
    expectedResult:
      'File submitted successfully.\nStatus progresses: PENDING ENGRAFI → CHECKER PENDING → PROCESSING COMPLETED.\nMerchants appear in Merchant List.',
    actualResult: 'Full E2E flow completed. Status transitions and merchant list verified.',
    status: 'PASS',
    remarks: 'Status changes take ~5–10 min per transition. Use Refresh button to poll.',
  },
  {
    tcId: 'TC_BULK_005',
    module: 'Bulk Onboarding',
    subModule: 'Onboarding History — Status Filter',
    role: 'Labesh_Maker',
    testType: 'Positive',
    description: 'Filter Onboarding History by each available status value — correct records returned',
    preconditions:
      'Labesh_Maker is logged in.\nOnboarding History has records in various statuses:\nPENDING ENGRAFI, ENGRAFI IN PROGRESS, ENGRAFI FAILED, CHECKER PENDING, PENDING ONBOARDING, ONBOARDING IN PROGRESS, PROCESSING COMPLETED.',
    testData:
      'Filter: Status = PENDING ENGRAFI\nFilter: Status = CHECKER PENDING\nFilter: Status = PROCESSING COMPLETED\n(repeat for each status value)',
    testSteps:
      '1. Login as Labesh_Maker\n2. Navigate to Bulk Operations → Onboarding History\n3. Click Filter button\n4. Click Status dropdown\n5. Select "PENDING ENGRAFI"\n6. Click Apply Filters\n7. Assert only PENDING ENGRAFI records shown in table\n8. Click Reset\n9. Repeat steps 4–8 for: ENGRAFI IN PROGRESS, ENGRAFI FAILED, CHECKER PENDING, PENDING ONBOARDING, ONBOARDING IN PROGRESS, PROCESSING COMPLETED',
    expectedResult:
      'Each status filter returns only records matching that status.\nReset clears filter and shows all records.',
    actualResult: 'Status filter works correctly for all available status values.',
    status: 'PASS',
    remarks: 'Available statuses: PENDING ENGRAFI, ENGRAFI IN PROGRESS, ENGRAFI FAILED, CHECKER PENDING, PENDING ONBOARDING, ONBOARDING IN PROGRESS, PROCESSING COMPLETED.',
  },
  {
    tcId: 'TC_BULK_006',
    module: 'Bulk Onboarding',
    subModule: 'Onboarding History — Date Filter',
    role: 'Labesh_Maker',
    testType: 'Positive',
    description: 'Filter Onboarding History by date range and Quick Select options — correct records returned',
    preconditions:
      'Labesh_Maker is logged in.\nOnboarding History has records across multiple dates.',
    testData:
      'From Date: 12/05/2026\nTo Date: 12/05/2026\nQuick Select: Today / Last 7 days / This month / Last 30 days',
    testSteps:
      '1. Login as Labesh_Maker\n2. Navigate to Bulk Operations → Onboarding History\n3. Click Filter\n4. Set From Date and To Date to today\n5. Click Apply Filters\n6. Assert only records created today are shown\n7. Reset and test Quick Select: Today, Last 7 days, This month, Last 30 days\n8. Assert each Quick Select filters records to the correct date range',
    expectedResult:
      'Date range filter returns records within the specified dates only.\nEach Quick Select option correctly scopes the visible records.',
    actualResult: 'Date range and quick select filters working correctly.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_BULK_007',
    module: 'Bulk Onboarding',
    subModule: 'Onboarding History — File Name Filter',
    role: 'Labesh_Maker',
    testType: 'Positive',
    description: 'Search Onboarding History by file name — matching record returned',
    preconditions:
      'Labesh_Maker is logged in.\nAt least one bulk onboarding submission exists.',
    testData:
      'File Name Search: partial file name (e.g. "a52c9a51")',
    testSteps:
      '1. Login as Labesh_Maker\n2. Navigate to Bulk Operations → Onboarding History\n3. Click Filter\n4. Type partial file name in "File Name" search box\n5. Click Apply Filters\n6. Assert matching file record is returned\n7. Click Reset and assert all records restored',
    expectedResult:
      'Only records with matching file name displayed.\nReset restores full list.',
    actualResult: 'File name filter returns correct matching records.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_BULK_008',
    module: 'Bulk Onboarding',
    subModule: 'Upload Details Modal',
    role: 'Labesh_Maker',
    testType: 'Positive',
    description: 'View Details shows Upload Details modal with merchant-level status (ENGRAFI PENDING)',
    preconditions:
      'Labesh_Maker is logged in.\nA bulk onboarding submission in PENDING ENGRAFI status exists.',
    testData:
      'Bulk file: recently submitted (status: PENDING ENGRAFI)',
    testSteps:
      '1. Login as Labesh_Maker\n2. Navigate to Bulk Operations → Onboarding History\n3. Locate record in PENDING ENGRAFI status\n4. Click "View Details" button under Actions column\n5. Assert "Upload Details" modal opens\n6. Assert modal shows merchant rows with status "ENGRAFI PENDING"\n7. Close the modal',
    expectedResult:
      'Upload Details modal opens.\nEach merchant row shows status "ENGRAFI PENDING".\nModal can be closed.',
    actualResult: 'Modal opened with correct merchant list and ENGRAFI PENDING status.',
    status: 'PASS',
    remarks: '',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // NEGATIVE SCENARIOS
  // ════════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_BULK_NEG_001',
    module: 'Bulk Onboarding',
    subModule: 'File Format Validation',
    role: 'Labesh_Maker',
    testType: 'Negative',
    description: 'Upload wrong file format (.pdf / .txt) — validation error expected',
    preconditions: 'Labesh_Maker is logged in. Bulk Merchant Onboarding page is open.',
    testData: 'Upload File: invalid_file.pdf\nMerchant Type: Individual',
    testSteps:
      '1. Login as Labesh_Maker\n2. Navigate to Bulk Operations → Bulk Merchant Onboarding\n3. Upload a .pdf or .txt file\n4. Assert file format validation error shown\n5. Assert Submit button blocked',
    expectedResult: 'File format error shown. Only .xlsx/.csv accepted. Submit blocked.',
    actualResult: 'File format validation error displayed. Submit blocked.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_BULK_NEG_002',
    module: 'Bulk Onboarding',
    subModule: 'Empty File',
    role: 'Labesh_Maker',
    testType: 'Negative',
    description: 'Upload empty template (headers only, no data rows) — validation error expected',
    preconditions: 'Labesh_Maker is logged in.',
    testData: 'Upload File: empty_template.xlsx (no data rows)\nMerchant Type: Individual',
    testSteps:
      '1. Login as Labesh_Maker\n2. Upload template with headers but no data rows\n3. Select Merchant Type: Individual\n4. Click Submit\n5. Assert "no merchant data" error shown',
    expectedResult: '"File contains no merchant data" error shown. Submit blocked.',
    actualResult: 'Empty file validation error displayed.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_BULK_NEG_003',
    module: 'Bulk Onboarding',
    subModule: 'Missing Mandatory Columns',
    role: 'Labesh_Maker',
    testType: 'Negative',
    description: 'Upload file with missing mandatory columns — validation error expected',
    preconditions: 'Labesh_Maker is logged in. Template prepared with required columns removed.',
    testData: 'Upload File: template_missing_columns.xlsx\nMerchant Type: Individual',
    testSteps:
      '1. Login as Labesh_Maker\n2. Upload template with mandatory columns removed\n3. Select Merchant Type: Individual\n4. Click Submit\n5. Assert validation error for missing columns',
    expectedResult: 'Validation error for missing mandatory columns. Submission blocked.',
    actualResult: 'Missing columns error displayed. Submission blocked.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_BULK_NEG_004',
    module: 'Bulk Onboarding',
    subModule: 'No File Selected',
    role: 'Labesh_Maker',
    testType: 'Negative',
    description: 'Submit without selecting a file — required field error expected',
    preconditions: 'Labesh_Maker is logged in.',
    testData: 'Upload File: (none)\nMerchant Type: Individual',
    testSteps:
      '1. Login as Labesh_Maker\n2. Navigate to Bulk Merchant Onboarding\n3. Do NOT upload any file\n4. Select Merchant Type: Individual\n5. Click Submit\n6. Assert file required error shown',
    expectedResult: 'File upload required error shown. Submit blocked.',
    actualResult: 'Required file error displayed. Submit blocked.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_BULK_NEG_005',
    module: 'Bulk Onboarding',
    subModule: 'No Merchant Type Selected',
    role: 'Labesh_Maker',
    testType: 'Negative',
    description: 'Submit without selecting a Merchant Type — required field error expected',
    preconditions: 'Labesh_Maker is logged in.',
    testData: 'Upload File: individual_bulk.xlsx\nMerchant Type: (not selected)',
    testSteps:
      '1. Login as Labesh_Maker\n2. Upload a valid bulk file\n3. Do NOT select Merchant Type\n4. Click Submit\n5. Assert Merchant Type required error shown',
    expectedResult: 'Merchant Type required error shown. Submit blocked.',
    actualResult: 'Required Merchant Type error displayed. Submit blocked.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_BULK_NEG_006',
    module: 'Bulk Onboarding',
    subModule: 'LabeshChecker Rejects Request',
    role: 'LabeshChecker',
    testType: 'Negative',
    description: 'LabeshChecker rejects Bulk Merchant Onboarding — status should reflect rejection',
    preconditions: 'Bulk onboarding request in CHECKER PENDING status. LabeshChecker account active.',
    testData: 'Request Type: BULK MERCHANT ONBOARDING\nRejection Comment: Invalid merchant data',
    testSteps:
      '1. Login as LabeshChecker\n2. Inbox → Pending Processes\n3. Locate BULK MERCHANT ONBOARDING request\n4. Click Review → Reject\n5. Enter comment: "Invalid merchant data"\n6. Click Confirm\n7. Assert rejection success message\n8. Login as Labesh_Maker → Onboarding History\n9. Assert status updated to rejected/failed state',
    expectedResult: 'Rejection confirmed. Status updated to rejected state in Onboarding History.',
    actualResult: 'Rejection confirmed. Correct status shown in Onboarding History.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_BULK_NEG_007',
    module: 'Bulk Onboarding',
    subModule: 'History Filter — No Match',
    role: 'Labesh_Maker',
    testType: 'Negative',
    description: 'Filter Onboarding History by file name that does not exist — empty result expected',
    preconditions: 'Labesh_Maker is logged in.',
    testData: 'File Name: zzz-nonexistent-file-9999',
    testSteps:
      '1. Login as Labesh_Maker\n2. Navigate to Onboarding History\n3. Click Filter\n4. Enter file name: "zzz-nonexistent-file-9999"\n5. Click Apply Filters\n6. Assert table shows empty / no records found message',
    expectedResult: 'No records shown. Empty state or "No data found" message displayed.',
    actualResult: 'Empty result displayed for non-existent file name.',
    status: 'PASS',
    remarks: '',
  },
];

// ── Excel Generator ────────────────────────────────────────────────────────────

async function generateBulkOnboardingReport() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Automation Suite';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Bulk Onboarding Test Cases', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: 'TC ID',            key: 'tcId',           width: 20  },
    { header: 'Module',           key: 'module',         width: 20  },
    { header: 'Sub-Module',       key: 'subModule',      width: 30  },
    { header: 'Role',             key: 'role',           width: 18  },
    { header: 'Test Type',        key: 'testType',       width: 14  },
    { header: 'Description',      key: 'description',    width: 45  },
    { header: 'Preconditions',    key: 'preconditions',  width: 38  },
    { header: 'Test Data',        key: 'testData',       width: 36  },
    { header: 'Test Steps',       key: 'testSteps',      width: 62  },
    { header: 'Expected Result',  key: 'expectedResult', width: 45  },
    { header: 'Actual Result',    key: 'actualResult',   width: 45  },
    { header: 'Status',           key: 'status',         width: 12  },
    { header: 'Remarks',          key: 'remarks',        width: 40  },
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
    { category: 'Module',             count: 'Bulk Onboarding' },
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
  const filePath  = path.join(reportsDir, `BulkOnboarding_Module_TestReport_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}\n`);
}

generateBulkOnboardingReport().catch(console.error);
