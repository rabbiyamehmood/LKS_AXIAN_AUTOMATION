import { test, expect } from '@playwright/test';

/**
 * Reports Module — Positive Scenarios
 *
 * Reports are now integrated directly in the portal (no Jasper popup).
 * Backend handles report generation via Jasper.
 *
 * TC_RPT_001 — Audit Logs Report                    → Results visible with all filters
 * TC_RPT_002 — Transaction Detail Report            → Report loads with MID and filters
 * TC_RPT_003 — Transaction Summary Report           → Results heading visible
 * TC_RPT_004 — Merchant Onboard Report              → Report generates with filters
 * TC_RPT_005 — Merchant Pending/Rejected Report     → Status toggle works
 * TC_RPT_006 — Merchant Status Analysis Report      → Status filter works correctly
 */

test.use({
  ignoreHTTPSErrors: true
});

test.describe('Reports Module — Positive Scenarios', () => {
  test.setTimeout(180_000); // 3 minutes per test — reports take time to generate

  test.beforeEach(async ({ page }) => {
    // Login to portal
    await page.goto('https://mixxmmp-test.tigo.co.tz/login');
    await page.getByRole('textbox', { name: 'Username or Email' }).fill('AdminMaker');
    await page.getByRole('textbox', { name: 'Password' }).fill('Pakistan@1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('networkidle');
    
    // Navigate to Reports
    await page.getByRole('link', { name: 'Reports' }).click();
    await page.getByRole('heading', { name: 'Reports' }).waitFor({ state: 'visible' });
  });

  // ── TC_RPT_001 ────────────────────────────────────────────────────────────────
  // Audit Logs Report with comprehensive filters
  // Expected result: PASS — Results visible with correct data
  test('TC_RPT_001 - Audit Logs Report generates successfully with filters', async ({ page }) => {
    await page.getByRole('button', { name: 'Audit Logs' }).click();
    await page.getByRole('heading', { name: 'Report Parameters' }).waitFor({ state: 'visible' });
    
    // Set Start Date
    await page.getByRole('textbox', { name: 'Start Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    // Set End Date
    await page.getByRole('textbox', { name: 'End Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Wednesday, June 10th,' }).click();
    
    // Set Status
    await page.getByText('Success').click();
    
    // Set Username
    await page.getByRole('textbox', { name: 'Filter by username' }).fill('AdminMaker');
    
    // Set Action Type
    await page.getByRole('button', { name: 'Action Type' }).click();
    await page.getByRole('option', { name: 'ALL', exact: true }).click();
    
    // Submit and verify results
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('heading', { name: 'Results' }).waitFor({ state: 'visible' });
    
    // Assertions
    await expect(page.getByText(/Showing \d+-\d+ of \d+ records/)).toBeVisible();
    await expect(page.getByText('Date Time')).toBeVisible();
    await expect(page.getByRole('table').getByText('Username', { exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'AdminMaker' }).first()).toBeVisible();
    
    // Test XLSX export
    await page.getByRole('button', { name: 'XLSX' }).click();
  });

  // ── TC_RPT_002 ────────────────────────────────────────────────────────────────
  // Transaction Detail Report with comprehensive filters
  // Expected result: PASS — Report loads with correct filters
  test('TC_RPT_002 - Transaction Detail Report generates successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Transaction Detail' }).click();
    
    // Set From Date
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    // Set To Date
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    // Set Source MID
    await page.locator('#SOURCE_MID').fill('000921773937631');
    
    // Set Aggregator
    await page.getByRole('button', { name: 'Aggregator', exact: true }).click();
    await page.getByRole('option', { name: 'All' }).click();
    
    // Set Status
    await page.getByRole('button', { name: 'Status', exact: true }).click();
    await page.getByLabel('All').getByText('All').click();
    
    // Set Transaction Category
    await page.getByRole('option', { name: 'All' }).click();
    
    // Set Channel
    await page.getByRole('button', { name: 'Channel' }).click();
    await page.getByText('Merchant Portal').click();
    
    // Set Entity MSISDN
    await page.locator('#ENTITY_MSISDN').fill('25570000082');
    
    // Submit and verify
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('heading', { name: 'Results' }).waitFor({ state: 'visible' });
    
    // Assertions
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
    await expect(page.getByText('000921773937631')).toBeVisible();
    
    // Test XLSX export
    await page.getByRole('button', { name: 'XLSX' }).click();
  });

  // ── TC_RPT_003 ────────────────────────────────────────────────────────────────
  // Transaction Summary Report with merchant filter
  // Expected result: PASS — Results heading visible
  test('TC_RPT_003 - Transaction Summary Report generates successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Transaction Summary' }).click();
    
    // Set From Date
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    // Set To Date
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    // Set Merchant Name
    await page.locator('#MERCHANT_NAME').fill('Touseefullah');
    
    // Set Aggregator
    await page.getByRole('button', { name: 'Aggregator', exact: true }).click();
    await page.getByText('All', { exact: true }).click();
    
    // Submit and verify
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('heading', { name: 'Results' }).waitFor({ state: 'visible' });
    
    // Assertions
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
    await expect(page.getByText('Touseefullah')).toBeVisible();
    
    // Test XLSX export
    await page.getByRole('button', { name: 'XLSX' }).click();
  });

  // ── TC_RPT_004 ────────────────────────────────────────────────────────────────
  // Merchant Onboard Report with comprehensive filters
  // Expected result: PASS — Report generates with filters
  test('TC_RPT_004 - Merchant Onboard Report generates successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Merchant Onboard' }).click();
    
    // Set From Date
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    // Set To Date
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    // Set Merchant Name
    await page.locator('#MERCHANT_NAME').fill('xysjdjd');
    
    // Set Aggregator
    await page.getByRole('button', { name: 'Aggregator', exact: true }).click();
    await page.getByLabel('Leave empty for all').getByText('All').click();
    
    // Set Status
    await page.getByRole('button', { name: 'Status', exact: true }).click();
    await page.getByText('Active', { exact: true }).click();
    
    // Set Onboarding Channel
    await page.getByRole('button', { name: 'Onboarding Channel' }).click();
    await page.getByText('Backoffice').click();
    
    // Set Entity MSISDN
    await page.locator('#ENTITY_MSISDN').fill('25500000082');
    
    // Submit and verify
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('heading', { name: 'Results' }).waitFor({ state: 'visible' });
    
    // Assertions
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
    
    // Test XLSX export
    await page.getByRole('button', { name: 'XLSX' }).click();
  });

  // ── TC_RPT_005 ────────────────────────────────────────────────────────────────
  // Merchant Pending/Rejected Report with status toggle
  // Expected result: PASS — Status toggle works correctly
  test('TC_RPT_005 - Merchant Pending/Rejected Report generates successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Merchant Pending/Rejected' }).click();
    
    // Set From Date
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('row', { name: 'Choose Sunday, May 31st, 2026' }).click();
    
    // Set To Date
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    // Set Status to Pending
    await page.getByRole('button', { name: 'Status', exact: true }).click();
    await page.getByText('Pending', { exact: true }).click();
    
    // Submit and verify Pending results
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(/Showing \d+-\d+ of \d+ records/)).toBeVisible();
    
    // Change Status to Rejected
    await page.getByRole('button', { name: 'Status', exact: true }).click();
    await page.getByText('Rejected', { exact: true }).click();
    
    // Submit and verify Rejected results
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
    
    // Test XLSX export
    await page.getByRole('button', { name: 'XLSX' }).click();
  });

  // ── TC_RPT_006 ────────────────────────────────────────────────────────────────
  // Merchant Status Analysis Report with status filter
  // Expected result: PASS — Status filter works correctly
  test('TC_RPT_006 - Merchant Status Analysis Report generates successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Merchant Status Analysis' }).click();
    await page.getByRole('heading', { name: 'Report Parameters' }).waitFor({ state: 'visible' });
    
    // Set Status to Pending
    await page.getByRole('button', { name: 'Status*' }).click();
    await page.getByText('Pending', { exact: true }).click();
    
    // Set From Date
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    // Set To Date
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    // Set Merchant Name
    await page.locator('#MERCHANT_NAME').fill('Touseefullah');
    
    // Set Aggregator
    await page.getByRole('button', { name: 'Aggregator', exact: true }).click();
    await page.getByText('All', { exact: true }).click();
    
    // Set Entity MSISDN
    await page.locator('#ENTITY_MSISDN').fill('25500000087');
    
    // Submit and verify
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('heading', { name: 'Results' }).waitFor({ state: 'visible' });
    
    // Test XLSX export
    await page.getByRole('button', { name: 'XLSX' }).click();
    
    // Change Status to Success and verify
    await page.getByRole('button', { name: 'Status*' }).click();
    await page.getByText('Success').click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  });
});
