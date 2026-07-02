const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'generateFinalMasterReport.ts');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

const naIds = new Set([
  'TC_AGG_UPD_E2E_001','TC_AGG_UPD_NEG_001','TC_AGG_UPD_NEG_002','TC_AGG_UPD_NEG_003',
  'TC_AGG_UPD_NEG_004','TC_AGG_UPD_NEG_005','TC_AGG_UPD_NEG_006','TC_AGG_UPD_NEG_007',
  'TC_AGG_UPD_NEG_008','TC_AGG_UPD_NEG_009','TC_AGG_UPD_NEG_010',
]);
const failIds = new Set([
  'TC_TILL_009','TC_TILL_010','TC_RPT_NEG_002','TC_RPT_NEG_003',
]);

const out = lines.map(line => {
  const m = line.match(/tcId:'(TC_[^']+)'/);
  if (!m) return line;
  const id = m[1];
  if (naIds.has(id))   return line.replace("status:'PASS'", "status:'N/A'");
  if (failIds.has(id)) return line.replace("status:'PASS'", "status:'FAIL'");
  return line;
});

fs.writeFileSync(filePath, out.join('\n'), 'utf8');
console.log('Status fixes applied.');
