import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

type TestType = 'Positive' | 'Negative';
type Status = 'PASS' | 'FAIL' | 'N/A';

interface LimitProfileTC {
  tcId: string;
  module: string;
  feature: string;
  testType: TestType;
  description: string;
  preconditions: string;
  testData: string;
  testSteps: string;
  expectedResult: string;
  status: Status;
}

const testCases: LimitProfileTC[] = [
  {
    tcId: 'TC_LIMIT_001',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    testType: 'Positive',
    description: 'Create limit profile and checker approves creation request',
    preconditions: 'Maker and Checker users are active and can login to MMP.',
    testData: 'Profile Name: Auto unique value, Description: test description, Rule: OUTGOING + AMOUNT + Daily + Min 10 + Max 50 + Currency TZS',
    testSteps: '1. Login as Maker\n2. Navigate to Merchant Onboarding > Limit Profile List\n3. Click Limit Profile Add\n4. Enter profile details\n5. Add rule with Transaction Type OUTGOING, Limit Unit AMOUNT, Reset Cycle Daily, min/max amount, currency TZS\n6. Click Save\n7. Logout Maker\n8. Login as Checker\n9. Open Inbox > Pending Processes\n10. Review LIMIT DEFINITION CREATION\n11. Approve with comment and confirm',
    expectedResult: 'Profile creation process is submitted successfully and checker approval is completed successfully.',
    status: 'N/A',
  },
  {
    tcId: 'TC_LIMIT_002',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    testType: 'Positive',
    description: 'View limit profile details after successful checker approval',
    preconditions: 'A limit profile is created by Maker and approved by Checker.',
    testData: 'Previously created approved profile',
    testSteps: '1. Login as Maker\n2. Navigate to Merchant Onboarding > Limit Profile List\n3. Click View on first profile\n4. Verify View Limit Profile page opens\n5. Click Go Back',
    expectedResult: 'View details screen opens correctly and user can return to list without error.',
    status: 'N/A',
  },
  {
    tcId: 'TC_LIMIT_003',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    testType: 'Positive',
    description: 'Update existing limit profile and checker approves update request',
    preconditions: 'A limit profile already exists and is in state that allows update submission.',
    testData: 'Updated Profile Name: Auto unique value, Updated Rule: Min 50, Max 500',
    testSteps: '1. Login as Maker\n2. Navigate to Merchant Onboarding > Limit Profile List\n3. Click Edit on profile\n4. Update profile name\n5. Edit first rule and set minimum and maximum amounts\n6. Click Update to submit\n7. Logout Maker\n8. Login as Checker\n9. Open Inbox > Pending Processes\n10. Review LIMIT DEFINITION UPDATE\n11. Approve with comment and confirm',
    expectedResult: 'Profile update process is submitted and approved successfully by checker.',
    status: 'N/A',
  },
  {
    tcId: 'TC_LIMIT_004',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    testType: 'Negative',
    description: 'Checker rejects limit profile update and maker rejects maker-pending process',
    preconditions: 'A limit profile update request is available in checker pending queue.',
    testData: 'Checker Reject Comment: reject update, Maker Reject Comment: reject approve by maker',
    testSteps: '1. Login as Checker\n2. Navigate to Inbox > Pending Processes\n3. Review LIMIT DEFINITION UPDATE\n4. Reject with comment and confirm\n5. Logout Checker\n6. Login as Maker\n7. Navigate to Inbox > Maker Pending Process\n8. Review LIMIT DEFINITION UPDATE\n9. Reject with comment and confirm',
    expectedResult: 'Update request is rejected by checker and corresponding maker-pending item is also rejected successfully.',
    status: 'N/A',
  },
];

async function generateLimitProfileReport() {
  const wb = new ExcelJS.Workbook();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const ws = wb.addWorksheet('Test Cases');
  ws.columns = [
    { header: 'TC ID', key: 'tcId', width: 16 },
    { header: 'Module', key: 'module', width: 24 },
    { header: 'Feature', key: 'feature', width: 20 },
    { header: 'Test Type', key: 'testType', width: 12 },
    { header: 'Description', key: 'description', width: 45 },
    { header: 'Preconditions', key: 'preconditions', width: 42 },
    { header: 'Test Data', key: 'testData', width: 46 },
    { header: 'Test Steps', key: 'testSteps', width: 65 },
    { header: 'Expected Result', key: 'expectedResult', width: 50 },
    { header: 'Status', key: 'status', width: 10 },
  ];

  const header = ws.getRow(1);
  header.height = 28;
  header.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  testCases.forEach((tc, index) => {
    const row = ws.addRow(tc);
    row.height = 82;
    const bgColor = index % 2 === 0 ? 'FFF4F7FB' : 'FFFFFFFF';

    row.eachCell((cell, col) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      if (col === 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = tc.testType === 'Positive'
          ? { bold: true, color: { argb: 'FF008A1E' } }
          : { bold: true, color: { argb: 'FFB00020' } };
      }

      if (col === 10) {
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

  const summary = wb.addWorksheet('Summary');
  const positive = testCases.filter(tc => tc.testType === 'Positive').length;
  const negative = testCases.filter(tc => tc.testType === 'Negative').length;
  const pass = testCases.filter(tc => tc.status === 'PASS').length;
  const fail = testCases.filter(tc => tc.status === 'FAIL').length;
  const na = testCases.filter(tc => tc.status === 'N/A').length;

  [
    ['Module', 'Merchant Onboarding - Limit Profile'],
    ['Generated On', new Date().toLocaleString()],
    ['Total Test Cases', testCases.length],
    ['Positive Cases', positive],
    ['Negative Cases', negative],
    ['', ''],
    ['PASS', pass],
    ['FAIL', fail],
    ['N/A', na],
  ].forEach(item => {
    const row = summary.addRow(item);
    row.getCell(1).font = { bold: true };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EFF7' } };
    [1, 2].forEach(c => {
      row.getCell(c).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  summary.getColumn(1).width = 22;
  summary.getColumn(2).width = 46;

  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filePath = path.join(reportsDir, `Limit_Profile_TestCases_${timestamp}.xlsx`);
  await wb.xlsx.writeFile(filePath);
  console.log(`Report saved: ${filePath}`);
}

generateLimitProfileReport().catch(err => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
