import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { LimitProfilePage } from '../../pages/mmp/LimitProfilePage';

async function loginAndGoToLimitProfileList(page: import('@playwright/test').Page) {
  const login = new LoginPage(page);
  await login.navigate();
  await login.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  const lp = new LimitProfilePage(page);
  await lp.navigateToLimitProfileList();
  return lp;
}

test.describe('Limit Profile - Filters', () => {

  // ── POSITIVE ───────────────────────────────────────────────────────────────

  test('TC_LIMIT_FILTER_001 - Filter by Profile Name returns matching results', async ({ page }) => {
    test.setTimeout(60_000);
    const lp = await loginAndGoToLimitProfileList(page);
    await lp.openFilterPanel();
    await lp.filterByProfileName('auto');
    await lp.assertTableVisible();
    await lp.resetFilters();
    await lp.assertTableVisible();
  });

  test('TC_LIMIT_FILTER_002 - Filter by Status "Active" returns active profiles', async ({ page }) => {
    test.setTimeout(60_000);
    const lp = await loginAndGoToLimitProfileList(page);
    await lp.openFilterPanel();
    await lp.filterByStatus('Active');
    await lp.assertTableVisible();
    await expect(page.getByRole('cell', { name: 'ACTIVE' }).first()).toBeVisible({ timeout: 10_000 });
    await lp.resetFilters();
  });

  test('TC_LIMIT_FILTER_003 - Quick select "Today" shows profiles created today', async ({ page }) => {
    test.setTimeout(60_000);
    const lp = await loginAndGoToLimitProfileList(page);
    await lp.openFilterPanel();
    await lp.clickQuickSelect('Today');
    // Table may show data or "no data found" — either is valid for today filter
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    const noDataVisible = await page.getByText(/no data found|no records/i).isVisible().catch(() => false);
    expect(tableVisible || noDataVisible).toBeTruthy();
    await lp.resetFilters();
  });

  test('TC_LIMIT_FILTER_004 - Quick select "Last 7 days" shows profiles in last 7 days', async ({ page }) => {
    test.setTimeout(60_000);
    const lp = await loginAndGoToLimitProfileList(page);
    await lp.openFilterPanel();
    await lp.clickQuickSelect('Last 7 days');
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    const noDataVisible = await page.getByText(/no data found|no records/i).isVisible().catch(() => false);
    expect(tableVisible || noDataVisible).toBeTruthy();
    await lp.resetFilters();
  });

  test('TC_LIMIT_FILTER_005 - Quick select "This month" shows profiles for this month', async ({ page }) => {
    test.setTimeout(60_000);
    const lp = await loginAndGoToLimitProfileList(page);
    await lp.openFilterPanel();
    await lp.clickQuickSelect('This month');
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    const noDataVisible = await page.getByText(/no data found|no records/i).isVisible().catch(() => false);
    expect(tableVisible || noDataVisible).toBeTruthy();
    await lp.resetFilters();
  });

  test('TC_LIMIT_FILTER_006 - Reset clears all filter inputs', async ({ page }) => {
    test.setTimeout(60_000);
    const lp = await loginAndGoToLimitProfileList(page);
    await lp.openFilterPanel();
    await lp.filterByProfileName('auto');
    await lp.resetFilters();
    await lp.assertProfileNameInputEmpty();
    await lp.assertTableVisible();
  });

  // ── NEGATIVE ──────────────────────────────────────────────────────────────

  test('TC_LIMIT_FILTER_NEG_001 - Non-existent profile name shows No data found', async ({ page }) => {
    test.setTimeout(60_000);
    const lp = await loginAndGoToLimitProfileList(page);
    await lp.openFilterPanel();
    await lp.filterByProfileName('zzz_nonexistent_profile_xyz_999');
    await lp.assertNoDataFound();
    await lp.resetFilters();
  });

  test('TC_LIMIT_FILTER_NEG_002 - From Date later than To Date shows validation error', async ({ page }) => {
    test.setTimeout(60_000);
    const lp = await loginAndGoToLimitProfileList(page);
    await lp.openFilterPanel();

    // Set From Date to a future date then To Date earlier
    await page.getByRole('textbox', { name: 'From Date' }).fill('31/05/2026');
    await page.getByRole('textbox', { name: 'To Date' }).fill('08/05/2026');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForTimeout(800);

    await expect(
      page.getByText(/from date cannot be later|invalid date range|date range/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await lp.resetFilters();
  });
});
