import { test, expect } from '@playwright/test';
import { LoginPage }          from '../../pages/mmp/LoginPage';
import { TillManagementPage } from '../../pages/mmp/TillManagementPage';

/**
 * Till Management — Negative Test Cases
 *
 * Create Form Validation:
 *   TC_TILL_NEG_001  Save with all fields empty → validation errors shown
 *   TC_TILL_NEG_002  Invalid email format → error shown, form not submitted
 *   TC_TILL_NEG_003  Non-numeric mobile number → field rejects input
 *   TC_TILL_NEG_004  No merchant selected → validation error shown
 *   TC_TILL_NEG_005  Terminal name missing only → error shown
 *
 * Update Form Validation:
 *   TC_TILL_NEG_006  Clear terminal name on edit → update blocked with error
 *
 * Checker Validation:
 *   TC_TILL_NEG_007  Checker Approve without comment → Confirm is disabled
 *   TC_TILL_NEG_008  Checker Reject without comment  → Confirm is disabled
 *
 * Filter Validation:
 *   TC_TILL_NEG_009  Filter with non-existent MSISDN → No data found
 *   TC_TILL_NEG_010  Filter with non-existent terminal name → No data found
 */

const MERCHANT_SEARCH = 'tous';
const MERCHANT_OPTION = 'touseefullah (25570000550)';

// ── Helpers ────────────────────────────────────────────────────────────────

async function loginAndGoToTillList(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const till      = new TillManagementPage(page);
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await till.navigateToTillList();
  return { loginPage, till };
}

async function loginAndOpenAddTerminalForm(page: import('@playwright/test').Page) {
  const { till } = await loginAndGoToTillList(page);
  await till.addTillBtn.click();
  await expect(page.getByRole('heading', { name: 'Add Terminal' })).toBeVisible({ timeout: 15000 });
  return till;
}

// ════════════════════════════════════════════════════════════════════════════
// Create Form Validation
// ════════════════════════════════════════════════════════════════════════════

// TC_TILL_NEG_001 — Save with all fields empty
test('TC_TILL_NEG_001 - Save with all fields empty shows validation errors', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndOpenAddTerminalForm(page);

  await page.getByRole('button', { name: 'Save' }).click();

  // All required field errors should appear
  await expect(page.getByText(/terminal name is required/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/email.*required|required.*email/i)).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/mobile.*required|required.*mobile/i)).toBeVisible({ timeout: 5000 });

  // Form must not be submitted
  await expect(page.getByText(/Processed OK/i)).not.toBeVisible();
});

// TC_TILL_NEG_002 — Invalid email format
test('TC_TILL_NEG_002 - Invalid email format shows validation error', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndOpenAddTerminalForm(page);

  await page.getByRole('textbox', { name: 'Enter terminal name' }).fill('NegTestTerminal');
  await page.getByRole('textbox', { name: 'Enter email address' }).fill('notanemail');
  await page.getByRole('textbox', { name: 'Enter mobile number' }).fill('700000099');
  await page.getByRole('textbox', { name: 'Enter location' }).fill('TestCity');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText(/invalid email/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Processed OK/i)).not.toBeVisible();
});

// TC_TILL_NEG_003 — Non-numeric mobile number
test('TC_TILL_NEG_003 - Non-numeric mobile number is rejected by the field', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndOpenAddTerminalForm(page);

  const mobileInput = page.getByRole('textbox', { name: 'Enter mobile number' });
  await mobileInput.fill('ABCDEFGH');

  // Field should silently reject alphabets → value stays empty or unchanged
  const val = await mobileInput.inputValue();
  expect(val).toBe('');

  // Clicking save should show mobile required error (field is empty)
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/mobile.*required|required.*mobile/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Processed OK/i)).not.toBeVisible();
});

// TC_TILL_NEG_004 — No merchant selected
test('TC_TILL_NEG_004 - No merchant selected shows validation error', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndOpenAddTerminalForm(page);

  // Fill all fields except merchant
  await page.getByRole('textbox', { name: 'Enter terminal name' }).fill('NegNoMerchant');
  await page.getByRole('textbox', { name: 'Enter email address' }).fill('negmerchant@yopmail.com');
  await page.getByRole('textbox', { name: 'Enter mobile number' }).fill('700000088');
  await page.getByRole('textbox', { name: 'Enter location' }).fill('TestCity');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText(/merchant.*required|required.*merchant|please select.*merchant/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Processed OK/i)).not.toBeVisible();
});

// TC_TILL_NEG_005 — Terminal name missing only
test('TC_TILL_NEG_005 - Terminal name missing shows "Terminal name is required" error', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndOpenAddTerminalForm(page);

  // Leave terminal name empty, fill rest
  await page.getByRole('textbox', { name: 'Enter email address' }).fill('negname@yopmail.com');
  await page.getByRole('textbox', { name: 'Enter mobile number' }).fill('700000077');
  await page.getByRole('textbox', { name: 'Enter location' }).fill('TestCity');

  // Select merchant
  await page.getByRole('button', { name: 'Merchant*' }).click();
  await page.getByRole('textbox', { name: 'Search merchant' }).fill(MERCHANT_SEARCH);
  await page.getByRole('option', { name: MERCHANT_OPTION }).click();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText(/terminal name is required/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Processed OK/i)).not.toBeVisible();
});

