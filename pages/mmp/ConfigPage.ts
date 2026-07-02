import { Page, Locator, expect } from '@playwright/test';

export class ConfigPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async navigateToKYCSetup() {
    await this.page.getByRole('button', { name: 'Config' }).click();
    await this.page.getByRole('link', { name: 'KYC Setup' }).click();
    await expect(this.page.getByRole('heading', { name: 'KYC Attributes' })).toBeVisible({ timeout: 15000 });
  }

  async navigateToLOVSetup() {
    await this.page.getByRole('button', { name: 'Config' }).click();
    await this.page.getByRole('link', { name: 'LOV Setup' }).click();
    await expect(this.page.getByRole('heading', { name: /LOV/i })).toBeVisible({ timeout: 15000 });
  }

  async navigateToDocumentSetup() {
    await this.page.getByRole('button', { name: 'Config' }).click();
    await this.page.getByRole('link', { name: 'Document Setup' }).click();
    await expect(this.page.getByRole('heading', { name: /Document/i })).toBeVisible({ timeout: 15000 });
  }

  async navigateToFieldValidationSetup() {
    await this.page.getByRole('button', { name: 'Config' }).click();
    await this.page.getByRole('link', { name: 'Field Validation Setup' }).click();
    await expect(this.page.getByRole('heading', { name: /Validation/i })).toBeVisible({ timeout: 15000 });
  }

  async navigateToMerchantTypeSetup() {
    await this.page.getByRole('button', { name: 'Config' }).click();
    await this.page.getByRole('link', { name: 'Merchant Type Setup' }).click();
    await expect(this.page.getByRole('heading', { name: /Merchant Type/i })).toBeVisible({ timeout: 15000 });
  }

  // ── KYC Setup ────────────────────────────────────────────────────────────────

  async editFirstKYCAttribute(newDataType: string) {
    await this.page.getByRole('button', { name: /edit/i }).first().click();
    await expect(this.page.getByRole('heading', { name: 'Edit KYC Attribute' })).toBeVisible({ timeout: 10000 });
    await this.page.getByLabel('Data Type *').selectOption(newDataType);
    await this.page.getByRole('button', { name: 'Update' }).click();
    await expect(this.page.getByText(/success|updated|processed/i)).toBeVisible({ timeout: 15000 });
  }

  async editKYCAttributeWithBlankName() {
    await this.page.getByRole('button', { name: /edit/i }).first().click();
    await expect(this.page.getByRole('heading', { name: 'Edit KYC Attribute' })).toBeVisible({ timeout: 10000 });
    await this.page.getByRole('textbox', { name: /attribute name/i }).clear();
    await this.page.getByRole('button', { name: 'Update' }).click();
    await expect(this.page.getByText(/at least 2 characters|required|cannot be empty/i)).toBeVisible({ timeout: 10000 });
  }

  // ── LOV Setup ─────────────────────────────────────────────────────────────────

  async addLOVValue(value: string) {
    await this.page.getByRole('button', { name: /edit/i }).first().click();
    await expect(this.page.getByRole('heading', { name: /Edit/i })).toBeVisible({ timeout: 10000 });
    await this.page.getByRole('textbox', { name: /value|add/i }).fill(value);
    await this.page.getByRole('button', { name: /add|submit/i }).first().click();
    await this.page.getByRole('button', { name: 'Update' }).click();
    await expect(this.page.getByText(/success|updated|processed/i)).toBeVisible({ timeout: 15000 });
  }

  async addDuplicateLOVValue(value: string) {
    await this.page.getByRole('button', { name: /edit/i }).first().click();
    await expect(this.page.getByRole('heading', { name: /Edit/i })).toBeVisible({ timeout: 10000 });
    await this.page.getByRole('textbox', { name: /value|add/i }).fill(value);
    await this.page.getByRole('button', { name: /add|submit/i }).first().click();
    // Try to add same value again
    await this.page.getByRole('textbox', { name: /value|add/i }).fill(value);
    await this.page.getByRole('button', { name: /add|submit/i }).first().click();
  }

  // ── Document Setup ────────────────────────────────────────────────────────────

  async editDocumentNameAndDescription(name: string, description: string) {
    await this.page.getByRole('button', { name: /edit/i }).first().click();
    await expect(this.page.getByRole('heading', { name: 'Edit Document Type' })).toBeVisible({ timeout: 10000 });
    await this.page.getByRole('textbox', { name: 'Name *' }).clear();
    await this.page.getByRole('textbox', { name: 'Name *' }).fill(name);
    await this.page.getByRole('textbox', { name: 'Description' }).clear();
    await this.page.getByRole('textbox', { name: 'Description' }).fill(description);
    await this.page.getByRole('button', { name: 'Update' }).click();
    await expect(this.page.getByText(/success|updated|processed/i)).toBeVisible({ timeout: 15000 });
  }

  async editDocumentWithExceedingLength(longName: string, longDesc: string) {
    await this.page.getByRole('button', { name: /edit/i }).first().click();
    await expect(this.page.getByRole('heading', { name: 'Edit Document Type' })).toBeVisible({ timeout: 10000 });
    await this.page.getByRole('textbox', { name: 'Name *' }).clear();
    await this.page.getByRole('textbox', { name: 'Name *' }).fill(longName);
    await this.page.getByRole('textbox', { name: 'Description' }).clear();
    await this.page.getByRole('textbox', { name: 'Description' }).fill(longDesc);
    await this.page.getByRole('button', { name: 'Update' }).click();
    await expect(this.page.getByText(/cannot exceed 150|cannot exceed 500/i)).toBeVisible({ timeout: 10000 });
  }

  // ── Field Validation Setup ───────────────────────────────────────────────────

  async editFieldValidation(regexPattern: string, errorMessage: string) {
    await this.page.getByRole('button', { name: /edit/i }).first().click();
    await expect(this.page.getByRole('heading', { name: 'Edit Validation' })).toBeVisible({ timeout: 10000 });
    await this.page.getByRole('textbox', { name: 'Regex Pattern *' }).clear();
    await this.page.getByRole('textbox', { name: 'Regex Pattern *' }).fill(regexPattern);
    await this.page.getByRole('textbox', { name: 'Error Message *' }).clear();
    await this.page.getByRole('textbox', { name: 'Error Message *' }).fill(errorMessage);
    await this.page.getByRole('button', { name: 'Update' }).click();
    await expect(this.page.getByText(/success|updated|processed/i)).toBeVisible({ timeout: 15000 });
  }

  async editFieldValidationBlankRegex() {
    await this.page.getByRole('button', { name: /edit/i }).first().click();
    await expect(this.page.getByRole('heading', { name: 'Edit Validation' })).toBeVisible({ timeout: 10000 });
    await this.page.getByRole('textbox', { name: 'Regex Pattern *' }).clear();
    await this.page.getByRole('button', { name: 'Update' }).click();
    await expect(this.page.getByText(/regex pattern is required/i)).toBeVisible({ timeout: 10000 });
  }

  // ── Checker approval via Inbox ─────────────────────────────────────────────────

  async approveFromInbox(requestType: string, comment: string) {
    await this.page.getByRole('button', { name: 'Inbox' }).click();
    await this.page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(this.page.getByRole('cell', { name: requestType }).first()).toBeVisible({ timeout: 20000 });
    await this.page.getByRole('button', { name: 'Review' }).first().click();
    await this.page.getByRole('button', { name: 'Approve' }).click();
    await this.page.getByRole('textbox', { name: 'Comments *' }).fill(comment);
    await this.page.getByRole('button', { name: 'Confirm' }).click();
    await expect(this.page.getByText(/approved|success/i)).toBeVisible({ timeout: 15000 });
    await this.page.getByRole('button', { name: 'Close toast' }).click();
  }

  async rejectFromInbox(requestType: string, comment: string) {
    await this.page.getByRole('button', { name: 'Inbox' }).click();
    await this.page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(this.page.getByRole('cell', { name: requestType }).first()).toBeVisible({ timeout: 20000 });
    await this.page.getByRole('button', { name: 'Review' }).first().click();
    await this.page.getByRole('button', { name: 'Reject' }).click();
    await this.page.getByRole('textbox', { name: 'Comments *' }).fill(comment);
    await this.page.getByRole('button', { name: 'Confirm' }).click();
    await expect(this.page.getByText(/rejected|success/i)).toBeVisible({ timeout: 15000 });
    await this.page.getByRole('button', { name: 'Close toast' }).click();
  }

  // ── Logout ────────────────────────────────────────────────────────────────────

  async logout() {
    await this.page.getByRole('button', { name: /a admin/i }).click();
    await this.page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(this.page).toHaveURL(/\/login/, { timeout: 10000 });
  }
}
