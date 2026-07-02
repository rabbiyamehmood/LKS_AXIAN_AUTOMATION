import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export interface TestResult {
  testName: string;
  module: string;
  role: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration?: string;
  errorMessage?: string;
  timestamp: string;
}

export async function exportResultsToExcel(results: TestResult[], fileName = 'test-results'): Promise<string> {
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Test Results');

  sheet.columns = [
    { header: 'Test Name', key: 'testName', width: 45 },
    { header: 'Module', key: 'module', width: 20 },
    { header: 'Role', key: 'role', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration', key: 'duration', width: 14 },
    { header: 'Error Message', key: 'errorMessage', width: 50 },
    { header: 'Timestamp', key: 'timestamp', width: 22 },
  ];

  // Style header row
  sheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E4057' } };
    cell.alignment = { horizontal: 'center' };
  });

  results.forEach(result => {
    const row = sheet.addRow(result);
    const statusCell = row.getCell('status');
    if (result.status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
    } else if (result.status === 'FAIL') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      statusCell.font = { color: { argb: 'FFFFFFFF' } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
    }
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(reportsDir, `${fileName}-${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log(`\n✅ Excel report saved: ${filePath}`);
  return filePath;
}
