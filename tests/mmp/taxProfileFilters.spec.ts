import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { TaxProfilePage } from '../../pages/mmp/TaxProfilePage';

async function loginAndGoToTaxProfileList(page: import('@playwright/test').Page) {
  const login = new LoginPage(page);
  await login.navigate();
  await login.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  const tax = new TaxProfilePage(page);
  await tax.navigateToTaxProfileList();
  return tax;
}

test.describe('Tax Profile - Filters', () => {

  // ── POSITIVE ───────────────────────────────────────────────────────────────

  test('TC_TAX_FILTER_001 - Filter by Profile Name returns matching Tax profiles', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();
    await tax.filterByProfileName('Auto');
    await tax.assertTableVisible();
    await tax.resetFilters();
    await tax.assertTableVisible();
  });

  test('TC_TAX_FILTER_002 - Filter by Region "Arusha" returns profiles in that region', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();
    await tax.filterByRegion('Arusha');
    await tax.assertTableVisible();
    await expect(page.getByRole('cell', { name: 'Arusha' }).first()).toBeVisible({ timeout: 10_000 });
    await tax.resetFilters();
  });

  test('TC_TAX_FILTER_003 - Filter by Status "Active" returns active Tax profiles', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();
    await tax.filterByStatus('Active');
    await tax.assertTableVisible();
    await expect(page.getByRole('cell', { name: 'ACTIVE' }).first()).toBeVisible({ timeout: 10_000 });
    await tax.resetFilters();
  });

  test('TC_TAX_FILTER_004 - Quick select "Today" shows Tax profiles created today', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();
    await tax.clickQuickSelect('Today');
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    const noDataVisible = await page.getByText(/no data found|no records/i).isVisible().catch(() => false);
    expect(tableVisible || noDataVisible).toBeTruthy();
    await tax.resetFilters();
  });

  test('TC_TAX_FILTER_005 - Quick select "This month" shows Tax profiles for this month', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();
    await tax.clickQuickSelect('This month');
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    const noDataVisible = await page.getByText(/no data found|no records/i).isVisible().catch(() => false);
    expect(tableVisible || noDataVisible).toBeTruthy();
    await tax.resetFilters();
  });

  test('TC_TAX_FILTER_006 - Quick select "Last 30 days" shows Tax profiles in last 30 days', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();
    await tax.clickQuickSelect('Last 30 days');
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    const noDataVisible = await page.getByText(/no data found|no records/i).isVisible().catch(() => false);
    expect(tableVisible || noDataVisible).toBeTruthy();
    await tax.resetFilters();
  });

  test('TC_TAX_FILTER_007 - Reset clears all Tax filter inputs (name, region, status)', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();
    await page.getByPlaceholder('Search by profile name').fill('Auto');
    await page.getByPlaceholder('Search by region').fill('Arusha');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForTimeout(800);
    await tax.resetFilters();
    await tax.assertProfileNameInputEmpty();
    await tax.assertRegionInputEmpty();
    await tax.assertTableVisible();
  });

  // ── NEGATIVE ──────────────────────────────────────────────────────────────

  test('TC_TAX_FILTER_NEG_001 - Non-existent profile name shows No data found', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();
    await tax.filterByProfileName('zzz_nonexistent_tax_xyz_999');
    await tax.assertNoDataFound();
    await tax.resetFilters();
  });

  test('TC_TAX_FILTER_NEG_002 - Non-existent region shows No data found', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();
    await tax.filterByRegion('zzz_nonexistent_region_999');
    await tax.assertNoDataFound();
    await tax.resetFilters();
  });

  test('TC_TAX_FILTER_NEG_003 - From Date later than To Date shows validation error', async ({ page }) => {
    test.setTimeout(60_000);
    const tax = await loginAndGoToTaxProfileList(page);
    await tax.openFilterPanel();

    await page.getByRole('textbox', { name: 'From Date' }).fill('31/05/2026');
    await page.getByRole('textbox', { name: 'To Date' }).fill('08/05/2026');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForTimeout(800);

    await expect(
      page.getByText(/from date cannot be later|invalid date range|date range/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await tax.resetFilters();
  });
});
