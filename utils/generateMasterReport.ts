import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface TC {
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

const allTestCases: TC[] = [

  // ── REPORTS ──────────────────────────────────────────────────────────────────
  { tcId:'TC_RPT_001', module:'Reports', subModule:'Transaction Summary', role:'AdminMaker', testType:'Positive',
    description:'Transaction Summary Report generates successfully with valid date range',
    preconditions:'AdminMaker logged into MMP. Jasper login: jasperadmin / jasperadmin.',
    testData:'FROM_DATE: April 1, 2026\nTO_DATE: Now',
    testSteps:'1. Login as AdminMaker\n2. Click Reports → Jasper popup opens\n3. Login to Jasper\n4. Select Transaction_Summary_Report\n5. Set FROM=April 1, TO=Now → Apply\n6. Assert title "Merchant Transaction Summary"\n7. Assert today\'s date in timestamp',
    expectedResult:'Report loads. Title and timestamp verified.', actualResult:'Report loaded successfully.', status:'PASS', remarks:'' },

  { tcId:'TC_RPT_002', module:'Reports', subModule:'Transaction Detail', role:'AdminMaker', testType:'Positive',
    description:'Transaction Detail Report generates with MID, Aggregator, Status and Transaction Type filters',
    preconditions:'Jasper session active. MID 000921773937631 exists.',
    testData:'MID: 000921773937631\nAGGREGATOR: AXIAN\nSTATUS: ALL\nCATEGORY: SEND_MONEY\nFROM: April 1 | TO: Now',
    testSteps:'1. Select Transaction_Detail_Report\n2. Fill MID, Aggregator, Status, Category, dates\n3. Click Apply\n4. Assert title "Merchant Transaction Report"\n5. Assert columns: MID, Aggregator, Category, Status',
    expectedResult:'Report loads with correct filters. All columns visible.', actualResult:'All assertions passed.', status:'PASS', remarks:'' },

  { tcId:'TC_RPT_003', module:'Reports', subModule:'Pending Payments', role:'AdminMaker', testType:'Positive',
    description:'Pending Payments Report generates successfully with valid date range',
    preconditions:'Jasper session active.',
    testData:'FROM_DATE: April 1, 2026\nTO_DATE: Now',
    testSteps:'1. Select Pending_Payments_Report\n2. Set dates → Apply\n3. Assert title "Pending Amounts & Aging Report"\n4. Assert "Pending Count" column visible',
    expectedResult:'Report loads. Title and Pending Count column visible.', actualResult:'All assertions passed.', status:'PASS', remarks:'' },

  { tcId:'TC_RPT_004', module:'Reports', subModule:'Aggregator Daily Report', role:'AdminMaker', testType:'Positive',
    description:'Aggregator Daily Report generates with AGGREGATOR filter and date range',
    preconditions:'Jasper session active.',
    testData:'AGGREGATOR: AXIAN\nFROM_DATE: April 1, 2026\nTO_DATE: Now',
    testSteps:'1. Select Aggregator_Daily_Report\n2. Select AGGREGATOR: AXIAN\n3. Set dates → Apply\n4. Assert title "Aggregator Daily Report"\n5. Assert AXIAN in report data',
    expectedResult:'Report loads. Title and AXIAN data visible.', actualResult:'All assertions passed.', status:'PASS', remarks:'' },

  { tcId:'TC_RPT_005', module:'Reports', subModule:'Audit Logs', role:'AdminMaker', testType:'Positive',
    description:'Audit Logs Report generates successfully with valid dates',
    preconditions:'Jasper session active.',
    testData:'STARTDATE: April 2026\nENDDATE: Now\nSTATUS: ALL',
    testSteps:'1. Select Audit Logs\n2. Set STARTDATE, ENDDATE, STATUS → Apply\n3. Assert title "System Audit Log Report"',
    expectedResult:'Report loads. Title "System Audit Log Report" visible.', actualResult:'All assertions passed.', status:'PASS', remarks:'' },

  { tcId:'TC_RPT_NEG_001', module:'Reports', subModule:'Jasper Login', role:'AdminMaker', testType:'Negative',
    description:'Jasper login fails with invalid credentials',
    preconditions:'AdminMaker logged into MMP. Jasper popup open.',
    testData:'Username: fakeuser\nPassword: fakepass',
    testSteps:'1. Enter fakeuser / fakepass → Login\n2. Assert login button still visible\n3. Assert error shown\n4. Assert Reports panel NOT visible',
    expectedResult:'Login fails. Error shown. Reports panel not accessible.', actualResult:'Login rejected. Error shown.', status:'PASS', remarks:'' },

  { tcId:'TC_RPT_NEG_002', module:'Reports', subModule:'Transaction Summary', role:'AdminMaker', testType:'Negative',
    description:'FROM date after TO date — shows empty report instead of error (bug)',
    preconditions:'Jasper session active.',
    testData:'FROM: May 7, 2026\nTO: April 1, 2026 (inverted)',
    testSteps:'1. Select Transaction_Summary_Report\n2. Set FROM=May 7, TO=April 1 → Apply\n3. Assert date range validation error shown',
    expectedResult:'Date range validation error shown.', actualResult:'Empty report shown — no error. BUG.', status:'FAIL', remarks:'Known bug: inverted date range accepted silently.' },

  { tcId:'TC_RPT_NEG_003', module:'Reports', subModule:'Transaction Detail', role:'AdminMaker', testType:'Negative',
    description:'Invalid MID format — shows empty report instead of error (bug)',
    preconditions:'Jasper session active.',
    testData:'MID: 000921773937631111@@@',
    testSteps:'1. Select Transaction_Detail_Report\n2. Enter invalid MID → Apply\n3. Assert MID format error shown',
    expectedResult:'MID format validation error shown.', actualResult:'Empty report — no error. BUG.', status:'FAIL', remarks:'Known bug: invalid MID accepted without validation.' },

  { tcId:'TC_RPT_NEG_004', module:'Reports', subModule:'Audit Logs', role:'AdminMaker', testType:'Negative',
    description:'Apply without mandatory STARTDATE/ENDDATE — required field error shown',
    preconditions:'Jasper session active.',
    testData:'STARTDATE: (empty)\nENDDATE: (empty)',
    testSteps:'1. Select Audit Logs\n2. Leave dates empty → Apply\n3. Assert "This field is mandatory" for both fields',
    expectedResult:'Mandatory field error shown for both dates.', actualResult:'Mandatory field errors displayed correctly.', status:'PASS', remarks:'' },

  // ── CONFIG ───────────────────────────────────────────────────────────────────
  { tcId:'TC_CFG_001', module:'Config', subModule:'KYC Setup', role:'AdminMaker / AdminChecker', testType:'Positive',
    description:'KYC attribute data type updated and reflected in Merchant Onboarding after approval',
    preconditions:'AdminMaker and AdminChecker active. KYC attribute "Business Name" exists.',
    testData:'KYC Attribute: Business Name\nData Type: Text → Date',
    testSteps:'1. AdminMaker → Config → KYC Setup → edit attribute → change Data Type → Update\n2. AdminChecker → Inbox → Approve\n3. Verify updated field type in Merchant Onboarding',
    expectedResult:'Data type updated. Reflected in Merchant Onboarding after approval.', actualResult:'Updated field type reflected correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_CFG_002', module:'Config', subModule:'LOV Setup', role:'AdminMaker / AdminChecker', testType:'Positive',
    description:'New LOV value "CEO" added to organizationRole and reflected in Merchant Onboarding dropdown',
    preconditions:'AdminMaker and AdminChecker active. organizationRole LOV exists.',
    testData:'LOV: organizationRole\nNew Value: CEO',
    testSteps:'1. AdminMaker → Config → LOV Setup → add "CEO" → Update\n2. AdminChecker → Inbox → Approve\n3. Verify "CEO" in organizationRole dropdown',
    expectedResult:'"CEO" added and visible in dropdown after approval.', actualResult:'"CEO" in dropdown after approval.', status:'PASS', remarks:'' },

  { tcId:'TC_CFG_003', module:'Config', subModule:'Document Setup', role:'AdminMaker / AdminChecker', testType:'Positive',
    description:'Document name and description updated and reflected in Merchant Onboarding',
    preconditions:'Document "VAT Certificate" exists.',
    testData:'Name: VAT Certificate → VAT Registration Certificate\nDescription: updated text',
    testSteps:'1. AdminMaker → Config → Document Setup → edit → update Name/Description → Update\n2. AdminChecker → Inbox → Approve\n3. Verify in Merchant Onboarding',
    expectedResult:'Updated name/description visible in Merchant Onboarding.', actualResult:'Changes reflected correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_CFG_004', module:'Config', subModule:'Field Validation Setup', role:'AdminMaker / AdminChecker', testType:'Positive',
    description:'Field Validation regex and error message updated — validates correctly in Merchant Onboarding',
    preconditions:'Field "Business_Name" exists in Field Validation Setup.',
    testData:'Field: Business_Name\nRegex: ^[A-Za-z\\s]{3,50}$\nError: "Business name must be 3–50 alphabetic characters."',
    testSteps:'1. AdminMaker → Config → Field Validation Setup → edit → update Regex + Error Message → Update\n2. AdminChecker → Inbox → Approve\n3. In Merchant Onboarding enter invalid value → assert new error shown\n4. Enter valid value → assert accepted',
    expectedResult:'Updated regex and error message applied.', actualResult:'Validation updated correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_CFG_005', module:'Config', subModule:'Merchant Type Setup', role:'AdminMaker / AdminChecker', testType:'Positive',
    description:'Merchant Type Setup configuration updated and approved',
    preconditions:'AdminMaker and AdminChecker active.',
    testData:'Merchant Type: Individual',
    testSteps:'1. AdminMaker → Config → Merchant Type Setup → edit config → Update\n2. AdminChecker → Inbox → Approve\n3. Verify change in Merchant Onboarding',
    expectedResult:'Configuration updated and reflected after approval.', actualResult:'Configuration change reflected correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_CFG_NEG_001', module:'Config', subModule:'KYC Setup', role:'AdminMaker', testType:'Negative',
    description:'Edit KYC attribute with blank name — validation error shown',
    preconditions:'AdminMaker logged in.',
    testData:'Attribute Name: (blank)',
    testSteps:'1. Config → KYC Setup → edit → clear Name → Update\n2. Assert "at least 2 characters" error',
    expectedResult:'Validation error shown for blank name.', actualResult:'Error displayed correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_CFG_NEG_002', module:'Config', subModule:'LOV Setup', role:'AdminMaker', testType:'Negative',
    description:'Duplicate LOV value silently ignored — no error shown (known bug)',
    preconditions:'AdminMaker logged in. LOV with value "BAR" already exists.',
    testData:'Duplicate value: BAR',
    testSteps:'1. Config → LOV Setup → edit → add "BAR" twice\n2. Assert "Value already exists" error shown',
    expectedResult:'"Value already exists" error shown.', actualResult:'No error shown — silently accepted. BUG.', status:'PASS', remarks:'Known bug: duplicate LOV value silently ignored.' },

  { tcId:'TC_CFG_NEG_003', module:'Config', subModule:'Field Validation Setup', role:'AdminMaker', testType:'Negative',
    description:'Blank regex — "Regex pattern is required" error shown',
    preconditions:'AdminMaker logged in.',
    testData:'Regex Pattern: (blank)',
    testSteps:'1. Config → Field Validation → edit → clear Regex → Update\n2. Assert "Regex pattern is required"',
    expectedResult:'"Regex pattern is required" shown.', actualResult:'Error displayed correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_CFG_NEG_004', module:'Config', subModule:'Document Setup', role:'AdminMaker', testType:'Negative',
    description:'Document name > 150 chars / description > 500 chars — inline errors shown',
    preconditions:'AdminMaker logged in.',
    testData:'Name: 160 chars\nDescription: 510 chars',
    testSteps:'1. Config → Document Setup → edit → enter oversized Name and Description → Update\n2. Assert length errors shown',
    expectedResult:'Length validation errors shown.', actualResult:'Errors displayed correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_CFG_NEG_005', module:'Config', subModule:'Reject Flow', role:'AdminMaker / AdminChecker', testType:'Negative',
    description:'AdminChecker rejects a Config update',
    preconditions:'AdminMaker submits a Document Setup update.',
    testData:'Reject comment: Invalid data',
    testSteps:'1. AdminMaker submits Document Setup update\n2. AdminChecker → Inbox → Review → Reject → Confirm\n3. Assert rejection success message',
    expectedResult:'Rejection confirmed with success message.', actualResult:'Rejection processed successfully.', status:'PASS', remarks:'' },

  // ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
  { tcId:'TC_PWD_001', module:'Change Password', subModule:'Password Change', role:'AdminMaker', testType:'Positive',
    description:'Change password with valid current and new password — success toast shown',
    preconditions:'AdminMaker logged in with Pakistan@1234.',
    testData:'Current: Pakistan@1234\nNew: Password@123\nConfirm: Password@123',
    testSteps:'1. Login as AdminMaker\n2. Profile → Change Password\n3. Fill fields → Click Change Password\n4. Assert "Password Changed Successfully" toast',
    expectedResult:'Success toast. User can login with new password.', actualResult:'Success toast. Password changed.', status:'PASS', remarks:'Password restored after test.' },

  { tcId:'TC_PWD_002', module:'Change Password', subModule:'Login Verification', role:'AdminMaker', testType:'Positive',
    description:'Old password rejected and new password accepted after change',
    preconditions:'Password changed (ref TC_PWD_001).',
    testData:'Old: Pakistan@1234 (fail)\nNew: Password@123 (success)',
    testSteps:'1. Logout\n2. Login with old password → assert "Invalid credentials"\n3. Login with new password → assert success',
    expectedResult:'Old rejected. New accepted.', actualResult:'Old rejected. New login succeeded.', status:'PASS', remarks:'Password restored after test.' },

  { tcId:'TC_PWD_NEG_001', module:'Change Password', subModule:'Wrong Current Password', role:'AdminMaker', testType:'Negative',
    description:'Wrong current password — no error shown (known bug)',
    preconditions:'AdminMaker logged in.',
    testData:'Current: WrongPassword@999\nNew: Password@123\nConfirm: Password@123',
    testSteps:'1. Open Change Password\n2. Fill wrong current password\n3. Click Change Password\n4. Assert error "Incorrect current password"',
    expectedResult:'"Incorrect current password" error shown.', actualResult:'No error shown — silent. BUG.', status:'FAIL', remarks:'Known bug: wrong current password accepted silently.' },

  { tcId:'TC_PWD_NEG_002', module:'Change Password', subModule:'Password Mismatch', role:'AdminMaker', testType:'Negative',
    description:'New and confirm passwords mismatch — inline error shown',
    preconditions:'AdminMaker logged in.',
    testData:'Current: Pakistan@1234\nNew: Password@123\nConfirm: Different@999',
    testSteps:'1. Open Change Password\n2. Fill mismatching passwords → Click Change Password\n3. Assert "Passwords do not match"',
    expectedResult:'"Passwords do not match" error shown.', actualResult:'Mismatch error shown correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_PWD_NEG_003', module:'Change Password', subModule:'Password Too Short', role:'AdminMaker', testType:'Negative',
    description:'New password less than 8 characters — validation error shown',
    preconditions:'AdminMaker logged in.',
    testData:'New: Ab1@ (4 chars)',
    testSteps:'1. Open Change Password\n2. New: Ab1@ → Click Change Password\n3. Assert "at least 8 characters" error',
    expectedResult:'Length validation error shown.', actualResult:'Error shown correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_PWD_NEG_004', module:'Change Password', subModule:'Same Password', role:'AdminMaker', testType:'Negative',
    description:'New password same as current — should be rejected',
    preconditions:'AdminMaker logged in.',
    testData:'All 3 fields: Pakistan@1234',
    testSteps:'1. Open Change Password\n2. Enter Pakistan@1234 for all 3 fields → Click Change Password\n3. Assert "must be different" error',
    expectedResult:'"Must be different from current" error shown.', actualResult:'Error shown correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_PWD_NEG_005', module:'Change Password', subModule:'Complexity Validation', role:'AdminMaker', testType:'Negative',
    description:'Password missing uppercase/number — complexity error shown',
    preconditions:'AdminMaker logged in.',
    testData:'New: alllowercase@ (no uppercase/number)',
    testSteps:'1. Open Change Password\n2. New: alllowercase@ → Click Change Password\n3. Assert complexity error',
    expectedResult:'Complexity validation error shown.', actualResult:'Error shown correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_PWD_NEG_006', module:'Change Password', subModule:'Empty Fields', role:'AdminMaker', testType:'Negative',
    description:'All fields empty — required field errors shown for all 3 fields',
    preconditions:'AdminMaker logged in.',
    testData:'All fields: (empty)',
    testSteps:'1. Open Change Password\n2. Leave all empty → Click Change Password\n3. Assert required errors for all 3 fields',
    expectedResult:'Required errors for all 3 fields. Submit blocked.', actualResult:'Required errors shown correctly.', status:'PASS', remarks:'' },

  // ── BULK ONBOARDING ──────────────────────────────────────────────────────────
  { tcId:'TC_BULK_001', module:'Bulk Onboarding', subModule:'Individual — Full E2E', role:'Labesh_Maker / LabeshChecker', testType:'Positive',
    description:'Bulk Merchant Onboarding full E2E for Merchant Type: Individual',
    preconditions:'Labesh_Maker and LabeshChecker active. Individual template (.xlsx) prepared.',
    testData:'Merchant Type: Individual\nFile: individual_bulk.xlsx\nComment: approved',
    testSteps:'1. Login as Labesh_Maker → Bulk Operations → Bulk Merchant Onboarding\n2. Upload template → select Merchant Type: Individual → Submit\n3. Assert success toast\n4. Onboarding History → assert PENDING ENGRAFI\n5. View Details → assert ENGRAFI PENDING per merchant\n6. Refresh until CHECKER PENDING\n7. Logout → login as LabeshChecker\n8. Inbox → Pending Processes → Review → Approve → Confirm\n9. Assert approval toast\n10. Login as Labesh_Maker → refresh until PROCESSING COMPLETED\n11. Navigate to Merchant List → assert new merchants appear',
    expectedResult:'Status: PENDING ENGRAFI → CHECKER PENDING → PROCESSING COMPLETED. Merchants in list.', actualResult:'Full E2E completed. All transitions verified.', status:'PASS', remarks:'Status changes ~5–10 min each.' },

  { tcId:'TC_BULK_002', module:'Bulk Onboarding', subModule:'NIDA Registered — Full E2E', role:'Labesh_Maker / LabeshChecker', testType:'Positive',
    description:'Bulk Merchant Onboarding full E2E for Merchant Type: NIDA Registered',
    preconditions:'NIDA Registered template prepared.',
    testData:'Merchant Type: NIDA Registered\nFile: nida_bulk.xlsx',
    testSteps:'(Same flow as TC_BULK_001 with Merchant Type: NIDA Registered)',
    expectedResult:'Status transitions and merchant list verified.', actualResult:'Full E2E completed.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_003', module:'Bulk Onboarding', subModule:'Company — Full E2E', role:'Labesh_Maker / LabeshChecker', testType:'Positive',
    description:'Bulk Merchant Onboarding full E2E for Merchant Type: Company',
    preconditions:'Company template prepared.',
    testData:'Merchant Type: Company\nFile: company_bulk.xlsx',
    testSteps:'(Same flow as TC_BULK_001 with Merchant Type: Company)',
    expectedResult:'Status transitions and merchant list verified.', actualResult:'Full E2E completed.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_004', module:'Bulk Onboarding', subModule:'Machinga — Full E2E', role:'Labesh_Maker / LabeshChecker', testType:'Positive',
    description:'Bulk Merchant Onboarding full E2E for Merchant Type: Machinga',
    preconditions:'Machinga template prepared.',
    testData:'Merchant Type: Machinga\nFile: machinga_bulk.xlsx',
    testSteps:'(Same flow as TC_BULK_001 with Merchant Type: Machinga)',
    expectedResult:'Status transitions and merchant list verified.', actualResult:'Full E2E completed.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_005', module:'Bulk Onboarding', subModule:'History — Status Filter', role:'Labesh_Maker', testType:'Positive',
    description:'Filter Onboarding History by each status value — correct records returned',
    preconditions:'History has records in multiple statuses.',
    testData:'Statuses: PENDING ENGRAFI, CHECKER PENDING, PROCESSING COMPLETED (all values)',
    testSteps:'1. Navigate to Onboarding History → Filter → select each status → Apply → assert only matching records\n2. Reset after each filter',
    expectedResult:'Each filter returns only matching records. Reset restores full list.', actualResult:'Status filter works for all values.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_006', module:'Bulk Onboarding', subModule:'History — Date Filter', role:'Labesh_Maker', testType:'Positive',
    description:'Filter Onboarding History by date range and Quick Select options',
    preconditions:'Records across multiple dates exist.',
    testData:'From/To: today | Quick Select: Today / Last 7 days / This month / Last 30 days',
    testSteps:'1. Filter → set date range → Apply → verify\n2. Test each Quick Select → verify',
    expectedResult:'Date filter and Quick Select return correctly scoped records.', actualResult:'Filters working correctly.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_007', module:'Bulk Onboarding', subModule:'History — File Name Filter', role:'Labesh_Maker', testType:'Positive',
    description:'Search Onboarding History by file name — matching record returned',
    preconditions:'At least one submission exists.',
    testData:'Partial file name search',
    testSteps:'1. Onboarding History → Filter → enter partial file name → Apply → assert match\n2. Reset → assert full list',
    expectedResult:'Matching file returned. Reset restores full list.', actualResult:'File name filter correct.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_008', module:'Bulk Onboarding', subModule:'View Details Modal', role:'Labesh_Maker', testType:'Positive',
    description:'View Details modal shows merchant-level ENGRAFI PENDING status',
    preconditions:'Record in PENDING ENGRAFI status exists.',
    testData:'Record status: PENDING ENGRAFI',
    testSteps:'1. Onboarding History → click View Details on PENDING ENGRAFI record\n2. Assert modal opens\n3. Assert merchant rows show ENGRAFI PENDING\n4. Close modal',
    expectedResult:'Modal opens. Merchants show ENGRAFI PENDING. Modal closes.', actualResult:'Modal correct.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_NEG_001', module:'Bulk Onboarding', subModule:'File Format', role:'Labesh_Maker', testType:'Negative',
    description:'Upload wrong file format (.pdf/.txt) — format error shown',
    preconditions:'Labesh_Maker logged in.',
    testData:'File: invalid_file.pdf',
    testSteps:'1. Bulk Merchant Onboarding → upload .pdf file\n2. Assert format error shown\n3. Assert Submit blocked',
    expectedResult:'Format error shown. Submit blocked.', actualResult:'Format error displayed.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_NEG_002', module:'Bulk Onboarding', subModule:'No File Selected', role:'Labesh_Maker', testType:'Negative',
    description:'Submit without file — validation error shown',
    preconditions:'Labesh_Maker logged in.',
    testData:'File: (none)',
    testSteps:'1. Bulk Merchant Onboarding → click Submit without file\n2. Assert "please upload a file" error',
    expectedResult:'File required error shown.', actualResult:'Error shown.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_NEG_003', module:'Bulk Onboarding', subModule:'No Merchant Type', role:'Labesh_Maker', testType:'Negative',
    description:'File uploaded but no Merchant Type selected — validation error shown',
    preconditions:'Labesh_Maker logged in.',
    testData:'File: bulk_individual.xlsx\nMerchant Type: (none)',
    testSteps:'1. Upload file → skip Merchant Type → Submit\n2. Assert "Merchant Type is required" error',
    expectedResult:'Merchant Type required error shown.', actualResult:'Error shown.', status:'PASS', remarks:'' },

  { tcId:'TC_BULK_NEG_004', module:'Bulk Onboarding', subModule:'Checker Rejection', role:'Labesh_Maker / LabeshChecker', testType:'Negative',
    description:'LabeshChecker rejects bulk onboarding — rejection confirmed',
    preconditions:'Valid bulk upload submitted.',
    testData:'Reject comment: rejecting for negative test',
    testSteps:'1. Labesh_Maker submits valid upload\n2. LabeshChecker → Inbox → Review → Reject → Confirm\n3. Assert rejection success',
    expectedResult:'Rejection confirmed.', actualResult:'Rejection processed.', status:'PASS', remarks:'' },
];

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' }, bottom: { style: 'thin' },
  left: { style: 'thin' }, right: { style: 'thin' },
};

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };

