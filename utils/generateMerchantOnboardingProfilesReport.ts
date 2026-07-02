import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

type TestType = 'Positive' | 'Negative';
type Status = 'PASS' | 'FAIL' | 'N/A';

interface ProfileTC {
  tcId: string;
  module: string;
  feature: string;
  flow: string;
  testType: TestType;
  description: string;
  preconditions: string;
  testData: string;
  testSteps: string;
  expectedResult: string;
  status: Status;
}

const testCases: ProfileTC[] = [
  {
    tcId: 'TC_LIMIT_001',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    flow: 'Create + Checker Approve',
    testType: 'Positive',
    description: 'Maker creates limit profile and Checker approves LIMIT DEFINITION CREATION.',
    preconditions: 'Maker and Checker users are active and can login.',
    testData: 'Profile Name: auto limit profile, Description: test description, Rule: OUTGOING + AMOUNT + Daily + Min 10 + Max 50 + TZS, Checker Comment: approved',
    testSteps: '1. Login as Maker\n2. Go to Merchant Onboarding > Limit Profile List\n3. Click Limit Profile Add and fill profile details\n4. Click Add Rule and fill transaction type, unit, reset cycle, min/max amount, currency\n5. Click Add then Save\n6. Verify Processed OK toast\n7. Logout Maker\n8. Login as Checker\n9. Go to Inbox > Pending Processes\n10. Open LIMIT DEFINITION CREATION row with Review\n11. Click Approve, enter comment, Confirm',
    expectedResult: 'Creation request is submitted and approved successfully.',
    status: 'N/A',
  },
  {
    tcId: 'TC_LIMIT_002',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    flow: 'View',
    testType: 'Positive',
    description: 'Maker opens View Limit Profile screen and returns back to list.',
    preconditions: 'At least one approved limit profile exists.',
    testData: 'N/A',
    testSteps: '1. Login as Maker\n2. Go to Merchant Onboarding > Limit Profile List\n3. Click View on first row\n4. Verify View Limit Profile heading\n5. Click Go Back',
    expectedResult: 'View screen opens correctly and Go Back returns to list.',
    status: 'N/A',
  },
  {
    tcId: 'TC_LIMIT_003',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    flow: 'Update + Checker Approve',
    testType: 'Positive',
    description: 'Maker updates limit profile and Checker approves LIMIT DEFINITION UPDATE.',
    preconditions: 'A limit profile exists and can be edited.',
    testData: 'Updated Name: auto limit profile update, Updated Rule: Min 50, Max 500, Checker Comment: update approve',
    testSteps: '1. Login as Maker\n2. Go to Limit Profile List and click Edit\n3. Update profile name\n4. Edit rule and set minimum and maximum amounts\n5. Click Update and verify Processed OK\n6. Logout Maker\n7. Login as Checker\n8. Go to Inbox > Pending Processes\n9. Open LIMIT DEFINITION UPDATE with Review\n10. Click Approve, enter comment, Confirm',
    expectedResult: 'Update request is approved successfully by Checker.',
    status: 'N/A',
  },
  {
    tcId: 'TC_LIMIT_004',
    module: 'Merchant Onboarding',
    feature: 'Limit Profile',
    flow: 'Update Reject + Maker Reject',
    testType: 'Negative',
    description: 'Checker rejects LIMIT DEFINITION UPDATE, then Maker rejects same item in Maker Pending Process.',
    preconditions: 'A limit profile update request is available in Checker queue.',
    testData: 'Checker Comment: reject update, Maker Comment: reject approve by maker',
    testSteps: '1. Login as Checker\n2. Go to Inbox > Pending Processes\n3. Open LIMIT DEFINITION UPDATE with Review\n4. Click Reject, enter comment, Confirm\n5. Logout Checker\n6. Login as Maker\n7. Go to Inbox > Maker Pending Process\n8. Open LIMIT DEFINITION UPDATE with Review\n9. Click Reject, enter comment, Confirm',
    expectedResult: 'Process is rejected by Checker and then rejected by Maker in Maker Pending Process.',
    status: 'N/A',
  },

  {
    tcId: 'TC_MDR_001',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    flow: 'Create + Checker Approve',
    testType: 'Positive',
    description: 'Maker creates MDR profile and Checker approves MDR PROFILE CREATION.',
    preconditions: 'Maker and Checker users are active and can login.',
    testData: 'Profile Name: auto mdr profile, Description: test description mdr profile, Merchant Category: Carpentry contractors, Payment Method: QR, Rule: MDR 10 + Min 10 + Max 100, Checker Comment: mdr approved',
    testSteps: '1. Login as Maker\n2. Go to Merchant Onboarding > MDR Profile List\n3. Click MDR Profile Add\n4. Fill profile name and description\n5. Select Merchant Category and Payment Method\n6. Click Add Rule and fill MDR value, minimum amount, maximum amount\n7. Click Add then Save\n8. Verify Processed OK toast\n9. Logout Maker\n10. Login as Checker\n11. Go to Inbox > Pending Processes\n12. Open MDR PROFILE CREATION with Review\n13. Click Approve, enter comment, Confirm',
    expectedResult: 'MDR profile creation is submitted and approved successfully.',
    status: 'N/A',
  },
  {
    tcId: 'TC_MDR_002',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    flow: 'Update + Checker Approve',
    testType: 'Positive',
    description: 'Maker updates MDR profile and Checker approves MDR PROFILE UPDATE.',
    preconditions: 'An MDR profile exists and can be edited.',
    testData: 'Updated Profile values and rule values, Checker Comment: mdr update approved',
    testSteps: '1. Login as Maker\n2. Go to MDR Profile List and click Edit\n3. Update profile fields/rule values\n4. Click Update and verify Processed OK\n5. Logout Maker\n6. Login as Checker\n7. Go to Inbox > Pending Processes\n8. Open MDR PROFILE UPDATE with Review\n9. Click Approve, enter comment, Confirm',
    expectedResult: 'MDR update request is approved successfully.',
    status: 'N/A',
  },
  {
    tcId: 'TC_MDR_003',
    module: 'Merchant Onboarding',
    feature: 'MDR Profile',
    flow: 'Update Reject + Maker Reject',
    testType: 'Negative',
    description: 'Checker rejects MDR PROFILE UPDATE, then Maker rejects corresponding maker-pending item.',
    preconditions: 'An MDR profile update request is available in Checker queue.',
    testData: 'Checker Comment: mdr update reject, Maker Comment: mdr reject acknowledged',
    testSteps: '1. Login as Checker\n2. Go to Inbox > Pending Processes\n3. Open MDR PROFILE UPDATE with Review\n4. Click Reject, enter comment, Confirm\n5. Logout Checker\n6. Login as Maker\n7. Go to Inbox > Maker Pending Process\n8. Open MDR PROFILE UPDATE with Review\n9. Click Reject, enter comment, Confirm',
    expectedResult: 'MDR update is rejected by Checker and then rejected by Maker in Maker Pending Process.',
    status: 'N/A',
  },

  {
    tcId: 'TC_TAX_001',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    flow: 'Create + Checker Approve',
    testType: 'Positive',
    description: 'Maker creates Tax profile and Checker approves TAX PROFILE CREATION.',
    preconditions: 'Maker and Checker users are active and can login.',
    testData: 'Profile Name: Auto tax profile, Region: Arusha, Rule: Tax 20 + Min 100 + Max 500, Checker Comment: tax profile approved',
    testSteps: '1. Login as Maker\n2. Go to Merchant Onboarding > Tax Profile List\n3. Click Tax Profile Add\n4. Fill profile name and select region\n5. Click Add Tax Rule and fill tax value, minimum amount, maximum amount\n6. Click Add then Save\n7. Verify Processed OK toast\n8. Logout Maker\n9. Login as Checker\n10. Go to Inbox > Pending Processes\n11. Open TAX PROFILE CREATION with Review\n12. Click Approve, enter comment, Confirm',
    expectedResult: 'Tax profile creation is submitted and approved successfully.',
    status: 'N/A',
  },
  {
    tcId: 'TC_TAX_002',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    flow: 'Update + Checker Approve',
    testType: 'Positive',
    description: 'Maker updates Tax profile and Checker approves TAX PROFILE UPDATE.',
    preconditions: 'A Tax profile exists and can be edited.',
    testData: 'Updated profile/rule values, Checker Comment: tax update approved',
    testSteps: '1. Login as Maker\n2. Go to Tax Profile List and click Edit\n3. Update tax profile details/rule\n4. Click Update and verify Processed OK\n5. Logout Maker\n6. Login as Checker\n7. Go to Inbox > Pending Processes\n8. Open TAX PROFILE UPDATE with Review\n9. Click Approve, enter comment, Confirm',
    expectedResult: 'Tax profile update request is approved successfully.',
    status: 'N/A',
  },
  {
    tcId: 'TC_TAX_003',
    module: 'Merchant Onboarding',
    feature: 'Tax Profile',
    flow: 'Update Reject + Maker Reject',
    testType: 'Negative',
    description: 'Checker rejects TAX PROFILE UPDATE, then Maker rejects corresponding maker-pending item.',
    preconditions: 'A Tax profile update request is available in Checker queue.',
    testData: 'Checker Comment: tax update reject, Maker Comment: tax reject acknowledged',
    testSteps: '1. Login as Checker\n2. Go to Inbox > Pending Processes\n3. Open TAX PROFILE UPDATE with Review\n4. Click Reject, enter comment, Confirm\n5. Logout Checker\n6. Login as Maker\n7. Go to Inbox > Maker Pending Process\n8. Open TAX PROFILE UPDATE with Review\n9. Click Reject, enter comment, Confirm',
    expectedResult: 'Tax update is rejected by Checker and then rejected by Maker in Maker Pending Process.',
    status: 'N/A',
  },
];

