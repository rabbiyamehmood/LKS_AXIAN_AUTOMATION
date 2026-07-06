import { Page } from '@playwright/test';

export class BankTransferPage {
  private readonly page: Page;

  private readonly accountNumberInput = this.page.getByRole('textbox', { name: 'Enter account number' });
  private readonly amountInput = this.page.getByRole('textbox', { name: '0.00' });
  private readonly proceedButton = this.page.getByRole('button', { name: 'Proceed to Pay' });
  private readonly transferSummaryHeading = this.page.getByRole('heading', { name: 'Transfer Summary' });
  private readonly confirmButton = this.page.getByRole('button', { name: 'Confirm' });
  private readonly confirmPaymentButton = this.page.getByRole('button', { name: 'Confirm Payment' });
  private readonly successHeading = this.page.getByRole('heading', { name: 'Payment Successful!' });
  private readonly downloadButton = this.page.getByRole('button', { name: 'Download' });
  private readonly closeModalButton = this.page.getByRole('button', { name: 'Close modal' });

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/outgoing/bank-transfer');
    await this.page.waitForLoadState('networkidle');
  }

  async fillTransferDetails(accountNumber: string, amount: string) {
    await this.accountNumberInput.fill(accountNumber);
    await this.amountInput.fill(amount);
    await this.proceedButton.click();
    await this.transferSummaryHeading.waitFor({ state: 'visible' });
  }

  async confirmTransfer() {
    await this.transferSummaryHeading.click();
    await this.confirmButton.click();
    await this.page.getByRole('textbox', { name: '•' }).first().waitFor({ state: 'visible' });
  }

  async enterMpin(mpin: string) {
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
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadButton.click();
    await downloadPromise;
    await this.closeModalButton.click();
  }

  async bankTransfer(accountNumber: string, amount: string, mpin: string) {
    await this.fillTransferDetails(accountNumber, amount);
    await this.confirmTransfer();
    await this.enterMpin(mpin);
    await this.verifySuccess();
    await this.downloadReceiptAndClose();
  }
}
