import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';

/**
 * TC_USER_UPD_E2E_001 — Full User Update & Approval Flow
 * AdminMaker edits first user → AdminChecker approves it
 */

// ── Checker comments ──────────────────────────────────────────────────────────

const userCheckerComments = {
  approve: 'Approved by AdminChecker - Automation Test',
  reject:  'Rejected by AdminChecker - Automation Test: Invalid user details',
};

test('TC_USER_UPD_E2E_001 - Full user update and approval flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const ts        = Date.now();
  const updatedEmail = `userupdate${ts}@yopmail.com`;

  // ── PHASE 1: AdminMaker updates an existing user ─────────────────────────────

  // Step 1: Login as AdminMaker
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 2: Go to User & Role Management → User List
  await page.getByRole('button', { name: 'User & Role Management' }).click();
  await page.getByRole('link', { name: 'User List' }).click();

  // Step 3: Click Edit on the first user in the list
  await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Edit' }).first().click();

  // Step 4: Assert Edit form is open
  await expect(page.getByRole('textbox', { name: 'Enter email address' })).toBeVisible();

  // Step 5: Update Email with unique value
  await page.getByRole('textbox', { name: 'Enter email address' }).clear();
  await page.getByRole('textbox', { name: 'Enter email address' }).fill(updatedEmail);

  // Step 6: Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Step 7: Assert success toast
  await expect(page.getByText('Processed OK')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 8: Logout AdminMaker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);

  // ── PHASE 2: AdminChecker approves the update ─────────────────────────────────

  // Step 9: Login as AdminChecker
  await loginPage.loginAsAdminChecker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 10: Go to Inbox → Pending Processes
  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();

  // Step 11: Find USER UPDATE row
  await expect(page.getByRole('cell', { name: 'USER UPDATE' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('cell', { name: 'USER UPDATE' }).first().click();

  // Step 12: Click Review
  await page.getByRole('button', { name: 'Review' }).first().click();
  await expect(page.getByRole('heading', { name: 'Review User' })).toBeVisible();

  // Step 13: Approve with comment
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill(userCheckerComments.approve);
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Step 14: Assert approval success
  await expect(page.getByText('Process approved successfully')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 15: Logout AdminChecker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
});