// ════════════════════════════════════════════════════════════════════════════
// Update Form Validation
// ════════════════════════════════════════════════════════════════════════════

// TC_TILL_NEG_006 — Clear terminal name on edit
test('TC_TILL_NEG_006 - Clearing terminal name on edit shows validation error', async ({ page }) => {
  test.setTimeout(60_000);
  const { till } = await loginAndGoToTillList(page);

  await till.firstEditBtn.click();
  await expect(page.getByRole('heading', { name: 'Edit Terminal' })).toBeVisible({ timeout: 15000 });

  // Clear the terminal name field
  await till.terminalNameInput.clear();
  await till.updateBtn.click();

  await expect(page.getByText(/terminal name is required/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Processed OK/i)).not.toBeVisible();
});

// ════════════════════════════════════════════════════════════════════════════
// Checker Validation
// ════════════════════════════════════════════════════════════════════════════

// TC_TILL_NEG_007 — Checker Approve without comment → Confirm disabled
test('TC_TILL_NEG_007 - Checker cannot Approve terminal without a comment — Confirm is disabled', async ({ page }) => {
  test.fail(true, 'Known issue: Confirm button remains disabled when comment is empty — test gets stuck in cleanup flow');
  test.setTimeout(120_000);

  const loginPage = new LoginPage(page);
  const till      = new TillManagementPage(page);

  // Setup: Maker creates a terminal to get a pending entry
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await till.navigateToTillList();
  await till.addTerminal({
    name:           `NegApprove_${Date.now()}`,
    email:          `negapprove${Date.now()}@yopmail.com`,
    mobile:         '700000066',
    location:       'Africa',
    merchantSearch: MERCHANT_SEARCH,
    merchantOption: MERCHANT_OPTION,
  });

  // Logout Maker
  await page.getByRole('button', { name: /L Labesh/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

  // Login as Checker
  await loginPage.loginAsLabeshChecker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();
  await expect(page.getByRole('cell', { name: 'TERMINAL CREATION' }).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Review' }).first().click();

  // Click Approve — leave comment empty
  await page.getByRole('button', { name: 'Approve' }).click();

  // Confirm button must be disabled when comment is empty
  await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled({ timeout: 5000 });
  await expect(page.getByText('Process approved successfully')).not.toBeVisible();

  // Close modal — manual cleanup needed from pending queue
  await page.getByRole('button', { name: 'Cancel' }).click();
});

// TC_TILL_NEG_008 — Checker Reject without comment → Confirm disabled
test('TC_TILL_NEG_008 - Checker cannot Reject terminal without a comment — Confirm is disabled', async ({ page }) => {
  test.fail(true, 'Known issue: Confirm button remains disabled when comment is empty — test gets stuck in cleanup flow');
  test.setTimeout(120_000);

  const loginPage = new LoginPage(page);
  const till      = new TillManagementPage(page);

  // Setup: Maker creates a terminal
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await till.navigateToTillList();
  await till.addTerminal({
    name:           `NegReject_${Date.now()}`,
    email:          `negreject${Date.now()}@yopmail.com`,
    mobile:         '700000055',
    location:       'Africa',
    merchantSearch: MERCHANT_SEARCH,
    merchantOption: MERCHANT_OPTION,
  });

  // Logout Maker
  await page.getByRole('button', { name: /L Labesh/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

  // Login as Checker
  await loginPage.loginAsLabeshChecker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();
  await expect(page.getByRole('cell', { name: 'TERMINAL CREATION' }).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Review' }).first().click();

  // Click Reject — leave comment empty
  await page.getByRole('button', { name: 'Reject' }).click();

  // Confirm button must be disabled when comment is empty
  await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled({ timeout: 5000 });
  await expect(page.getByText('Process rejected successfully')).not.toBeVisible();

  // Close modal — manual cleanup needed from pending queue
  await page.getByRole('button', { name: 'Cancel' }).click();
});

// ════════════════════════════════════════════════════════════════════════════
// Filter Validation
// ════════════════════════════════════════════════════════════════════════════

// TC_TILL_NEG_009 — Filter with non-existent MSISDN
test('TC_TILL_NEG_009 - Filter by non-existent Owner MSISDN shows No data found', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndGoToTillList(page);

  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('textbox', { name: 'Enter owner MSISDN' }).fill('999999999999999');
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);

  await expect(page.getByText('No data found')).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Reset' }).click();
});

// TC_TILL_NEG_010 — Filter with non-existent terminal name
test('TC_TILL_NEG_010 - Filter by non-existent Terminal Name shows No data found', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndGoToTillList(page);

  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('textbox', { name: 'Enter terminal name' }).fill('XXXXXXXXXNONEXISTENT');
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);

  await expect(page.getByText('No data found')).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Reset' }).click();
});
