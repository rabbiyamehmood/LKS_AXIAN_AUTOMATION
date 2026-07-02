import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { generateAggregatorData, checkerComments } from '../../test-data/aggregator.data';

/**
 * Aggregator Update — Negative Test Cases
 *
 * MAKER side (edit form validation — TC_AGG_UPD_NEG_001 to 007):
 *   001 — Clear Aggregator Name → "Aggregator name is required"
 *   002 — Clear Contact Person → "Contact person name is required"
 *   003 — Clear Email → "Invalid email format"
 *   004 — Invalid email (missing @) → "Invalid email format"
 *   005 — Clear Phone → "Phone number is required"
 *   006 — Non-numeric phone → field stays empty → "Phone number is required"
 *   007 — Uncheck QR (no payment method) → "At least one payment method must be selected"
 *
 * CHECKER side (TC_AGG_UPD_NEG_008 to 010):
 *   008 — Approve without comment → Confirm button is disabled
 *   009 — Reject without comment → Confirm button is disabled
 *   010 — Checker rejects update with valid reason
 */

// ── Helper: open the edit form of the first aggregator ──────────────────────

async function openEditForm(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  await page.getByRole('button', { name: 'Aggregator Management' }).click();
  await page.getByRole('link', { name: 'Aggregator List' }).click();
  await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByRole('textbox', { name: 'Enter aggregator name' })).toBeVisible();
}

// ── Helper: create an update request as maker then switch to checker ─────────

async function createUpdateRequestAsMaker(page: import('@playwright/test').Page) {
  const ts = Date.now();
  await openEditForm(page);

  await page.getByRole('textbox', { name: 'Enter aggregator name' }).clear();
  await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(`Auto_Update_${ts}`);
  await page.getByRole('textbox', { name: 'Enter email address' }).clear();
  await page.getByRole('textbox', { name: 'Enter email address' }).fill(`update${ts}@yopmail.com`);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Processed OK')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Logout maker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
}

// ── NEGATIVE — MAKER FORM VALIDATION ─────────────────────────────────────────

test.describe('Aggregator Update — Form Validation (Negative)', () => {

  test('TC_AGG_UPD_NEG_001 - Clear Aggregator Name — shows "Aggregator name is required"', async ({ page }) => {
    await openEditForm(page);

    // Step: Clear the Aggregator Name field
    await page.getByRole('textbox', { name: 'Enter aggregator name' }).clear();

    // Step: Click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Assert: validation error shown
    await expect(page.getByText('Aggregator name is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_UPD_NEG_002 - Clear Contact Person — shows "Contact person name is required"', async ({ page }) => {
    await openEditForm(page);

    await page.getByRole('textbox', { name: 'Enter contact person name' }).clear();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Contact person name is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_UPD_NEG_003 - Clear Email — shows "Invalid email format"', async ({ page }) => {
    await openEditForm(page);

    await page.getByRole('textbox', { name: 'Enter email address' }).clear();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_UPD_NEG_004 - Invalid email format (missing @) — shows "Invalid email format"', async ({ page }) => {
    await openEditForm(page);

    await page.getByRole('textbox', { name: 'Enter email address' }).clear();
    await page.getByRole('textbox', { name: 'Enter email address' }).fill('invalidemail.com');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_UPD_NEG_005 - Clear Phone — shows "Phone number is required"', async ({ page }) => {
    await openEditForm(page);

    await page.getByRole('textbox', { name: 'Enter phone number' }).clear();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_UPD_NEG_006 - Non-numeric phone — field rejects alphabets, stays empty, shows "Phone number is required"', async ({ page }) => {
    await openEditForm(page);

    const phoneField = page.getByRole('textbox', { name: 'Enter phone number' });
    await phoneField.clear();
    await phoneField.fill('ABCDEFGH');

    // Field should reject non-numeric → value stays empty
    await expect(phoneField).toHaveValue('');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_UPD_NEG_007 - Uncheck QR (no payment method) — shows "At least one payment method must be selected"', async ({ page }) => {
    await openEditForm(page);

    // Uncheck QR if it is checked
    const qrCheckbox = page.locator('#QR');
    const isChecked  = await qrCheckbox.isChecked();
    if (isChecked) {
      await qrCheckbox.click();
    }

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('At least one payment method must be selected')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

});

// ── NEGATIVE — CHECKER VALIDATION ────────────────────────────────────────────

test.describe('Aggregator Update — Checker Validation (Negative)', () => {

  test('TC_AGG_UPD_NEG_008 - Checker cannot Approve update without a comment — Confirm is disabled', async ({ page }) => {
    // Setup: create a pending update
    await createUpdateRequestAsMaker(page);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'AGGREGATOR UPDATE' }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('cell', { name: 'AGGREGATOR UPDATE' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review Aggregator' })).toBeVisible();

    // Click Approve — leave comment empty
    await page.getByRole('button', { name: 'Approve' }).click();
    const commentsField = page.getByRole('textbox', { name: 'Comments *' });
    await expect(commentsField).toBeVisible();
    await expect(commentsField).toHaveValue('');

    // Confirm should be disabled when comment is empty
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    await expect(page.getByText('Process approved successfully')).not.toBeVisible();
  });

  test('TC_AGG_UPD_NEG_009 - Checker cannot Reject update without a comment — Confirm is disabled', async ({ page }) => {
    // Setup: create a pending update
    await createUpdateRequestAsMaker(page);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'AGGREGATOR UPDATE' }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('cell', { name: 'AGGREGATOR UPDATE' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review Aggregator' })).toBeVisible();

    // Click Reject — leave comment empty
    await page.getByRole('button', { name: 'Reject' }).click();
    const commentsField = page.getByRole('textbox', { name: 'Comments *' });
    await expect(commentsField).toBeVisible();
    await expect(commentsField).toHaveValue('');

    // Confirm should be disabled when comment is empty
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    await expect(page.getByText('Process rejected')).not.toBeVisible();
  });

  test('TC_AGG_UPD_NEG_010 - Checker rejects aggregator update with a valid reason', async ({ page }) => {
    // Setup: create a pending update
    await createUpdateRequestAsMaker(page);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'AGGREGATOR UPDATE' }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('cell', { name: 'AGGREGATOR UPDATE' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review Aggregator' })).toBeVisible();

    // Reject with comment
    await page.getByRole('button', { name: 'Reject' }).click();
    await page.getByRole('textbox', { name: 'Comments *' }).fill(checkerComments.reject);
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Process rejected')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Close toast' }).click();

    // Logout
    await page.getByRole('button', { name: /a admin/i }).click();
    await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

});
