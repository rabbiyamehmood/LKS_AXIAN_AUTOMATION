import ExcelJS from 'exceljs';
import path    from 'path';
import fs      from 'fs';

interface TC {
  tcId:           string;
  testType:       'Positive' | 'Negative';
  description:    string;
  preconditions:  string;
  testData:       string;
  testSteps:      string;
  expectedResult: string;
  status:         'PASS' | 'FAIL' | 'N/A';
}

const testCases: TC[] = [
  {
    tcId:          'TC_INBOX_001',
    testType:      'Positive',
    description:   'Filter by Process ID shows matching record',
    preconditions: 'Labesh_Maker is logged in. Process ID 8318490 exists.',
    testData:      'Process ID: 8318490',
    testSteps:     '1. Login as Labesh_Maker\n2. Go to Inbox > Maker Pending Process\n3. Click Filters\n4. Enter Process ID: 8318490\n5. Click Apply Filters\n6. Assert cell with "8318490" is visible',
    expectedResult:'Table shows the record with Process ID 8318490.',
    status:        'PASS',
  },
  {
    tcId:          'TC_INBOX_002',
    testType:      'Positive',
    description:   'Filter by Request Type "Merchant Creation" shows matching records',
    preconditions: 'Labesh_Maker is logged in. MERCHANT CREATION processes exist.',
    testData:      'Request Type: Merchant Creation',
    testSteps:     '1. Login as Labesh_Maker\n2. Go to Inbox > Maker Pending Process\n3. Click Filters\n4. Select Request Type: Merchant Creation\n5. Click Apply Filters\n6. Assert "MERCHANT CREATION" cell is visible',
    expectedResult:'Table shows MERCHANT CREATION records.',
    status:        'PASS',
  },
  {
    tcId:          'TC_INBOX_003',
    testType:      'Positive',
    description:   'Filter by Date Range (yesterday to today) shows records in range',
    preconditions: 'Labesh_Maker is logged in. Processes exist in the last 2 days.',
    testData:      'From Date: yesterday (dynamic), To Date: today (dynamic)',
    testSteps:     '1. Login as Labesh_Maker\n2. Go to Inbox > Maker Pending Process\n3. Click Filters\n4. Select From Date: yesterday from calendar\n5. Select To Date: today from calendar\n6. Click Apply Filters\n7. Assert table is visible with records',
    expectedResult:'Table shows records created between yesterday and today.',
    status:        'PASS',
  },
  {
    tcId:          'TC_INBOX_004',
    testType:      'Positive',
    description:   'Reset Filters clears all applied filter values',
    preconditions: 'Labesh_Maker is logged in.',
    testData:      'Process ID: 8318490',
    testSteps:     '1. Login as Labesh_Maker\n2. Go to Inbox > Maker Pending Process\n3. Click Filters\n4. Enter Process ID: 8318490\n5. Click Apply Filters\n6. Assert matching record visible\n7. Click Reset\n8. Assert Process ID field is empty',
    expectedResult:'Process ID input is cleared after Reset.',
    status:        'PASS',
  },
  {
    tcId:          'TC_INBOX_NEG_001',
    testType:      'Negative',
    description:   'Filter by non-existent Process ID shows "No data found"',
    preconditions: 'Labesh_Maker is logged in.',
    testData:      'Process ID: 934343434343 (non-existent)',
    testSteps:     '1. Login as Labesh_Maker\n2. Go to Inbox > Maker Pending Process\n3. Click Filters\n4. Enter Process ID: 934343434343\n5. Click Apply Filters\n6. Assert "No data found" message is visible',
    expectedResult:'"No data found" message is displayed.',
    status:        'PASS',
  },
  {
    tcId:          'TC_INBOX_NEG_002',
    testType:      'Negative',
    description:   'From Date later than To Date shows validation error',
    preconditions: 'Labesh_Maker is logged in.',
    testData:      'From Date: 31/05/2026, To Date: 08/05/2026 (From > To)',
    testSteps:     '1. Login as Labesh_Maker\n2. Go to Inbox > Maker Pending Process\n3. Click Filters\n4. Select From Date: May 31 (future)\n5. Select To Date: May 8 (earlier than From Date)\n6. Click Apply Filters\n7. Assert "From Date cannot be later than To Date" error is visible',
    expectedResult:'"From Date cannot be later than To Date" validation message is shown.',
    status:        'PASS',
  },
  {
    tcId:          'TC_INBOX_005',
    testType:      'Positive',
    description:   'Filter by Request Type then Review record — action buttons (Go Back, Reject, Approve) are visible',
    preconditions: 'Labesh_Maker is logged in. At least one AGGREGATOR CREATION record exists in Maker Pending Process.',
    testData:      'Request Type: Aggregator Creation',
    testSteps:     '1. Login as Labesh_Maker\n2. Go to Inbox > Maker Pending Process\n3. Click Filters\n4. Select Request Type: Aggregator Creation\n5. Click Apply Filters\n6. Assert table is visible with at least one AGGREGATOR CREATION row\n7. Click Review on the first result\n8. Assert heading "Review Aggregator" is visible\n9. Assert "Go Back" button is visible\n10. Assert "Reject" button is visible\n11. Assert "Approve" button is visible\n12. Click Go Back\n13. Assert table is visible again (list restored)',
    expectedResult:'Review page opens after filter + Review click.\nGo Back, Reject, Approve buttons are all visible.\nGo Back returns the user to the filtered list.',
    status:        'N/A',
  },
];

