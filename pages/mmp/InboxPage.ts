import { Page, Locator, expect } from '@playwright/test';

export class InboxPage {
  readonly page: Page;

  // Navigation
  readonly inboxBtn: Locator;
  readonly pendingProcessesLink: Locator;

  // Pending processes table
  readonly aggregatorCreationCell: Locator;
  readonly reviewBtn: Locator;

  // Review modal
  readonly reviewHeading: Locator;
  readonly approveBtn: Locator;
  readonly rejectBtn: Locator;
  readonly commentsInput: Locator;
  readonly confirmBtn: Locator;

  // Feedback
  readonly approvedToast: Locator;
  readonly rejectedToast: Locator;
  readonly closeToastBtn: Locator;

  // Logout
  readonly userMenuBtn: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.inboxBtn              = page.getByRole('button', { name: 'Inbox' });
    this.pendingProcessesLink  = page.getByRole('link', { name: 'Pending Processes' });

    this.aggregatorCreationCell = page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first();
    this.reviewBtn              = page.getByRole('button', { name: 'Review' }).first();

    this.reviewHeading = page.getByRole('heading', { name: 'Review Aggregator' });
    this.approveBtn    = page.getByRole('button', { name: 'Approve' });
    this.rejectBtn     = page.getByRole('button', { name: 'Reject' });
    this.commentsInput = page.getByRole('textbox', { name: 'Comments *' });
    this.confirmBtn    = page.getByRole('button', { name: 'Confirm' });

    this.approvedToast = page.getByText('Process approved successfully');
    this.rejectedToast = page.getByText('Process rejected');
    this.closeToastBtn = page.getByRole('button', { name: 'Close toast' });

    this.userMenuBtn = page.getByRole('button', { name: /a admin/i });
    this.logoutBtn   = page.getByRole('banner').getByRole('button', { name: 'Logout' });
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  async navigateToPendingProcesses() {
    await this.inboxBtn.click();
    await this.pendingProcessesLink.click();
    await expect(this.aggregatorCreationCell).toBeVisible({ timeout: 15000 });
  }

  async openReview() {
    await this.aggregatorCreationCell.click();
    await this.reviewBtn.click();
    await expect(this.reviewHeading).toBeVisible();
  }

  // ── Approve flow ──────────────────────────────────────────────────────────────

  async approveAggregator(comment: string) {
    await this.approveBtn.click();
    await this.commentsInput.fill(comment);
    await this.confirmBtn.click();
    await expect(this.approvedToast).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Reject flow ───────────────────────────────────────────────────────────────

  async rejectAggregator(comment: string) {
    await this.rejectBtn.click();
    await this.commentsInput.fill(comment);
    await this.confirmBtn.click();
    await expect(this.rejectedToast).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  async assertNoPendingAggregatorCreation() {
    await expect(this.aggregatorCreationCell).not.toBeVisible();
  }

  // ── Logout ────────────────────────────────────────────────────────────────────

  async logout() {
    await this.userMenuBtn.click();
    await this.logoutBtn.click();
    await expect(this.page).toHaveURL(/\/login/);
  }
}
