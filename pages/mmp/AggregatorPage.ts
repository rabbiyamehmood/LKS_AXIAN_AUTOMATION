import { Page, Locator, expect } from '@playwright/test';

export class AggregatorPage {
  readonly page: Page;

  // Navigation
  readonly aggregatorManagementBtn: Locator;
  readonly aggregatorListLink: Locator;
  readonly addAggregatorBtn: Locator;

  // Form fields
  readonly nameInput: Locator;
  readonly contactPersonInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly qrAuthOption: Locator;
  readonly saveBtn: Locator;

  // Feedback
  readonly successToast: Locator;
  readonly closeToastBtn: Locator;

  // Validation errors
  readonly nameRequiredError: Locator;
  readonly contactPersonRequiredError: Locator;
  readonly emailInvalidError: Locator;
  readonly phoneRequiredError: Locator;
  readonly paymentMethodRequiredError: Locator;

  // Logout
  readonly userMenuBtn: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.aggregatorManagementBtn = page.getByRole('button', { name: 'Aggregator Management' });
    this.aggregatorListLink      = page.getByRole('link', { name: 'Aggregator List' });
    this.addAggregatorBtn        = page.getByRole('button', { name: 'Add Aggregator' });

    this.nameInput          = page.getByRole('textbox', { name: 'Enter aggregator name' });
    this.contactPersonInput = page.getByRole('textbox', { name: 'Enter contact person name' });
    this.emailInput         = page.getByRole('textbox', { name: 'Enter email address' });
    this.phoneInput         = page.getByRole('textbox', { name: 'Enter phone number' });
    this.qrAuthOption       = page.locator('#QR');
    this.saveBtn            = page.getByRole('button', { name: 'Save' });

    this.successToast = page.getByText('Processed OK');
    this.closeToastBtn = page.getByRole('button', { name: 'Close toast' });

    this.nameRequiredError = page.getByText('Aggregator name is required');
    this.contactPersonRequiredError = page.getByText('Contact person name is required');
    this.emailInvalidError = page.getByText('Invalid email format');
    this.phoneRequiredError = page.getByText('Phone number is required');
    this.paymentMethodRequiredError = page.getByText('At least one payment method must be selected');

    this.userMenuBtn = page.getByRole('button', { name: /a admin/i });
    this.logoutBtn   = page.getByRole('banner').getByRole('button', { name: 'Logout' });
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  async navigateToAggregatorList() {
    await this.aggregatorManagementBtn.click();
    await this.aggregatorListLink.click();
    await expect(this.addAggregatorBtn).toBeVisible();
  }

  async openAddAggregatorForm() {
    await this.addAggregatorBtn.click();
    await expect(this.nameInput).toBeVisible();
  }

  // ── Form interactions ─────────────────────────────────────────────────────────

  async fillAggregatorForm(data: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.contactPersonInput.fill(data.contactPerson);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.qrAuthOption.click();
  }

  async clearAndFillName(name: string) {
    await this.nameInput.clear();
    await this.nameInput.fill(name);
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  async assertSaveBtnDisabled() {
    await expect(this.saveBtn).toBeDisabled();
  }

  async assertSaveBtnEnabled() {
    await expect(this.saveBtn).toBeEnabled();
  }

  async assertSuccessToastVisible() {
    await expect(this.successToast).toBeVisible({ timeout: 15000 });
  }

  async assertStillOnForm() {
    await expect(this.nameInput).toBeVisible();
  }

  async assertFieldError(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  async saveAggregator() {
    await this.saveBtn.click();
  }

  async closeSuccessToast() {
    await this.closeToastBtn.click();
  }

  async logout() {
    await this.userMenuBtn.click();
    await this.logoutBtn.click();
    await expect(this.page).toHaveURL(/\/login/);
  }

  // ── Full positive flow ────────────────────────────────────────────────────────

  async createAggregator(data: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
  }) {
    await this.navigateToAggregatorList();
    await this.openAddAggregatorForm();
    await this.fillAggregatorForm(data);
    await this.saveAggregator();
    await this.assertSuccessToastVisible();
    await this.closeSuccessToast();
  }
}
