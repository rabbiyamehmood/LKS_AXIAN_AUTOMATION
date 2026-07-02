import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { TillManagementPage } from '../../pages/mmp/TillManagementPage';

/**
 * Till Management — Terminal CRUD + Maker/Checker Flows
 *
 * TC_TILL_001  Create Terminal → Checker Approves
 * TC_TILL_002  Update Terminal → Checker Approves → Verify in list
 * TC_TILL_003  Create Terminal → Checker Rejects → Maker confirms rejection
 */

const MERCHANT_SEARCH  = 'tous';
const MERCHANT_OPTION  = 'touseefullah (25570000550)';

// Helper: login + navigate to till list
async function loginAsLabeshMaker(loginPage: LoginPage, till: TillManagementPage) {
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(loginPage.page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await till.navigateToTillList();
}

// Helper: logout via UI
async function logoutViaUI(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /L Labesh/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
}

// Helper: Checker inbox → review first terminal entry of given type → action
async function checkerReview(
  page: import('@playwright/test').Page,
  loginPage: LoginPage,
  requestType: 'TERMINAL CREATION' | 'TERMINAL UPDATE',
  action: 'Approve' | 'Reject',
  comment: string
) {
  await loginPage.navigate();
  await loginPage.loginAsLabeshChecker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();

  // Assert the request type row exists
  await expect(page.getByRole('cell', { name: requestType }).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Review' }).first().click();
  await page.getByRole('button', { name: action }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill(comment);
  await page.getByRole('button', { name: 'Confirm' }).click();

  const toastText = action === 'Approve' ? 'Process approved successfully' : 'Process rejected successfully';
  await expect(page.getByText(toastText)).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();
}

// ════════════════════════════════════════════════════════════════════════════
// TC_TILL_001 — Create Terminal → Checker Approves
// ════════════════════════════════════════════════════════════════════════════

test('TC_TILL_001 - Create terminal and Checker approves it', async ({ page }) => {
  test.setTimeout(120_000);

  const loginPage = new LoginPage(page);
  const till      = new TillManagementPage(page);

  // PHASE 1: Maker creates terminal
  await loginAsLabeshMaker(loginPage, till);
  await till.addTerminal({
    name:           'AutoTerminalApprove',
    email:          'autoapprove@yopmail.com',
    mobile:         '700000044',
    location:       'Africa',
    merchantSearch: MERCHANT_SEARCH,
    merchantOption: MERCHANT_OPTION,
  });

  // Assert: toast was shown (already asserted inside addTerminal)
  await logoutViaUI(page);

  // PHASE 2: Checker approves
  await checkerReview(page, loginPage, 'TERMINAL CREATION', 'Approve', 'Terminal creation approved');

  await logoutViaUI(page);
});

// ════════════════════════════════════════════════════════════════════════════
// TC_TILL_002 — Update Terminal → Checker Approves → Verify in list
// ════════════════════════════════════════════════════════════════════════════

test('TC_TILL_002 - Update terminal and Checker approves, verify status in list', async ({ page }) => {
  test.setTimeout(120_000);

  const loginPage = new LoginPage(page);
  const till      = new TillManagementPage(page);

  // PHASE 1: Maker edits first terminal
  await loginAsLabeshMaker(loginPage, till);
  const updatedName = `TermUpdated_${Date.now()}`;
  await till.editFirstTerminal(updatedName, 'Inactive');
  await logoutViaUI(page);

  // PHASE 2: Checker approves the update
  await checkerReview(page, loginPage, 'TERMINAL UPDATE', 'Approve', 'Terminal update accepted');
  await logoutViaUI(page);

  // PHASE 3: Maker verifies updated terminal name and Inactive status in list
  await loginAsLabeshMaker(loginPage, till);

  // The updated name should appear in the list
  await expect(page.getByText(updatedName).first()).toBeVisible({ timeout: 15000 });

  // Assert the row with that name shows Inactive status
  const updatedRow = page.locator('tr').filter({ has: page.getByText(updatedName) }).first();
  await expect(updatedRow.getByText('Inactive')).toBeVisible({ timeout: 15000 });

  await logoutViaUI(page);
});

// ════════════════════════════════════════════════════════════════════════════
// TC_TILL_003 — Create Terminal → Checker Rejects → Maker confirms rejection
// ════════════════════════════════════════════════════════════════════════════

test('TC_TILL_003 - Create terminal, Checker rejects, Maker confirms rejection', async ({ page }) => {
  test.setTimeout(120_000);

  const loginPage = new LoginPage(page);
  const till      = new TillManagementPage(page);

  // PHASE 1: Maker creates a terminal for rejection
  await loginAsLabeshMaker(loginPage, till);
  await till.addTerminal({
    name:           'TerminalRejectFlow',
    email:          'termreject2@yopmail.com',
    mobile:         '700000055',
    location:       'Africa',
    merchantSearch: MERCHANT_SEARCH,
    merchantOption: MERCHANT_OPTION,
  });
  await logoutViaUI(page);

  // PHASE 2: Checker rejects
  await checkerReview(page, loginPage, 'TERMINAL CREATION', 'Reject', 'Terminal rejected by checker');
  await logoutViaUI(page);

  // PHASE 3: Maker views rejection in Maker Pending Process and confirms
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Maker Pending Process' }).click();

  // Assert TERMINAL CREATION row is visible in Maker Pending Process
  await expect(page.getByRole('cell', { name: 'TERMINAL CREATION' }).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Review' }).first().click();
  await page.getByRole('button', { name: 'Reject' }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill('Terminal rejection acknowledged by Maker');
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(page.getByText('Process rejected successfully')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();
});
