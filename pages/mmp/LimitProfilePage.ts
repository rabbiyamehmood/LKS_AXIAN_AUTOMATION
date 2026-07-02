import { expect, Locator, Page } from '@playwright/test';

export class LimitProfilePage {
  readonly page: Page;

  readonly merchantOnboardingBtn: Locator;
  readonly limitProfileListLink: Locator;
  readonly limitProfileAddBtn: Locator;

  readonly profileNameInput: Locator;
  readonly descriptionInput: Locator;

  readonly addRuleBtn: Locator;
  readonly transactionTypeBtn: Locator;
  readonly limitUnitBtn: Locator;
  readonly minAmountInput: Locator;
  readonly maxAmountInput: Locator;
  readonly currencyBtn: Locator;

  readonly addRuleConfirmBtn: Locator;
  readonly saveBtn: Locator;
  readonly updateBtn: Locator;

  readonly toastProcessedOk: Locator;
  readonly toastApproved: Locator;
  readonly toastRejected: Locator;
  readonly closeToastBtn: Locator;

  readonly viewBtnFirst: Locator;
  readonly editBtnFirst: Locator;
  readonly goBackBtn: Locator;
  readonly viewHeading: Locator;

  readonly inboxBtn: Locator;
  readonly pendingProcessesLink: Locator;
  readonly makerPendingProcessesLink: Locator;
  readonly reviewBtnFirst: Locator;
  readonly approveBtn: Locator;
  readonly rejectBtn: Locator;
  readonly commentsInput: Locator;
  readonly confirmBtn: Locator;

  readonly userMenuBtn: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.merchantOnboardingBtn = page.getByRole('button', { name: 'Merchant Onboarding' });
    this.limitProfileListLink = page.getByRole('link', { name: 'Limit Profile List' });
    this.limitProfileAddBtn = page.getByRole('button', { name: 'Limit Profile Add' });

    this.profileNameInput = page.getByRole('textbox', { name: 'Enter profile name' });
    this.descriptionInput = page.getByRole('textbox', { name: 'Description' });

    this.addRuleBtn = page.getByRole('button', { name: 'Add Rule' });
    this.transactionTypeBtn = page.getByRole('button', { name: 'Transaction Type*' });
    this.limitUnitBtn = page.getByRole('button', { name: 'Limit Unit*' });
    this.minAmountInput = page.getByRole('textbox', { name: 'Enter minimum amount' });
    this.maxAmountInput = page.getByRole('textbox', { name: 'Enter maximum amount' });
    this.currencyBtn = page.getByRole('button', { name: 'Currency*' });

    this.addRuleConfirmBtn = page.getByRole('button', { name: 'Add', exact: true });
    this.saveBtn = page.getByRole('button', { name: 'Save' });
    this.updateBtn = page.getByRole('button', { name: 'Update' });

    this.toastProcessedOk = page.getByText('Processed OK Process ID:');
    this.toastApproved = page.getByText('Process approved successfully');
    this.toastRejected = page.getByText('Process rejected successfully');
    this.closeToastBtn = page.getByRole('button', { name: 'Close toast' });

    this.viewBtnFirst = page.getByRole('button', { name: 'View' }).first();
    this.editBtnFirst = page.getByRole('button', { name: 'Edit' }).first();
    this.goBackBtn = page.getByRole('button', { name: 'Go Back' });
    this.viewHeading = page.getByRole('heading', { name: 'View Limit Profile' });

    this.inboxBtn = page.getByRole('button', { name: 'Inbox' });
    this.pendingProcessesLink = page.getByRole('link', { name: 'Pending Processes' });
    this.makerPendingProcessesLink = page.getByRole('link', { name: 'Maker Pending Process' });
    this.reviewBtnFirst = page.getByRole('button', { name: 'Review' }).first();
    this.approveBtn = page.getByRole('button', { name: 'Approve' });
    this.rejectBtn = page.getByRole('button', { name: 'Reject' });
    this.commentsInput = page.getByRole('textbox', { name: 'Comments *' });
    this.confirmBtn = page.getByRole('button', { name: 'Confirm' });

