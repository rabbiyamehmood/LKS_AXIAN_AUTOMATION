import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';

/**
 * User Update — Negative Test Cases
 *
 * MAKER side (edit form validation — TC_USER_UPD_NEG_001 to 005):
 *   001 — Clear Email → "Invalid email format"
 *   002 — Invalid email format (missing @) → "Invalid email format"
 *   003 — Clear First Name → "First name is required"
 *   004 — Clear Last Name → "Last name is required"
 *   005 — Clear Phone → "Phone number is required"
 *
 * CHECKER side (TC_USER_UPD_NEG_006 to 008):
 *   006 — Approve without comment → Confirm button is disabled
 *   007 — Reject without comment → Confirm button is disabled
 *   008 — Checker rejects user update with valid reason
 */

// ── Checker comments ──────────────────────────────────────────────────────────

const userCheckerComments = {
  approve: 'Approved by AdminChecker - Automation Test',
  reject:  'Rejected by AdminChecker - Automation Test: Invalid user details',
};

// ── Helper: open the Edit form of the first user ─────────────────────────────

async function openUserEditForm(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  await page.getByRole('button', { name: 'User & Role Management' }).click();
  await page.getByRole('link', { name: 'User List' }).click();
  await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByRole('textbox', { name: 'Enter email address' })).toBeVisible();
}

// ── Helper: create an update request as maker then logout ────────────────────

async function createUserUpdateAsMaker(page: import('@playwright/test').Page) {
  const ts = Date.now();
  await openUserEditForm(page);

  await page.getByRole('textbox', { name: 'Enter email address' }).clear();
  await page.getByRole('textbox', { name: 'Enter email address' }).fill(`userupdate${ts}@yopmail.com`);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Processed OK')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Logout maker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
}

// ── NEGATIVE — MAKER FORM VALIDATION ─────────────────────────────────────────

test.describe('User Update — Form Validation (Negative)', () => {

  test('TC_USER_UPD_NEG_001 - Clear Email — shows "Invalid email format"', async ({ page }) => {
    await openUserEditForm(page);

    // Step: Clear the Email field
    await page.getByRole('textbox', { name: 'Enter email address' }).clear();

    // Step: Click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Assert: validation error shown
    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_USER_UPD_NEG_002 - Invalid email format (missing @) — shows "Invalid email format"', async ({ page }) => {
    await openUserEditForm(page);

    await page.getByRole('textbox', { name: 'Enter email address' }).clear();
    await page.getByRole('textbox', { name: 'Enter email address' }).fill('invalidemail.com');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_USER_UPD_NEG_003 - Clear First Name — shows "First name is required"', async ({ page }) => {
    await openUserEditForm(page);

    await page.getByRole('textbox', { name: 'Enter first name' }).clear();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_USER_UPD_NEG_004 - Clear Last Name — shows "Last name is required"', async ({ page }) => {
    await openUserEditForm(page);

    await page.getByRole('textbox', { name: 'Enter last name' }).clear();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Last name is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_USER_UPD_NEG_005 - Clear Phone — shows "Phone number is required"', async ({ page }) => {
    await openUserEditForm(page);

    await page.getByRole('textbox', { name: 'Enter phone number' }).clear();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

});

// ── NEGATIVE — CHECKER VALIDATION ────────────────────────────────────────────

test.describe('User Update — Checker Validation (Negative)', () => {

  test('TC_USER_UPD_NEG_006 - Checker cannot Approve user update without a comment — Confirm is disabled', async ({ page }) => {
    await createUserUpdateAsMaker(page);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'USER UPDATE' }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('cell', { name: 'USER UPDATE' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review User' })).toBeVisible();

    // Click Approve — leave comment empty
    await page.getByRole('button', { name: 'Approve' }).click();
    const commentsField = page.getByRole('textbox', { name: 'Comments *' });
    await expect(commentsField).toBeVisible();
    await expect(commentsField).toHaveValue('');

    // Confirm should be disabled when comment is empty
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    await expect(page.getByText('Process approved successfully')).not.toBeVisible();
  });

  test('TC_USER_UPD_NEG_007 - Checker cannot Reject user update without a comment — Confirm is disabled', async ({ page }) => {
    await createUserUpdateAsMaker(page);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'USER UPDATE' }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('cell', { name: 'USER UPDATE' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review User' })).toBeVisible();

    // Click Reject — leave comment empty
    await page.getByRole('button', { name: 'Reject' }).click();
    const commentsField = page.getByRole('textbox', { name: 'Comments *' });
    await expect(commentsField).toBeVisible();
    await expect(commentsField).toHaveValue('');

    // Confirm should be disabled when comment is empty
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    await expect(page.getByText('Process rejected')).not.toBeVisible();
  });

  test('TC_USER_UPD_NEG_008 - Checker rejects user update with a valid reason', async ({ page }) => {
    await createUserUpdateAsMaker(page);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'USER UPDATE' }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('cell', { name: 'USER UPDATE' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review User' })).toBeVisible();

    // Click Reject — fill comment
    await page.getByRole('button', { name: 'Reject' }).click();
    await page.getByRole('textbox', { name: 'Comments *' }).fill(userCheckerComments.reject);
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Assert rejection success
    await expect(page.getByText('Process rejected')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Close toast' }).click();

    // Logout AdminChecker
    await page.getByRole('button', { name: /a admin/i }).click();
    await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

});
