import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface RoleTestCase {
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

const testCases: RoleTestCase[] = [

  // ── POSITIVE ──────────────────────────────────────────────────────────────────

  {
    tcId: 'TC_ROLE_E2E_001',
    module: 'Role Creation & Approval',
    role: 'AdminMaker → AdminChecker',
    testType: 'Positive',
    description: 'Full end-to-end role creation and approval flow',
    preconditions: 'AdminMaker and AdminChecker accounts are active. Portal is accessible.',
    testData:
      'Role Name: AutoRole_<timestamp>\nDescription: AutoDesc_<timestamp>\nPermissions: All permissions selected\nApproval Comment: Approved by AdminChecker - Automation Test',
    testSteps:
      '1. Navigate to /login\n2. Login as AdminMaker\n3. Go to User & Role Management → Role List\n4. Click Add Role\n5. Fill Role Name with unique value\n6. Fill Description\n7. Click parent permission checkbox\n8. Select each individual permission (items 2-15)\n9. Click Save\n10. Verify "Processed OK" toast appears\n11. Close toast and Logout\n12. Login as AdminChecker\n13. Go to Inbox → Pending Processes\n14. Click ROLE CREATION row\n15. Click Review\n16. Click Approve\n17. Enter approval comment\n18. Click Confirm\n19. Verify "Process approved successfully" toast\n20. Close toast and Logout',
    expectedResult:
      'Role created successfully with "Processed OK" toast.\nAdminChecker sees it in Pending Processes.\nApproval succeeds with "Process approved successfully" toast.\nBoth users successfully logged out.',
    status: 'PASS',
  },

  // ── NEGATIVE — MAKER FORM VALIDATION ─────────────────────────────────────────

  {
    tcId: 'TC_ROLE_NEG_001',
    module: 'Role Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'All fields empty — Save shows all required validation errors',
    preconditions: 'AdminMaker logged in. Add Role form is open.',
    testData: 'All fields: (empty)',
    testSteps:
      '1. Login as AdminMaker\n2. Go to User & Role Management → Role List\n3. Click Add Role\n4. Leave all fields empty\n5. Click Save\n6. Assert "Name must be at least 4 characters" is visible\n7. Assert "Description must be at least 4 characters" is visible\n8. Assert "Please select at least one permission" is visible\n9. Assert "Processed OK" toast is NOT visible',
    expectedResult:
      'All 3 required validation errors are shown. No success toast appears.',
    status: 'PASS',
  },
  {
    tcId: 'TC_ROLE_NEG_002',
    module: 'Role Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Role Name missing — shows "Name must be at least 4 characters"',
    preconditions: 'AdminMaker logged in. Add Role form is open.',
    testData: 'Name: (empty)\nDescription: ValidDesc\nPermissions: All selected',
    testSteps:
      '1. Login as AdminMaker\n2. Open Add Role form\n3. Leave Name empty\n4. Fill valid Description\n5. Select all permissions\n6. Click Save\n7. Assert "Name must be at least 4 characters" is visible\n8. Assert "Processed OK" is NOT visible',
    expectedResult:
      'Name validation error shown. Form not submitted.',
    status: 'PASS',
  },
  {
    tcId: 'TC_ROLE_NEG_003',
    module: 'Role Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Role Name too short (< 4 chars) — shows "Name must be at least 4 characters"',
    preconditions: 'AdminMaker logged in. Add Role form is open.',
    testData: 'Name: AB\nDescription: ValidDesc\nPermissions: All selected',
    testSteps:
      '1. Login as AdminMaker\n2. Open Add Role form\n3. Fill Name with "AB" (2 chars)\n4. Fill valid Description\n5. Select all permissions\n6. Click Save\n7. Assert "Name must be at least 4 characters" is visible\n8. Assert "Processed OK" is NOT visible',
    expectedResult:
      'Name too short error shown. Form not submitted.',
    status: 'PASS',
  },
  {
    tcId: 'TC_ROLE_NEG_004',
    module: 'Role Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Role Name too long (> 70 chars) — field enforces max 70 character limit',
    preconditions: 'AdminMaker logged in. Add Role form is open.',
    testData: 'Name: 71 x "A"\nDescription: ValidDesc\nPermissions: All selected',
    testSteps:
      '1. Login as AdminMaker\n2. Open Add Role form\n3. Fill Name with 71 characters\n4. Press Tab to blur field\n5. Assert field value is capped at 70 chars OR error "Name cannot exceed 70 characters" is visible\n6. Assert "Processed OK" is NOT visible',
    expectedResult:
      'Field silently caps at 70 chars OR validation error shown. Form not submitted.',
    status: 'PASS',
  },
  {
    tcId: 'TC_ROLE_NEG_005',
    module: 'Role Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Description missing — shows "Description must be at least 4 characters"',
    preconditions: 'AdminMaker logged in. Add Role form is open.',
    testData: 'Name: ValidName\nDescription: (empty)\nPermissions: All selected',
    testSteps:
      '1. Login as AdminMaker\n2. Open Add Role form\n3. Fill valid Name\n4. Leave Description empty\n5. Select all permissions\n6. Click Save\n7. Assert "Description must be at least 4 characters" is visible\n8. Assert "Processed OK" is NOT visible',
    expectedResult:
      'Description validation error shown. Form not submitted.',
    status: 'PASS',
  },
  {
    tcId: 'TC_ROLE_NEG_006',
    module: 'Role Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Description too short (< 4 chars) — shows "Description must be at least 4 characters"',
    preconditions: 'AdminMaker logged in. Add Role form is open.',
    testData: 'Name: ValidName\nDescription: AB\nPermissions: All selected',
    testSteps:
      '1. Login as AdminMaker\n2. Open Add Role form\n3. Fill valid Name\n4. Fill Description with "AB" (2 chars)\n5. Select all permissions\n6. Click Save\n7. Assert "Description must be at least 4 characters" is visible\n8. Assert "Processed OK" is NOT visible',
    expectedResult:
      'Description too short error shown. Form not submitted.',
    status: 'PASS',
  },
  {
    tcId: 'TC_ROLE_NEG_007',
    module: 'Role Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'No permission selected (empty form) — shows "Please select at least one permission"',
    preconditions: 'AdminMaker logged in. Add Role form is open.',
    testData: 'All fields empty',
    testSteps:
      '1. Login as AdminMaker\n2. Open Add Role form\n3. Leave all fields empty\n4. Click Save\n5. Assert "Please select at least one permission" is visible\n6. Assert "Processed OK" is NOT visible',
    expectedResult:
      'Permission required error shown. Form not submitted.',
    status: 'PASS',
  },
  {
    tcId: 'TC_ROLE_NEG_008',
    module: 'Role Creation',
    role: 'AdminMaker',
    testType: 'Negative',
    description: 'Valid name and description but no permissions selected — shows "Please select at least one permission"',
    preconditions: 'AdminMaker logged in. Add Role form is open.',
    testData: 'Name: ValidName\nDescription: ValidDesc\nPermissions: none',
    testSteps:
      '1. Login as AdminMaker\n2. Open Add Role form\n3. Fill valid Name\n4. Fill valid Description\n5. Do NOT select any permission\n6. Click Save\n7. Assert "Please select at least one permission" is visible\n8. Assert "Processed OK" is NOT visible',
    expectedResult:
      'Permission required error shown even when name and description are valid.',
    status: 'PASS',
  },

  // ── NEGATIVE — CHECKER SIDE ───────────────────────────────────────────────────

  {
    tcId: 'TC_ROLE_NEG_009',
    module: 'Role Approval',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'Checker cannot Approve role without a comment — Confirm button is disabled',
    preconditions: 'A role has been submitted by AdminMaker and is pending approval.',
    testData: 'Approval Comment: (empty)',
    testSteps:
      '1. AdminMaker creates a role\n2. Logout AdminMaker\n3. Login as AdminChecker\n4. Go to Inbox → Pending Processes\n5. Click Review on the pending role\n6. Click Approve\n7. Leave comment empty\n8. Assert Confirm button is disabled',
    expectedResult:
      'Confirm button is disabled when no comment is entered. Approval cannot proceed.',
    status: 'PASS',
  },
  {
    tcId: 'TC_ROLE_NEG_010',
    module: 'Role Approval',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'Checker cannot Reject role without a comment — Confirm button is disabled',
    preconditions: 'A role has been submitted by AdminMaker and is pending approval.',
    testData: 'Rejection Comment: (empty)',
    testSteps:
      '1. AdminMaker creates a role\n2. Logout AdminMaker\n3. Login as AdminChecker\n4. Go to Inbox → Pending Processes\n5. Click Review on the pending role\n6. Click Reject\n7. Leave comment empty\n8. Assert Confirm button is disabled',
    expectedResult:
      'Confirm button is disabled when no comment is entered. Rejection cannot proceed.',
    status: 'PASS',
  },
  {
    tcId: 'TC_ROLE_NEG_011',
    module: 'Role Approval',
    role: 'AdminChecker',
    testType: 'Negative',
    description: 'Checker rejects role creation with valid rejection reason',
    preconditions: 'A role has been submitted by AdminMaker and is pending approval.',
    testData: 'Rejection Comment: Rejected by AdminChecker - Automation Test',
    testSteps:
      '1. AdminMaker creates a role\n2. Logout AdminMaker\n3. Login as AdminChecker\n4. Go to Inbox → Pending Processes\n5. Click Review on the pending role\n6. Click Reject\n7. Enter rejection comment\n8. Click Confirm\n9. Assert "Process rejected successfully" toast is visible\n10. Logout AdminChecker',
    expectedResult:
      'Role creation rejected. "Process rejected successfully" toast shown. Checker logged out.',
    status: 'PASS',
  },
];

async function generateRoleReport() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Role Creation Tests');

  // Header row
  const headers = [
    'TC ID', 'Module', 'Role', 'Test Type', 'Description',
    'Preconditions', 'Test Data', 'Test Steps', 'Expected Result', 'Status',
  ];

  sheet.addRow(headers);

  // Style header
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  headerRow.height = 30;

  // Data rows
  testCases.forEach((tc) => {
    const row = sheet.addRow([
      tc.tcId, tc.module, tc.role, tc.testType, tc.description,
      tc.preconditions, tc.testData, tc.testSteps, tc.expectedResult, tc.status,
    ]);

    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };

      // Status column color
      if (colNumber === 10) {
        if (cell.value === 'PASS') {
          cell.font = { bold: true, color: { argb: 'FF006100' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
        } else if (cell.value === 'FAIL') {
          cell.font = { bold: true, color: { argb: 'FF9C0006' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
        } else {
          cell.font = { bold: true, color: { argb: 'FF7F6000' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
        }
      }

      // Test type color
      if (colNumber === 4) {
        if (cell.value === 'Positive') {
          cell.font = { color: { argb: 'FF006100' } };
        } else {
          cell.font = { color: { argb: 'FF9C0006' } };
        }
      }
    });

    row.height = 80;
  });

  // Column widths
  sheet.getColumn(1).width = 18;   // TC ID
  sheet.getColumn(2).width = 28;   // Module
  sheet.getColumn(3).width = 22;   // Role
  sheet.getColumn(4).width = 12;   // Test Type
  sheet.getColumn(5).width = 45;   // Description
  sheet.getColumn(6).width = 35;   // Preconditions
  sheet.getColumn(7).width = 35;   // Test Data
  sheet.getColumn(8).width = 55;   // Test Steps
  sheet.getColumn(9).width = 45;   // Expected Result
  sheet.getColumn(10).width = 10;  // Status

  // Save file
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filePath = path.join(reportsDir, `Role_Creation_Report_${timestamp}.xlsx`);

  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Role Creation Report generated: ${filePath}`);
}

generateRoleReport().catch(console.error);