    this.userMenuBtn = page.getByRole('button', { name: /labesh|admin/i }).first();
    this.logoutBtn = page.getByRole('banner').getByRole('button', { name: 'Logout' });
  }

  private async selectInDialog(dialog: Locator, triggerName: string, optionName: string) {
    await dialog.getByRole('button', { name: triggerName }).click();

    const optionInDialog = dialog.getByRole('option', { name: optionName, exact: true }).first();
    if (await optionInDialog.count()) {
      await optionInDialog.click();
      return;
    }

    const textInDialog = dialog.getByText(optionName, { exact: true }).first();
    await textInDialog.click();
  }

  async navigateToLimitProfileList() {
    await this.merchantOnboardingBtn.click();
    await this.limitProfileListLink.click();
    await expect(this.limitProfileAddBtn).toBeVisible({ timeout: 15_000 });
  }

  async openCreateForm() {
    await this.limitProfileAddBtn.click();
    await expect(this.profileNameInput).toBeVisible({ timeout: 10_000 });
  }

  async fillProfileHeader(profileName: string, description: string) {
    await this.profileNameInput.fill(profileName);
    await this.descriptionInput.fill(description);
  }

  async addRule(rule: {
    transactionType: 'OUTGOING';
    limitUnit: 'COUNT' | 'AMOUNT';
    resetCycle: 'Daily';
    minimumAmount: number;
    maximumAmount: number;
    currency: 'TZS';
  }) {
    await this.addRuleBtn.click();

    const addRuleDialog = this.page.getByRole('dialog').filter({ hasText: 'Add Rule' }).first();
    await expect(addRuleDialog).toBeVisible({ timeout: 10_000 });

    await this.selectInDialog(addRuleDialog, 'Transaction Type*', rule.transactionType);
    await this.selectInDialog(addRuleDialog, 'Limit Unit*', rule.limitUnit);
    await this.selectInDialog(addRuleDialog, 'Reset Cycle*', rule.resetCycle);

    const minAmountInDialog = addRuleDialog.getByRole('textbox', { name: 'Enter minimum amount' });
    if (await minAmountInDialog.count()) {
      await minAmountInDialog.fill(String(rule.minimumAmount));
    }

    await addRuleDialog.getByRole('textbox', { name: 'Enter maximum amount' }).fill(String(rule.maximumAmount));

    await this.selectInDialog(addRuleDialog, 'Currency*', rule.currency);
    await addRuleDialog.getByRole('button', { name: 'Add', exact: true }).click();
  }

  async saveNewProfile() {
    await this.saveBtn.click();
    await expect(this.toastProcessedOk).toBeVisible({ timeout: 15_000 });
    await this.closeToastBtn.click();
  }

  async openFirstForView() {
    await this.viewBtnFirst.click();
    await expect(this.viewHeading).toBeVisible({ timeout: 10_000 });
  }

  async goBackFromView() {
    await this.goBackBtn.click();
    await expect(this.limitProfileAddBtn).toBeVisible({ timeout: 10_000 });
  }

  async openFirstForEdit() {
    await this.editBtnFirst.click();
    await expect(this.profileNameInput).toBeVisible({ timeout: 10_000 });
  }

  async updateProfileHeader(profileName: string) {
    await this.profileNameInput.fill(profileName);
  }

  async updateFirstRule(minimumAmount: number, maximumAmount: number) {
    await this.page.getByRole('heading', { name: 'Profile Rules' }).click();
    await this.page.getByRole('button', { name: 'Edit' }).first().click();
    await this.minAmountInput.fill(String(minimumAmount));
    await this.maxAmountInput.fill(String(maximumAmount));
    await this.page.getByLabel('Edit Rule').getByRole('button', { name: 'Update' }).click();
  }

  async submitUpdate() {
    await this.updateBtn.click();
    await expect(this.toastProcessedOk).toBeVisible({ timeout: 15_000 });
    await this.closeToastBtn.click();
  }

  async logout() {
    await this.userMenuBtn.click();
    await this.logoutBtn.click();
    await expect(this.page).toHaveURL(/\/login/, { timeout: 15_000 });
  }

  async navigateToCheckerPendingProcesses() {
    await this.inboxBtn.click();
    await this.pendingProcessesLink.click();
    await expect(this.page.getByText('Request Type')).toBeVisible({ timeout: 10_000 });
  }

  async navigateToMakerPendingProcesses() {
    await this.inboxBtn.click();
    await this.makerPendingProcessesLink.click();
    await expect(this.page.getByText('Request Type')).toBeVisible({ timeout: 10_000 });
  }

  async openFirstReviewByRequestType(requestType: 'LIMIT DEFINITION CREATION' | 'LIMIT DEFINITION UPDATE') {
    await this.page.getByRole('cell', { name: requestType }).first().click();
    await this.reviewBtnFirst.click();
  }

  async approveCurrentProcess(comment: string) {
    await this.approveBtn.click();
    await this.commentsInput.fill(comment);
    await this.confirmBtn.click();
    await expect(this.toastApproved).toBeVisible({ timeout: 15_000 });
    await this.closeToastBtn.click();
  }

  async rejectCurrentProcess(comment: string) {
    await this.rejectBtn.click();
    await this.commentsInput.fill(comment);
    await this.confirmBtn.click();
    await expect(this.toastRejected).toBeVisible({ timeout: 15_000 });
    await this.closeToastBtn.click();
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
