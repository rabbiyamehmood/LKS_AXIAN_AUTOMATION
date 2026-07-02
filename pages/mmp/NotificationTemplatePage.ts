import { Page, Locator, expect } from '@playwright/test';

export class NotificationTemplatePage {
  readonly page: Page;

  // ── Navigation ─────────────────────────────────────────────────────────────
  readonly notificationsBtn:  Locator;
  readonly notificationsLink: Locator;
  readonly addNotificationsBtn: Locator;

  // ── Create / Edit form ─────────────────────────────────────────────────────
  readonly templateNameInput:  Locator;
  readonly eventTypeBtn:       Locator;
  readonly channelBtn:         Locator;
  readonly subjectInput:       Locator;
  readonly bodyTemplateInput:  Locator;
  readonly saveBtn:            Locator;
  readonly updateBtn:          Locator;
  readonly statusBtn:          Locator;
  readonly goBackBtn:          Locator;

  // ── Toasts ─────────────────────────────────────────────────────────────────
  readonly processedOkToast: Locator;
  readonly closeToastBtn:    Locator;

  constructor(page: Page) {
    this.page = page;

    this.notificationsBtn   = page.getByRole('button', { name: 'Notifications Management' });
    this.notificationsLink  = page.getByRole('link',   { name: 'Notifications List' });
    this.addNotificationsBtn = page.getByRole('button', { name: 'Add Notifications' });

    this.templateNameInput  = page.getByRole('textbox', { name: 'Enter template name' });
    this.eventTypeBtn       = page.getByRole('button',  { name: 'Event Type*' });
    this.channelBtn         = page.getByRole('button',  { name: 'Channel*' });
    this.subjectInput       = page.getByRole('textbox', { name: 'Enter notification subject' });
    this.bodyTemplateInput  = page.getByRole('textbox', { name: 'Body Template*' });
    this.saveBtn            = page.getByRole('button',  { name: 'Save' });
    this.updateBtn          = page.getByRole('button',  { name: 'Update' });
    this.statusBtn          = page.getByRole('button',  { name: 'Status' });
    this.goBackBtn          = page.getByRole('button',  { name: 'Go Back' });

    this.processedOkToast = page.getByText('Processed OK Process ID:');
    this.closeToastBtn    = page.getByRole('button', { name: 'Close toast' });
  }

  // ── Navigate to Notifications List ─────────────────────────────────────────

  async navigateToNotificationsList() {
    await this.notificationsBtn.click();
    await this.notificationsLink.click();
    await expect(this.page.getByRole('heading', { name: 'Notification Templates' })).toBeVisible({ timeout: 15000 });
  }

  // ── Create a new notification template ────────────────────────────────────

  async createTemplate(data: {
    name:        string;
    eventType:   string;
    channel:     string;
    subject:     string;
    body:        string;
  }) {
    await this.addNotificationsBtn.click();
    await expect(this.page.getByRole('heading', { name: 'Create Notification Template' })).toBeVisible({ timeout: 15000 });

    await this.templateNameInput.fill(data.name);

    await this.eventTypeBtn.click();
    await this.page.getByText(data.eventType, { exact: true }).click();

    await this.channelBtn.click();
    await this.page.getByText(data.channel, { exact: true }).click();

    await this.subjectInput.fill(data.subject);
    await this.bodyTemplateInput.fill(data.body);

    await this.saveBtn.click();
    await expect(this.processedOkToast).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Edit first template in list ────────────────────────────────────────────

  async editFirstTemplate(data: {
    body:      string;
    newStatus: string;
  }) {
    await this.page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(this.page.getByRole('heading', { name: /edit.*notification|notification.*template/i })).toBeVisible({ timeout: 15000 });

    await this.bodyTemplateInput.click();
    await this.bodyTemplateInput.fill(data.body);

    await this.statusBtn.click();
    await this.page.getByText(data.newStatus, { exact: true }).click();

    await this.updateBtn.click();
    await expect(this.processedOkToast).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Checker: review first pending item of given type ──────────────────────

  async checkerReview(loginPage: import('./LoginPage').LoginPage, requestType: 'NOTIFICATION CREATION' | 'NOTIFICATION UPDATE', action: 'Approve' | 'Reject', comment: string) {
    await loginPage.navigate();
    await loginPage.loginAsLabeshChecker();
    await expect(this.page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await this.page.getByRole('button', { name: 'Inbox' }).click();
    await this.page.getByRole('link',   { name: 'Pending Processes' }).click();

    await expect(this.page.getByRole('cell', { name: requestType }).first()).toBeVisible({ timeout: 15000 });
    await this.page.getByRole('button', { name: 'Review' }).first().click();

    await this.page.getByRole('button', { name: action }).click();
    await this.page.getByRole('textbox', { name: 'Comments *' }).fill(comment);
    await this.page.getByRole('button', { name: 'Confirm' }).click();

    const toastText = action === 'Approve' ? 'Process approved successfully' : 'Process rejected successfully';
    await expect(this.page.getByText(toastText)).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Maker: acknowledge rejection in Maker Pending Process ─────────────────

  async makerAcknowledgeRejection(loginPage: import('./LoginPage').LoginPage, requestType: 'NOTIFICATION CREATION' | 'NOTIFICATION UPDATE', comment: string) {
    await loginPage.navigate();
    await loginPage.loginAsLabeshMaker();
    await expect(this.page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await this.page.getByRole('button', { name: 'Inbox' }).click();
    await this.page.getByRole('link',   { name: 'Maker Pending Process' }).click();

    await expect(this.page.getByRole('cell', { name: requestType }).first()).toBeVisible({ timeout: 15000 });
    await this.page.getByRole('button', { name: 'Review' }).first().click();

    await this.page.getByRole('button', { name: 'Reject' }).click();
    await this.page.getByRole('textbox', { name: 'Comments *' }).fill(comment);
    await this.page.getByRole('button', { name: 'Confirm' }).click();

    await expect(this.page.getByText('Process rejected successfully')).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }
}
