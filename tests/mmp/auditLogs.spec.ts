import { test, expect, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { AuditLogsPage } from '../../pages/mmp/AuditLogsPage';

/**
 * TC_AUDITLOG_001 — Real-time Audit Log Verification (Positive E2E)
 *
 * Flow:
 *  PHASE 1 — AdminMaker (normal window):
 *    1. Login as AdminMaker
 *    2. Navigate to Audit Logs
 *    3. Filter by Action Type = LOGIN + Username = AdminChecker
 *    4. Apply Filters
 *
 *  PHASE 2 — AdminChecker (separate incognito window):
 *    5. Login as AdminChecker (this generates the audit log entry)
 *
 *  PHASE 3 — Back to AdminMaker window:
 *    6. Click Refresh
 *    7. Assert the AdminChecker LOGIN row is present with:
 *       - Today's date in Date & Time column
 *       - Action = LOGIN
 *       - Username = AdminChecker
 *       - Status = Success
 *       - Endpoint = /login
 *    8. Click View Details → verify payload modal opens
 *    9. Close modal
 */

test('TC_AUDITLOG_001 - Real-time audit log: AdminChecker login captured and verified in Audit Logs', async ({ browser }) => {
  test.setTimeout(120_000);

  // ── PHASE 1: AdminMaker window ────────────────────────────────────────────
  const makerContext: BrowserContext = await browser.newContext({ ignoreHTTPSErrors: true });
  const makerPage: Page = await makerContext.newPage();
  const makerLogin = new LoginPage(makerPage);
  const auditLogs  = new AuditLogsPage(makerPage);

  // Step 1: Login as AdminMaker
  await makerLogin.navigate();
  await makerLogin.loginAsAdminMaker();
  await expect(makerPage).not.toHaveURL(/\/login/, { timeout: 15000 });

  // Step 2: Navigate to Audit Logs
  await auditLogs.navigate();

  // Step 3 & 4: Open Filter → Action Type = LOGIN, Username = AdminChecker → Apply
  await makerPage.getByRole('button', { name: 'Filter' }).click();
  await makerPage.getByRole('button', { name: 'Action Type' }).click();
  await makerPage.getByLabel('Select action type').getByText('LOGIN', { exact: true }).click();
  await makerPage.getByRole('textbox', { name: 'Search by username' }).fill('AdminChecker');
  await makerPage.getByRole('button', { name: 'Apply Filters' }).click();
  await makerPage.waitForLoadState('networkidle', { timeout: 30000 });

  // ── PHASE 2: AdminChecker incognito window ────────────────────────────────
  const incognitoContext: BrowserContext = await browser.newContext({ ignoreHTTPSErrors: true });
  const incognitoPage: Page = await incognitoContext.newPage();
  const checkerLogin = new LoginPage(incognitoPage);

  // Step 5: Bring incognito window to front and login as AdminChecker
  await incognitoPage.bringToFront();
  await checkerLogin.navigate();
  await checkerLogin.loginAsAdminChecker();
  await expect(incognitoPage).not.toHaveURL(/\/login/, { timeout: 15000 });

  // ── PHASE 3: Back to AdminMaker window — Refresh & Assert ─────────────────
  await makerPage.bringToFront();

  // Step 6: Refresh the audit log table
  await makerPage.getByRole('button', { name: 'Refresh' }).click();
  await makerPage.waitForLoadState('networkidle', { timeout: 30000 });

  // Step 7: Locate the AdminChecker LOGIN row
  const checkerRow = makerPage.locator('tr').filter({
    has: makerPage.getByText('LOGIN', { exact: true }),
  }).filter({
    has: makerPage.getByText('AdminChecker', { exact: true }),
  }).first();

  await expect(checkerRow).toBeVisible({ timeout: 15000 });

  // Assert: Date & Time contains today's date (e.g. "07 May 2026")
  const today = auditLogs.getTodayTableFormat();
  await expect(checkerRow).toContainText(today);

  // Assert: Action = LOGIN
  await expect(checkerRow.getByText('LOGIN', { exact: true })).toBeVisible();

  // Assert: Username = AdminChecker
  await expect(checkerRow.getByText('AdminChecker', { exact: true })).toBeVisible();

  // Assert: Status = Success
  await expect(checkerRow.getByText('Success', { exact: true })).toBeVisible();

  // Assert: Endpoint = /login
  await expect(checkerRow.getByText('/login', { exact: true })).toBeVisible();

  // Step 8: Open View Details for this row — assert modal opens
  await checkerRow.getByRole('button', { name: 'View Details' }).click();
  await expect(makerPage.getByLabel('Payload Details')).toBeVisible({ timeout: 10000 });

  // Step 9: Close the payload modal
  await makerPage.getByLabel('Payload Details').getByRole('button').filter({ hasText: /^$/ }).click();
  await expect(makerPage.getByLabel('Payload Details')).not.toBeVisible({ timeout: 5000 });

  // ── Cleanup ───────────────────────────────────────────────────────────────
  await incognitoContext.close();
  await makerContext.close();
});

