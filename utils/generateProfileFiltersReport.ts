import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

type TestType = 'Positive' | 'Negative';
type Status = 'PASS' | 'FAIL' | 'N/A';

interface FilterTC {
  tcId: string;
  module: string;
  feature: string;
  filterField: string;
  testType: TestType;
  description: string;
  preconditions: string;
  testData: string;
  testSteps: string;
  expectedResult: string;
  status: Status;
}

const testCases: FilterTC[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // LIMIT PROFILE FILTERS
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_LIMIT_FILTER_001',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    filterField: 'Profile Name',
    testType: 'Positive',
    description: 'Filter by Profile Name returns matching limit profiles',
    preconditions: 'Maker is logged in. At least one profile with name containing "auto" exists.',
    testData: 'Profile Name: auto',
    testSteps: '1. Login as Maker\n2. Go to Merchant Onboarding > Limit Profile List\n3. Click Filter to open filter panel\n4. Enter "auto" in Profile Name field\n5. Click Apply Filters\n6. Assert table is visible\n7. Click Reset',
    expectedResult: 'Table shows only profiles whose name matches "auto". Reset restores full list.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LIMIT_FILTER_002',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    filterField: 'Status',
    testType: 'Positive',
    description: 'Filter by Status "Active" returns only active limit profiles',
    preconditions: 'Maker is logged in. Active profiles exist.',
    testData: 'Status: Active',
    testSteps: '1. Login as Maker\n2. Go to Limit Profile List\n3. Click Filter\n4. Select Status: Active from dropdown\n5. Click Apply Filters\n6. Assert table visible and ACTIVE cell visible\n7. Click Reset',
    expectedResult: 'Table shows only ACTIVE profiles.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LIMIT_FILTER_003',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    filterField: 'Quick Select - Today',
    testType: 'Positive',
    description: 'Quick select "Today" filters profiles created today',
    preconditions: 'Maker is logged in.',
    testData: 'Quick Select: Today',
    testSteps: '1. Login as Maker\n2. Go to Limit Profile List\n3. Click Filter\n4. Click "Today" quick select button\n5. Assert table or "No data found" is visible\n6. Click Reset',
    expectedResult: 'Table shows profiles created today or "No data found" if none exist.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LIMIT_FILTER_004',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    filterField: 'Quick Select - Last 7 days',
    testType: 'Positive',
    description: 'Quick select "Last 7 days" filters profiles in last 7 days',
    preconditions: 'Maker is logged in.',
    testData: 'Quick Select: Last 7 days',
    testSteps: '1. Login as Maker\n2. Go to Limit Profile List\n3. Click Filter\n4. Click "Last 7 days" quick select\n5. Assert table or No data visible\n6. Click Reset',
    expectedResult: 'Filter returns profiles from the last 7 days.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LIMIT_FILTER_005',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    filterField: 'Quick Select - This month',
    testType: 'Positive',
    description: 'Quick select "This month" filters profiles created this month',
    preconditions: 'Maker is logged in.',
    testData: 'Quick Select: This month',
    testSteps: '1. Login as Maker\n2. Go to Limit Profile List\n3. Click Filter\n4. Click "This month" quick select\n5. Assert table or No data visible\n6. Click Reset',
    expectedResult: 'Filter returns profiles from the current calendar month.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LIMIT_FILTER_006',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    filterField: 'Reset',
    testType: 'Positive',
    description: 'Reset clears all applied filter values and restores full list',
    preconditions: 'Maker is logged in.',
    testData: 'Profile Name: auto (applied first)',
    testSteps: '1. Login as Maker\n2. Go to Limit Profile List\n3. Click Filter\n4. Enter "auto" in Profile Name\n5. Click Apply Filters\n6. Click Reset\n7. Assert Profile Name input is empty\n8. Assert table is visible',
    expectedResult: 'Filter fields are cleared and the full profile list is shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LIMIT_FILTER_NEG_001',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    filterField: 'Profile Name (non-existent)',
    testType: 'Negative',
    description: 'Filtering by a non-existent profile name shows "No data found"',
    preconditions: 'Maker is logged in.',
    testData: 'Profile Name: zzz_nonexistent_profile_xyz_999',
    testSteps: '1. Login as Maker\n2. Go to Limit Profile List\n3. Click Filter\n4. Enter "zzz_nonexistent_profile_xyz_999" in Profile Name\n5. Click Apply Filters\n6. Assert "No data found" message is visible\n7. Click Reset',
    expectedResult: '"No data found" message is displayed.',
    status: 'PASS',
  },
  {
    tcId: 'TC_LIMIT_FILTER_NEG_002',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    filterField: 'Date Range (From > To)',
    testType: 'Negative',
    description: 'Setting From Date later than To Date shows a validation error',
    preconditions: 'Maker is logged in.',
    testData: 'From Date: 31/05/2026, To Date: 08/05/2026 (From > To)',
    testSteps: '1. Login as Maker\n2. Go to Limit Profile List\n3. Click Filter\n4. Enter From Date: 31/05/2026\n5. Enter To Date: 08/05/2026\n6. Click Apply Filters\n7. Assert date validation error is visible\n8. Click Reset',
    expectedResult: 'Validation error shown. Filter is not applied.',
    status: 'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MDR PROFILE FILTERS
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_MDR_FILTER_001',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    filterField: 'Profile Name',
    testType: 'Positive',
    description: 'Filter by Profile Name returns matching MDR profiles',
    preconditions: 'Maker is logged in. MDR profile with name containing "auto" exists.',
    testData: 'Profile Name: auto',
    testSteps: '1. Login as Maker\n2. Go to Merchant Onboarding > MDR Profile List\n3. Click Filter\n4. Enter "auto" in Profile Name\n5. Click Apply Filters\n6. Assert table visible\n7. Click Reset',
    expectedResult: 'Matching MDR profiles shown. Reset restores full list.',
    status: 'PASS',
  },
  {
    tcId: 'TC_MDR_FILTER_002',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    filterField: 'Status',
    testType: 'Positive',
    description: 'Filter by Status "Active" returns only active MDR profiles',
    preconditions: 'Maker is logged in. Active MDR profiles exist.',
    testData: 'Status: Active',
    testSteps: '1. Login as Maker\n2. Go to MDR Profile List\n3. Click Filter\n4. Select Status: Active\n5. Click Apply Filters\n6. Assert ACTIVE cell visible\n7. Click Reset',
    expectedResult: 'Only ACTIVE MDR profiles are shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_MDR_FILTER_003',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    filterField: 'Quick Select - Today',
    testType: 'Positive',
    description: 'Quick select "Today" filters MDR profiles created today',
    preconditions: 'Maker is logged in.',
    testData: 'Quick Select: Today',
    testSteps: '1. Login as Maker\n2. Go to MDR Profile List\n3. Click Filter\n4. Click "Today" quick select\n5. Assert table or No data visible\n6. Click Reset',
    expectedResult: 'Profiles created today are shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_MDR_FILTER_004',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    filterField: 'Quick Select - Last 7 days',
    testType: 'Positive',
    description: 'Quick select "Last 7 days" filters MDR profiles in last 7 days',
    preconditions: 'Maker is logged in.',
    testData: 'Quick Select: Last 7 days',
    testSteps: '1. Login as Maker\n2. Go to MDR Profile List\n3. Click Filter\n4. Click "Last 7 days"\n5. Assert table or No data visible\n6. Click Reset',
    expectedResult: 'Profiles from the last 7 days are shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_MDR_FILTER_005',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    filterField: 'Quick Select - Last 30 days',
    testType: 'Positive',
    description: 'Quick select "Last 30 days" filters MDR profiles in last 30 days',
    preconditions: 'Maker is logged in.',
    testData: 'Quick Select: Last 30 days',
    testSteps: '1. Login as Maker\n2. Go to MDR Profile List\n3. Click Filter\n4. Click "Last 30 days"\n5. Assert table or No data visible\n6. Click Reset',
    expectedResult: 'Profiles from the last 30 days are shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_MDR_FILTER_006',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    filterField: 'Reset',
    testType: 'Positive',
    description: 'Reset clears MDR filter inputs and restores list',
    preconditions: 'Maker is logged in.',
    testData: 'Profile Name: auto (applied first)',
    testSteps: '1. Login as Maker\n2. Go to MDR Profile List\n3. Click Filter\n4. Enter "auto" in Profile Name\n5. Click Apply Filters\n6. Click Reset\n7. Assert Profile Name is empty\n8. Assert table visible',
    expectedResult: 'Filter cleared. Full MDR profile list restored.',
    status: 'PASS',
  },
  {
    tcId: 'TC_MDR_FILTER_NEG_001',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    filterField: 'Profile Name (non-existent)',
    testType: 'Negative',
    description: 'Non-existent MDR profile name shows "No data found"',
    preconditions: 'Maker is logged in.',
    testData: 'Profile Name: zzz_nonexistent_mdr_xyz_999',
    testSteps: '1. Login as Maker\n2. Go to MDR Profile List\n3. Click Filter\n4. Enter "zzz_nonexistent_mdr_xyz_999"\n5. Click Apply Filters\n6. Assert "No data found" visible\n7. Click Reset',
    expectedResult: '"No data found" message is displayed.',
    status: 'PASS',
  },
  {
    tcId: 'TC_MDR_FILTER_NEG_002',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    filterField: 'Date Range (From > To)',
    testType: 'Negative',
    description: 'From Date later than To Date shows validation error for MDR filters',
    preconditions: 'Maker is logged in.',
    testData: 'From Date: 31/05/2026, To Date: 08/05/2026',
    testSteps: '1. Login as Maker\n2. Go to MDR Profile List\n3. Click Filter\n4. Enter From Date: 31/05/2026\n5. Enter To Date: 08/05/2026\n6. Click Apply Filters\n7. Assert date validation error visible\n8. Click Reset',
    expectedResult: 'Validation error shown. Filter not applied.',
    status: 'PASS',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TAX PROFILE FILTERS
  // ══════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_TAX_FILTER_001',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Profile Name',
    testType: 'Positive',
    description: 'Filter by Profile Name returns matching Tax profiles',
    preconditions: 'Maker is logged in. Tax profile with name containing "Auto" exists.',
    testData: 'Profile Name: Auto',
    testSteps: '1. Login as Maker\n2. Go to Merchant Onboarding > Tax Profile List\n3. Click Filter\n4. Enter "Auto" in Profile Name\n5. Click Apply Filters\n6. Assert table visible\n7. Click Reset',
    expectedResult: 'Matching Tax profiles shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_TAX_FILTER_002',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Region',
    testType: 'Positive',
    description: 'Filter by Region "Arusha" returns Tax profiles in that region',
    preconditions: 'Maker is logged in. Tax profiles with region Arusha exist.',
    testData: 'Region: Arusha',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List\n3. Click Filter\n4. Enter "Arusha" in Region field\n5. Click Apply Filters\n6. Assert Arusha cell visible in table\n7. Click Reset',
    expectedResult: 'Only profiles in the Arusha region are shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_TAX_FILTER_003',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Status',
    testType: 'Positive',
    description: 'Filter by Status "Active" returns only active Tax profiles',
    preconditions: 'Maker is logged in. Active Tax profiles exist.',
    testData: 'Status: Active',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List\n3. Click Filter\n4. Select Status: Active\n5. Click Apply Filters\n6. Assert ACTIVE cell visible\n7. Click Reset',
    expectedResult: 'Only ACTIVE Tax profiles are shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_TAX_FILTER_004',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Quick Select - Today',
    testType: 'Positive',
    description: 'Quick select "Today" filters Tax profiles created today',
    preconditions: 'Maker is logged in.',
    testData: 'Quick Select: Today',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List\n3. Click Filter\n4. Click "Today"\n5. Assert table or No data visible\n6. Click Reset',
    expectedResult: 'Profiles created today are shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_TAX_FILTER_005',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Quick Select - This month',
    testType: 'Positive',
    description: 'Quick select "This month" filters Tax profiles for current month',
    preconditions: 'Maker is logged in.',
    testData: 'Quick Select: This month',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List\n3. Click Filter\n4. Click "This month"\n5. Assert table or No data visible\n6. Click Reset',
    expectedResult: 'Profiles from current month are shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_TAX_FILTER_006',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Quick Select - Last 30 days',
    testType: 'Positive',
    description: 'Quick select "Last 30 days" filters Tax profiles in last 30 days',
    preconditions: 'Maker is logged in.',
    testData: 'Quick Select: Last 30 days',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List\n3. Click Filter\n4. Click "Last 30 days"\n5. Assert table or No data visible\n6. Click Reset',
    expectedResult: 'Profiles from the last 30 days are shown.',
    status: 'PASS',
  },
  {
    tcId: 'TC_TAX_FILTER_007',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Reset (Name + Region)',
    testType: 'Positive',
    description: 'Reset clears all Tax filter inputs including Name and Region',
    preconditions: 'Maker is logged in.',
    testData: 'Profile Name: Auto, Region: Arusha (applied first)',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List\n3. Click Filter\n4. Enter "Auto" in Profile Name and "Arusha" in Region\n5. Click Apply Filters\n6. Click Reset\n7. Assert Profile Name and Region inputs are empty\n8. Assert table visible',
    expectedResult: 'All filter fields cleared. Full Tax profile list restored.',
    status: 'PASS',
  },
  {
    tcId: 'TC_TAX_FILTER_NEG_001',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Profile Name (non-existent)',
    testType: 'Negative',
    description: 'Non-existent Tax profile name shows "No data found"',
    preconditions: 'Maker is logged in.',
    testData: 'Profile Name: zzz_nonexistent_tax_xyz_999',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List\n3. Click Filter\n4. Enter "zzz_nonexistent_tax_xyz_999"\n5. Click Apply Filters\n6. Assert "No data found" visible\n7. Click Reset',
    expectedResult: '"No data found" message is displayed.',
    status: 'PASS',
  },
  {
    tcId: 'TC_TAX_FILTER_NEG_002',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Region (non-existent)',
    testType: 'Negative',
    description: 'Non-existent region shows "No data found"',
    preconditions: 'Maker is logged in.',
    testData: 'Region: zzz_nonexistent_region_999',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List\n3. Click Filter\n4. Enter "zzz_nonexistent_region_999" in Region\n5. Click Apply Filters\n6. Assert "No data found" visible\n7. Click Reset',
    expectedResult: '"No data found" message is displayed.',
    status: 'PASS',
  },
  {
    tcId: 'TC_TAX_FILTER_NEG_003',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    filterField: 'Date Range (From > To)',
    testType: 'Negative',
    description: 'From Date later than To Date shows validation error for Tax filters',
    preconditions: 'Maker is logged in.',
    testData: 'From Date: 31/05/2026, To Date: 08/05/2026',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List\n3. Click Filter\n4. Enter From Date: 31/05/2026\n5. Enter To Date: 08/05/2026\n6. Click Apply Filters\n7. Assert date validation error visible\n8. Click Reset',
    expectedResult: 'Validation error shown. Filter not applied.',
    status: 'PASS',
  },
];

