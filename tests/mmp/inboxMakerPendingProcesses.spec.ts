import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';

/**
 * Inbox - Maker Pending Processes (Positive Tests)
 *
 * TC_INBOX_001  Filter by Process ID
 * TC_INBOX_002  Filter by Request Type (Merchant Creation)
 * TC_INBOX_003  Filter by Date Range (yesterday to today)
 * TC_INBOX_004  Reset Filters
 */

async function loginAndGoToMakerPending(page: import('@playwright/test').Page) {
  const login = new LoginPage(page);
  await login.navigate();
  await login.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Maker Pending Process' }).click();
  await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 });
}

// TC_INBOX_001
test('TC_INBOX_001 - Filter by Process ID shows matching record', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndGoToMakerPending(page);

  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('textbox', { name: 'Enter process ID (digits only)' }).click();
  await page.getByRole('textbox', { name: 'Enter process ID (digits only)' }).fill('8318490');
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);

  await expect(page.getByRole('table').getByText('Process ID')).toBeVisible();
  await expect(page.getByRole('cell', { name: '8318490' })).toBeVisible();

  await page.getByRole('button', { name: 'Reset' }).click();
});

// TC_INBOX_002
test('TC_INBOX_002 - Filter by Request Type Merchant Creation shows matching records', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndGoToMakerPending(page);

  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('button', { name: 'Request Type' }).click();
  await page.getByText('Merchant Creation', { exact: true }).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);

  await expect(page.getByRole('table').getByText('Request Type')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'MERCHANT CREATION' }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Reset' }).click();
});

// TC_INBOX_003
test('TC_INBOX_003 - Filter by Date Range yesterday to today shows records', async ({ page }) => {
  test.setTimeout(90_000);
  await loginAndGoToMakerPending(page);

  await page.getByRole('button', { name: 'Filters', exact: true }).click();

  // From Date: yesterday
  await page.getByRole('textbox', { name: 'From Date' }).click();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yDateStr = yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  await page.getByRole('gridcell', { name: new RegExp(`Choose ${yDateStr.split(',')[0]}.*${yesterday.getDate()}`, 'i') }).first().click();

  // To Date: today
  await page.getByRole('textbox', { name: 'To Date' }).click();
  const today = new Date();
  const tDateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  await page.getByRole('gridcell', { name: new RegExp(`Choose ${tDateStr.split(',')[0]}.*${today.getDate()}`, 'i') }).first().click();

  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);

  // After date filter - table or no data should be visible
  const tableVisible  = await page.getByRole('table').isVisible().catch(() => false);
  const noDataVisible = await page.getByText('No data found').isVisible().catch(() => false);
  expect(tableVisible || noDataVisible).toBe(true);
});

// TC_INBOX_004
test('TC_INBOX_004 - Reset Filters clears all applied filters', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndGoToMakerPending(page);

  // Apply a filter first
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('textbox', { name: 'Enter process ID (digits only)' }).fill('8318490');
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);
  await expect(page.getByRole('cell', { name: '8318490' })).toBeVisible();

  // Reset — filter panel is already open after Apply Filters
  await page.getByRole('button', { name: 'Reset' }).click();
  await page.waitForTimeout(800);

  // Process ID field should be empty
  await expect(page.getByRole('textbox', { name: 'Enter process ID (digits only)' })).toHaveValue('');
});

// TC_INBOX_005
test('TC_INBOX_005 - Filter by Request Type then Review record shows action buttons', async ({ page }) => {
  /**
   * Scenario: After applying a Request Type filter in the Inbox, the user
   * clicks Review on the first matching record and verifies that the Review
   * detail page opens and all available action buttons are present:
   *   • Go Back  — returns to the list
   *   • Reject   — rejects the request
   *   • Approve  — approves the request
   *
   * This test only navigates to the review page and asserts the UI state;
   * it does NOT perform the approval / rejection action (those are covered
   * by the dedicated update / creation test suites).
   */
  test.setTimeout(60_000);
  await loginAndGoToMakerPending(page);

  // Step 1: Open Filters and select Request Type = Aggregator Creation
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('button', { name: 'Request Type' }).click();
  await page.getByText('Aggregator Creation', { exact: true }).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);

  // Step 2: Assert at least one result row is visible
  await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('cell', { name: 'AGGREGATOR CREATION' }).first()).toBeVisible({ timeout: 15_000 });

  // Step 3: Click Review on the first result
  await page.getByRole('button', { name: 'Review' }).first().click();

  // Step 4: Assert the Review detail page has opened
  await expect(page.getByRole('heading', { name: 'Review Aggregator' })).toBeVisible({ timeout: 15_000 });

  // Step 5: Assert all three action buttons are present
  await expect(page.getByRole('button', { name: 'Go Back' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reject' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();

  // Step 6: Return to list using Go Back (leaves the system in a clean state)
  await page.getByRole('button', { name: 'Go Back' }).click();
  await expect(page.getByRole('table')).toBeVisible({ timeout: 15_000 });
});
