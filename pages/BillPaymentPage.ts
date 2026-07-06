import { Page } from '@playwright/test';

export class BillPaymentPage {
  private readonly page: Page;

  private readonly billPaymentsLink = this.page.getByRole('link', { name: 'Bill Payments' });
  private readonly myUtilitiesButton = this.page.getByRole('button', { name: 'My Utilities' });
  private readonly energyButton = this.page.getByRole('button', { name: 'Energy My Utilities' });
  private readonly lukuButton = this.page.getByRole('button', { name: 'LUKU' });
  private readonly consumerNumberInput = this.page.getByRole('textbox', { name: 'Enter consumer number' });
  private readonly amountInput = this.page.getByRole('textbox', { name: '0.00' });
  private readonly continueButton = this.page.getByRole('button', { name: 'Continue' });
  private readonly confirmPaymentHeading = this.page.getByRole('heading', { name: 'Confirm Payment' });
  private readonly proceedToPayButton = this.page.getByRole('button', { name: 'Proceed to Pay' });
  private readonly confirmPaymentButton = this.page.getByRole('button', { name: 'Confirm Payment' });
  private readonly successHeading = this.page.getByRole('heading', { name: 'Payment Successful!' });
  private readonly downloadButton = this.page.getByRole('button', { name: 'Download' });
  private readonly closeModalButton = this.page.getByRole('button', { name: 'Close modal' });

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.billPaymentsLink.click();
    await this.myUtilitiesButton.click();
    await this.energyButton.click();
    await this.lukuButton.click();
  }

  async fillBillDetails(consumerNumber: string, amount: string) {
    await this.consumerNumberInput.click();
    await this.consumerNumberInput.fill(consumerNumber);
    await this.amountInput.click();
    await this.amountInput.fill(amount);
    await this.continueButton.click();
    await this.confirmPaymentHeading.waitFor({ state: 'visible' });
  }

  async confirmPayment() {
    await this.confirmPaymentHeading.click();
    await this.proceedToPayButton.click();
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

  async payBill(consumerNumber: string, amount: string, mpin: string) {
    await this.fillBillDetails(consumerNumber, amount);
    await this.confirmPayment();
    await this.enterMpin(mpin);
    await this.verifySuccess();
    await this.downloadReceiptAndClose();
  }
}
