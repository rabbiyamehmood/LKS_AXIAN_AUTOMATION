import { expect, Page } from '@playwright/test';
import { LoginPage } from './LoginPage';

export class MDRProfilePage {
  constructor(readonly page: Page) {}

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigateToMDRProfileList() {
    await this.page.getByRole('button', { name: 'Merchant Onboarding' }).click();
    await this.page.getByRole('link', { name: 'MDR Profile List' }).click();
    await expect(this.page.getByRole('button', { name: 'MDR Profile Add' })).toBeVisible({ timeout: 15_000 });
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async createProfile(data: {
    name: string;
    description: string;
    merchantCategory: string;
    paymentMethod: string;
    mdrValue: number;
    minimumAmount: number;
    maximumAmount: number;
  }) {
    await this.page.getByRole('button', { name: 'MDR Profile Add' }).click();
    await expect(this.page.getByRole('textbox', { name: 'Enter profile name' })).toBeVisible({ timeout: 10_000 });

    await this.page.getByRole('textbox', { name: 'Enter profile name' }).fill(data.name);
    await this.page.getByRole('textbox', { name: 'Description' }).fill(data.description);

    await this.page.getByRole('button', { name: 'Merchant Category*' }).click();
    await this.page.getByRole('option', { name: data.merchantCategory }).click();

    await this.page.getByRole('button', { name: 'Payment Method*' }).click();
    await this.page.getByText(data.paymentMethod, { exact: true }).click();

    await this.page.getByRole('button', { name: 'Add Rule' }).click();
    await this.page.getByRole('textbox', { name: 'Enter mdr value' }).fill(String(data.mdrValue));
    await this.page.getByRole('textbox', { name: 'Enter minimum amount' }).fill(String(data.minimumAmount));
    await this.page.getByRole('textbox', { name: 'Enter maximum amount' }).fill(String(data.maximumAmount));
    await this.page.getByRole('button', { name: 'Add', exact: true }).click();

    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.getByText('Processed OK Process ID:')).toBeVisible({ timeout: 15_000 });
    await this.page.getByRole('button', { name: 'Close toast' }).click();
  }

  // ── Checker review ────────────────────────────────────────────────────────

  async checkerReview(
    loginPage: LoginPage,
    requestType: 'MDR PROFILE CREATION' | 'MDR PROFILE UPDATE',
    action: 'Approve' | 'Reject',
    comment: string
  ) {
    await loginPage.navigate();
    await loginPage.loginAsLabeshChecker();
    await expect(this.page).not.toHaveURL(/\/login/, { timeout: 15_000 });

    await this.page.getByRole('button', { name: 'Inbox' }).click();
    await this.page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(this.page.getByText('Request Type')).toBeVisible({ timeout: 10_000 });

    await this.page.getByRole('cell', { name: requestType }).first().click();
    await this.page.getByRole('button', { name: 'Review' }).first().click();

    await this.page.getByRole('button', { name: action }).click();
    await this.page.getByRole('textbox', { name: 'Comments *' }).fill(comment);
    await this.page.getByRole('button', { name: 'Confirm' }).click();

    const toastText = action === 'Approve' ? 'Process approved successfully' : 'Process rejected successfully';
    await expect(this.page.getByText(toastText)).toBeVisible({ timeout: 15_000 });
    await this.page.getByRole('button', { name: 'Close toast' }).click();
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async logout() {
    await this.page.getByRole('button', { name: /labesh/i }).first().click();
    await this.page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(this.page).toHaveURL(/\/login/, { timeout: 15_000 });
  }

  // ── Filter helpers ────────────────────────────────────────────────────────

  async openFilterPanel() {
    await this.page.getByRole('button', { name: 'Filter' }).click();
    await expect(
      this.page.getByPlaceholder('Search by profile name or description')
    ).toBeVisible({ timeout: 10_000 });
  }

  async filterByProfileName(name: string) {
    await this.page.getByPlaceholder('Search by profile name or description').fill(name);
    await this.page.getByRole('button', { name: 'Apply Filters' }).click();
    await this.page.waitForTimeout(800);
  }

  async filterByStatus(status: string) {
    await this.page.getByRole('combobox').filter({ hasText: 'Select status' }).click();
    await this.page.getByText(status, { exact: true }).click();
    await this.page.getByRole('button', { name: 'Apply Filters' }).click();
    await this.page.waitForTimeout(800);
  }

  async filterByDateRange(fromDate: string, toDate: string) {
    await this.page.getByRole('textbox', { name: 'From Date' }).fill(fromDate);
    await this.page.getByRole('textbox', { name: 'To Date' }).fill(toDate);
    await this.page.getByRole('button', { name: 'Apply Filters' }).click();
    await this.page.waitForTimeout(800);
  }

  async clickQuickSelect(option: 'Today' | 'Last 7 days' | 'This month' | 'Last 30 days') {
    await this.page.getByRole('button', { name: option, exact: true }).click();
    await this.page.waitForTimeout(800);
  }

  async resetFilters() {
    await this.page.getByRole('button', { name: 'Reset' }).click();
    await this.page.waitForTimeout(600);
  }

  async assertTableVisible() {
    await expect(this.page.getByRole('table')).toBeVisible({ timeout: 15_000 });
  }

  async assertNoDataFound() {
    await expect(
      this.page.getByText(/no data found|no records/i).first()
    ).toBeVisible({ timeout: 10_000 });
  }

  async assertProfileNameInputEmpty() {
    await expect(
      this.page.getByPlaceholder('Search by profile name or description')
    ).toHaveValue('');
  }
}