async function generateFiltersReport() {
  const workbook = new ExcelJS.Workbook();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const ws = workbook.addWorksheet('Test Cases');
  ws.columns = [
    { header: 'TC ID',           key: 'tcId',           width: 22 },
    { header: 'Module',          key: 'module',         width: 22 },
    { header: 'Feature',         key: 'feature',        width: 18 },
    { header: 'Filter Field',    key: 'filterField',    width: 28 },
    { header: 'Test Type',       key: 'testType',       width: 12 },
    { header: 'Description',     key: 'description',    width: 52 },
    { header: 'Preconditions',   key: 'preconditions',  width: 40 },
    { header: 'Test Data',       key: 'testData',       width: 40 },
    { header: 'Test Steps',      key: 'testSteps',      width: 68 },
    { header: 'Expected Result', key: 'expectedResult', width: 52 },
    { header: 'Status',          key: 'status',         width: 10 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  testCases.forEach((tc, index) => {
    const row = ws.addRow(tc);
    row.height = 85;
    const bg = index % 2 === 0 ? 'FFF4F7FB' : 'FFFFFFFF';

    row.eachCell((cell, col) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border    = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

      if (col === 5) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = tc.testType === 'Positive'
          ? { bold: true, color: { argb: 'FF008A1E' } }
          : { bold: true, color: { argb: 'FFB00020' } };
      }

      if (col === 11) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (tc.status === 'PASS') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        } else if (tc.status === 'FAIL') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7A8796' } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        }
      }
    });
  });

  const summary = workbook.addWorksheet('Summary');
  const positive = testCases.filter((t) => t.testType === 'Positive').length;
  const negative = testCases.filter((t) => t.testType === 'Negative').length;
  const limitCases = testCases.filter((t) => t.feature === 'Limit Profile').length;
  const mdrCases = testCases.filter((t) => t.feature === 'MDR Profile').length;
  const taxCases = testCases.filter((t) => t.feature === 'Tax Profile').length;

  const rows = [
    ['Module',                'Merchant Onboarding - Profile Filters'],
    ['Sub-modules',           'Limit Profile | MDR Profile | Tax Profile'],
    ['Generated On',          new Date().toLocaleString()],
    ['Total Test Cases',      testCases.length],
    ['Positive Cases',        positive],
    ['Negative Cases',        negative],
    ['', ''],
    ['Limit Profile Cases',   limitCases],
    ['MDR Profile Cases',     mdrCases],
    ['Tax Profile Cases',     taxCases],
    ['', ''],
    ['PASS',                  testCases.filter((t) => t.status === 'PASS').length],
    ['FAIL',                  testCases.filter((t) => t.status === 'FAIL').length],
    ['N/A (not yet run)',     testCases.filter((t) => t.status === 'N/A').length],
  ];

  rows.forEach((item) => {
    const row = summary.addRow(item);
    row.getCell(1).font = { bold: true };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EFF7' } };
    [1, 2].forEach((c) => {
      row.getCell(c).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  });

  summary.getColumn(1).width = 26;
  summary.getColumn(2).width = 58;

  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const reportFile = path.join(reportsDir, `MerchantOnboarding_ProfileFilters_TestCases_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(reportFile);
  console.log(`Report saved: ${reportFile}`);
}

generateFiltersReport().catch((err) => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
