import { test, expect, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { AuditLogsPage } from '../../pages/mmp/AuditLogsPage';

/**
 * Audit Logs — Negative Filter Test Cases
 * Login once, reset between tests.
 *
 * TC_AUDITLOG_NEG_001  Non-existent username → "No data found" (no validation)
 * TC_AUDITLOG_NEG_002  To Date < From Date  → should show error (FAIL — app bug)
 */

test.describe('Audit Logs - Negative Filter Tests', () => {
  test.setTimeout(120_000);

  let context: BrowserContext;
  let page: Page;
  let auditLogs: AuditLogsPage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ ignoreHTTPSErrors: true });
    page = await context.newPage();
    const loginPage = new LoginPage(page);
    auditLogs = new AuditLogsPage(page);

    await loginPage.navigate();
    await loginPage.loginAsAdminMaker();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await auditLogs.navigate();

    // Open filter panel once — stays open throughout all tests
    await page.getByRole('button', { name: 'Filter' }).click();
  });

  test.afterAll(async () => {
    await context.close();
  });

  // Reset state before each test
  test.beforeEach(async () => {
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  });

  // ── TC_AUDITLOG_NEG_001 ───────────────────────────────────────────────────
  // BUG: App shows "No data found" instead of a validation error for unknown usernames
  test('TC_AUDITLOG_NEG_001 - Non-existent username shows No data found (no validation)', async () => {
    await page.getByRole('textbox', { name: 'Search by username' }).fill('jkejke9998');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // App shows "No data found" — no username validation error is shown
    await expect(page.getByText('No data found')).toBeVisible({ timeout: 10000 });

    // EXPECTED (but missing): a validation message like "User not found" or similar
    // Asserting that NO such validation message exists — confirms the bug
    await expect(page.getByText(/user not found|invalid username|no such user/i)).not.toBeVisible();
  });

  // ── TC_AUDITLOG_NEG_002 ───────────────────────────────────────────────────
  // BUG: To Date earlier than From Date should show a validation error, but app
  //      silently shows "No data found" instead. This test intentionally FAILS
  //      to highlight the missing date range validation.
  test('TC_AUDITLOG_NEG_002 - To Date earlier than From Date should show error (FAIL - app bug)', async () => {
    // Get today's date dynamically
    const today = new Date();
    const todayDate = today.getDate();
    
    // From Date = today (June 8, 2026)
    await page.getByRole('textbox', { name: 'From Date' }).click();
    await page.locator('.react-datepicker__day').filter({ hasText: new RegExp(`^${todayDate}$`) }).first().click();

    // To Date = 1st of current month (June 1, 2026 - earlier than From Date)
    await page.getByRole('textbox', { name: 'To Date' }).click();
    await page.locator('.react-datepicker__day').filter({ hasText: /^1$/ }).first().click();

    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // EXPECTED: App should show a date range validation error
    // ACTUAL: App shows "No data found" silently — this assertion will FAIL (known bug)
    await expect(
      page.getByText(/to date must be after from date|invalid date range|end date cannot be before start date/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
