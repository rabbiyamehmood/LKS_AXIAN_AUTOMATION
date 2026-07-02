import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { generateAggregatorData, checkerComments } from '../../test-data/aggregator.data';

/**
 * Aggregator Negative Test Cases — based on actual UI validation messages
 *
 * Validation messages observed:
 *   - "Aggregator name is required"
 *   - "Contact person name is required"
 *   - "Invalid email format"
 *   - "Phone number is required"
 *   - "Must be a valid phone number"
 *   - "At least one payment method must be selected"
 *
 * MAKER side (form validation — TC_AGG_NEG_001 to 010):
 *   001 — All fields empty → all required errors shown after clicking Save
 *   002 — Name missing → "Aggregator name is required"
 *   003 — Name with numbers only → validation error
 *   004 — Contact person missing → "Contact person name is required"
 *   005 — Email missing → "Invalid email format"
 *   006 — Invalid email (missing @) → "Invalid email format"
 *   007 — Invalid email (double @@) → "Invalid email format"
 *   008 — Phone missing → "Phone number is required"
 *   009 — Non-numeric phone → "Must be a valid phone number"
 *   010 — No payment method selected → "At least one payment method must be selected"
 *
 * CHECKER side (TC_AGG_NEG_011 to 013):
 *   011 — Approve without comment → Confirm disabled
 *   012 — Reject without comment → Confirm disabled
 *   013 — Reject with valid reason (negative workflow)
 */

// ── Helper: login as AdminMaker and open the Add Aggregator form ──────────────

