import { Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly emailInput = this.page.getByRole('textbox', { name: 'your.email@example.com' });
  private readonly passwordInput = this.page.getByRole('textbox', { name: 'Your password' });
  private readonly merchantRadio = this.page.getByRole('radio', { name: 'Merchant' });
  private readonly signInButton = this.page.getByRole('button', { name: 'Sign In' });
  private readonly otpInput = this.page.getByRole('textbox', { name: '••••••' });
  private readonly verifyCodeButton = this.page.getByRole('button', { name: 'Verify Code' });
  private readonly confirmButton = this.page.getByRole('button', { name: 'Confirm' });

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.emailInput.click();
    await this.emailInput.fill(email);
    await this.emailInput.press('Tab');
    await this.passwordInput.fill(password);
    await this.merchantRadio.click();
    await this.signInButton.click();
    // Wait for OTP screen to appear
    await this.otpInput.waitFor({ state: 'visible' });
  }

  async enterOtp(otp: string) {
    await this.otpInput.click();
    await this.otpInput.fill(otp);
    await this.verifyCodeButton.click();
    // Wait for account selection table
    await this.page.waitForLoadState('networkidle');
  }

  async selectAccount() {
    await this.page.locator('tr:nth-child(7) > .px-4.py-3.whitespace-nowrap.text-center > div > .h-5').click();
    await this.confirmButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectAccountByNumber(accountNumber: string) {
    await this.page.getByRole('cell', { name: accountNumber }).click();
    await this.confirmButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async loginAndSelectAccount(email: string, password: string, otp: string) {
    await this.goto();
    await this.login(email, password);
    await this.enterOtp(otp);
    await this.selectAccount();
  }

  async loginAndSelectAccountByNumber(email: string, password: string, otp: string, accountNumber: string) {
    await this.goto();
    await this.login(email, password);
    await this.enterOtp(otp);
    await this.selectAccountByNumber(accountNumber);
  }
}
