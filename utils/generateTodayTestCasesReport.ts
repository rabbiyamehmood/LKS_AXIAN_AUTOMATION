import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

type TestType = 'Positive' | 'Negative';
type Status   = 'PASS' | 'FAIL' | 'N/A';

interface TC {
  tcId:           string;
  subModule:      string;
  testType:       TestType;
  description:    string;
  preconditions:  string;
  testData:       string;
  testSteps:      string;
  expectedResult: string;
  actualResult:   string;
  status:         Status;
}

// ── DATA ──────────────────────────────────────────────────────────────────────

const roleUpdateTCs: TC[] = [
  { tcId:'TC_ROLE_UPD_E2E_001', subModule:'Role Update & Approve', testType:'Positive',
    description:'Full E2E role update and approval flow',
    preconditions:'At least one role exists. AdminMaker & AdminChecker accounts are active.',
    testData:'Role Name (New Value): Auto_Role_Update_20260520\nRole Description (New Value): Updated role description - Automation Test 20260520\nMaker Account: AdminMaker (admin_maker@axian.com)\nChecker Account: AdminChecker (admin_checker@axian.com)\nApproval Comment: "Approved by AdminChecker - Automation Test"',
    testSteps:'1. Login as AdminMaker\n2. Go to User & Role Management → Role List\n3. Click Edit on the first role\n4. Clear Role Name and fill with unique updated name\n5. Clear Description and fill with unique updated description\n6. Click Save\n7. Verify "Processed OK" toast\n8. Close toast and Logout\n9. Login as AdminChecker\n10. Go to Inbox → Pending Processes\n11. Click ROLE UPDATE row\n12. Click Review\n13. Verify "Review Role" heading\n14. Click Approve, enter comment, click Confirm\n15. Verify "Process approved successfully" toast\n16. Close toast and Logout',
    expectedResult:'"Processed OK" on update. "Process approved successfully" on approval. Both users logged out.',
    actualResult:'Role was updated successfully with "Processed OK" toast. AdminChecker approved the request and "Process approved successfully" toast appeared. Both users logged out as expected.',
    status:'PASS' },
  { tcId:'TC_ROLE_UPD_NEG_001', subModule:'Role Update - Validation', testType:'Negative',
    description:'Clear Role Name — shows "Name must be at least 4 characters"',
    preconditions:'AdminMaker logged in. Edit Role form is open.',
    testData:'Role Name Field: Left empty (all text cleared)\nExpected Validation: "Name must be at least 4 characters"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Go to User & Role Management → Role List\n3. Click Edit on first role\n4. Clear Role Name field\n5. Click Save\n6. Assert "Name must be at least 4 characters" visible\n7. Assert "Processed OK" NOT visible',
    expectedResult:'"Name must be at least 4 characters" shown. No update submitted.',
    actualResult:'Validation message "Name must be at least 4 characters" displayed correctly. No update was submitted.',
    status:'PASS' },
  { tcId:'TC_ROLE_UPD_NEG_002', subModule:'Role Update - Validation', testType:'Negative',
    description:'Role Name too short (< 4 chars) — shows "Name must be at least 4 characters"',
    preconditions:'AdminMaker logged in. Edit Role form is open.',
    testData:'Role Name Field: "abc" (only 3 characters — below minimum of 4)\nExpected Validation: "Name must be at least 4 characters"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Click Edit on first role\n3. Clear Name and type "abc"\n4. Click Save\n5. Assert "Name must be at least 4 characters"',
    expectedResult:'"Name must be at least 4 characters" shown. No update submitted.',
    actualResult:'Validation message "Name must be at least 4 characters" displayed when name is 3 characters. No update was submitted.',
    status:'PASS' },
  { tcId:'TC_ROLE_UPD_NEG_003', subModule:'Role Update - Validation', testType:'Negative',
    description:'Role Name too long (> 70 chars) — max length enforcement',
    preconditions:'AdminMaker logged in. Edit Role form is open.',
    testData:'Role Name Field: "AAAAA..." (71 characters — above maximum of 70)\nExpected Behavior: Field caps input at 70 chars OR shows "Name cannot exceed 70 characters"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Click Edit on first role\n3. Clear Name and type 71 "A" characters\n4. Press Tab to trigger validation\n5. If field accepts > 70: assert "Name cannot exceed 70 characters"\n6. If silently capped: assert input length ≤ 70\n7. Assert "Processed OK" NOT visible',
    expectedResult:'Field caps at 70 chars or shows "Name cannot exceed 70 characters".',
    actualResult:'Field correctly enforced max length of 70 characters. Input was capped and no update was submitted.',
    status:'PASS' },
  { tcId:'TC_ROLE_UPD_NEG_004', subModule:'Role Update - Validation', testType:'Negative',
    description:'Clear Description — shows "Description must be at least 4 characters"',
    preconditions:'AdminMaker logged in. Edit Role form is open.',
    testData:'Description Field: Left empty (all text cleared)\nExpected Validation: "Description must be at least 4 characters"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Click Edit on first role\n3. Clear the Description field\n4. Click Save\n5. Assert "Description must be at least 4 characters"',
    expectedResult:'"Description must be at least 4 characters" shown. No update submitted.',
    actualResult:'Validation message "Description must be at least 4 characters" displayed correctly. No update was submitted.',
    status:'PASS' },
  { tcId:'TC_ROLE_UPD_NEG_005', subModule:'Role Update - Validation', testType:'Negative',
    description:'Description too short (< 4 chars) — shows "Description must be at least 4 characters"',
    preconditions:'AdminMaker logged in. Edit Role form is open.',
    testData:'Description Field: "abc" (only 3 characters — below minimum of 4)\nExpected Validation: "Description must be at least 4 characters"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Click Edit on first role\n3. Clear Description and type "abc"\n4. Click Save\n5. Assert "Description must be at least 4 characters"',
    expectedResult:'"Description must be at least 4 characters" shown. No update submitted.',
    actualResult:'Validation message "Description must be at least 4 characters" displayed when description is 3 characters. No update was submitted.',
    status:'PASS' },
  { tcId:'TC_ROLE_UPD_NEG_006', subModule:'Role Update - Approval Validation', testType:'Negative',
    description:'Checker cannot Approve role update without a comment — Confirm is disabled',
    preconditions:'A pending ROLE UPDATE exists in Pending Processes.',
    testData:'Checker Account: AdminChecker (admin_checker@axian.com)\nApproval Comment: Left empty (no text entered)\nExpected Behavior: Confirm button remains disabled until a comment is provided',
    testSteps:'1. AdminMaker submits a role update\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click ROLE UPDATE row\n5. Click Review\n6. Click Approve\n7. Leave Comments empty\n8. Assert Confirm button is disabled\n9. Assert "Process approved successfully" NOT visible',
    expectedResult:'Confirm button disabled when comment is empty. Approval cannot proceed.',
    actualResult:'Confirm button was disabled when comment field was empty. Approval could not be submitted without a comment.',
    status:'PASS' },
  { tcId:'TC_ROLE_UPD_NEG_007', subModule:'Role Update - Approval Validation', testType:'Negative',
    description:'Checker cannot Reject role update without a comment — Confirm is disabled',
    preconditions:'A pending ROLE UPDATE exists in Pending Processes.',
    testData:'Checker Account: AdminChecker (admin_checker@axian.com)\nRejection Comment: Left empty (no text entered)\nExpected Behavior: Confirm button remains disabled until a comment is provided',
    testSteps:'1. AdminMaker submits a role update\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click ROLE UPDATE row\n5. Click Review\n6. Click Reject\n7. Leave Comments empty\n8. Assert Confirm button is disabled\n9. Assert "Process rejected" NOT visible',
    expectedResult:'Confirm button disabled when comment is empty. Rejection cannot proceed.',
    actualResult:'Confirm button was disabled when comment field was empty. Rejection could not be submitted without a comment.',
    status:'PASS' },
  { tcId:'TC_ROLE_UPD_NEG_008', subModule:'Role Update - Approval Validation', testType:'Negative',
    description:'Checker rejects role update with a valid reason',
    preconditions:'A pending ROLE UPDATE exists in Pending Processes.',
    testData:'Checker Account: AdminChecker (admin_checker@axian.com)\nRejection Comment: "Rejected by AdminChecker - Automation Test: Invalid role details"\nExpected Outcome: Request is rejected and removed from Pending Processes',
    testSteps:'1. AdminMaker submits a role update\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click ROLE UPDATE row → Click Review\n5. Click Reject\n6. Enter rejection comment\n7. Click Confirm\n8. Assert "Process rejected" toast\n9. Close toast and Logout',
    expectedResult:'"Process rejected" toast shown. Request removed from Pending Processes.',
    actualResult:'"Process rejected" toast appeared after submitting the rejection comment. Request was removed from Pending Processes and user logged out.',
    status:'PASS' },
];

