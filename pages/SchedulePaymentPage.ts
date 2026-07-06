import { Page } from '@playwright/test';

export type TransferType = 'Wallet to Wallet' | 'Wallet to Bank';
export type Frequency = 'Daily' | 'Weekly' | 'Monthly';
export type PaymentType = 'Full Payment' | 'Percentage' | 'Partial Payment';

export interface ScheduleOptions {
  transferType: TransferType;
  // Wallet to Wallet
  msisdn?: string;
  // Wallet to Bank
  bank?: string;
  accountNumber?: string;
  // Scheduling
  frequency: Frequency;
  weeklyDays?: string[];
  monthlyDays?: string[];
  executionTime: string;
  // Payment type
  paymentType: PaymentType;
  percentage?: string;
  partialAmount?: string;
}

export class SchedulePaymentPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.getByText('Account Balance').click();
    await this.page.getByText('ACTIVE', { exact: true }).click();
    await this.page.getByRole('button', { name: 'Outgoing' }).click();
    await this.page.getByRole('link', { name: 'Schedule Payments' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async openCreateForm() {
    await this.page.getByRole('button', { name: 'Create Schedule Payment' }).click();
    await this.page.getByText('Transfer Type *').waitFor({ state: 'visible' });
  }

  async selectTransferType(type: TransferType) {
    await this.page.getByText('Transfer Type *').click();
    await this.page.getByRole('button', { name: type }).click();
  }

  async fillWalletToWalletDetails(msisdn: string) {
    await this.page.getByRole('textbox', { name: 'Enter mobile number' }).click();
    await this.page.getByRole('textbox', { name: 'Enter mobile number' }).fill(msisdn);
  }

  async fillWalletToBankDetails(bank: string, accountNumber: string) {
    await this.page.getByRole('button', { name: /Bank\* (Select a bank|.*Bank)/ }).click();
    await this.page.getByRole('option', { name: bank }).click();
    await this.page.getByRole('textbox', { name: 'Enter account number' }).fill(accountNumber);
  }

  async selectFrequency(frequency: Frequency) {
    if (frequency !== 'Daily') {
      await this.page.getByRole('radio', { name: frequency }).click();
    }
  }

  async selectWeeklyDays(days: string[]) {
    await this.page.getByText('Days of Week*Select days').click();
    for (const day of days) {
      await this.page.getByText(day, { exact: true }).click();
    }
    await this.page.getByText('Transfer Type *').click();
  }

  async selectMonthlyDays(days: string[]) {
    await this.page.getByRole('button', { name: /Days of Month\* Select day/ }).click();
    for (const day of days) {
      await this.page.getByRole('option', { name: day, exact: true }).click();
    }
    await this.page.getByText('Transfer Type *').click();
  }

  async selectExecutionTime(time: string) {
    await this.page.getByRole('textbox', { name: 'Execution Time*' }).click();
    await this.page.getByRole('option', { name: time }).click();
  }

  async selectPaymentType(paymentType: PaymentType) {
    await this.page.getByRole('radio', { name: paymentType }).click();
  }

  async fillPercentage(percentage: string) {
    await this.page.getByRole('textbox', { name: 'Enter percentage' }).click();
    await this.page.getByRole('textbox', { name: 'Enter percentage' }).fill(percentage);
  }

  async fillPartialAmount(amount: string) {
    await this.page.getByRole('textbox', { name: 'Enter amount' }).click();
    await this.page.getByRole('textbox', { name: 'Enter amount' }).fill(amount);
  }

  async submitSchedule() {
    await this.page.getByRole('button', { name: 'Create Schedule' }).click();
    await this.page.getByRole('heading', { name: 'Enter MPIN' }).waitFor({ state: 'visible' });
  }

  async enterMpin(mpin: string) {
    await this.page.getByRole('heading', { name: 'Enter MPIN' }).click();
    const mpinFields = this.page.getByRole('textbox', { name: '•' });
    await mpinFields.first().click();
    for (let i = 0; i < mpin.length; i++) {
      await mpinFields.nth(i).fill(mpin[i]);
    }
    await this.page.getByRole('button', { name: 'Confirm Payment' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async createSchedule(options: ScheduleOptions, mpin: string) {
    await this.openCreateForm();
    await this.selectTransferType(options.transferType);

    if (options.transferType === 'Wallet to Wallet' && options.msisdn) {
      await this.fillWalletToWalletDetails(options.msisdn);
    }

    if (options.transferType === 'Wallet to Bank' && options.bank && options.accountNumber) {
      await this.fillWalletToBankDetails(options.bank, options.accountNumber);
    }

    await this.selectFrequency(options.frequency);

    if (options.frequency === 'Weekly' && options.weeklyDays) {
      await this.selectWeeklyDays(options.weeklyDays);
    }

    if (options.frequency === 'Monthly' && options.monthlyDays) {
      await this.selectMonthlyDays(options.monthlyDays);
    }

    await this.selectExecutionTime(options.executionTime);

    if (options.paymentType !== 'Full Payment') {
      await this.selectPaymentType(options.paymentType);
    }

    if (options.paymentType === 'Percentage' && options.percentage) {
      await this.fillPercentage(options.percentage);
    }

    if (options.paymentType === 'Partial Payment' && options.partialAmount) {
      await this.fillPartialAmount(options.partialAmount);
    }

    await this.submitSchedule();
    await this.enterMpin(mpin);
  }
}
