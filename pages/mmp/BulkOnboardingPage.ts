import { Page, Locator, expect } from '@playwright/test';

export class BulkOnboardingPage {
  readonly page: Page;

  // ── Navigation ────────────────────────────────────────────────────────────
  readonly bulkOperationsBtn: Locator;
  readonly bulkMerchantOnboardingLink: Locator;
  readonly onboardingHistoryLink: Locator;

  // ── Upload form ───────────────────────────────────────────────────────────
  readonly fileDropZone: Locator;
  readonly fileInput: Locator;
  readonly merchantTypeBtn: Locator;
  readonly submitBtn: Locator;
  readonly successToast: Locator;
  readonly closeToastBtn: Locator;

  // ── Onboarding History page ───────────────────────────────────────────────
  readonly historyHeading: Locator;
  readonly refreshBtn: Locator;
  readonly filterBtn: Locator;
  readonly resetBtn: Locator;
  readonly applyFiltersBtn: Locator;

  // ── History filters ───────────────────────────────────────────────────────
  readonly fileNameInput: Locator;
  readonly statusDropdown: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly quickSelectToday: Locator;
  readonly quickSelectLast7Days: Locator;
  readonly quickSelectThisMonth: Locator;
  readonly quickSelectLast30Days: Locator;

  // ── View Details modal ────────────────────────────────────────────────────
  readonly viewDetailsBtn: Locator;
  readonly uploadDetailsHeading: Locator;
  readonly closeModalBtn: Locator;

  // ── Inbox / Checker ───────────────────────────────────────────────────────
  readonly inboxBtn: Locator;
  readonly pendingProcessesLink: Locator;
  readonly reviewBtn: Locator;
  readonly approveBtn: Locator;
  readonly rejectBtn: Locator;
  readonly commentsInput: Locator;
  readonly confirmBtn: Locator;
  readonly approvalSuccessToast: Locator;

  // ── Profile / Logout ──────────────────────────────────────────────────────
  readonly labeshProfileBtn: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.bulkOperationsBtn        = page.getByRole('button', { name: 'Bulk Operations' });
    this.bulkMerchantOnboardingLink = page.getByRole('link', { name: 'Bulk Merchant Onboarding' });
    this.onboardingHistoryLink    = page.getByRole('link', { name: 'Onboarding History' });

    this.fileDropZone             = page.getByRole('button', { name: 'Drag and drop your file here' });
    this.fileInput                = page.getByRole('button', { name: 'Drag and drop your file here' });
    this.merchantTypeBtn          = page.getByRole('button', { name: 'Merchant Type*' });
    this.submitBtn                = page.getByRole('button', { name: 'Submit Bulk Onboarding' });
    this.successToast             = page.getByText('Bulk merchant onboarding request submitted successfully');
    this.closeToastBtn            = page.getByRole('button', { name: 'Close toast' });

    this.historyHeading           = page.getByRole('heading', { name: 'Bulk Onboarding History' });
    this.refreshBtn               = page.getByRole('button', { name: 'Refresh' });
    this.filterBtn                = page.getByRole('button', { name: 'Filter' });
    this.resetBtn                 = page.getByRole('button', { name: 'Reset' });
    this.applyFiltersBtn          = page.getByRole('button', { name: 'Apply Filters' });

    this.fileNameInput            = page.getByRole('textbox', { name: 'Search by file name' });
    this.statusDropdown           = page.getByRole('button', { name: 'Status' });
    this.fromDateInput            = page.getByLabel('From Date');
    this.toDateInput              = page.getByLabel('To Date');
    this.quickSelectToday         = page.getByRole('button', { name: 'Today' });
    this.quickSelectLast7Days     = page.getByRole('button', { name: 'Last 7 days' });
    this.quickSelectThisMonth     = page.getByRole('button', { name: 'This month' });
    this.quickSelectLast30Days    = page.getByRole('button', { name: 'Last 30 days' });

    this.viewDetailsBtn           = page.getByRole('button', { name: 'View Details' }).first();
    this.uploadDetailsHeading     = page.getByRole('heading', { name: 'Upload Details' });
    this.closeModalBtn            = page.getByLabel('Upload Details').getByRole('button').filter({ hasText: /^$/ });