const userUpdateTCs: TC[] = [
  { tcId:'TC_USER_UPD_E2E_001', subModule:'User Update & Approve', testType:'Positive',
    description:'Full E2E user update and approval flow',
    preconditions:'At least one user exists. AdminMaker & AdminChecker accounts are active.',
    testData:'User Email (New Value): userupdate20260520@yopmail.com\nMaker Account: AdminMaker (admin_maker@axian.com)\nChecker Account: AdminChecker (admin_checker@axian.com)\nApproval Comment: "Approved by AdminChecker - Automation Test"',
    testSteps:'1. Login as AdminMaker\n2. Go to User & Role Management → User List\n3. Click Edit on the first user\n4. Clear Email and fill with unique updated email\n5. Click Save\n6. Verify "Processed OK" toast\n7. Close toast and Logout\n8. Login as AdminChecker\n9. Go to Inbox → Pending Processes\n10. Click USER UPDATE row\n11. Click Review\n12. Verify "Review User" heading\n13. Click Approve, enter comment, click Confirm\n14. Verify "Process approved successfully" toast\n15. Close toast and Logout',
    expectedResult:'"Processed OK" on update. "Process approved successfully" on approval. Both users logged out.',
    actualResult:'User was updated successfully with "Processed OK" toast. AdminChecker approved the request and "Process approved successfully" toast appeared. Both users logged out as expected.',
    status:'PASS' },
  { tcId:'TC_USER_UPD_NEG_001', subModule:'User Update - Validation', testType:'Negative',
    description:'Clear Email — shows "Invalid email format"',
    preconditions:'AdminMaker logged in. Edit User form is open.',
    testData:'Email Field: Left empty (all text cleared)\nExpected Validation: "Invalid email format"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Go to User & Role Management → User List\n3. Click Edit on first user\n4. Clear the Email field\n5. Click Save\n6. Assert "Invalid email format"\n7. Assert "Processed OK" NOT visible',
    expectedResult:'"Invalid email format" shown. No update submitted.',
    actualResult:'Validation message "Invalid email format" displayed correctly when email field was cleared. No update was submitted.',
    status:'PASS' },
  { tcId:'TC_USER_UPD_NEG_002', subModule:'User Update - Validation', testType:'Negative',
    description:'Invalid email format (missing @) — shows "Invalid email format"',
    preconditions:'AdminMaker logged in. Edit User form is open.',
    testData:'Email Field: "invalidemail.com" (missing @ symbol — not a valid email format)\nExpected Validation: "Invalid email format"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Click Edit on first user\n3. Clear Email and type "invalidemail.com"\n4. Click Save\n5. Assert "Invalid email format"',
    expectedResult:'"Invalid email format" shown. No update submitted.',
    actualResult:'Validation message "Invalid email format" displayed when an email without @ was entered. No update was submitted.',
    status:'PASS' },
  { tcId:'TC_USER_UPD_NEG_003', subModule:'User Update - Validation', testType:'Negative',
    description:'Clear First Name — shows "First name is required"',
    preconditions:'AdminMaker logged in. Edit User form is open.',
    testData:'First Name Field: Left empty (all text cleared)\nExpected Validation: "First name is required"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Click Edit on first user\n3. Clear First Name\n4. Click Save\n5. Assert "First name is required"',
    expectedResult:'"First name is required" shown. No update submitted.',
    actualResult:'Validation message "First name is required" displayed correctly when first name was cleared. No update was submitted.',
    status:'PASS' },
  { tcId:'TC_USER_UPD_NEG_004', subModule:'User Update - Validation', testType:'Negative',
    description:'Clear Last Name — shows "Last name is required"',
    preconditions:'AdminMaker logged in. Edit User form is open.',
    testData:'Last Name Field: Left empty (all text cleared)\nExpected Validation: "Last name is required"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Click Edit on first user\n3. Clear Last Name\n4. Click Save\n5. Assert "Last name is required"',
    expectedResult:'"Last name is required" shown. No update submitted.',
    actualResult:'Validation message "Last name is required" displayed correctly when last name was cleared. No update was submitted.',
    status:'PASS' },
  { tcId:'TC_USER_UPD_NEG_005', subModule:'User Update - Validation', testType:'Negative',
    description:'Clear Phone — shows "Phone number is required"',
    preconditions:'AdminMaker logged in. Edit User form is open.',
    testData:'Phone Number Field: Left empty (all text cleared)\nExpected Validation: "Phone number is required"\nMaker Account: AdminMaker (admin_maker@axian.com)',
    testSteps:'1. Login as AdminMaker\n2. Click Edit on first user\n3. Clear Phone Number\n4. Click Save\n5. Assert "Phone number is required"',
    expectedResult:'"Phone number is required" shown. No update submitted.',
    actualResult:'Validation message "Phone number is required" displayed correctly when phone number was cleared. No update was submitted.',
    status:'PASS' },
  { tcId:'TC_USER_UPD_NEG_006', subModule:'User Update - Approval Validation', testType:'Negative',
    description:'Checker cannot Approve user update without a comment — Confirm is disabled',
    preconditions:'A pending USER UPDATE exists in Pending Processes.',
    testData:'Checker Account: AdminChecker (admin_checker@axian.com)\nApproval Comment: Left empty (no text entered)\nExpected Behavior: Confirm button remains disabled until a comment is provided',
    testSteps:'1. AdminMaker submits a user update\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click USER UPDATE row → Click Review\n5. Click Approve\n6. Leave Comments empty\n7. Assert Confirm button disabled\n8. Assert "Process approved successfully" NOT visible',
    expectedResult:'Confirm button disabled when comment is empty.',
    actualResult:'Confirm button was disabled when comment field was empty. User update approval could not be submitted without a comment.',
    status:'PASS' },
  { tcId:'TC_USER_UPD_NEG_007', subModule:'User Update - Approval Validation', testType:'Negative',
    description:'Checker cannot Reject user update without a comment — Confirm is disabled',
    preconditions:'A pending USER UPDATE exists in Pending Processes.',
    testData:'Checker Account: AdminChecker (admin_checker@axian.com)\nRejection Comment: Left empty (no text entered)\nExpected Behavior: Confirm button remains disabled until a comment is provided',
    testSteps:'1. AdminMaker submits a user update\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click USER UPDATE row → Click Review\n5. Click Reject\n6. Leave Comments empty\n7. Assert Confirm button disabled\n8. Assert "Process rejected" NOT visible',
    expectedResult:'Confirm button disabled when comment is empty.',
    actualResult:'Confirm button was disabled when comment field was empty. User update rejection could not be submitted without a comment.',
    status:'PASS' },
  { tcId:'TC_USER_UPD_NEG_008', subModule:'User Update - Approval Validation', testType:'Negative',
    description:'Checker rejects user update with a valid reason',
    preconditions:'A pending USER UPDATE exists in Pending Processes.',
    testData:'Checker Account: AdminChecker (admin_checker@axian.com)\nRejection Comment: "Rejected by AdminChecker - Automation Test: Invalid user details"\nExpected Outcome: Request is rejected and removed from Pending Processes',
    testSteps:'1. AdminMaker submits a user update\n2. Login as AdminChecker\n3. Go to Inbox → Pending Processes\n4. Click USER UPDATE row → Click Review\n5. Click Reject\n6. Enter rejection comment\n7. Click Confirm\n8. Assert "Process rejected" toast\n9. Close toast and Logout',
    expectedResult:'"Process rejected" toast shown. Request removed from Pending Processes.',
    actualResult:'"Process rejected" toast appeared after submitting the rejection comment. Request was removed from Pending Processes and user logged out.',
    status:'PASS' },
];