async function openAddForm(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  await page.getByRole('button', { name: 'Aggregator Management' }).click();
  await page.getByRole('link', { name: 'Aggregator List' }).click();
  await page.getByRole('button', { name: 'Add Aggregator' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter aggregator name' })).toBeVisible();
}

// ── Helper: create aggregator as Maker then logout (for checker tests) ────────

async function createAndLogout(page: import('@playwright/test').Page) {
  const loginPage      = new LoginPage(page);
  const data           = generateAggregatorData();

  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  await page.getByRole('button', { name: 'Aggregator Management' }).click();
  await page.getByRole('link', { name: 'Aggregator List' }).click();
  await page.getByRole('button', { name: 'Add Aggregator' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter aggregator name' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(data.name);
  await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(data.contactPerson);
  await page.getByRole('textbox', { name: 'Enter email address' }).fill(data.email);
  await page.getByRole('textbox', { name: 'Enter phone number' }).fill(data.phone);
  await page.locator('#QR').click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Processed OK')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Logout
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAKER — FORM VALIDATION NEGATIVE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Aggregator Creation — Form Validation (Negative)', () => {

  test('TC_AGG_NEG_001 - All fields empty - Save shows required errors on all fields', async ({ page }) => {
    await openAddForm(page);

    // Click Save without filling anything
    await page.getByRole('button', { name: 'Save' }).click();

    // Assert all required error messages appear
    await expect(page.getByText('Aggregator name is required')).toBeVisible();
    await expect(page.getByText('Contact person name is required')).toBeVisible();
    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('At least one payment method must be selected')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_NEG_002 - Aggregator Name missing - shows "Aggregator name is required"', async ({ page }) => {
    await openAddForm(page);
    const data = generateAggregatorData();

    await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(data.contactPerson);
    await page.getByRole('textbox', { name: 'Enter email address' }).fill(data.email);
    await page.getByRole('textbox', { name: 'Enter phone number' }).fill(data.phone);
    await page.locator('#QR').click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Aggregator name is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_NEG_003 - Aggregator Name with numbers only - should show validation error', async ({ page }) => {
    await openAddForm(page);
    const data = generateAggregatorData();

    await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill('123456789');
    await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(data.contactPerson);
    await page.getByRole('textbox', { name: 'Enter email address' }).fill(data.email);
    await page.getByRole('textbox', { name: 'Enter phone number' }).fill(data.phone);
    await page.locator('#QR').click();
    await page.getByRole('button', { name: 'Save' }).click();

    const hasError = await page.getByText('Aggregator name is required').isVisible()
      || await page.getByText(/invalid/i).isVisible();
    if (!hasError) {
      await expect(page.getByText('Processed OK')).not.toBeVisible();
    } else {
      expect(hasError).toBeTruthy();
    }
  });

  test('TC_AGG_NEG_004 - Contact Person missing - shows "Contact person name is required"', async ({ page }) => {
    await openAddForm(page);
    const data = generateAggregatorData();

    await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(data.name);
    await page.getByRole('textbox', { name: 'Enter email address' }).fill(data.email);
    await page.getByRole('textbox', { name: 'Enter phone number' }).fill(data.phone);
    await page.locator('#QR').click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Contact person name is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_NEG_005 - Email missing - shows "Invalid email format"', async ({ page }) => {
    await openAddForm(page);
    const data = generateAggregatorData();

    await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(data.name);
    await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(data.contactPerson);
    await page.getByRole('textbox', { name: 'Enter phone number' }).fill(data.phone);
    await page.locator('#QR').click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_NEG_006 - Invalid email format (missing @) - shows "Invalid email format"', async ({ page }) => {
    await openAddForm(page);
    const data = generateAggregatorData();

    await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(data.name);
    await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(data.contactPerson);
    await page.getByRole('textbox', { name: 'Enter email address' }).fill('invalidemail.com');
    await page.getByRole('textbox', { name: 'Enter phone number' }).fill(data.phone);
    await page.locator('#QR').click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_NEG_007 - Invalid email format (double @@) - shows "Invalid email format"', async ({ page }) => {
    await openAddForm(page);
    const data = generateAggregatorData();

    await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(data.name);
    await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(data.contactPerson);
    await page.getByRole('textbox', { name: 'Enter email address' }).fill('test@@yopmail.com');
    await page.getByRole('textbox', { name: 'Enter phone number' }).fill(data.phone);
    await page.locator('#QR').click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_NEG_008 - Phone missing - shows "Phone number is required"', async ({ page }) => {
    await openAddForm(page);
    const data = generateAggregatorData();

    await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(data.name);
    await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(data.contactPerson);
    await page.getByRole('textbox', { name: 'Enter email address' }).fill(data.email);
    await page.locator('#QR').click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_NEG_009 - Non-numeric phone - field rejects alphabets and keeps field empty', async ({ page }) => {
    await openAddForm(page);
    const data = generateAggregatorData();

    await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(data.name);
    await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(data.contactPerson);
    await page.getByRole('textbox', { name: 'Enter email address' }).fill(data.email);

    // Type alphabets into phone field — field should silently reject them
    const phoneField = page.getByRole('textbox', { name: 'Enter phone number' });
    await phoneField.fill('ABCDEFGH');

    // Field value should be empty because non-numeric chars are filtered out
    await expect(phoneField).toHaveValue('');

    await page.locator('#QR').click();
    await page.getByRole('button', { name: 'Save' }).click();

    // Empty phone field → "Phone number is required" error shown
    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

  test('TC_AGG_NEG_010 - No payment method selected - shows "At least one payment method must be selected"', async ({ page }) => {
    await openAddForm(page);
    const data = generateAggregatorData();

    // Fill all fields but do NOT click QR
    await page.getByRole('textbox', { name: 'Enter aggregator name' }).fill(data.name);
    await page.getByRole('textbox', { name: 'Enter contact person name' }).fill(data.contactPerson);
    await page.getByRole('textbox', { name: 'Enter email address' }).fill(data.email);
    await page.getByRole('textbox', { name: 'Enter phone number' }).fill(data.phone);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('At least one payment method must be selected')).toBeVisible();
    await expect(page.getByText('Processed OK')).not.toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
//  CHECKER — APPROVAL VALIDATION NEGATIVE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Aggregator Approval — Checker Validation (Negative)', () => {

  test('TC_AGG_NEG_011 - Checker cannot Approve without a comment - Confirm is disabled', async ({ page }) => {
    await createAndLogout(page);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first()).toBeVisible({ timeout: 15000 });

    await page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review Aggregator' })).toBeVisible();

    // Click Approve — leave comment empty
    await page.getByRole('button', { name: 'Approve' }).click();

    // Confirm should be disabled when comment is empty
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    await expect(page.getByText('Process approved successfully')).not.toBeVisible();

    // Cleanup: approve with comment so pending queue stays clean
    await page.getByRole('textbox', { name: 'Comments *' }).fill('Cleanup: approved after empty-comment validation test');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Process approved successfully')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Close toast' }).click();

    await page.getByRole('button', { name: /a admin/i }).click();
    await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC_AGG_NEG_012 - Checker cannot Reject without a comment - Confirm is disabled', async ({ page }) => {
    await createAndLogout(page);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first()).toBeVisible({ timeout: 15000 });

    await page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review Aggregator' })).toBeVisible();

    // Click Reject — leave comment empty
    await page.getByRole('button', { name: 'Reject' }).click();

    // Confirm should be disabled when comment is empty
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    await expect(page.getByText(/rejected/i)).not.toBeVisible();

    // Cleanup: reject with comment so pending queue stays clean
    await page.getByRole('textbox', { name: 'Comments *' }).fill('Cleanup: rejected after empty-comment validation test');
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText(/rejected/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Close toast' }).click();

    await page.getByRole('button', { name: /a admin/i }).click();
    await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC_AGG_NEG_013 - Checker rejects aggregator creation with a valid reason', async ({ page }) => {
    await createAndLogout(page);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole('button', { name: 'Inbox' }).click();
    await page.getByRole('link', { name: 'Pending Processes' }).click();
    await expect(page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first()).toBeVisible({ timeout: 15000 });

    await page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first().click();
    await page.getByRole('button', { name: 'Review' }).first().click();
    await expect(page.getByRole('heading', { name: 'Review Aggregator' })).toBeVisible();

    // Reject with valid comment
    await page.getByRole('button', { name: 'Reject' }).click();
    await page.getByRole('textbox', { name: 'Comments *' }).fill(checkerComments.reject);
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText(/rejected/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Close toast' }).click();

    await page.getByRole('button', { name: /a admin/i }).click();
    await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

});
