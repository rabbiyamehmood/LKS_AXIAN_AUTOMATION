import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { SchedulePaymentPage } from '../../pages/SchedulePaymentPage';
import { USER, SCHEDULE_ACCOUNTS, SCHEDULE_WALLET_TO_BANK } from '../../data/testData';

test.use({ ignoreHTTPSErrors: true });

test.describe('Schedule Payments - Wallet to Bank', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAndSelectAccountByNumber(
      USER.email, USER.password, USER.otp, SCHEDULE_ACCOUNTS.accountNumber
    );
  });

  // ── FULL PAYMENT ──────────────────────────────────────────────
  test('TC_SCH_W2B_001 | Daily - Full Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Bank', bank: SCHEDULE_WALLET_TO_BANK.bank, accountNumber: SCHEDULE_WALLET_TO_BANK.accountNumber, frequency: 'Daily', executionTime: SCHEDULE_WALLET_TO_BANK.executionTimeDaily, paymentType: 'Full Payment' },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2B_002 | Weekly - Full Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Bank', bank: SCHEDULE_WALLET_TO_BANK.bank, accountNumber: SCHEDULE_WALLET_TO_BANK.accountNumber, frequency: 'Weekly', weeklyDays: SCHEDULE_WALLET_TO_BANK.weeklyDays, executionTime: SCHEDULE_WALLET_TO_BANK.executionTimeDaily, paymentType: 'Full Payment' },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2B_003 | Monthly - Full Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Bank', bank: SCHEDULE_WALLET_TO_BANK.bank, accountNumber: SCHEDULE_WALLET_TO_BANK.accountNumber, frequency: 'Monthly', monthlyDays: SCHEDULE_WALLET_TO_BANK.monthlyDays, executionTime: SCHEDULE_WALLET_TO_BANK.executionTimeMonthly, paymentType: 'Full Payment' },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  // ── PERCENTAGE PAYMENT ────────────────────────────────────────
  test('TC_SCH_W2B_004 | Daily - Percentage Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Bank', bank: SCHEDULE_WALLET_TO_BANK.bank, accountNumber: SCHEDULE_WALLET_TO_BANK.accountNumber, frequency: 'Daily', executionTime: SCHEDULE_WALLET_TO_BANK.executionTimeDaily, paymentType: 'Percentage', percentage: SCHEDULE_WALLET_TO_BANK.percentage },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2B_005 | Weekly - Percentage Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Bank', bank: SCHEDULE_WALLET_TO_BANK.bank, accountNumber: SCHEDULE_WALLET_TO_BANK.accountNumber, frequency: 'Weekly', weeklyDays: SCHEDULE_WALLET_TO_BANK.weeklyDays, executionTime: SCHEDULE_WALLET_TO_BANK.executionTimeDaily, paymentType: 'Percentage', percentage: SCHEDULE_WALLET_TO_BANK.percentage },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2B_006 | Monthly - Percentage Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Bank', bank: SCHEDULE_WALLET_TO_BANK.bank, accountNumber: SCHEDULE_WALLET_TO_BANK.accountNumber, frequency: 'Monthly', monthlyDays: SCHEDULE_WALLET_TO_BANK.monthlyDays, executionTime: SCHEDULE_WALLET_TO_BANK.executionTimeMonthly, paymentType: 'Percentage', percentage: SCHEDULE_WALLET_TO_BANK.percentage },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  // ── PARTIAL PAYMENT ───────────────────────────────────────────
  test('TC_SCH_W2B_007 | Daily - Partial Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Bank', bank: SCHEDULE_WALLET_TO_BANK.bank, accountNumber: SCHEDULE_WALLET_TO_BANK.accountNumber, frequency: 'Daily', executionTime: SCHEDULE_WALLET_TO_BANK.executionTimeDaily, paymentType: 'Partial Payment', partialAmount: SCHEDULE_WALLET_TO_BANK.partialAmount },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2B_008 | Weekly - Partial Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Bank', bank: SCHEDULE_WALLET_TO_BANK.bank, accountNumber: SCHEDULE_WALLET_TO_BANK.accountNumber, frequency: 'Weekly', weeklyDays: SCHEDULE_WALLET_TO_BANK.weeklyDays, executionTime: SCHEDULE_WALLET_TO_BANK.executionTimeDaily, paymentType: 'Partial Payment', partialAmount: SCHEDULE_WALLET_TO_BANK.partialAmount },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  test('TC_SCH_W2B_009 | Monthly - Partial Payment', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.createSchedule(
      { transferType: 'Wallet to Bank', bank: SCHEDULE_WALLET_TO_BANK.bank, accountNumber: SCHEDULE_WALLET_TO_BANK.accountNumber, frequency: 'Monthly', monthlyDays: SCHEDULE_WALLET_TO_BANK.monthlyDays, executionTime: SCHEDULE_WALLET_TO_BANK.executionTimeMonthly, paymentType: 'Partial Payment', partialAmount: SCHEDULE_WALLET_TO_BANK.partialAmount },
      USER.mpin
    );
    await expect(page).not.toHaveURL(/error/);
  });

  // ── NEGATIVE TESTS ────────────────────────────────────────────
  test('TC_SCH_W2B_NEG_001 | Daily - Empty Account Number should show validation error', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.openCreateForm();
    await schedulePage.selectTransferType('Wallet to Bank');
    await schedulePage.fillWalletToBankDetails(SCHEDULE_WALLET_TO_BANK.bank, '');
    await schedulePage.selectExecutionTime(SCHEDULE_WALLET_TO_BANK.executionTimeDaily);
    await page.getByRole('button', { name: 'Create Schedule' }).click();
    await expect(page.getByRole('heading', { name: 'Enter MPIN' })).not.toBeVisible();
  });

  test('TC_SCH_W2B_NEG_002 | Daily - No Bank Selected should show validation error', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.openCreateForm();
    await schedulePage.selectTransferType('Wallet to Bank');
    await page.getByRole('textbox', { name: 'Enter account number' }).fill(SCHEDULE_WALLET_TO_BANK.accountNumber);
    await schedulePage.selectExecutionTime(SCHEDULE_WALLET_TO_BANK.executionTimeDaily);
    await page.getByRole('button', { name: 'Create Schedule' }).click();
    await expect(page.getByRole('heading', { name: 'Enter MPIN' })).not.toBeVisible();
  });

  test('TC_SCH_W2B_NEG_003 | Daily Full Payment - Wrong MPIN should show error', async ({ page }) => {
    const schedulePage = new SchedulePaymentPage(page);
    await schedulePage.goto();
    await schedulePage.openCreateForm();
    await schedulePage.selectTransferType('Wallet to Bank');
    await schedulePage.fillWalletToBankDetails(SCHEDULE_WALLET_TO_BANK.bank, SCHEDULE_WALLET_TO_BANK.accountNumber);
    await schedulePage.selectExecutionTime(SCHEDULE_WALLET_TO_BANK.executionTimeDaily);
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