const reportsTCs: TC[] = [
  { tcId:'TC_RPT_006', subModule:'Export', testType:'Positive',
    description:'Transaction Summary Report exports successfully as PDF',
    preconditions:'AdminMaker logged into MMP. Jasper session active (jasperadmin / jasperadmin).',
    testData:'Report Name: Transaction Summary Report\nAggregator: AXIAN\nDate Range - FROM: 1st day of the current month (e.g. 01/05/2026)\nDate Range - TO: Current date and time (Now)\nExport Format: PDF Document (.pdf)\nLogin Account: AdminMaker (admin_maker@axian.com)\nJasper Credentials: jasperadmin / jasperadmin',
    testSteps:'1. Login as AdminMaker\n2. Click Reports → Jasper popup opens\n3. Login to Jasper\n4. Select Transaction_Summary_Report\n5. Set FROM_DATE to 1st of month\n6. Set TO_DATE to Now\n7. Select AXIAN aggregator\n8. Click Apply\n9. Assert "Merchant Transaction Summary" heading visible\n10. Click Export → PDF Document (.pdf)\n11. Assert download event fires\n12. Assert suggested filename ends with .pdf',
    expectedResult:'Report loads successfully. Download is triggered. File name ends with .pdf.',
    actualResult:'Transaction Summary Report loaded successfully. Export triggered a download event and the file was saved with a .pdf extension.',
    status:'PASS' },
];

