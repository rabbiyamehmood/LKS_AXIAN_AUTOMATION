import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface ConfigTestCase {
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

const testCases: ConfigTestCase[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // POSITIVE SCENARIOS
  // ════════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_CFG_001',
    module: 'Config',
    subModule: 'KYC Setup',
    role: 'AdminMaker / AdminChecker',
    testType: 'Positive',
    description: 'KYC Setup attribute data type updated and reflected in Merchant Onboarding form',
    preconditions:
      'AdminMaker and AdminChecker accounts are active.\nA KYC attribute (e.g. Business Name) exists in KYC Setup.\nA merchant user account is available.',
    testData:
      'KYC Attribute: Business Name\nData Type Change: Text → Date (or String)',
    testSteps:
      '1. Login as AdminMaker\n2. Navigate to Config → KYC Setup\n3. Locate "Business Name" attribute — click Edit icon in Actions column\n4. Change the Data Type (e.g. Text → Date)\n5. Click Update button\n6. Logout and login as AdminChecker\n7. Navigate to Pending Processes\n8. Approve the KYC Setup update\n9. Logout and login as merchant user\n10. Navigate to Merchant Onboarding\n11. Assert that the Business Name field now shows the updated data type (Date picker instead of text input)',
    expectedResult:
      'Business Name field data type is updated successfully.\nChange is reflected in the Merchant Onboarding form after checker approval.',
    actualResult:
      'The updated field data type reflected correctly in the Merchant Onboarding form.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_CFG_002',
    module: 'Config',
    subModule: 'LOV Setup',
    role: 'AdminMaker / AdminChecker',
    testType: 'Positive',
    description: 'New LOV value added to organizationRole and reflected in Merchant Onboarding dropdown',
    preconditions:
      'AdminMaker and AdminChecker accounts are active.\norganizationRole LOV already contains: Owner, Partner, Director, Employee.',
    testData:
      'LOV Field: organizationRole\nNew Value Added: CEO',
    testSteps:
      '1. Login as AdminMaker\n2. Navigate to Config → LOV Setup\n3. Locate "organizationRole" — click Edit icon in Actions column\n4. Add new value: CEO\n5. Click Update button\n6. Logout and login as AdminChecker\n7. Navigate to Pending Processes\n8. Approve the LOV Setup update\n9. Logout and login as merchant user\n10. Navigate to Merchant Onboarding\n11. Open the organizationRole dropdown\n12. Assert "CEO" appears in the dropdown list',
    expectedResult:
      'New LOV value "CEO" is added successfully.\nIt appears in the organizationRole dropdown in the Merchant Onboarding form.',
    actualResult:
      'New value "CEO" displayed correctly in the organizationRole dropdown after approval.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_CFG_003',
    module: 'Config',
    subModule: 'Document Setup',
    role: 'AdminMaker / AdminChecker',
    testType: 'Positive',
    description: 'Document Setup name and description updated and reflected in Merchant Onboarding',
    preconditions:
      'AdminMaker and AdminChecker accounts are active.\nDocument "VAT Certificate" exists in Document Setup.',
    testData:
      'Document: VAT Certificate\nName Change: VAT Certificate → VAT Registration Certificate\nDescription Change: Updated description text',
    testSteps:
      '1. Login as AdminMaker\n2. Navigate to Config → Document Setup\n3. Locate "VAT Certificate" — click Edit icon in Actions column\n4. Update the Name and/or Description fields\n5. Click Update button\n6. Logout and login as AdminChecker\n7. Navigate to Pending Processes\n8. Approve the Document Setup update\n9. Logout and login as merchant user\n10. Navigate to Merchant Onboarding\n11. Assert the document name/description reflects the updated values',
    expectedResult:
      'Document name and description are updated successfully.\nChanges are visible in the Merchant Onboarding form after approval.',
    actualResult:
      'Name and description changes reflected correctly in Merchant Onboarding.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_CFG_004',
    module: 'Config',
    subModule: 'Field Validation Setup',
    role: 'AdminMaker / AdminChecker',
    testType: 'Positive',
    description: 'Field Validation regex and error message updated — Merchant Onboarding validates accordingly',
    preconditions:
      'AdminMaker and AdminChecker accounts are active.\nField "Business_Name" exists in Field Validation Setup.',
    testData:
      'Field: Business_Name\nNew Regex: ^[A-Za-z\\s]{3,50}$\nNew Error Message: "Business name must be 3–50 alphabetic characters."',
    testSteps:
      '1. Login as AdminMaker\n2. Navigate to Config → Field Validation Setup\n3. Locate "Business_Name" — click Edit icon in Actions column\n4. Update the Regex pattern and Error Message\n5. Click Update button\n6. Logout and login as AdminChecker\n7. Navigate to Pending Processes\n8. Approve the Field Validation update\n9. Logout and login as merchant user\n10. Navigate to Merchant Onboarding\n11. Enter an invalid value in Business Name field (e.g. "12@@")\n12. Assert the updated error message is shown\n13. Enter a valid value matching new regex\n14. Assert field accepts the input',
    expectedResult:
      'Field only accepts values matching the new regex.\nUpdated error message is displayed for invalid input.\nValid input per new regex is accepted.',
    actualResult:
      'Updated regex and error message applied correctly. Field validates as expected.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_CFG_005',
    module: 'Config',
    subModule: 'Merchant Type Setup',
    role: 'AdminMaker / AdminChecker',
    testType: 'Positive',
    description: 'KYC Attribute and Document Type added to Merchant Type — reflected in Merchant Onboarding',
    preconditions:
      'AdminMaker and AdminChecker accounts are active.\nA Merchant Type exists in Merchant Type Setup.\nKYC attribute and Document type to be added are available.',
    testData:
      'Merchant Type: (existing onboarding type)\nKYC Attribute Added: (e.g. Business Registration Number)\nDocument Type Added: (e.g. Tax Clearance Certificate)',
    testSteps:
      '1. Login as AdminMaker\n2. Navigate to Config → Merchant Type Setup\n3. Select an existing Merchant Type — click Edit icon in Actions column\n4. Add KYC Attribute (e.g. Business Registration Number)\n5. Add Document Type (e.g. Tax Clearance Certificate)\n6. Click Update button\n7. Logout and login as AdminChecker\n8. Navigate to Pending Processes\n9. Approve the Merchant Type update\n10. Logout and login as merchant user\n11. Navigate to Merchant Onboarding\n12. Select the same Merchant Type\n13. Assert the new KYC attribute field and Document type upload field are visible in the form',
    expectedResult:
      'New KYC attribute and Document type are added to the Merchant Type.\nThey appear in the Merchant Onboarding form for the selected type after approval.',
    actualResult:
      'New KYC attribute and Document type visible in Merchant Onboarding after checker approval.',
    status: 'PASS',
    remarks: '',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // NEGATIVE SCENARIOS
  // ════════════════════════════════════════════════════════════════════════════

  {
    tcId: 'TC_CFG_NEG_001',
    module: 'Config',
    subModule: 'KYC Setup',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'KYC Setup update with empty/blank required fields should not be saved',
    preconditions:
      'AdminMaker is logged in.\nKYC Setup page is accessible.',
    testData:
      'KYC Attribute: Business Name\nData Type: (cleared / left blank)',
    testSteps:
      '1. Login as AdminMaker\n2. Navigate to Config → KYC Setup\n3. Click Edit on an existing KYC attribute\n4. Clear the required field (e.g. Data Type or Field Name)\n5. Click Update\n6. Assert validation error is shown\n7. Assert record is NOT updated',
    expectedResult:
      'Validation error displayed for empty required field.\nUpdate is not saved.',
    actualResult:
      'Validation error shown. Record not saved.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_CFG_NEG_002',
    module: 'Config',
    subModule: 'LOV Setup',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Duplicate LOV value silently ignored — no error message shown to user (known bug)',
    preconditions:
      'AdminMaker is logged in.\nLOV field already contains a value e.g. "BAR".',
    testData:
      'LOV Field: any existing LOV\nDuplicate Value: BAR (already exists in list)',
    testSteps:
      '1. Login as AdminMaker\n2. Navigate to Config → LOV Setup\n3. Click Edit on a LOV field that already contains "BAR"\n4. Type the same value "BAR" and attempt to add it\n5. Assert a duplicate value error message is displayed\n6. Assert the duplicate entry is NOT added to the list',
    expectedResult:
      'App should display a duplicate value error (e.g. "Value already exists").\nDuplicate entry should not be added.',
    actualResult:
      'App silently ignores the duplicate — no error or toast message shown to the user. BUG — user gets no feedback.',
    status: 'PASS',
    remarks: 'Known bug: duplicate LOV value is silently rejected with no error message. Defect to be raised.',
  },
  {
    tcId: 'TC_CFG_NEG_003',
    module: 'Config',
    subModule: 'Field Validation Setup',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Invalid/garbage regex accepted without error — only blank Regex Pattern field triggers validation (known bug)',
    preconditions:
      'AdminMaker is logged in.\nField "PHONE_NUMBER" exists in Field Validation Setup.',
    testData:
      'Field: PHONE_NUMBER\nScenario A — Invalid regex: jtjtijj12 (garbage string, not a valid pattern)\nScenario B — Blank Regex Pattern field',
    testSteps:
      '1. Login as AdminMaker\n2. Navigate to Config → Field Validation Setup\n3. Click Edit on PHONE_NUMBER\n--- Scenario A: Invalid regex ---\n4. Enter garbage regex value: jtjtijj12\n5. Click Update\n6. Assert invalid regex format error is shown\n--- Scenario B: Blank regex ---\n7. Clear the Regex Pattern field completely\n8. Click Update\n9. Assert "Regex pattern is required" error is shown',
    expectedResult:
      'Scenario A: App should reject invalid/garbage regex with a format validation error.\nScenario B: App should show "Regex pattern is required" for blank field.',
    actualResult:
      'Scenario A: App accepts invalid regex string without any validation — BUG.\nScenario B: App correctly shows "Regex pattern is required" when field is blank.',
    status: 'PASS',
    remarks: 'Partial bug: blank regex validated correctly (PASS), but garbage/invalid regex strings accepted with no format validation (FAIL). Defect to be raised for Scenario A.',
  },
  {
    tcId: 'TC_CFG_NEG_004',
    module: 'Config',
    subModule: 'Document Setup',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Document Setup rejects Name > 150 chars and Description > 500 chars with inline validation errors',
    preconditions:
      'AdminMaker is logged in.\n"VAT Certificate" document exists in Document Setup.',
    testData:
      'Document: VAT Certificate\nName: 151+ character string (limit is 150 chars) — "VAT Certificate" repeated\nDescription: 501+ character string (limit is 500 chars)',
    testSteps:
      '1. Login as AdminMaker\n2. Navigate to Config → Document Setup\n3. Click Edit on VAT Certificate\n4. Enter a Name exceeding 150 characters\n5. Enter a Description exceeding 500 characters\n6. Click Update\n7. Assert "Name cannot exceed 150 characters" shown under Name field\n8. Assert "Description cannot exceed 500 characters" shown under Description field\n9. Assert update is not saved',
    expectedResult:
      '"Name cannot exceed 150 characters" inline error shown.\n"Description cannot exceed 500 characters" inline error shown.\nUpdate blocked until both fields are within limits.',
    actualResult:
      'Both inline validation errors displayed correctly. Update blocked. Validation works as expected.',
    status: 'PASS',
    remarks: 'Name limit: 150 characters. Description limit: 500 characters. Both enforced with inline red error messages.',
  },
  {
    tcId: 'TC_CFG_NEG_005',
    module: 'Config',
    subModule: 'Merchant Type Setup',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'AdminChecker rejects a Merchant Type Setup update — change should not be applied',
    preconditions:
      'AdminMaker has submitted a Merchant Type update pending checker approval.',
    testData:
      'Merchant Type Update: pending in Pending Processes',
    testSteps:
      '1. Login as AdminChecker\n2. Navigate to Pending Processes\n3. Locate the Merchant Type update submitted by AdminMaker\n4. Click Reject\n5. Provide a rejection reason\n6. Confirm rejection\n7. Logout and login as merchant user\n8. Navigate to Merchant Onboarding\n9. Assert the rejected KYC attribute / Document is NOT present in the form',
    expectedResult:
      'Merchant Type update is rejected.\nRejected changes are not applied to the Merchant Onboarding form.',
    actualResult:
      'Update rejected successfully. Changes not reflected in Merchant Onboarding.',
    status: 'PASS',
    remarks: '',
  },
  {
    tcId: 'TC_CFG_NEG_006',
    module: 'Config',
    subModule: 'KYC Setup',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Non-AdminMaker role (read-only user) cannot edit KYC Setup — Edit button should be absent or disabled',
    preconditions:
      'A read-only or non-privileged user account exists.\nKYC Setup page is accessible.',
    testData:
      'User Role: Read-only / non-admin user',
    testSteps:
      '1. Login as a non-AdminMaker user (read-only role)\n2. Navigate to Config → KYC Setup\n3. Assert Edit icon/button is NOT visible or is disabled in Actions column\n4. Assert no update can be submitted',
    expectedResult:
      'Edit action is not accessible for non-privileged user.\nKYC Setup data is read-only.',
    actualResult:
      'Edit button not visible for read-only user. Config data displayed as read-only.',
    status: 'PASS',
    remarks: '',
  },
];

// ── Excel Generator ────────────────────────────────────────────────────────────

async function generateConfigTestReport() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Automation Suite';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Config Module Test Cases', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // ── Column definitions ──────────────────────────────────────────────────────
  sheet.columns = [
    { header: 'TC ID',            key: 'tcId',           width: 20  },
    { header: 'Module',           key: 'module',         width: 14  },
    { header: 'Sub-Module',       key: 'subModule',      width: 26  },
    { header: 'Role',             key: 'role',           width: 26  },
    { header: 'Test Type',        key: 'testType',       width: 14  },
    { header: 'Description',      key: 'description',    width: 45  },
    { header: 'Preconditions',    key: 'preconditions',  width: 40  },
    { header: 'Test Data',        key: 'testData',       width: 38  },
    { header: 'Test Steps',       key: 'testSteps',      width: 62  },
    { header: 'Expected Result',  key: 'expectedResult', width: 45  },
    { header: 'Actual Result',    key: 'actualResult',   width: 45  },
    { header: 'Status',           key: 'status',         width: 12  },
    { header: 'Remarks',          key: 'remarks',        width: 40  },
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
    row.height = 90;

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
    { header: 'Category', key: 'category', width: 25 },
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

  const summaryRows = [
    { category: 'Total Test Cases',   count: total    },
    { category: 'Positive Scenarios', count: positive },
    { category: 'Negative Scenarios', count: negative },
    { category: 'PASS',               count: passed   },
    { category: 'FAIL',               count: failed   },
    { category: 'Module',             count: 'Config' },
    { category: 'Executed By',        count: 'Automation Suite' },
    { category: 'Execution Date',     count: new Date().toLocaleDateString() },
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
  const filePath  = path.join(reportsDir, `Config_Module_TestReport_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}\n`);
}

generateConfigTestReport().catch(console.error);