async function generateMerchantOnboardingProfilesReport() {
  const workbook = new ExcelJS.Workbook();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const ws = workbook.addWorksheet('Test Cases');
  ws.columns = [
    { header: 'TC ID', key: 'tcId', width: 16 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Feature', key: 'feature', width: 18 },
    { header: 'Flow', key: 'flow', width: 28 },
    { header: 'Test Type', key: 'testType', width: 12 },
    { header: 'Description', key: 'description', width: 48 },
    { header: 'Preconditions', key: 'preconditions', width: 40 },
    { header: 'Test Data', key: 'testData', width: 50 },
    { header: 'Test Steps', key: 'testSteps', width: 68 },
    { header: 'Expected Result', key: 'expectedResult', width: 54 },
    { header: 'Status', key: 'status', width: 10 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
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
    row.height = 88;
    const bg = index % 2 === 0 ? 'FFF4F7FB' : 'FFFFFFFF';

    row.eachCell((cell, col) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

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
  const pass = testCases.filter((t) => t.status === 'PASS').length;
  const fail = testCases.filter((t) => t.status === 'FAIL').length;
  const na = testCases.filter((t) => t.status === 'N/A').length;

  [
    ['Module', 'Merchant Onboarding - Profiles (Limit, MDR, Tax)'],
    ['Generated On', new Date().toLocaleString()],
    ['Total Test Cases', testCases.length],
    ['Positive Cases', positive],
    ['Negative Cases', negative],
    ['', ''],
    ['PASS', pass],
    ['FAIL', fail],
    ['N/A', na],
  ].forEach((item) => {
    const row = summary.addRow(item);
    row.getCell(1).font = { bold: true };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EFF7' } };
    [1, 2].forEach((c) => {
      row.getCell(c).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  summary.getColumn(1).width = 24;
  summary.getColumn(2).width = 58;

  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportFile = path.join(reportsDir, `Merchant_Onboarding_Profiles_TestCases_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(reportFile);
  console.log(`Report saved: ${reportFile}`);
}

generateMerchantOnboardingProfilesReport().catch((err) => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