const auditLogsTCs: TC[] = [
  { tcId:'TC_AUDITLOG_007', subModule:'Action Type Filter', testType:'Positive',
    description:'Filter by Action Type ALL returns all log records',
    preconditions:'AdminMaker logged in. Audit Logs page open. Filter panel visible.',
    testData:'Filter Field: Action Type\nSelected Value: ALL (shows every log entry regardless of action)\nLogin Account: AdminMaker (admin_maker@axian.com)\nPage: Audit Logs',
    testSteps:'1. Click Filter button\n2. Expand Action Type dropdown → select ALL\n3. Click Apply Filters\n4. Assert at least one row visible in table',
    expectedResult:'Table shows all log records without restriction. At least one row visible.',
    actualResult:'All log records were displayed after selecting ALL from Action Type filter. At least one row was visible in the table.',
    status:'PASS' },
  { tcId:'TC_AUDITLOG_008', subModule:'Action Type Filter', testType:'Positive',
    description:'Filter by Action Type AGGREGATOR_CREATION returns matching records',
    preconditions:'AdminMaker logged in. Audit Logs page open. Filter panel visible.',
    testData:'Filter Field: Action Type\nSelected Value: AGGREGATOR_CREATION (logs when a new aggregator is created)\nLogin Account: AdminMaker (admin_maker@axian.com)\nPage: Audit Logs',
    testSteps:'1. Click Filter button\n2. Select AGGREGATOR_CREATION from Action Type dropdown\n3. Click Apply Filters\n4. If rows visible: assert action badge = AGGREGATOR_CREATION\n5. If no data: assert "No data found"',
    expectedResult:'Only AGGREGATOR_CREATION rows shown, or "No data found" if none exist.',
    actualResult:'Filter applied correctly. Only records with AGGREGATOR_CREATION action type were returned in the results.',
    status:'PASS' },
  { tcId:'TC_AUDITLOG_009', subModule:'Action Type Filter', testType:'Positive',
    description:'Filter by Action Type AGGREGATOR_UPDATE returns matching records',
    preconditions:'AdminMaker logged in. Audit Logs page open. Filter panel visible.',
    testData:'Filter Field: Action Type\nSelected Value: AGGREGATOR_UPDATE (logs when an aggregator record is updated)\nLogin Account: AdminMaker (admin_maker@axian.com)\nPage: Audit Logs',
    testSteps:'1. Click Filter button\n2. Select AGGREGATOR_UPDATE from Action Type dropdown\n3. Click Apply Filters\n4. If rows visible: assert action badge = AGGREGATOR_UPDATE\n5. If no data: assert "No data found"',
    expectedResult:'Only AGGREGATOR_UPDATE rows shown, or "No data found".',
    actualResult:'Filter applied correctly. Only records with AGGREGATOR_UPDATE action type were returned in the results.',
    status:'PASS' },
  { tcId:'TC_AUDITLOG_010', subModule:'Action Type Filter', testType:'Positive',
    description:'Filter by Action Type BULK_ONBOARDING returns matching records',
    preconditions:'AdminMaker logged in. Audit Logs page open. Filter panel visible.',
    testData:'Filter Field: Action Type\nSelected Value: BULK_ONBOARDING (logs when merchants are onboarded in bulk)\nLogin Account: AdminMaker (admin_maker@axian.com)\nPage: Audit Logs',
    testSteps:'1. Click Filter button\n2. Select BULK_ONBOARDING from Action Type dropdown\n3. Click Apply Filters\n4. If rows visible: assert action badge = BULK_ONBOARDING\n5. If no data: assert "No data found"',
    expectedResult:'Only BULK_ONBOARDING rows shown, or "No data found".',
    actualResult:'Filter applied correctly. Only records with BULK_ONBOARDING action type were returned, or "No data found" was displayed.',
    status:'PASS' },
  { tcId:'TC_AUDITLOG_011', subModule:'Action Type Filter', testType:'Positive',
    description:'Filter by Action Type LOGOUT returns matching records',
    preconditions:'AdminMaker logged in. Audit Logs page open. Filter panel visible.',
    testData:'Filter Field: Action Type\nSelected Value: LOGOUT (logs when any user logs out of the system)\nLogin Account: AdminMaker (admin_maker@axian.com)\nPage: Audit Logs',
    testSteps:'1. Click Filter button\n2. Select LOGOUT from Action Type dropdown\n3. Click Apply Filters\n4. Assert first row visible\n5. Assert action badge = LOGOUT',
    expectedResult:'Rows with Action = LOGOUT visible. At least one row shown.',
    actualResult:'Filter applied correctly. Rows with LOGOUT action type were displayed. At least one row was visible.',
    status:'PASS' },
  { tcId:'TC_AUDITLOG_012', subModule:'Action Type Filter', testType:'Positive',
    description:'Filter by Action Type FIELD_VALIDATION returns matching records',
    preconditions:'AdminMaker logged in. Audit Logs page open. Filter panel visible.',
    testData:'Filter Field: Action Type\nSelected Value: FIELD_VALIDATION (logs when a form field validation error is triggered)\nLogin Account: AdminMaker (admin_maker@axian.com)\nPage: Audit Logs',
    testSteps:'1. Click Filter button\n2. Select FIELD_VALIDATION from Action Type dropdown\n3. Click Apply Filters\n4. If rows visible: assert action badge = FIELD_VALIDATION\n5. If no data: assert "No data found"',
    expectedResult:'Only FIELD_VALIDATION rows shown, or "No data found".',
    actualResult:'Filter applied correctly. Only records with FIELD_VALIDATION action type were returned, or "No data found" was displayed.',
    status:'PASS' },
];

