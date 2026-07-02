import { test, expect } from '@playwright/test';
import { LoginPage }           from '../../pages/mmp/LoginPage';
import { TillManagementPage }  from '../../pages/mmp/TillManagementPage';

/**
 * Till Management — View Terminal & Filter Tests
 *
 * TC_TILL_004  View Terminal details → Go Back to list
 * TC_TILL_005  Filter by Owner MSISDN
 * TC_TILL_006  Filter by Merchant Name
 * TC_TILL_007  Filter by Entity MSISDN
 * TC_TILL_008  Filter by Source MID
 * TC_TILL_009  Filter by Source TID        [KNOWN BUG — returns full list]
 * TC_TILL_010  Filter by Alias Code        [KNOWN BUG — returns no data]
 * TC_TILL_011  Filter by Terminal Name
 * TC_TILL_012  Filter by Date Range (yesterday → today)
 */

// ── Test data ─────────────────────────────────────────────────────────────────
const OWNER_MSISDN  = '255675288586';
const ENTITY_MSISDN = '25570000550';
const SOURCE_MID    = '000921778084667';
const SOURCE_TID    = '00000116';
const ALIAS_CODE    = '00000116';
const TERMINAL_NAME = 'TestTerminal';
const MERCHANT_NAME = 'Touseef Naveed';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function loginAndGoToTillList(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const till      = new TillManagementPage(page);
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await till.navigateToTillList();
  return { loginPage, till };
}

async function openFilterPanel(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Filter' }).click();
}

async function applyFilters(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);
}

async function resetFilters(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Reset' }).click();
  await page.waitForTimeout(800);
}

// ════════════════════════════════════════════════════════════════════════════
// TC_TILL_004 — View Terminal details and Go Back
// ════════════════════════════════════════════════════════════════════════════

test('TC_TILL_004 - View terminal details and Go Back returns to Terminal List', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndGoToTillList(page);

  // Open Actions dropdown and click View on first row
  await page.getByText('Actions').first().click();
  await page.getByRole('button', { name: 'View' }).first().click();

  // Assert we are on the terminal detail/view page
  await expect(page.getByRole('heading', { name: /terminal/i }).first()).toBeVisible({ timeout: 15000 });

  // Click Go Back and assert we return to Terminal List
  await page.getByRole('button', { name: 'Go Back' }).click();
  await expect(page.getByRole('heading', { name: 'Terminal List' })).toBeVisible({ timeout: 15000 });
});

// ════════════════════════════════════════════════════════════════════════════
// Filter Tests
// ════════════════════════════════════════════════════════════════════════════

test.describe('Till Management — Filters', () => {

  // TC_TILL_005 — Filter by Owner MSISDN
  test('TC_TILL_005 - Filter by Owner MSISDN returns matching results', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAndGoToTillList(page);

    await openFilterPanel(page);
    await page.getByRole('textbox', { name: 'Enter owner MSISDN' }).fill(OWNER_MSISDN);
    await applyFilters(page);

    // Assert table has results
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('No data found')).not.toBeVisible();

    await resetFilters(page);
    // After reset, full list should be back
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
  });

  // TC_TILL_006 — Filter by Merchant Name
  test('TC_TILL_006 - Filter by Merchant Name returns matching results', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAndGoToTillList(page);

    await openFilterPanel(page);
    await page.getByRole('textbox', { name: 'Enter merchant name' }).fill(MERCHANT_NAME);
    await applyFilters(page);

    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('No data found')).not.toBeVisible();

    await resetFilters(page);
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
  });

  // TC_TILL_007 — Filter by Entity MSISDN
  test('TC_TILL_007 - Filter by Entity MSISDN returns matching results', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAndGoToTillList(page);

    await openFilterPanel(page);
    await page.getByRole('textbox', { name: 'Enter entity MSISDN' }).fill(ENTITY_MSISDN);
    await applyFilters(page);

    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('No data found')).not.toBeVisible();

    await resetFilters(page);
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
  });

  // TC_TILL_008 — Filter by Source MID
  test('TC_TILL_008 - Filter by Source MID returns matching results', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAndGoToTillList(page);

    await openFilterPanel(page);
    await page.getByRole('textbox', { name: 'Enter source MID' }).fill(SOURCE_MID);
    await applyFilters(page);

    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('No data found')).not.toBeVisible();

    await resetFilters(page);
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
  });

  // TC_TILL_009 — Filter by Source TID [KNOWN BUG]
  test('TC_TILL_009 - Filter by Source TID returns only matching terminal [KNOWN BUG]', async ({ page }) => {
    test.fail(true, 'Known bug: Source TID filter returns full list instead of filtering by specific TID');
    test.setTimeout(60_000);
    await loginAndGoToTillList(page);

    await openFilterPanel(page);
    await page.getByRole('textbox', { name: 'Enter source TID' }).fill(SOURCE_TID);
    await applyFilters(page);

    // Expected: only the terminal with TID 00000116 should appear (single row)
    // Actual:   full list is returned (bug)
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1, { timeout: 15000 });

    await resetFilters(page);
  });

  // TC_TILL_010 — Filter by Alias Code [KNOWN BUG]
  test('TC_TILL_010 - Filter by Alias Code returns matching terminal [KNOWN BUG]', async ({ page }) => {
    test.fail(true, 'Known bug: Alias Code filter returns "No data found" instead of matching terminal');
    test.setTimeout(60_000);
    await loginAndGoToTillList(page);

    await openFilterPanel(page);
    await page.getByRole('textbox', { name: 'Enter alias code' }).fill(ALIAS_CODE);
    await applyFilters(page);

    // Expected: terminal with alias 00000116 should appear
    // Actual:   "No data found" is shown (bug)
    await expect(page.getByText('No data found')).not.toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });

    await resetFilters(page);
  });

  // TC_TILL_011 — Filter by Terminal Name
  test('TC_TILL_011 - Filter by Terminal Name returns exact matching terminal', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAndGoToTillList(page);

    await openFilterPanel(page);
    await page.getByRole('textbox', { name: 'Enter terminal name' }).fill(TERMINAL_NAME);
    await applyFilters(page);

    // Assert exact terminal name visible in results
    await expect(page.getByText(TERMINAL_NAME, { exact: true })).toBeVisible({ timeout: 15000 });

    await resetFilters(page);
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
  });

  // TC_TILL_012 — Filter by Date Range (yesterday → today)
  test('TC_TILL_012 - Filter by Date Range returns terminals created in range', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAndGoToTillList(page);

    await openFilterPanel(page);

    // Build dynamic calendar cell labels for yesterday and today
    const today     = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const fromLabel = `${DAYS[yesterday.getDay()]}, ${MONTHS[yesterday.getMonth()]} ${yesterday.getDate()}`;
    const toLabel   = `${DAYS[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`;

    await page.getByRole('textbox', { name: 'From Date' }).click();
    await page.getByRole('gridcell', { name: new RegExp(fromLabel) }).click();

    await page.getByRole('textbox', { name: 'To Date' }).click();
    await page.getByRole('gridcell', { name: new RegExp(toLabel) }).click();

    await applyFilters(page);

    // Assert table shows results (terminals created in this date range)
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('No data found')).not.toBeVisible();
    // Assert "Created At" column header is visible
    await expect(page.getByRole('columnheader', { name: /created at/i })).toBeVisible({ timeout: 10000 });

    await resetFilters(page);
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
  });
});
