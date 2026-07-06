import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { SendMoneyPage } from '../../pages/SendMoneyPage';
import { USER, SEND_MONEY } from '../../data/testData';

test.use({ ignoreHTTPSErrors: true });

test.describe('Send Money', () => {

  test('should successfully send money to a mobile number', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const sendMoneyPage = new SendMoneyPage(page);

    await loginPage.loginAndSelectAccount(USER.email, USER.password, USER.otp);
    await sendMoneyPage.goto();
    await sendMoneyPage.sendMoney(SEND_MONEY.msisdn, SEND_MONEY.amount, USER.mpin);

    await expect(page.getByRole('heading', { name: 'Payment Successful!' })).toBeVisible();
  });

});
