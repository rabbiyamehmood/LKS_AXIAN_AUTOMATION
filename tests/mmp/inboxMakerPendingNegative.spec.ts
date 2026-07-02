import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';

/**
 * Inbox - Maker Pending Processes (Negative Tests)
 *
 * TC_INBOX_NEG_001  Filter by non-existent Process ID shows "No data found"
 * TC_INBOX_NEG_002  From Date later than To Date shows validation error
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

// TC_INBOX_NEG_001
test('TC_INBOX_NEG_001 - Filter by non-existent Process ID shows No data found', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndGoToMakerPending(page);

  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('textbox', { name: 'Enter process ID (digits only)' }).fill('934343434343');
  await page.getByRole('button', { name: 'Apply Filters' }).click();

  await expect(page.getByText('No data found')).toBeVisible({ timeout: 10_000 });
});

// TC_INBOX_NEG_002
test('TC_INBOX_NEG_002 - From Date later than To Date shows validation error', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAndGoToMakerPending(page);

  await page.getByRole('button', { name: 'Filters' }).click();

  // Set From Date to May 31 (future) and To Date to May 8 (today) — invalid range
  await page.getByRole('textbox', { name: 'From Date' }).click();
  await page.getByRole('gridcell', { name: /Choose.*May 31/ }).click();

  await page.getByRole('textbox', { name: 'To Date' }).click();
  await page.getByRole('gridcell', { name: /Choose.*May 8/ }).click();

  await page.getByRole('button', { name: 'Apply Filters' }).click();

  await expect(page.getByText('From Date cannot be later')).toBeVisible({ timeout: 10_000 });
});
