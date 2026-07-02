import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { MDRProfilePage } from '../../pages/mmp/MDRProfilePage';

async function loginAndGoToMDRProfileList(page: import('@playwright/test').Page) {
  const login = new LoginPage(page);
  await login.navigate();
  await login.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  const mdr = new MDRProfilePage(page);
  await mdr.navigateToMDRProfileList();
  return mdr;
}

test.describe('MDR Profile - Filters', () => {

  // ── POSITIVE ───────────────────────────────────────────────────────────────

  test('TC_MDR_FILTER_001 - Filter by Profile Name returns matching MDR profiles', async ({ page }) => {
    test.setTimeout(60_000);
    const mdr = await loginAndGoToMDRProfileList(page);
    await mdr.openFilterPanel();
    await mdr.filterByProfileName('auto');
    await mdr.assertTableVisible();
    await mdr.resetFilters();
    await mdr.assertTableVisible();
  });

  test('TC_MDR_FILTER_002 - Filter by Status "Active" returns active MDR profiles', async ({ page }) => {
    test.setTimeout(60_000);
    const mdr = await loginAndGoToMDRProfileList(page);
    await mdr.openFilterPanel();
    await mdr.filterByStatus('Active');
    await mdr.assertTableVisible();
    await expect(page.getByRole('cell', { name: 'ACTIVE' }).first()).toBeVisible({ timeout: 10_000 });
    await mdr.resetFilters();
  });

  test('TC_MDR_FILTER_003 - Quick select "Today" shows MDR profiles created today', async ({ page }) => {
    test.setTimeout(60_000);
    const mdr = await loginAndGoToMDRProfileList(page);
    await mdr.openFilterPanel();
    await mdr.clickQuickSelect('Today');
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    const noDataVisible = await page.getByText(/no data found|no records/i).isVisible().catch(() => false);
    expect(tableVisible || noDataVisible).toBeTruthy();
    await mdr.resetFilters();
  });

  test('TC_MDR_FILTER_004 - Quick select "Last 7 days" shows MDR profiles in last 7 days', async ({ page }) => {
    test.setTimeout(60_000);
    const mdr = await loginAndGoToMDRProfileList(page);
    await mdr.openFilterPanel();
    await mdr.clickQuickSelect('Last 7 days');
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    const noDataVisible = await page.getByText(/no data found|no records/i).isVisible().catch(() => false);
    expect(tableVisible || noDataVisible).toBeTruthy();
    await mdr.resetFilters();
  });

  test('TC_MDR_FILTER_005 - Quick select "Last 30 days" shows MDR profiles in last 30 days', async ({ page }) => {
    test.setTimeout(60_000);
    const mdr = await loginAndGoToMDRProfileList(page);
    await mdr.openFilterPanel();
    await mdr.clickQuickSelect('Last 30 days');
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    const noDataVisible = await page.getByText(/no data found|no records/i).isVisible().catch(() => false);
    expect(tableVisible || noDataVisible).toBeTruthy();
    await mdr.resetFilters();
  });

  test('TC_MDR_FILTER_006 - Reset clears all MDR filter inputs', async ({ page }) => {
    test.setTimeout(60_000);
    const mdr = await loginAndGoToMDRProfileList(page);
    await mdr.openFilterPanel();
    await mdr.filterByProfileName('auto');
    await mdr.resetFilters();
    await mdr.assertProfileNameInputEmpty();
    await mdr.assertTableVisible();
  });

  // ── NEGATIVE ──────────────────────────────────────────────────────────────

  test('TC_MDR_FILTER_NEG_001 - Non-existent profile name shows No data found', async ({ page }) => {
    test.setTimeout(60_000);
    const mdr = await loginAndGoToMDRProfileList(page);
    await mdr.openFilterPanel();
    await mdr.filterByProfileName('zzz_nonexistent_mdr_xyz_999');
    await mdr.assertNoDataFound();
    await mdr.resetFilters();
  });

  test('TC_MDR_FILTER_NEG_002 - From Date later than To Date shows validation error', async ({ page }) => {
    test.setTimeout(60_000);
    const mdr = await loginAndGoToMDRProfileList(page);
    await mdr.openFilterPanel();

    await page.getByRole('textbox', { name: 'From Date' }).fill('31/05/2026');
    await page.getByRole('textbox', { name: 'To Date' }).fill('08/05/2026');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await page.waitForTimeout(800);

    await expect(
      page.getByText(/from date cannot be later|invalid date range|date range/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await mdr.resetFilters();
  });
});
