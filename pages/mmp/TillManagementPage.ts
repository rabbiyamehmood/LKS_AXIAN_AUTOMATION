import { Page, Locator, expect } from '@playwright/test';

export class TillManagementPage {
  readonly page: Page;

  // ── Navigation ────────────────────────────────────────────────────────────
  readonly tillManagementBtn: Locator;
  readonly tillListLink: Locator;
  readonly addTillBtn: Locator;

  // ── Add Terminal form ─────────────────────────────────────────────────────
  readonly terminalNameInput: Locator;
  readonly emailInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly locationInput: Locator;
  readonly merchantBtn: Locator;
  readonly merchantSearchInput: Locator;
  readonly saveBtn: Locator;

  // ── Edit Terminal form ────────────────────────────────────────────────────
  readonly firstEditBtn: Locator;
  readonly statusBtn: Locator;
  readonly updateBtn: Locator;

  // ── Toasts ────────────────────────────────────────────────────────────────
  readonly processedOkToast: Locator;
  readonly closeToastBtn: Locator;

  // ── Logout ────────────────────────────────────────────────────────────────
  readonly userMenuBtn: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.tillManagementBtn = page.getByRole('button', { name: 'Till Management' });
    this.tillListLink      = page.getByRole('link', { name: 'Till List' });
    this.addTillBtn        = page.getByRole('button', { name: 'Add Till' });

    this.terminalNameInput  = page.getByRole('textbox', { name: 'Enter terminal name' });
    this.emailInput         = page.getByRole('textbox', { name: 'Enter email address' });
    this.mobileNumberInput  = page.getByRole('textbox', { name: 'Enter mobile number' });
    this.locationInput      = page.getByRole('textbox', { name: 'Enter location' });
    this.merchantBtn        = page.getByRole('button', { name: 'Merchant*' });
    this.merchantSearchInput = page.getByRole('textbox', { name: 'Search merchant' });
    this.saveBtn            = page.getByRole('button', { name: 'Save' });

    this.firstEditBtn = page.getByRole('button', { name: 'Edit' }).first();
    this.statusBtn    = page.getByRole('button', { name: 'Status' });
    this.updateBtn    = page.getByRole('button', { name: 'Update' });

    this.processedOkToast = page.getByText('Processed OK Process ID:');
    this.closeToastBtn    = page.getByRole('button', { name: 'Close toast' });

    this.userMenuBtn = page.getByRole('button', { name: /L Labesh/i });
    this.logoutBtn   = page.getByRole('banner').getByRole('button', { name: 'Logout' });
  }

  // ── Navigate to Till List ─────────────────────────────────────────────────

  async navigateToTillList() {
    await this.tillManagementBtn.click();
    await this.tillListLink.click();
    await expect(this.page.getByRole('heading', { name: 'Terminal List' })).toBeVisible({ timeout: 15000 });
  }

  // ── Add a new terminal ────────────────────────────────────────────────────

  async addTerminal(data: {
    name: string;
    email: string;
    mobile: string;
    location: string;
    merchantSearch: string;
    merchantOption: string;
  }) {
    await this.addTillBtn.click();
    await expect(this.page.getByRole('heading', { name: 'Add Terminal' })).toBeVisible({ timeout: 15000 });

    await this.terminalNameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.mobileNumberInput.fill(data.mobile);
    await this.locationInput.fill(data.location);

    // Select merchant
    await this.merchantBtn.click();
    await this.merchantSearchInput.fill(data.merchantSearch);
    await this.page.getByRole('option', { name: data.merchantOption }).click();

    await this.saveBtn.click();
    await expect(this.processedOkToast).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Edit first terminal in list ───────────────────────────────────────────

  async editFirstTerminal(newName: string, newStatus: string) {
    await this.firstEditBtn.click();
    await expect(this.page.getByRole('heading', { name: 'Edit Terminal' })).toBeVisible({ timeout: 15000 });

    await this.terminalNameInput.clear();
    await this.terminalNameInput.fill(newName);

    await this.statusBtn.click();
    await this.page.getByText(newStatus).click();

    await this.updateBtn.click();
    await expect(this.processedOkToast).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async logout() {
    await this.userMenuBtn.click();
    await this.logoutBtn.click();
    await expect(this.page).toHaveURL(/\/login/, { timeout: 15000 });
  }

  // ── Assert terminal visible in list ──────────────────────────────────────

  async assertTerminalInList(terminalName: string) {
    await expect(this.page.getByText(terminalName)).toBeVisible({ timeout: 15000 });
  }

  // ── Assert terminal status in list ───────────────────────────────────────

  async assertTerminalStatus(terminalName: string, status: string) {
    const row = this.page.locator('tr').filter({ has: this.page.getByText(terminalName) }).first();
    await expect(row.getByText(status, { exact: true })).toBeVisible({ timeout: 15000 });
  }
}
