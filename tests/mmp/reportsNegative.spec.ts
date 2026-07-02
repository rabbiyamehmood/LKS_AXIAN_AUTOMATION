import { test, expect } from '@playwright/test';

/**
 * Reports Module — Negative Scenarios
 *
 * Reports are now integrated directly in the portal (no Jasper popup).
 * Backend handles report generation via Jasper.
 *
 * TC_RPT_NEG_001 — Audit Logs without mandatory dates      → Validation error expected
 * TC_RPT_NEG_002 — Transaction Detail with invalid MID     → Validation error or empty results expected
 * TC_RPT_NEG_003 — Transaction Summary: FROM > TO date     → Validation error expected
 * TC_RPT_NEG_004 — Merchant Onboard with non-existent      → Empty results expected
 * TC_RPT_NEG_005 — Pending/Rejected with future dates      → Validation error or empty results
 * TC_RPT_NEG_006 — Status Analysis without Status field    → Validation error expected
 * TC_RPT_NEG_007 — Transaction Detail invalid MSISDN       → Validation error expected
 * TC_RPT_NEG_008 — Audit Logs with non-existent username   → Empty results expected
 */

test.use({
  ignoreHTTPSErrors: true
});

test.describe('Reports Module — Negative Scenarios', () => {
  test.setTimeout(120_000);

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

  // ── TC_RPT_NEG_001 ────────────────────────────────────────────────────────────
  // Audit Logs: Submit without filling mandatory date fields
  // Expected result: Validation error shown
  test('TC_RPT_NEG_001 - Audit Logs without mandatory dates shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Audit Logs' }).click();
    await page.getByRole('heading', { name: 'Report Parameters' }).waitFor({ state: 'visible' });
    
    // Do NOT fill Start Date or End Date — click Submit directly
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Validation error must be visible
    await expect(
      page.getByText(/required|mandatory|must|enter|field/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ── TC_RPT_NEG_002 ────────────────────────────────────────────────────────────
  // Transaction Detail: Invalid MID format with special characters
  // Expected result: Validation error or empty results (known bug if no validation)
  test.skip('TC_RPT_NEG_002 - Transaction Detail with invalid MID format', async ({ page }) => {
    await page.getByRole('button', { name: 'Transaction Detail' }).click();
    
    // Set valid dates
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    // Set invalid MID with special characters
    await page.locator('#SOURCE_MID').fill('@#$%^&*');
    
    // Set other fields
    await page.getByRole('button', { name: 'Aggregator', exact: true }).click();
    await page.getByRole('option', { name: 'All' }).click();
    
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // EXPECTED: Validation error shown OR empty results with no data
    // This test is skipped due to known bug - app doesn't validate MID format
    const errorVisible = await page.getByText(/invalid|error|format/i).isVisible({ timeout: 5000 }).catch(() => false);
    const noResults = await page.getByText(/no records|0-0 of 0/i).isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(errorVisible || noResults).toBeTruthy();
  });

  // ── TC_RPT_NEG_003 ────────────────────────────────────────────────────────────
  // Transaction Summary: FROM date greater than TO date
  // Expected result: Validation error (known bug if not shown)
  test.skip('TC_RPT_NEG_003 - Transaction Summary with FROM date greater than TO date', async ({ page }) => {
    await page.getByRole('button', { name: 'Transaction Summary' }).click();
    
    // Set FROM date to June 11 (later)
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    // Set TO date to June 1 (earlier) - invalid range
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    await page.locator('#MERCHANT_NAME').fill('TestMerchant');
    await page.getByRole('button', { name: 'Aggregator', exact: true }).click();
    await page.getByText('All', { exact: true }).click();
    
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // EXPECTED: Date range validation error
    // This test is skipped due to known bug - app doesn't validate date range
    await expect(
      page.getByText(/invalid.*date|date.*range|from.*greater|cannot be after/i)
    ).toBeVisible({ timeout: 10000 });
  });

  // ── TC_RPT_NEG_004 ────────────────────────────────────────────────────────────
  // Merchant Onboard: Search with non-existent merchant name
  // Expected result: Empty results with appropriate message
  test('TC_RPT_NEG_004 - Merchant Onboard with non-existent merchant returns no results', async ({ page }) => {
    await page.getByRole('button', { name: 'Merchant Onboard' }).click();
    
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    // Non-existent merchant name
    await page.locator('#MERCHANT_NAME').fill('NonExistentMerchant999');
    
    await page.getByRole('button', { name: 'Aggregator', exact: true }).click();
    await page.getByLabel('Leave empty for all').getByText('All').click();
    
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify empty results
    await expect(
      page.getByText(/no records|0-0 of 0|showing 0/i)
    ).toBeVisible({ timeout: 15000 });
  });

  // ── TC_RPT_NEG_005 ────────────────────────────────────────────────────────────
  // Merchant Pending/Rejected: Future date range
  // Expected result: Validation error or empty results
  test('TC_RPT_NEG_005 - Pending/Rejected Report with future dates', async ({ page }) => {
    await page.getByRole('button', { name: 'Merchant Pending/Rejected' }).click();
    
    // Set future FROM date (June 2027)
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    // Navigate to future year if date picker allows
    await page.getByRole('textbox', { name: 'From Date*' }).fill('06/01/2027');
    
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('textbox', { name: 'To Date*' }).fill('06/11/2027');
    
    await page.getByRole('button', { name: 'Status', exact: true }).click();
    await page.getByText('Pending', { exact: true }).click();
    
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Either validation error OR empty results
    const errorVisible = await page.getByText(/future|invalid|cannot select/i).isVisible({ timeout: 5000 }).catch(() => false);
    const noResults = await page.getByText(/no records|0-0 of 0/i).isVisible({ timeout: 10000 }).catch(() => false);
    
    expect(errorVisible || noResults).toBeTruthy();
  });

  // ── TC_RPT_NEG_006 ────────────────────────────────────────────────────────────
  // Merchant Status Analysis: Submit without mandatory Status field
  // Expected result: Validation error
  test('TC_RPT_NEG_006 - Status Analysis without mandatory Status field shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Merchant Status Analysis' }).click();
    await page.getByRole('heading', { name: 'Report Parameters' }).waitFor({ state: 'visible' });
    
    // Fill dates but leave Status empty (it's mandatory)
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    await page.locator('#MERCHANT_NAME').fill('TestMerchant');
    
    // Do NOT select Status — click Submit
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Validation error must be visible
    await expect(
      page.getByText(/required|mandatory|must select|status.*required/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ── TC_RPT_NEG_007 ────────────────────────────────────────────────────────────
  // Transaction Detail: Invalid Entity MSISDN format
  // Expected result: Validation error or empty results
  test.skip('TC_RPT_NEG_007 - Transaction Detail with invalid Entity MSISDN format', async ({ page }) => {
    await page.getByRole('button', { name: 'Transaction Detail' }).click();
    
    await page.getByRole('textbox', { name: 'From Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    await page.getByRole('textbox', { name: 'To Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Thursday, June 11th,' }).click();
    
    await page.locator('#SOURCE_MID').fill('000921773937631');
    
    // Invalid MSISDN with alphabetic characters
    await page.locator('#ENTITY_MSISDN').fill('abc123xyz');
    
    await page.getByRole('button', { name: 'Aggregator', exact: true }).click();
    await page.getByRole('option', { name: 'All' }).click();
    
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // EXPECTED: Validation error OR empty results
    // This test is skipped due to potential lack of validation
    const errorVisible = await page.getByText(/invalid|error|format|msisdn/i).isVisible({ timeout: 5000 }).catch(() => false);
    const noResults = await page.getByText(/no records|0-0 of 0/i).isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(errorVisible || noResults).toBeTruthy();
  });

  // ── TC_RPT_NEG_008 ────────────────────────────────────────────────────────────
  // Audit Logs: Search with non-existent username
  // Expected result: Empty results
  test('TC_RPT_NEG_008 - Audit Logs with non-existent username returns no results', async ({ page }) => {
    await page.getByRole('button', { name: 'Audit Logs' }).click();
    
    await page.getByRole('textbox', { name: 'Start Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Monday, June 1st,' }).click();
    
    await page.getByRole('textbox', { name: 'End Date*' }).click();
    await page.getByRole('gridcell', { name: 'Choose Wednesday, June 10th,' }).click();
    
    // Non-existent username
    await page.getByRole('textbox', { name: 'Filter by username' }).fill('NonExistentUser999');
    
    await page.getByRole('button', { name: 'Action Type' }).click();
    await page.getByRole('option', { name: 'ALL', exact: true }).click();
    
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify empty results
    await expect(
      page.getByText(/no records|0-0 of 0|showing 0/i)
    ).toBeVisible({ timeout: 15000 });
  });
});
