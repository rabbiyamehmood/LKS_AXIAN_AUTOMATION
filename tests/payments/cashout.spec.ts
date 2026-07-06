import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { CashoutPage } from '../../pages/CashoutPage';
import { USER, CASHOUT } from '../../data/testData';

test.use({ ignoreHTTPSErrors: true });

test.describe('Cashout', () => {

  test('should successfully complete a cashout via agent', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const cashoutPage = new CashoutPage(page);

    await loginPage.loginAndSelectAccount(USER.email, USER.password, USER.otp);
    await cashoutPage.goto();
    await cashoutPage.cashout(CASHOUT.agentCode, CASHOUT.amount, USER.mpin);

    await expect(page.getByRole('heading', { name: 'Payment Successful!' })).toBeVisible();
  });

});
