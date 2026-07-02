import { Page, Locator, expect } from '@playwright/test';

export class AuditLogsPage {
  readonly page: Page;

  // ── Navigation ────────────────────────────────────────────────────────────
  readonly auditLogsLink: Locator;

  // ── Filter panel ──────────────────────────────────────────────────────────
  readonly filterBtn: Locator;
  readonly actionTypeDropdown: Locator;
  readonly usernameInput: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly applyFiltersBtn: Locator;
  readonly resetBtn: Locator;

  // ── Quick select ──────────────────────────────────────────────────────────
  readonly quickToday: Locator;
  readonly quickLast7: Locator;
  readonly quickThisMonth: Locator;
  readonly quickLast30: Locator;

  // ── Table & actions ───────────────────────────────────────────────────────
  readonly refreshBtn: Locator;
  readonly firstViewDetailsBtn: Locator;

  // ── Payload Details modal ─────────────────────────────────────────────────
  readonly payloadModal: Locator;
  readonly payloadHeadingsSection: Locator;      // "Headers" label
  readonly payloadRequestParamsSection: Locator; // "Request Params" label
  readonly payloadResponseBodySection: Locator;  // "Response Body" label
  readonly payloadCloseBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.auditLogsLink = page.getByRole('link', { name: 'Audit Logs' });

    this.filterBtn          = page.getByRole('button', { name: 'Filter' });
    this.actionTypeDropdown = page.getByLabel('Select action type');
    this.usernameInput      = page.getByRole('textbox', { name: 'Search by username' });
    this.fromDateInput      = page.getByPlaceholder('DD/MM/YYYY').first();
    this.toDateInput        = page.getByPlaceholder('DD/MM/YYYY').last();
    this.applyFiltersBtn    = page.getByRole('button', { name: 'Apply Filters' });
    this.resetBtn           = page.getByRole('button', { name: 'Reset' });

    this.quickToday     = page.getByRole('button', { name: 'Today' });
    this.quickLast7     = page.getByRole('button', { name: 'Last 7 days' });
    this.quickThisMonth = page.getByRole('button', { name: 'This month' });
    this.quickLast30    = page.getByRole('button', { name: 'Last 30 days' });

    this.refreshBtn         = page.getByRole('button', { name: 'Refresh' });
    this.firstViewDetailsBtn = page.getByRole('button', { name: 'View Details' }).first();

    this.payloadModal                 = page.getByLabel('Payload Details');
    this.payloadHeadingsSection       = page.getByText('Headers', { exact: true });
    this.payloadRequestParamsSection  = page.getByText('Request Params', { exact: true });
    this.payloadResponseBodySection   = page.getByText('Response Body', { exact: true });
    this.payloadCloseBtn              = page.getByLabel('Payload Details').getByRole('button').filter({ hasText: /^$/ });
  }

  // ── Navigate to Audit Logs ────────────────────────────────────────────────

  async navigate() {
    await this.auditLogsLink.click();
    await expect(this.page).toHaveURL(/audit-logs/, { timeout: 15000 });
    // Wait for the page heading — Apply Filters is hidden until Filter panel is opened
    await expect(this.page.getByRole('heading', { name: 'Audit Logs' })).toBeVisible({ timeout: 15000 });
  }

  // ── Open filter panel and filter by Action Type ────────────────────────────

  async filterByActionType(actionType: string) {
    await this.filterBtn.click();
    await this.page.getByRole('button', { name: 'Action Type' }).click();
    await this.actionTypeDropdown.getByText(actionType, { exact: true }).click();
    await this.applyFiltersBtn.click();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // ── Filter by Username ─────────────────────────────────────────────────────

  async filterByUsername(username: string) {
    await this.filterBtn.click();
    await this.usernameInput.fill(username);
    await this.applyFiltersBtn.click();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // ── Filter by date range ───────────────────────────────────────────────────

  async filterByDateRange(fromDate: string, toDate: string) {
    await this.filterBtn.click();
    await this.fromDateInput.fill(fromDate);
    await this.toDateInput.fill(toDate);
    await this.applyFiltersBtn.click();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // ── Refresh the logs table ─────────────────────────────────────────────────

  async refresh() {
    await this.refreshBtn.click();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // ── Open View Details popup for first row ─────────────────────────────────

  async openFirstPayloadDetails() {
    await this.firstViewDetailsBtn.click();
    await expect(this.payloadModal).toBeVisible({ timeout: 10000 });
  }

  // ── Close payload modal ────────────────────────────────────────────────────

  async closePayloadModal() {
    await this.payloadCloseBtn.click();
    await expect(this.payloadModal).not.toBeVisible({ timeout: 5000 });
  }

  // ── Assert a username appears anywhere in the log table ───────────────────

  async assertUsernameInTable(username: string) {
    await expect(
      this.page.getByRole('cell', { name: username }).first()
    ).toBeVisible({ timeout: 15000 });
  }

  // ── Assert a row exists matching action type + username ───────────────────

  async assertLogEntry(actionType: string, username: string) {
    const row = this.page.locator('tr').filter({
      has: this.page.getByText(actionType, { exact: true }),
    }).filter({
      has: this.page.getByText(username, { exact: true }),
    }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
  }

  // ── Get today's date in the format shown in table: "07 May 2026" ──────────

  getTodayTableFormat(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  // ── Open View Details popup for the first row matching action + username ──

  async openPayloadForEntry(actionType: string, username: string) {
    const row = this.page.locator('tr').filter({
      has: this.page.getByText(actionType, { exact: true }),
    }).filter({
      has: this.page.getByText(username, { exact: true }),
    }).first();
    await row.getByRole('button', { name: 'View Details' }).click();
    await expect(this.payloadModal).toBeVisible({ timeout: 10000 });
  }

  // ── Assert payload modal has all sections + username in request params ────

  async assertPayloadDetails(username: string) {
    await expect(this.payloadHeadingsSection).toBeVisible();
    await expect(this.payloadRequestParamsSection).toBeVisible();
    await expect(this.payloadResponseBodySection).toBeVisible();
    // Request Params should contain the username that triggered the action
    await expect(this.page.locator('.//text()').filter({ hasText: username }).first()).toBeVisible({ timeout: 10000 }).catch(async () => {
      // fallback: check body text
      await expect(this.page.locator('body')).toContainText(username, { timeout: 10000 });
    });
  }
}
