import { Page } from '@playwright/test';

export class ChangePasswordPage {
  private readonly page: Page;

  private readonly profileMenuButton = this.page.getByRole('button', { name: /Daniyal General Store Logged/ });
  private readonly profileLink = this.page.getByRole('link', { name: 'Profile' });
  private readonly changePasswordLink = this.page.getByRole('link', { name: 'Change Password' });
  private readonly currentPasswordInput = this.page.getByRole('textbox', { name: 'Current Password *' });
  private readonly newPasswordInput = this.page.getByRole('textbox', { name: 'New Password *', exact: true });
  private readonly confirmNewPasswordInput = this.page.getByRole('textbox', { name: 'Confirm New Password *' });
  private readonly changePasswordButton = this.page.getByRole('button', { name: 'Change Password' });

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.profileMenuButton.click();
    await this.profileLink.click();
    await this.changePasswordLink.click();
    await this.currentPasswordInput.waitFor({ state: 'visible' });
  }

  async fillForm(currentPassword: string, newPassword: string, confirmNewPassword: string) {
    await this.currentPasswordInput.click();
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.click();
    await this.newPasswordInput.fill(newPassword);
    await this.newPasswordInput.press('Tab');
    await this.confirmNewPasswordInput.click();
    await this.confirmNewPasswordInput.fill(confirmNewPassword);
  }

  async submit() {
    await this.changePasswordButton.click();
  }

  async changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string) {
    await this.fillForm(currentPassword, newPassword, confirmNewPassword);
    await this.submit();
  }
}
