import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import http from 'http';

function startServer(reportDir: string, port: number): http.Server {
  const server = http.createServer((req, res) => {
    let filePath = path.join(reportDir, req.url === '/' ? 'index.html' : req.url!);
    if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(filePath);
    const mime: Record<string, string> = {
      '.html': 'text/html', '.js': 'application/javascript',
      '.css': 'text/css', '.json': 'application/json',
      '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
    };
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  server.listen(port);
  return server;
}

async function generateAllurePDF() {
  const reportDir = path.resolve(__dirname, '..', 'allure-report');
  const reportsDir = path.resolve(__dirname, '..', 'reports');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPdf = path.join(reportsDir, `MMP_Allure_Report_${timestamp}.pdf`);

  if (!fs.existsSync(path.join(reportDir, 'index.html'))) {
    console.error('Allure report not found. Run: npx allure generate --output allure-report allure-results');
    process.exit(1);
  }
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const port = 9323;
  const server = startServer(reportDir, port);
  console.log(`Serving report on http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  console.log('Loading Allure report...');
  await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for Allure SPA to fully render — wait for any chart/stat element
  await page.waitForSelector('canvas, .app__content, [class*="summary"], [class*="stat"], [class*="chart"]', { timeout: 20000 }).catch(() => {
    console.log('Waiting extra time for SPA to render...');
  });
  await page.waitForTimeout(6000);

  console.log('Generating PDF...');
  await page.pdf({
    path: outputPdf,
    format: 'A3',
    printBackground: true,
    margin: { top: '20mm', bottom: '15mm', left: '10mm', right: '10mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:10px;width:100%;text-align:center;color:#444;font-family:sans-serif;padding-top:5px;">MMP Automation Testing — Allure Report</div>`,
    footerTemplate: `<div style="font-size:9px;width:100%;text-align:center;color:#888;font-family:sans-serif;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
  });

  await browser.close();
  server.close();
  console.log('PDF saved:', outputPdf);
}

generateAllurePDF().catch(err => { console.error(err); process.exit(1); });
