import { Page } from '@playwright/test';

export class ChangeMpinPage {
  private readonly page: Page;

  private readonly profileMenuButton = this.page.getByRole('button', { name: /Daniyal General Store Logged/ });
  private readonly profileLink = this.page.getByRole('link', { name: 'Profile' });
  private readonly changeMpinButton = this.page.getByRole('button', { name: 'Change MPIN' }).first();
  private readonly changeMpinHeading = this.page.getByRole('heading', { name: 'Change MPIN' });
  private readonly submitButton = this.page.getByRole('button', { name: 'Change MPIN' }).nth(1);
  private readonly successMessage = this.page.getByText('MPIN changed successfully');

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.profileMenuButton.click();
    await this.profileLink.click();
    await this.changeMpinButton.click();
    await this.changeMpinHeading.waitFor({ state: 'visible' });
  }

  // Fill a 4-digit MPIN into a group of 4 inputs starting at nth index
  private async fillMpinGroup(startIndex: number, mpin: string) {
    const inputs = this.page.getByRole('textbox', { name: '•' });
    for (let i = 0; i < 4; i++) {
      await inputs.nth(startIndex + i).fill(mpin[i]);
    }
  }

  async fillOldMpin(mpin: string) {
    await this.page.getByText('Old MPIN *').click();
    await this.fillMpinGroup(0, mpin);
  }

  async fillNewMpin(mpin: string) {
    await this.page.getByText('New MPIN *').click();
    await this.fillMpinGroup(4, mpin);
  }

  async fillConfirmMpin(mpin: string) {
    await this.fillMpinGroup(8, mpin);
  }

  async submit() {
    await this.submitButton.click();
  }

  async verifySuccess() {
    await this.successMessage.waitFor({ state: 'visible' });
  }

  async changeMpin(oldMpin: string, newMpin: string, confirmMpin: string) {
    await this.fillOldMpin(oldMpin);
    await this.fillNewMpin(newMpin);
    await this.fillConfirmMpin(confirmMpin);
    await this.submit();
    await this.verifySuccess();
  }
}
