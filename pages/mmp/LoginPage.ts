import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"], input[placeholder*="User"], input[id*="user"]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    this.errorMessage = page.locator('.error, .alert-danger, [class*="error"], [class*="invalid"]').first();
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    // Wait for button to be enabled (it can be disabled briefly after page transitions)
    await expect(this.loginButton).toBeEnabled({ timeout: 15000 });
    await this.loginButton.click();
  }

  async loginAsAdminMaker() {
    await this.login(
      process.env.ADMIN_MAKER_USERNAME!,
      process.env.ADMIN_MAKER_PASSWORD!
    );
  }

  async loginAsAdminChecker() {
    await this.login(
      process.env.ADMIN_CHECKER_USERNAME!,
      process.env.ADMIN_CHECKER_PASSWORD!
    );
  }

  async loginAsLabeshMaker() {
    await this.login(
      process.env.LABESH_MAKER_USERNAME!,
      process.env.LABESH_MAKER_PASSWORD!
    );
  }

  async loginAsLabeshChecker() {
    await this.login(
      process.env.LABESH_CHECKER_USERNAME!,
      process.env.LABESH_CHECKER_PASSWORD!
    );
  }
}