async function generateReport() {
  const wb        = new ExcelJS.Workbook();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  // Sheet 1: Test Cases
  const ws = wb.addWorksheet('Test Cases');
  ws.columns = [
    { header: 'TC ID',           key: 'tcId',           width: 20 },
    { header: 'Test Type',       key: 'testType',       width: 12 },
    { header: 'Description',     key: 'description',    width: 52 },
    { header: 'Preconditions',   key: 'preconditions',  width: 40 },
    { header: 'Test Data',       key: 'testData',       width: 40 },
    { header: 'Test Steps',      key: 'testSteps',      width: 65 },
    { header: 'Expected Result', key: 'expectedResult', width: 50 },
    { header: 'Status',          key: 'status',         width: 12 },
  ];

  const hdr = ws.getRow(1);
  hdr.height = 30;
  hdr.eachCell(cell => {
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  testCases.forEach((tc, idx) => {
    const row = ws.addRow(tc);
    row.height = 75;
    const bg  = idx % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
    row.eachCell((cell, col) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border    = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if (col === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = tc.testType === 'Positive'
          ? { bold: true, color: { argb: 'FF00B050' } }
          : { bold: true, color: { argb: 'FFCC0000' } };
      }
      if (col === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tc.status === 'PASS' ? 'FF00B050' : 'FFFF0000' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      }
    });
  });

  // Sheet 2: Summary
  const sw   = wb.addWorksheet('Summary');
  const pass = testCases.filter(t => t.status === 'PASS').length;
  const fail = testCases.filter(t => t.status === 'FAIL').length;
  const pos  = testCases.filter(t => t.testType === 'Positive').length;
  const neg  = testCases.filter(t => t.testType === 'Negative').length;

  [
    ['Module',           'Inbox - Maker Pending Processes'],
    ['Report Generated', new Date().toLocaleString()],
    ['Total Test Cases', testCases.length],
    ['Positive Tests',   pos],
    ['Negative Tests',   neg],
    ['', ''],
    ['PASS',             pass],
    ['FAIL',             fail],
    ['Pass Rate',        `${((pass / testCases.length) * 100).toFixed(1)}%`],
  ].forEach(r => {
    const row = sw.addRow(r);
    row.getCell(1).font  = { bold: true };
    row.getCell(1).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EFF7' } };
    [1, 2].forEach(c => row.getCell(c).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } });
    if (r[0] === 'PASS') { row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } }; row.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } }; }
    if (r[0] === 'FAIL') { row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; row.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } }; }
  });
  sw.getColumn(1).width = 25;
  sw.getColumn(2).width = 40;

  // Save
  const dir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `Inbox_MakerPending_Report_${timestamp}.xlsx`);
  await wb.xlsx.writeFile(file);
  console.log(`Report saved: ${file}`);
}

generateReport().catch(err => { console.error(err); process.exit(1); });
