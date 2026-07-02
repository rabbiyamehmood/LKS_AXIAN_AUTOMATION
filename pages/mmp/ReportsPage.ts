import { Page, Locator, expect } from '@playwright/test';

export class ReportsPage {
  readonly page: Page;

  // ── Jasper Login ─────────────────────────────────────────────────────────────
  readonly jasperUserIdInput: Locator;
  readonly jasperPasswordInput: Locator;
  readonly jasperLoginBtn: Locator;

  // ── Report Panel ─────────────────────────────────────────────────────────────
  readonly reportsPanel: Locator;
  readonly closeReportBtn: Locator;
  readonly applyBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.jasperUserIdInput  = page.getByRole('textbox', { name: 'User ID:' });
    this.jasperPasswordInput = page.getByRole('textbox', { name: 'Password:' });
    this.jasperLoginBtn     = page.getByRole('button', { name: 'Login' });

    this.reportsPanel  = page.locator('#handler2');
    this.closeReportBtn = page.getByRole('button', { name: 'Close Report' });
    this.applyBtn      = page.getByRole('button', { name: 'Apply' });
  }

  // ── Jasper Login ─────────────────────────────────────────────────────────────

  async loginToJasper(userId: string, password: string) {
    await this.jasperUserIdInput.fill(userId);
    await this.jasperPasswordInput.fill(password);
    await this.jasperLoginBtn.click();
    await this.reportsPanel.waitFor({ state: 'visible', timeout: 30000 });
  }

  // ── Shared Helpers ────────────────────────────────────────────────────────────

  private async setFromDate(month: string, day: string) {
    await this.page
      .getByTitle('FROM_DATE. \nIf your parameter supports relative date expressions, you can enter ')
      .getByRole('button')
      .click();
    await this.page.getByLabel('Select month').selectOption(month);
    await this.page.getByRole('link', { name: day, exact: true }).click();
    await this.page.getByRole('button', { name: 'Close', exact: true }).click();
  }

  private async setFromDateCell(month: string, day: string) {
    await this.page
      .getByTitle('FROM_DATE. \nIf your parameter supports relative date expressions, you can enter ')
      .getByRole('button')
      .click();
    await this.page.getByLabel('Select month').selectOption(month);
    await this.page.getByRole('cell', { name: day, exact: true }).click();
    await this.page.getByRole('button', { name: 'Close', exact: true }).click();
  }

  private async setFromStartDate(month: string) {
    await this.page
      .getByTitle('STARTDATE. \nIf your parameter supports relative date expressions, you can enter ')
      .getByRole('button')
      .click();
    await this.page.getByLabel('Select month').selectOption(month);
    await this.page.getByRole('button', { name: 'Close', exact: true }).click();
  }

  private async setToDateNow() {
    await this.page
      .getByTitle('TO_DATE. \nIf your parameter supports relative date expressions, you can enter ex')
      .getByRole('button')
      .click();
    await this.page.getByRole('button', { name: 'Now' }).click();
    // Picker auto-closes after 'Now' — click Close only if still visible
    const closeBtn = this.page.getByRole('button', { name: 'Close', exact: true });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  private async setEndDateNow() {
    await this.page
      .getByTitle('ENDDATE. \nIf your parameter supports relative date expressions, you can enter ex')
      .getByRole('button')
      .click();
    await this.page.getByRole('button', { name: 'Now' }).click();
    // Picker auto-closes after 'Now' — click Close only if still visible
    const closeBtn = this.page.getByRole('button', { name: 'Close', exact: true });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  private getTodayString(): string {
    return new Date().toISOString().slice(0, 10); // e.g. "2026-05-07"
  }

  // ── Report 1: Transaction Summary Report ─────────────────────────────────────

  async runTransactionSummaryReport() {
    await this.reportsPanel.click();
    await this.page.getByLabel('Transaction_Summary_Report', { exact: true }).click();

    await this.setFromDate('3', '1');
    await this.setToDateNow();

    await this.applyBtn.click();
    await this.page.waitForLoadState('networkidle', { timeout: 60000 });

    // Assertions
    await expect(this.page.getByText('Merchant Transaction Summary')).toBeVisible({ timeout: 60000 });
    await expect(this.page.locator('body')).toContainText(this.getTodayString());
  }

  // ── Report 2: Transaction Detail Report ──────────────────────────────────────

  async runTransactionDetailReport() {
    await this.closeReportBtn.click();
    await this.page.getByLabel('Transaction_Detail_Report', { exact: true }).click();

    // Filters
    await this.page.getByRole('textbox', { name: 'MID' }).fill('000921773937631');
    await this.page.locator('#AGGREGATOR_NAME').getByText('Click to select item... ---').click();
    await this.page.getByText('AXIAN', { exact: true }).click();
    await this.page.locator('#STATUS').getByText('Click to select item... ---').click();
    await this.page.getByText('ALL').nth(3).click();

    await this.setFromDate('3', '1');
    await this.setToDateNow();

    await this.page.getByText('Click to select item... ---').click();
    await this.page.getByText('SEND_MONEY').click();

    await this.applyBtn.click();
    await this.page.waitForLoadState('networkidle', { timeout: 60000 });

    // Assertions
    await expect(this.page.getByText('Merchant Transaction Report')).toBeVisible({ timeout: 60000 });
    await expect(this.page.locator('body')).toContainText(this.getTodayString());
    await expect(this.page.locator('#JR_PAGE_ANCHOR_0_1').getByText('MID')).toBeVisible();
    await expect(this.page.getByText('000921773937631').first()).toBeVisible();
    await expect(this.page.getByText('Aggregator', { exact: true })).toBeVisible();
    await expect(this.page.getByText('AXIAN').nth(1)).toBeVisible();
    await expect(this.page.getByText('Category', { exact: true })).toBeVisible();
    await expect(this.page.getByText('SEND_MONEY').nth(1)).toBeVisible();
    await expect(this.page.getByText('Status', { exact: true })).toBeVisible();
    await expect(this.page.getByText('SUCCESS').first()).toBeVisible();
  }

  // ── Report 3: Pending Payments Report ────────────────────────────────────────

  async runPendingPaymentsReport() {
    await this.closeReportBtn.click();
    await this.page.getByLabel('Pending_Payments_Report', { exact: true }).click();

    await this.setFromDate('3', '1');
    await this.setToDateNow();

    await this.applyBtn.click();
    await this.page.waitForLoadState('networkidle', { timeout: 60000 });

    // Assertions
    await expect(this.page.getByText('Pending Amounts & Aging Report')).toBeVisible({ timeout: 60000 });
    await expect(this.page.locator('body')).toContainText(this.getTodayString());
    await expect(this.page.getByText('Pending Count')).toBeVisible();
  }

  // ── Report 4: Failed Payments Report ─────────────────────────────────────────

  async runFailedPaymentsReport() {
    await this.closeReportBtn.click();
    await this.page.getByLabel('Failed_Payments_Report', { exact: true }).click();

    await this.setFromDateCell('3', '1');
    await this.setToDateNow();

    // Filters — re-confirm defaults (ALL)
    await this.page.locator('#AGGREGATOR_NAME').getByText('Click to select item... ALL').click();
    await this.page.getByText('ALL').nth(4).click();
    await this.page.locator('#MERCHANT_NAME').getByText('Click to select item... ALL').click();
    await this.page.getByText('ALL').nth(5).click();

    await this.applyBtn.click();
    await this.page.waitForLoadState('networkidle', { timeout: 60000 });

    // Assertions
    await expect(this.page.getByText('Merchant Failure Analysis')).toBeVisible({ timeout: 60000 });
    await expect(this.page.locator('body')).toContainText(this.getTodayString());
  }

  // ── Report 5: Audit Logs Report ───────────────────────────────────────────────

  async runAuditLogsReport() {
    await this.closeReportBtn.click();
    await this.page.getByLabel('Audit Logs', { exact: true }).click();

    await this.setFromStartDate('3');
    await this.setEndDateNow();

    // Action type dropdown — select ALL
    await this.page.getByText('Click to select item... ALL').click();
    await this.page.getByRole('button', { name: 'Apply' }).click();
    await this.page.waitForLoadState('networkidle', { timeout: 60000 });

    // Assertions
    await expect(this.page.getByText('System Audit Log Report')).toBeVisible({ timeout: 60000 });
    await expect(this.page.locator('body')).toContainText(this.getTodayString());
  }

  // ── Report 6: Export Transaction Summary Report as PDF ───────────────────────

  async exportTransactionSummaryReport(): Promise<import('@playwright/test').Download> {
    // Navigate to Transaction Summary Report and run it first
    await this.reportsPanel.click();
    await this.page.getByLabel('Transaction_Summary_Report', { exact: true }).click();

    // Set FROM_DATE to 1st of current month
    await this.page
      .getByTitle('FROM_DATE. \nIf your parameter supports relative date expressions, you can enter ')
      .getByRole('button')
      .click();
    await this.page.getByRole('link', { name: '1', exact: true }).click();
    await this.page.getByRole('button', { name: 'Close', exact: true }).click();

    // Set TO_DATE to Now
    await this.setToDateNow();

    // Select AXIAN aggregator
    await this.page.locator('#AGGREGATOR_NAME').getByText('Click to select item... ALL').click();
    await this.page.getByText('AXIAN', { exact: true }).click();

    await this.applyBtn.click();
    await this.page.waitForLoadState('networkidle', { timeout: 60000 });

    // Assert report loaded before exporting
    await expect(this.page.getByText('Merchant Transaction Summary')).toBeVisible({ timeout: 60000 });

    // Trigger Export → PDF
    await this.page.getByRole('button', { name: 'Export' }).click();
    await this.page.getByRole('menuitem', { name: 'PDF Document (.pdf)' }).click();

    // Wait for download event
    const downloadPromise = this.page.waitForEvent('download', { timeout: 60000 });
    await this.page.getByText('Exporting...').click();
    const download = await downloadPromise;
    return download;
  }
}

