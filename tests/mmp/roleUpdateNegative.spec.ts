import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { generateRoleData, roleCheckerComments } from '../../test-data/role.data';

/**
 * Role Update — Negative Test Cases
 *
 * MAKER side (edit form validation — TC_ROLE_UPD_NEG_001 to 005):
 *   001 — Clear Role Name → "Name must be at least 4 characters"
 *   002 — Role Name too short (< 4 chars) → "Name must be at least 4 characters"
 *   003 — Role Name too long (> 70 chars) → max length enforcement
 *   004 — Clear Description → "Description must be at least 4 characters"
 *   005 — Description too short (< 4 chars) → "Description must be at least 4 characters"
 *
 * CHECKER side (TC_ROLE_UPD_NEG_006 to 008):
 *   006 — Approve without comment → Confirm button is disabled
 *   007 — Reject without comment → Confirm button is disabled
 *   008 — Checker rejects role update with valid reason
 */

// ── Helper: open the Edit form of the first role ─────────────────────────────

async function openRoleEditForm(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  await page.getByRole('button', { name: 'User & Role Management' }).click();
  await page.getByRole('link', { name: 'Role List' }).click();
  await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByRole('textbox', { name: 'Enter role name' })).toBeVisible();
}

// ── Helper: create an update request as maker then logout ────────────────────

async function createRoleUpdateAsMaker(page: import('@playwright/test').Page) {
  const ts = Date.now();
  await openRoleEditForm(page);

  await page.getByRole('textbox', { name: 'Enter role name' }).clear();
  await page.getByRole('textbox', { name: 'Enter role name' }).fill(`Auto_Role_Update_${ts}`);
  await page.getByRole('textbox', { name: 'Enter role description' }).clear();
  await page.getByRole('textbox', { name: 'Enter role description' }).fill(`Updated description ${ts}`);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Processed OK')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Logout maker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
}

// ── NEGATIVE — MAKER FORM VALIDATION ─────────────────────────────────────────

test.describe('Role Update — Form Validation (Negative)', () => {

  test('TC_ROLE_UPD_NEG_001 - Clear Role Name — shows "Name must be at least 4 characters"', async ({ page }) => {
    await openRoleEditForm(page);

    // Step: Clear the Role Name field
    await page.getByRole('textbox', { name: 'Enter role name' }).clear();

    // Step: Click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Assert: validation error shown
    await expect(page.getByText('Name must be at least 4 characters')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_ROLE_UPD_NEG_002 - Role Name too short (< 4 chars) — shows "Name must be at least 4 characters"', async ({ page }) => {
    await openRoleEditForm(page);

    await page.getByRole('textbox', { name: 'Enter role name' }).clear();
    await page.getByRole('textbox', { name: 'Enter role name' }).fill('abc');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Name must be at least 4 characters')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_ROLE_UPD_NEG_003 - Role Name too long (> 70 chars) — max length enforcement', async ({ page }) => {
    await openRoleEditForm(page);

    const nameField = page.getByRole('textbox', { name: 'Enter role name' });
    await nameField.clear();
    await nameField.fill('A'.repeat(71));
    await nameField.press('Tab');

    const actualValue = await nameField.inputValue();

    if (actualValue.length > 70) {
      await expect(page.getByText('Name cannot exceed 70 characters')).toBeVisible();
    } else {
      expect(actualValue.length).toBeLessThanOrEqual(70);
    }

    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_ROLE_UPD_NEG_004 - Clear Description — shows "Description must be at least 4 characters"', async ({ page }) => {
    await openRoleEditForm(page);

    await page.getByRole('textbox', { name: 'Enter role description' }).clear();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Description must be at least 4 characters')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_ROLE_UPD_NEG_005 - Description too short (< 4 chars) — shows "Description must be at least 4 characters"', async ({ page }) => {
    await openRoleEditForm(page);

    await page.getByRole('textbox', { name: 'Enter role description' }).clear();
    await page.getByRole('textbox', { name: 'Enter role description' }).fill('abc');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Description must be at least 4 characters')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

});

// ── NEGATIVE — CHECKER VALIDATION ────────────────────────────────────────────

test.describe('Role Update — Checker Validation (Negative)', () => {

  test('TC_ROLE_UPD_NEG_006 - Checker cannot Approve role update without a comment — Confirm is disabled', async ({ page }) => {
    await createRoleUpdateAsMaker(page);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'ROLE UPDATE' }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('cell', { name: 'ROLE UPDATE' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review Role' })).toBeVisible();

    // Click Approve — leave comment empty
    await page.getByRole('button', { name: 'Approve' }).click();
    const commentsField = page.getByRole('textbox', { name: 'Comments *' });
    await expect(commentsField).toBeVisible();
    await expect(commentsField).toHaveValue('');

    // Confirm should be disabled when comment is empty
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    await expect(page.getByText('Process approved successfully')).not.toBeVisible();
  });

  test('TC_ROLE_UPD_NEG_007 - Checker cannot Reject role update without a comment — Confirm is disabled', async ({ page }) => {
    await createRoleUpdateAsMaker(page);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'ROLE UPDATE' }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('cell', { name: 'ROLE UPDATE' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review Role' })).toBeVisible();

    // Click Reject — leave comment empty
    await page.getByRole('button', { name: 'Reject' }).click();
    const commentsField = page.getByRole('textbox', { name: 'Comments *' });
    await expect(commentsField).toBeVisible();
    await expect(commentsField).toHaveValue('');

    // Confirm should be disabled when comment is empty
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    await expect(page.getByText('Process rejected')).not.toBeVisible();
  });

  test('TC_ROLE_UPD_NEG_008 - Checker rejects role update with a valid reason', async ({ page }) => {
    await createRoleUpdateAsMaker(page);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'ROLE UPDATE' }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('cell', { name: 'ROLE UPDATE' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review Role' })).toBeVisible();

    // Click Reject — fill comment
    await page.getByRole('button', { name: 'Reject' }).click();
    await page.getByRole('textbox', { name: 'Comments *' }).fill(roleCheckerComments.reject);
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
