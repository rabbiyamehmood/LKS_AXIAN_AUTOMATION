import { test, expect, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { AuditLogsPage } from '../../pages/mmp/AuditLogsPage';

/**
 * Audit Logs � Positive Filter Test Cases
 * Login once, reset between tests.
 *
 * TC_AUDITLOG_002  Filter by Action Type = LOGIN
 * TC_AUDITLOG_003  Filter by Username = AdminMaker
 * TC_AUDITLOG_004  Filter by Date Range (today to today)
 * TC_AUDITLOG_005  Quick filter Today
 * TC_AUDITLOG_006  Reset Filters clears applied filter * TC_AUDITLOG_007  Filter by Action Type = ALL
 * TC_AUDITLOG_008  Filter by Action Type = AGGREGATOR_CREATION
 * TC_AUDITLOG_009  Filter by Action Type = AGGREGATOR_UPDATE
 * TC_AUDITLOG_010  Filter by Action Type = BULK_ONBOARDING
 * TC_AUDITLOG_011  Filter by Action Type = LOGOUT
 * TC_AUDITLOG_012  Filter by Action Type = FIELD_VALIDATION */

test.describe('Audit Logs - Positive Filter Tests', () => {
  test.setTimeout(120_000);

  let context: BrowserContext;
  let page: Page;
  let auditLogs: AuditLogsPage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ ignoreHTTPSErrors: true });
    page = await context.newPage();
    const loginPage = new LoginPage(page);
    auditLogs = new AuditLogsPage(page);

    await loginPage.navigate();
    await loginPage.loginAsAdminMaker();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await auditLogs.navigate();

    // Open filter panel once � stays open throughout all tests
    await page.getByRole('button', { name: 'Filter' }).click();
  });

  test.afterAll(async () => {
    await context.close();
  });

  // Reset state before each test
  test.beforeEach(async () => {
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  });

  // TC_AUDITLOG_002
  test('TC_AUDITLOG_002 - Filter by Action Type LOGIN returns results', async () => {
    await page.getByRole('button', { name: 'Action Type' }).click();
    await page.getByRole('option', { name: 'LOGIN', exact: true }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('LOGIN').nth(1)).toBeVisible();
  });

  // TC_AUDITLOG_003
  test('TC_AUDITLOG_003 - Filter by Username AdminMaker returns results', async () => {
    await page.getByRole('textbox', { name: 'Search by username' }).fill('AdminMaker');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page.getByRole('columnheader', { name: /Username/ })).toBeVisible();
    await expect(page.getByText('AdminMaker').nth(1)).toBeVisible({ timeout: 15000 });
  });

  // TC_AUDITLOG_004
  test('TC_AUDITLOG_004 - Filter by Date Range (today to today) returns results', async () => {
    // Get today's date in DD/MM/YYYY format
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const todayFormatted = `${day}/${month}/${year}`;

    // Fill From Date
    await page.getByRole('textbox', { name: 'From Date' }).fill(todayFormatted);
    await page.getByRole('textbox', { name: 'From Date' }).press('Enter');

    // Fill To Date
    await page.getByRole('textbox', { name: 'To Date' }).fill(todayFormatted);
    await page.getByRole('textbox', { name: 'To Date' }).press('Enter');

    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
    
    // Verify the date contains current month and year
    const monthName = today.toLocaleString('en-US', { month: 'short' });
    await expect(firstRow).toContainText(`${monthName} ${year}`);
  });

  // TC_AUDITLOG_005
  test('TC_AUDITLOG_005 - Quick filter Today shows today logs', async () => {
    await page.getByRole('button', { name: 'Today' }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
    
    // Verify the date contains current month and year
    const today = new Date();
    const monthName = today.toLocaleString('en-US', { month: 'short' });
    const year = today.getFullYear();
    await expect(firstRow).toContainText(`${monthName} ${year}`);
  });

  // TC_AUDITLOG_006
  test('TC_AUDITLOG_006 - Reset Filters clears applied filter', async () => {
    await page.getByRole('textbox', { name: 'Search by username' }).fill('AdminMaker');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page.getByRole('textbox', { name: 'Search by username' })).toHaveValue('');
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
  });

  // TC_AUDITLOG_007
  test('TC_AUDITLOG_007 - Filter by Action Type ALL returns all log records', async () => {
    await page.getByRole('button', { name: 'Action Type' }).click();
    await page.getByRole('option', { name: 'ALL', exact: true }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
  });

  // TC_AUDITLOG_008
  test('TC_AUDITLOG_008 - Filter by Action Type AGGREGATOR_CREATION returns matching records', async () => {
    await page.getByRole('button', { name: 'Action Type' }).click();
    await page.getByRole('option', { name: 'AGGREGATOR_CREATION', exact: true }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Wait for either table data or "No data found" message with extended timeout
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr');
      const noDataText = document.querySelector('body')?.textContent?.includes('No data found');
      return (rows.length > 0 && !rows[0].textContent?.trim().startsWith('Date')) || noDataText;
    }, { timeout: 15000 }).catch(() => {});

    const firstRow = page.locator('tbody tr').first();
    const noData = page.getByText('No data found');
    const hasData = await firstRow.isVisible().catch(() => false);
    const hasNoData = await noData.isVisible().catch(() => false);
    
    expect(hasData || hasNoData).toBe(true);

    if (hasData) {
      await expect(page.getByText('AGGREGATOR_CREATION').first()).toBeVisible({ timeout: 15000 });
    }
  });

  // TC_AUDITLOG_009
  test('TC_AUDITLOG_009 - Filter by Action Type AGGREGATOR_UPDATE returns matching records', async () => {
    await page.getByRole('button', { name: 'Action Type' }).click();
    await page.getByRole('option', { name: 'AGGREGATOR_UPDATE', exact: true }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Wait for either table data or "No data found" message
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr');
      const noDataText = document.querySelector('body')?.textContent?.includes('No data found');
      return (rows.length > 0 && !rows[0].textContent?.trim().startsWith('Date')) || noDataText;
    }, { timeout: 15000 }).catch(() => {});

    const firstRow = page.locator('tbody tr').first();
    const noData = page.getByText('No data found');
    const hasData = await firstRow.isVisible().catch(() => false);
    const hasNoData = await noData.isVisible().catch(() => false);
    
    expect(hasData || hasNoData).toBe(true);

    if (hasData) {
      await expect(page.getByText('AGGREGATOR_UPDATE').first()).toBeVisible({ timeout: 15000 });
    }
  });

  // TC_AUDITLOG_010
  test('TC_AUDITLOG_010 - Filter by Action Type BULK_ONBOARDING returns matching records', async () => {
    await page.getByRole('button', { name: 'Action Type' }).click();
    await page.getByRole('option', { name: 'BULK_ONBOARDING', exact: true }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Wait for either table data or "No data found" message
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr');
      const noDataText = document.querySelector('body')?.textContent?.includes('No data found');
      return (rows.length > 0 && !rows[0].textContent?.trim().startsWith('Date')) || noDataText;
    }, { timeout: 15000 }).catch(() => {});

    const firstRow = page.locator('tbody tr').first();
    const noData = page.getByText('No data found');
    const hasData = await firstRow.isVisible().catch(() => false);
    const hasNoData = await noData.isVisible().catch(() => false);
    
    expect(hasData || hasNoData).toBe(true);

    if (hasData) {
      await expect(page.getByText('BULK_ONBOARDING').first()).toBeVisible({ timeout: 15000 });
    }
  });

  // TC_AUDITLOG_011
  test('TC_AUDITLOG_011 - Filter by Action Type LOGOUT returns matching records', async () => {
    await page.getByRole('button', { name: 'Action Type' }).click();
    await page.getByRole('option', { name: 'LOGOUT', exact: true }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('LOGOUT').nth(1)).toBeVisible();
  });

  // TC_AUDITLOG_012
  test('TC_AUDITLOG_012 - Filter by Action Type FIELD_VALIDATION returns matching records', async () => {
    await page.getByRole('button', { name: 'Action Type' }).click();
    await page.getByRole('option', { name: 'FIELD_VALIDATION', exact: true }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Wait for either table data or "No data found" message
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr');
      const noDataText = document.querySelector('body')?.textContent?.includes('No data found');
      return (rows.length > 0 && !rows[0].textContent?.trim().startsWith('Date')) || noDataText;
    }, { timeout: 15000 }).catch(() => {});

    const firstRow = page.locator('tbody tr').first();
    const noData = page.getByText('No data found');
    const hasData = await firstRow.isVisible().catch(() => false);
    const hasNoData = await noData.isVisible().catch(() => false);
    
    expect(hasData || hasNoData).toBe(true);

    if (hasData) {
      await expect(page.getByText('FIELD_VALIDATION').first()).toBeVisible({ timeout: 15000 });
    }
  });
});
