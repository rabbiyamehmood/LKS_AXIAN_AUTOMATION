import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { checkerComments } from '../../test-data/aggregator.data';

/**
 * TC_AGG_UPD_E2E_001 — Full Aggregator Update & Approval Flow
 * AdminMaker edits first aggregator → AdminChecker approves it
 */

test('TC_AGG_UPD_E2E_001 - Full aggregator update and approval flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const ts        = Date.now();
  const updatedName  = `Auto_Aggregator_Update_${ts}`;
  const updatedEmail = `aggregatorupdate${ts}@yopmail.com`;

  // ── PHASE 1: AdminMaker updates an existing aggregator ───────────────────────

  // Step 1: Login as AdminMaker
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 2: Go to Aggregator Management → Aggregator List
  await page.getByRole('button', { name: 'Aggregator Management' }).click();
  await page.getByRole('link', { name: 'Aggregator List' }).click();

  // Step 3: Click Edit on the first aggregator in the list
  await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Edit' }).first().click();

  // Step 4: Assert Edit form is open
  await expect(page.getByRole('textbox', { name: 'Enter aggregator name' })).toBeVisible();

  // Step 5: Update Aggregator Name with unique value
  await page.getByRole('textbox', { name: 'Enter aggregator name' }).clear();
  await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(updatedName);

  // Step 6: Update Email with unique value
  await page.getByRole('textbox', { name: 'Enter email address' }).clear();
  await page.getByRole('textbox', { name: 'Enter email address' }).fill(updatedEmail);

  // Step 7: Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Step 8: Assert success toast
  await expect(page.getByText('Processed OK')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 9: Logout AdminMaker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);

  // ── PHASE 2: AdminChecker approves the update ────────────────────────────────

  // Step 10: Login as AdminChecker
  await loginPage.loginAsAdminChecker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 11: Go to Inbox → Pending Processes
  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();

  // Step 12: Find AGGREGATOR UPDATE row
  await expect(page.getByRole('cell', { name: 'AGGREGATOR UPDATE' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('cell', { name: 'AGGREGATOR UPDATE' }).first().click();

  // Step 13: Click Review
  await page.getByRole('button', { name: 'Review' }).first().click();
  await expect(page.getByRole('heading', { name: 'Review Aggregator' })).toBeVisible();

  // Step 14: Approve with comment
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill(checkerComments.approve);
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Step 15: Assert approval success
  await expect(page.getByText('Process approved successfully')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 16: Logout AdminChecker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
});