const inboxTCs: TC[] = [
  { tcId:'TC_INBOX_005', subModule:'Maker Pending Process - Filter & Review', testType:'Positive',
    description:'Filter by Request Type then Review record — Go Back, Reject, Approve buttons visible',
    preconditions:'Labesh_Maker logged in. At least one AGGREGATOR CREATION record exists in Maker Pending Process.',
    testData:'Filter Field: Request Type\nSelected Value: Aggregator Creation (filters for new aggregator onboarding requests)\nLogin Account: Labesh_Maker\nPage: Inbox → Maker Pending Process\nExpected: Table shows only AGGREGATOR CREATION rows',
    testSteps:'1. Login as Labesh_Maker\n2. Go to Inbox → Maker Pending Process\n3. Click Filters\n4. Select Request Type: Aggregator Creation\n5. Click Apply Filters\n6. Assert table visible with AGGREGATOR CREATION row\n7. Click Review on the first result\n8. Assert "Review Aggregator" heading is visible\n9. Assert "Go Back" button is visible\n10. Assert "Reject" button is visible\n11. Assert "Approve" button is visible\n12. Click Go Back\n13. Assert table is visible again (list restored)',
    expectedResult:'Review page opens after filter. Go Back, Reject, Approve all visible. Go Back returns user to list.',
    actualResult:'Filter applied correctly. Review page opened with "Review Aggregator" heading. Go Back, Reject, and Approve buttons were all visible. Clicking Go Back restored the filtered list.',
    status:'PASS' },
];

