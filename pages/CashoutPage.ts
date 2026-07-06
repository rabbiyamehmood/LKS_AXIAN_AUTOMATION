import { Page } from '@playwright/test';

export class CashoutPage {
  private readonly page: Page;

  private readonly agentCodeInput = this.page.getByRole('textbox', { name: 'Enter Agent Code' });
  private readonly amountInput = this.page.getByRole('textbox', { name: '0.00' });
  private readonly proceedButton = this.page.getByRole('button', { name: 'Proceed to Pay' });
  private readonly confirmTransferHeading = this.page.getByRole('heading', { name: 'Confirm Transfer' });
  private readonly confirmButton = this.page.getByRole('button', { name: 'Confirm' });
  private readonly enterMpinHeading = this.page.getByRole('heading', { name: 'Enter MPIN' });
  private readonly confirmPaymentButton = this.page.getByRole('button', { name: 'Confirm Payment' });
  private readonly successHeading = this.page.getByRole('heading', { name: 'Payment Successful!' });
  private readonly downloadButton = this.page.getByRole('button', { name: 'Download' });
  private readonly closeModalButton = this.page.getByRole('button', { name: 'Close modal' });

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/outgoing/cashout');
    await this.page.waitForLoadState('networkidle');
  }

  async fillCashoutDetails(agentCode: string, amount: string) {
    await this.agentCodeInput.fill(agentCode);
    await this.amountInput.fill(amount);
    await this.proceedButton.click();
    await this.confirmTransferHeading.waitFor({ state: 'visible' });
  }

  async confirmTransfer() {
    await this.confirmTransferHeading.click();
    await this.confirmButton.click();
    await this.enterMpinHeading.waitFor({ state: 'visible' });
  }

  async enterMpin(mpin: string) {
    await this.enterMpinHeading.click();
    const mpinFields = this.page.getByRole('textbox', { name: '•' });
    await mpinFields.first().click();
    for (let i = 0; i < mpin.length; i++) {
      await mpinFields.nth(i).fill(mpin[i]);
    }
    await this.confirmPaymentButton.click();
    await this.successHeading.waitFor({ state: 'visible' });
  }

  async verifySuccess() {
    await this.successHeading.click();
  }

  async downloadReceiptAndClose(): Promise<void> {
    // Wait for the download event once — only click Download once
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadButton.click();
    await downloadPromise;
    await this.closeModalButton.click();
  }

  async cashout(agentCode: string, amount: string, mpin: string) {
    await this.fillCashoutDetails(agentCode, amount);
    await this.confirmTransfer();
    await this.enterMpin(mpin);
    await this.verifySuccess();
    await this.downloadReceiptAndClose();
  }
}
