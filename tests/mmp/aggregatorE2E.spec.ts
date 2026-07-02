import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { AggregatorPage } from '../../pages/mmp/AggregatorPage';
import { InboxPage } from '../../pages/mmp/InboxPage';
import { generateAggregatorData, checkerComments } from '../../test-data/aggregator.data';

/**
 * TC_AGG_E2E_001 — Full Aggregator Creation & Approval Flow
 * AdminMaker creates aggregator → AdminChecker approves it
 */

test('TC_AGG_E2E_001 - Full aggregator creation and approval flow', async ({ page }) => {
  const loginPage      = new LoginPage(page);
  const aggregatorPage = new AggregatorPage(page);
  const inboxPage      = new InboxPage(page);
  const testData       = generateAggregatorData();

  // ── PHASE 1: AdminMaker creates aggregator ───────────────────────────────────

  // Step 1: Login as AdminMaker
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 2: Go to Aggregator Management → Aggregator List
  await page.getByRole('button', { name: 'Aggregator Management' }).click();
  await page.getByRole('link', { name: 'Aggregator List' }).click();

  // Step 3: Click Add Aggregator
  await page.getByRole('button', { name: 'Add Aggregator' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter aggregator name' })).toBeVisible();

  // Step 4: Fill the form
  await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(testData.name);
  await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(testData.contactPerson);
  await page.getByRole('textbox', { name: 'Enter email address' }).fill(testData.email);
  await page.getByRole('textbox', { name: 'Enter phone number' }).fill(testData.phone);
  await page.locator('#QR').click();

  // Step 5: Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Step 6: Assert success toast
  await expect(page.getByText('Processed OK')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 7: Logout AdminMaker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);

  // ── PHASE 2: AdminChecker approves the aggregator ───────────────────────────

  // Step 8: Login as AdminChecker
  await loginPage.loginAsAdminChecker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 9: Go to Inbox → Pending Processes
  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();

  // Step 10: Find AGGREGATOR CREATION row and click Review
  await expect(page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first().click();
  await page.getByRole('button', { name: 'Review' }).first().click();

  // Step 11: Assert Review modal is open
  await expect(page.getByRole('heading', { name: 'Review Aggregator' })).toBeVisible();

  // Step 12: Approve with comment
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill(checkerComments.approve);
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Step 13: Assert approval toast
  await expect(page.getByText('Process approved successfully')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 14: Logout AdminChecker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
});