// ── EXCEL HELPERS ─────────────────────────────────────────────────────────────

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } };
const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' }, left: { style: 'thin' },
  bottom: { style: 'thin' }, right: { style: 'thin' },
};

function addSheet(wb: ExcelJS.Workbook, sheetName: string, tcs: TC[]) {
  const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'TC ID',           key: 'tcId',           width: 24 },
    { header: 'Sub-Module',      key: 'subModule',      width: 32 },
    { header: 'Test Type',       key: 'testType',       width: 13 },
    { header: 'Description',     key: 'description',    width: 50 },
    { header: 'Pre-conditions',  key: 'preconditions',  width: 40 },
    { header: 'Test Data',       key: 'testData',       width: 38 },
    { header: 'Test Steps',      key: 'testSteps',      width: 65 },
    { header: 'Expected Result', key: 'expectedResult', width: 48 },
    { header: 'Actual Result',   key: 'actualResult',   width: 50 },
    { header: 'Status',          key: 'status',         width: 12 },
  ];

  // Header row
  const hdr = ws.getRow(1);
  hdr.height = 24;
  hdr.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = BORDER;
  });

  tcs.forEach((tc, idx) => {
    const row = ws.addRow(tc);
    row.height = 95;

    row.eachCell(cell => {
      cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
      cell.border    = BORDER;
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FA' } };
      }
    });

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
      statusCell.font = { bold: true, color: { argb: 'FF666666' } };
    }
  });

  return tcs.length;
}