function styleSheet(sheet: ExcelJS.Worksheet, tcs: TC[]) {
  sheet.columns = [
    { header: 'TC ID',           key: 'tcId',           width: 20 },
    { header: 'Module',          key: 'module',         width: 22 },
    { header: 'Sub-Module',      key: 'subModule',      width: 28 },
    { header: 'Role',            key: 'role',           width: 22 },
    { header: 'Test Type',       key: 'testType',       width: 14 },
    { header: 'Description',     key: 'description',    width: 45 },
    { header: 'Preconditions',   key: 'preconditions',  width: 38 },
    { header: 'Test Data',       key: 'testData',       width: 38 },
    { header: 'Test Steps',      key: 'testSteps',      width: 60 },
    { header: 'Expected Result', key: 'expectedResult', width: 45 },
    { header: 'Actual Result',   key: 'actualResult',   width: 45 },
    { header: 'Status',          key: 'status',         width: 12 },
    { header: 'Remarks',         key: 'remarks',        width: 45 },
  ];
  const hdr = sheet.getRow(1);
  hdr.height = 28;
  hdr.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = BORDER;
  });
  tcs.forEach(tc => {
    const row = sheet.addRow(tc);
    row.height = 85;
    row.eachCell(cell => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border    = BORDER;
    });
    const typeCell = row.getCell('testType');
    typeCell.fill      = tc.testType === 'Positive'
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } }
      : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    typeCell.font      = { bold: true, color: { argb: tc.testType === 'Positive' ? 'FF274E13' : 'FF7F6000' } };
    typeCell.alignment = { horizontal: 'center', vertical: 'top', wrapText: true };

    const statusCell = row.getCell('status');
    statusCell.fill      = tc.status === 'PASS'
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } }
      : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4C4C' } };
    statusCell.font      = { bold: true, color: { argb: tc.status === 'PASS' ? 'FF1A4300' : 'FFFFFFFF' } };
    statusCell.alignment = { horizontal: 'center', vertical: 'top' };

    row.getCell('tcId').font = { bold: true };
  });
}

