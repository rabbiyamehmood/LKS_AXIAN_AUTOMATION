import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { SchedulePaymentPage } from '../../pages/SchedulePaymentPage';
import { USER, SCHEDULE_ACCOUNTS, SCHEDULE_WALLET_TO_WALLET } from '../../data/testData';

test.use({ ignoreHTTPSErrors: true });

test.describe('Schedule Payments - Wallet to Wallet', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAndSelectAccountByNumber(
      USER.email, USER.password, USER.otp, SCHEDULE_ACCOUNTS.accountNumber
    );
  });

  // ── FULL PAYMENT ──────────────────────────────────────────────
  test('TC_SCH_W2W_001 | Daily - Full Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Wallet', msisdn: SCHEDULE_WALLET_TO_WALLET.msisdn, frequency: 'Daily', executionTime: SCHEDULE_WALLET_TO_WALLET.executionTimeDaily, paymentType: 'Full Payment' },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2W_002 | Weekly - Full Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Wallet', msisdn: SCHEDULE_WALLET_TO_WALLET.msisdn, frequency: 'Weekly', weeklyDays: SCHEDULE_WALLET_TO_WALLET.weeklyDays, executionTime: SCHEDULE_WALLET_TO_WALLET.executionTimeDaily, paymentType: 'Full Payment' },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2W_003 | Monthly - Full Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Wallet', msisdn: SCHEDULE_WALLET_TO_WALLET.msisdn, frequency: 'Monthly', monthlyDays: SCHEDULE_WALLET_TO_WALLET.monthlyDays, executionTime: SCHEDULE_WALLET_TO_WALLET.executionTimeMonthly, paymentType: 'Full Payment' },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  // ── PERCENTAGE PAYMENT ────────────────────────────────────────
  test('TC_SCH_W2W_004 | Daily - Percentage Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Wallet', msisdn: SCHEDULE_WALLET_TO_WALLET.msisdn, frequency: 'Daily', executionTime: SCHEDULE_WALLET_TO_WALLET.executionTimeDaily, paymentType: 'Percentage', percentage: SCHEDULE_WALLET_TO_WALLET.percentage },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2W_005 | Weekly - Percentage Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Wallet', msisdn: SCHEDULE_WALLET_TO_WALLET.msisdn, frequency: 'Weekly', weeklyDays: SCHEDULE_WALLET_TO_WALLET.weeklyDays, executionTime: SCHEDULE_WALLET_TO_WALLET.executionTimeDaily, paymentType: 'Percentage', percentage: SCHEDULE_WALLET_TO_WALLET.percentage },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2W_006 | Monthly - Percentage Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Wallet', msisdn: SCHEDULE_WALLET_TO_WALLET.msisdn, frequency: 'Monthly', monthlyDays: SCHEDULE_WALLET_TO_WALLET.monthlyDays, executionTime: SCHEDULE_WALLET_TO_WALLET.executionTimeMonthly, paymentType: 'Percentage', percentage: SCHEDULE_WALLET_TO_WALLET.percentage },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  // ── PARTIAL PAYMENT ───────────────────────────────────────────
  test('TC_SCH_W2W_007 | Daily - Partial Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Wallet', msisdn: SCHEDULE_WALLET_TO_WALLET.msisdn, frequency: 'Daily', executionTime: SCHEDULE_WALLET_TO_WALLET.executionTimeDaily, paymentType: 'Partial Payment', partialAmount: SCHEDULE_WALLET_TO_WALLET.partialAmount },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2W_008 | Weekly - Partial Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Wallet', msisdn: SCHEDULE_WALLET_TO_WALLET.msisdn, frequency: 'Weekly', weeklyDays: SCHEDULE_WALLET_TO_WALLET.weeklyDays, executionTime: SCHEDULE_WALLET_TO_WALLET.executionTimeDaily, paymentType: 'Partial Payment', partialAmount: SCHEDULE_WALLET_TO_WALLET.partialAmount },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2W_009 | Monthly - Partial Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Wallet', msisdn: SCHEDULE_WALLET_TO_WALLET.msisdn, frequency: 'Monthly', monthlyDays: SCHEDULE_WALLET_TO_WALLET.monthlyDays, executionTime: SCHEDULE_WALLET_TO_WALLET.executionTimeMonthly, paymentType: 'Partial Payment', partialAmount: SCHEDULE_WALLET_TO_WALLET.partialAmount },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  // ── NEGATIVE TESTS ────────────────────────────────────────────
  test('TC_SCH_W2W_NEG_001 | Daily - Empty MSISDN should show validation error', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.openCreateForm();
    await schedulePage.selectTransferType('Wallet to Wallet');
    await schedulePage.selectExecutionTime(SCHEDULE_WALLET_TO_WALLET.executionTimeDaily);
    await page.getByRole('button', { name: 'Create Schedule' }).click();
    // Expect a validation error — form should NOT submit
    await expect(page.getByRole('heading', { name: 'Enter MPIN' })).not.toBeVisible();
  });

  test('TC_SCH_W2W_NEG_002 | Daily - Invalid MSISDN format should show error', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.openCreateForm();
    await schedulePage.selectTransferType('Wallet to Wallet');
    await schedulePage.fillWalletToWalletDetails('999');
    await schedulePage.selectExecutionTime(SCHEDULE_WALLET_TO_WALLET.executionTimeDaily);
    await page.getByRole('button', { name: 'Create Schedule' }).click();
    await expect(page.getByRole('heading', { name: 'Enter MPIN' })).not.toBeVisible();
  });

  test('TC_SCH_W2W_NEG_003 | Daily Full Payment - Wrong MPIN should show error', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.openCreateForm();
    await schedulePage.selectTransferType('Wallet to Wallet');
    await schedulePage.fillWalletToWalletDetails(SCHEDULE_WALLET_TO_WALLET.msisdn);
    await schedulePage.selectExecutionTime(SCHEDULE_WALLET_TO_WALLET.executionTimeDaily);
    await schedulePage.submitSchedule(); // waits for MPIN dialog
    // Enter wrong MPIN digits
    const mpinFields = page.getByRole('textbox', { name: '•' });
    await mpinFields.first().click();
    await mpinFields.nth(0).fill('9');
    await mpinFields.nth(1).fill('9');
    await mpinFields.nth(2).fill('9');
    await mpinFields.nth(3).fill('9');
    await page.getByRole('button', { name: 'Confirm Payment' }).click();
    // Wrong MPIN — error indicator or MPIN dialog remains
    await expect(
      page.locator('[class*="error"], [class*="invalid"], [role="alert"]').or(
        page.getByRole('heading', { name: 'Enter MPIN' })
      )
    ).toBeVisible({ timeout: 10_000 });
  });

});