    this.inboxBtn                 = page.getByRole('button', { name: 'Inbox' });
    this.pendingProcessesLink     = page.getByRole('link', { name: 'Pending Processes' });
    this.reviewBtn                = page.getByRole('button', { name: 'Review' }).first();
    this.approveBtn               = page.getByRole('button', { name: 'Approve' });
    this.rejectBtn                = page.getByRole('button', { name: 'Reject' });
    this.commentsInput            = page.getByRole('textbox', { name: 'Comments *' });
    this.confirmBtn               = page.getByRole('button', { name: 'Confirm' });
    this.approvalSuccessToast     = page.getByText('Bulk onboarding process');

    this.labeshProfileBtn         = page.getByRole('button', { name: 'L Labesh' });
    this.logoutBtn                = page.getByRole('banner').getByRole('button', { name: 'Logout' });
  }

  // ── Navigate to Bulk Merchant Onboarding ──────────────────────────────────
  async navigateToBulkOnboarding() {
    await this.bulkOperationsBtn.click();
    await this.bulkMerchantOnboardingLink.click();
    await expect(this.fileDropZone).toBeVisible({ timeout: 10000 });
  }

  // ── Navigate to Onboarding History ───────────────────────────────────────
  async navigateToOnboardingHistory() {
    await this.bulkOperationsBtn.click();
    await this.onboardingHistoryLink.click();
    await expect(this.historyHeading).toBeVisible({ timeout: 10000 });
  }

  // ── Upload file and select merchant type ─────────────────────────────────
  async uploadFile(filePath: string, merchantType: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.merchantTypeBtn.click();
    await this.page.getByText(merchantType, { exact: true }).click();
  }

  // ── Submit and assert success toast ──────────────────────────────────────
  async submitAndAssertSuccess() {
    await this.submitBtn.click();
    await expect(this.successToast).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Wait for status in history table (polls with Refresh) ─────────────────
  async waitForStatus(status: string, maxRetries = 12, intervalMs = 30000) {
    for (let i = 0; i < maxRetries; i++) {
      const statusCell = this.page.getByRole('table').getByText(status).first();
      if (await statusCell.isVisible()) return;
      await this.refreshBtn.click();
      await this.page.waitForTimeout(intervalMs);
    }
    throw new Error(`Status "${status}" not reached after ${maxRetries} refreshes`);
  }

  // ── Open View Details modal and assert merchants listed ───────────────────
  async openViewDetailsAndAssert() {
    await this.viewDetailsBtn.click();
    await expect(this.uploadDetailsHeading).toBeVisible({ timeout: 10000 });
  }

  // ── Close Upload Details modal ────────────────────────────────────────────
  async closeModal() {
    await this.closeModalBtn.click();
  }

  // ── Open Filter panel ────────────────────────────────────────────────────
  async openFilterPanel() {
    await this.filterBtn.click();
  }

  // ── Apply status filter ──────────────────────────────────────────────────
  async filterByStatus(status: string) {
    await this.filterBtn.click();
    await this.statusDropdown.click();
    await this.page.getByLabel('Select status').getByText(status).click();
    await this.applyFiltersBtn.click();
  }

  // ── Reset filters ─────────────────────────────────────────────────────────
  async resetFilters() {
    await this.resetBtn.click();
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async logout() {
    await this.labeshProfileBtn.click();
    await this.logoutBtn.click();
  }

  // ── Approve from Pending Processes (LabeshChecker) ────────────────────────
  async approveFromPendingProcesses(comment: string) {
    await this.inboxBtn.click();
    await this.pendingProcessesLink.click();
    await expect(
      this.page.getByRole('cell', { name: 'BULK MERCHANT ONBOARDING' }).first()
    ).toBeVisible({ timeout: 15000 });
    await this.reviewBtn.click();
    await this.approveBtn.click();
    await this.commentsInput.fill(comment);
    await this.confirmBtn.click();
    await expect(this.approvalSuccessToast).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Reject from Pending Processes (LabeshChecker) ────────────────────────
  async rejectFromPendingProcesses(comment: string) {
    await this.inboxBtn.click();
    await this.pendingProcessesLink.click();
    await expect(
      this.page.getByRole('cell', { name: 'BULK MERCHANT ONBOARDING' }).first()
    ).toBeVisible({ timeout: 15000 });
    await this.reviewBtn.click();
    await this.rejectBtn.click();
    await this.commentsInput.fill(comment);
    await this.confirmBtn.click();
  }
}
