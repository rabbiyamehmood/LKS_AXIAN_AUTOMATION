import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { BankTransferPage } from '../../pages/BankTransferPage';
import { USER, BANK_TRANSFER } from '../../data/testData';

test.use({ ignoreHTTPSErrors: true });

test.describe('Bank Transfer', () => {

  test('should successfully complete a bank transfer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bankTransferPage = new BankTransferPage(page);

    await loginPage.loginAndSelectAccount(USER.email, USER.password, USER.otp);
    await bankTransferPage.goto();
    await bankTransferPage.bankTransfer(BANK_TRANSFER.accountNumber, BANK_TRANSFER.amount, USER.mpin);

    await expect(page.getByRole('heading', { name: 'Payment Successful!' })).toBeVisible();
  });

});