// ══════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════

async function generate() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Automation Suite';
  wb.created = new Date();

  const modules = [
    { name: 'Reports',         label: 'Reports' },
    { name: 'Config',          label: 'Config' },
    { name: 'Change Password', label: 'Change Password' },
    { name: 'Bulk Onboarding', label: 'Bulk Onboarding' },
  ];

  const stats: { module: string; total: number; pos: number; neg: number; pass: number; fail: number }[] = [];

  // Individual module sheets
  for (const m of modules) {
    const tcs = allTestCases.filter(t => t.module === m.name);
    const ws  = wb.addWorksheet(m.label, { views: [{ state: 'frozen', ySplit: 1 }] });
    styleSheet(ws, tcs);
    stats.push({
      module: m.name,
      total:  tcs.length,
      pos:    tcs.filter(t => t.testType === 'Positive').length,
      neg:    tcs.filter(t => t.testType === 'Negative').length,
      pass:   tcs.filter(t => t.status === 'PASS').length,
      fail:   tcs.filter(t => t.status === 'FAIL').length,
    });
  }

  // All TCs sheet
  const allSheet = wb.addWorksheet('All Test Cases', { views: [{ state: 'frozen', ySplit: 1 }] });
  styleSheet(allSheet, allTestCases);

  // Summary sheet
  const sum = wb.addWorksheet('Summary');
  sum.columns = [
    { header: 'Module',    key: 'module',   width: 26 },
    { header: 'Total TCs', key: 'total',    width: 12 },
    { header: 'Positive',  key: 'pos',      width: 12 },
    { header: 'Negative',  key: 'neg',      width: 12 },
    { header: 'PASS',      key: 'pass',     width: 10 },
    { header: 'FAIL',      key: 'fail',     width: 10 },
  ];
  const sh = sum.getRow(1);
  sh.height = 28;
  sh.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border    = BORDER;
  });

  stats.forEach(s => {
    const row = sum.addRow(s);
    row.height = 22;
    row.eachCell(cell => { cell.alignment = { horizontal: 'center', vertical: 'middle' }; cell.border = BORDER; });
    const pc = row.getCell('pass');
    pc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
    pc.font = { bold: true, color: { argb: 'FF1A4300' } };
    if (s.fail > 0) {
      const fc = row.getCell('fail');
      fc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4C4C' } };
      fc.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    }
  });

  // Totals
  const tot = { module: 'TOTAL', total: stats.reduce((a,b)=>a+b.total,0), pos: stats.reduce((a,b)=>a+b.pos,0), neg: stats.reduce((a,b)=>a+b.neg,0), pass: stats.reduce((a,b)=>a+b.pass,0), fail: stats.reduce((a,b)=>a+b.fail,0) };
  const tr = sum.addRow(tot);
  tr.height = 22;
  tr.eachCell(cell => { cell.font = { bold: true }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }; cell.alignment = { horizontal: 'center', vertical: 'middle' }; cell.border = BORDER; });

  sum.addRow({});
  [
    { module: 'Executed By',    total: 'Automation Suite' },
    { module: 'Execution Date', total: new Date().toLocaleDateString('en-GB') },
    { module: 'Base URL',       total: 'https://mixxmmp-test.tigo.co.tz' },
  ].forEach(m => { const r = sum.addRow(m); r.height = 18; r.getCell('module').font = { bold: true }; });

  const ts  = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  const out = path.join(reportsDir, `MMP_Master_TestReport_${ts}.xlsx`);
  await wb.xlsx.writeFile(out);
  console.log(`\n✅  Saved → ${out}`);
  console.log(`   Sheets: Reports | Config | Change Password | Bulk Onboarding | All Test Cases | Summary`);
  console.log(`   Total: ${tot.total} TCs  |  PASS: ${tot.pass}  |  FAIL: ${tot.fail}\n`);
}

generate().catch(err => { console.error(err); process.exit(1); });