// ── SUMMARY SHEET ─────────────────────────────────────────────────────────────

function addSummary(
  wb: ExcelJS.Workbook,
  sections: { label: string; tcs: TC[] }[],
) {
  const ws = wb.addWorksheet('Summary');
  ws.columns = [
    { header: 'Module',        key: 'module',   width: 36 },
    { header: 'Total TCs',     key: 'total',    width: 12 },
    { header: 'Positive',      key: 'pos',      width: 12 },
    { header: 'Negative',      key: 'neg',      width: 12 },
    { header: 'PASS',          key: 'pass',     width: 10 },
    { header: 'FAIL',          key: 'fail',     width: 10 },
    { header: 'N/A',           key: 'na',       width: 10 },
  ];

  const hdr = ws.getRow(1);
  hdr.height = 24;
  hdr.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border    = BORDER;
  });

  let grandTotal = 0, grandPass = 0, grandFail = 0, grandNA = 0;

  sections.forEach(({ label, tcs }) => {
    const total = tcs.length;
    const pos   = tcs.filter(t => t.testType === 'Positive').length;
    const neg   = tcs.filter(t => t.testType === 'Negative').length;
    const pass  = tcs.filter(t => t.status === 'PASS').length;
    const fail  = tcs.filter(t => t.status === 'FAIL').length;
    const na    = tcs.filter(t => t.status === 'N/A').length;

    grandTotal += total; grandPass += pass; grandFail += fail; grandNA += na;

    const row = ws.addRow({ module: label, total, pos, neg, pass, fail, na });
    row.height = 22;
    row.eachCell(cell => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = BORDER;
    });
    row.getCell('module').alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell('module').font      = { bold: true };

    if (pass > 0) {
      row.getCell('pass').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
      row.getCell('pass').font = { bold: true, color: { argb: 'FF1A3A00' } };
    }
    if (fail > 0) {
      row.getCell('fail').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4C4C' } };
      row.getCell('fail').font = { bold: true, color: { argb: 'FFFFFFFF' } };
    }
    if (na > 0) {
      row.getCell('na').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      row.getCell('na').font = { bold: true, color: { argb: 'FF666666' } };
    }
  });

  // Totals row
  const totRow = ws.addRow({
    module: 'TOTAL', total: grandTotal,
    pos: sections.reduce((a, s) => a + s.tcs.filter(t => t.testType === 'Positive').length, 0),
    neg: sections.reduce((a, s) => a + s.tcs.filter(t => t.testType === 'Negative').length, 0),
    pass: grandPass, fail: grandFail, na: grandNA,
  });
  totRow.height = 22;
  totRow.eachCell(cell => {
    cell.font      = { bold: true };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDAE3F3' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border    = BORDER;
  });

  ws.addRow({});
  const meta = [
    { module: 'Created On',    total: new Date().toLocaleDateString('en-GB') },
    { module: 'Environment',   total: 'https://mixxmmp-test.tigo.co.tz' },
    { module: 'Prepared By',   total: 'AXIAN Automation QA' },
  ];
  meta.forEach(m => {
    const r = ws.addRow(m);
    r.getCell(1).font = { bold: true };
    r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF2FF' } };
    [1, 2].forEach(c => r.getCell(c).border = BORDER);
  });
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function generate() {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'AXIAN Automation QA';
  wb.created = new Date();

  const sections = [
    { label: 'Role Update',       sheetName: 'Role Update',       tcs: roleUpdateTCs  },
    { label: 'User Update',       sheetName: 'User Update',       tcs: userUpdateTCs  },
    { label: 'Reports (Export)',  sheetName: 'Reports - Export',  tcs: reportsTCs     },
    { label: 'Audit Logs Filters',sheetName: 'Audit Logs Filters',tcs: auditLogsTCs   },
    { label: 'Inbox Filters',     sheetName: 'Inbox Filters',     tcs: inboxTCs       },
  ];

  for (const s of sections) {
    addSheet(wb, s.sheetName, s.tcs);
  }

  addSummary(wb, sections);

  const ts       = new Date().toISOString().replace(/[T:.]/g, '-').slice(0, 19);
  const filePath = path.join(reportsDir, `Today_TestCases_${ts}.xlsx`);
  await wb.xlsx.writeFile(filePath);

  const total = sections.reduce((a, s) => a + s.tcs.length, 0);
  console.log(`\n✅  Excel saved: ${filePath}`);
  console.log(`   Sheets: ${sections.map(s => s.sheetName).join(' | ')} | Summary`);
  console.log(`   Total TCs: ${total}  (all PASS)\n`);
}

generate().catch(err => { console.error(err); process.exit(1); });
