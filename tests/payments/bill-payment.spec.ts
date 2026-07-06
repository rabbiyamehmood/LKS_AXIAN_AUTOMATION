import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { BillPaymentPage } from '../../pages/BillPaymentPage';
import { USER, BILL_PAYMENT } from '../../data/testData';

test.use({ ignoreHTTPSErrors: true });

test.describe('Bill Payment', () => {

  test('should successfully complete a LUKU bill payment', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const billPaymentPage = new BillPaymentPage(page);

    await loginPage.loginAndSelectAccount(USER.email, USER.password, USER.otp);
    await billPaymentPage.goto();
    await billPaymentPage.payBill(BILL_PAYMENT.consumerNumber, BILL_PAYMENT.amount, USER.mpin);

    await expect(page.getByRole('heading', { name: 'Payment Successful!' })).toBeVisible();
  });

});
