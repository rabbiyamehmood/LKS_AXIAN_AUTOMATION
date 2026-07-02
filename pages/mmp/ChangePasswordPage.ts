import { Page, Locator, expect } from '@playwright/test';

export class ChangePasswordPage {
  readonly page: Page;

  // ── Profile menu ────────────────────────────────────────────────────────────
  readonly profileMenuBtn: Locator;
  readonly changePasswordMenuItem: Locator;

  // ── Change Password form ─────────────────────────────────────────────────────
  readonly heading: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmNewPasswordInput: Locator;
  readonly changePasswordBtn: Locator;

  // ── Feedback ─────────────────────────────────────────────────────────────────
  readonly successToast: Locator;
  readonly closeToastBtn: Locator;

  // ── Logout ───────────────────────────────────────────────────────────────────
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.profileMenuBtn        = page.getByRole('button', { name: 'a admin' });
    this.changePasswordMenuItem = page.getByRole('button', { name: 'Change Password' });

    this.heading               = page.getByRole('heading', { name: 'Change Password' });
    this.currentPasswordInput  = page.getByRole('textbox', { name: 'Current Password *' });
    this.newPasswordInput      = page.getByRole('textbox', { name: 'New Password *', exact: true });
    this.confirmNewPasswordInput = page.getByRole('textbox', { name: 'Confirm New Password *' });
    this.changePasswordBtn     = page.getByRole('button', { name: 'Change Password' });

    this.successToast          = page.getByRole('heading', { name: 'Password Changed Successfully' });
    this.closeToastBtn         = page.getByRole('button', { name: 'Close toast' });

    this.logoutBtn             = page.getByRole('banner').getByRole('button', { name: 'Logout' });
  }

  // ── Open Change Password form ─────────────────────────────────────────────────

  async openChangePasswordForm() {
    await this.profileMenuBtn.click();
    await this.changePasswordMenuItem.click();
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  // ── Fill and submit ───────────────────────────────────────────────────────────

  async fillAndSubmit(currentPassword: string, newPassword: string, confirmPassword: string) {
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmNewPasswordInput.fill(confirmPassword);
    await this.changePasswordBtn.click();
  }

  // ── Positive: change password successfully ────────────────────────────────────

  async changePasswordSuccessfully(currentPassword: string, newPassword: string) {
    await this.fillAndSubmit(currentPassword, newPassword, newPassword);
    await expect(this.successToast).toBeVisible({ timeout: 15000 });
    await this.closeToastBtn.click();
  }

  // ── Logout ────────────────────────────────────────────────────────────────────

  async logout() {
    await this.profileMenuBtn.click();
    await this.logoutBtn.click();
  }
}
