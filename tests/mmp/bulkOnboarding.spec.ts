import { test, expect } from '@playwright/test';
import * as path from 'path';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { BulkOnboardingPage } from '../../pages/mmp/BulkOnboardingPage';

/**
 * Bulk Onboarding Module — Positive Scenarios
 *
 * TC_BULK_001 — Upload valid Individual template → checker approves
 * TC_BULK_002 — Upload valid NIDA Registered template → checker approves
 * TC_BULK_003 — Upload valid Company template → checker approves
 * TC_BULK_004 — Upload valid Machinga template → checker approves
 * TC_BULK_005 — Onboarding History: filter by status
 * TC_BULK_006 — Onboarding History: filter by file name
 * TC_BULK_007 — Onboarding History: filter by date range
 * TC_BULK_008 — Onboarding History: View Details modal shows upload info
 */

// Resolve test file paths (place excel templates in test-data/bulk/)
const DATA_DIR = path.resolve(__dirname, '../../test-data/bulk');

const MAKER_USER = process.env.LABESH_MAKER_USERNAME   ?? 'Labesh_Maker';
const MAKER_PASS = process.env.LABESH_MAKER_PASSWORD   ?? 'Pakistan@1234';
const CHECKER_USER = process.env.LABESH_CHECKER_USERNAME ?? 'LabeshChecker';
const CHECKER_PASS = process.env.LABESH_CHECKER_PASSWORD ?? 'Pakistan@1234';

async function loginMaker(page: any) {
  const lp = new LoginPage(page);
  await lp.navigate();
  await page.getByRole('textbox', { name: /username/i }).fill(MAKER_USER);
  await page.getByRole('textbox', { name: /password/i }).fill(MAKER_PASS);
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  return new BulkOnboardingPage(page);
}

async function loginChecker(page: any) {
  const lp = new LoginPage(page);
  await lp.navigate();
  await page.getByRole('textbox', { name: /username/i }).fill(CHECKER_USER);
  await page.getByRole('textbox', { name: /password/i }).fill(CHECKER_PASS);
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  return new BulkOnboardingPage(page);
}

async function makerLogout(page: any) {
  await page.getByRole('button', { name: /L Labesh/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
}

test.describe('Bulk Onboarding — Positive Scenarios', () => {

  // ── TC_BULK_001 ────────────────────────────────────────────────────────────────
  test('TC_BULK_001 - Upload Individual template and approve', async ({ page }) => {
    test.setTimeout(300_000);
    const bulk = await loginMaker(page);

    await bulk.navigateToBulkOnboarding();
    await bulk.uploadFile(path.join(DATA_DIR, 'bulk_individual.xlsx'), 'Individual');
    await bulk.submitBtn.click();
    await expect(bulk.successToast).toBeVisible({ timeout: 30000 });
    await bulk.closeToastBtn.click();

    await makerLogout(page);

    // Checker approves
    const checker = await loginChecker(page);
    await checker.inboxBtn.click();
    await checker.pendingProcessesLink.click();
    await expect(page.getByRole('cell', { name: 'BULK MERCHANT ONBOARDING' }).first()).toBeVisible({ timeout: 30000 });
    await checker.reviewBtn.click();
    await checker.approveBtn.click();
    await checker.commentsInput.fill('TC_BULK_001 approved');
    await checker.confirmBtn.click();
    await expect(checker.approvalSuccessToast).toBeVisible({ timeout: 30000 });
    await checker.closeToastBtn.click();
  });

  // ── TC_BULK_002 ────────────────────────────────────────────────────────────────
  test('TC_BULK_002 - Upload NIDA Registered template and approve', async ({ page }) => {
    test.setTimeout(300_000);
    const bulk = await loginMaker(page);

    await bulk.navigateToBulkOnboarding();
    await bulk.uploadFile(path.join(DATA_DIR, 'bulk_nida.xlsx'), 'NIDA Registered');
    await bulk.submitBtn.click();
    await expect(bulk.successToast).toBeVisible({ timeout: 30000 });
    await bulk.closeToastBtn.click();

    await makerLogout(page);

    const checker = await loginChecker(page);
    await checker.inboxBtn.click();
    await checker.pendingProcessesLink.click();
    await expect(page.getByRole('cell', { name: 'BULK MERCHANT ONBOARDING' }).first()).toBeVisible({ timeout: 30000 });
    await checker.reviewBtn.click();
    await checker.approveBtn.click();
    await checker.commentsInput.fill('TC_BULK_002 approved');
    await checker.confirmBtn.click();
    await expect(checker.approvalSuccessToast).toBeVisible({ timeout: 30000 });
    await checker.closeToastBtn.click();
  });

  // ── TC_BULK_003 ────────────────────────────────────────────────────────────────
  test('TC_BULK_003 - Upload Company template and approve', async ({ page }) => {
    test.setTimeout(300_000);
    const bulk = await loginMaker(page);

    await bulk.navigateToBulkOnboarding();
    await bulk.uploadFile(path.join(DATA_DIR, 'bulk_company.xlsx'), 'Company');
    await bulk.submitBtn.click();
    await expect(bulk.successToast).toBeVisible({ timeout: 30000 });
    await bulk.closeToastBtn.click();

    await makerLogout(page);

    const checker = await loginChecker(page);
    await checker.inboxBtn.click();
    await checker.pendingProcessesLink.click();
    await expect(page.getByRole('cell', { name: 'BULK MERCHANT ONBOARDING' }).first()).toBeVisible({ timeout: 30000 });
    await checker.reviewBtn.click();
    await checker.approveBtn.click();
    await checker.commentsInput.fill('TC_BULK_003 approved');
    await checker.confirmBtn.click();
    await expect(checker.approvalSuccessToast).toBeVisible({ timeout: 30000 });
    await checker.closeToastBtn.click();
  });

  // ── TC_BULK_004 ────────────────────────────────────────────────────────────────
  test('TC_BULK_004 - Upload Machinga template and approve', async ({ page }) => {
    test.setTimeout(300_000);
    const bulk = await loginMaker(page);

    await bulk.navigateToBulkOnboarding();
    await bulk.uploadFile(path.join(DATA_DIR, 'bulk_machinga.xlsx'), 'Machinga');
    await bulk.submitBtn.click();
    await expect(bulk.successToast).toBeVisible({ timeout: 30000 });
    await bulk.closeToastBtn.click();

    await makerLogout(page);

    const checker = await loginChecker(page);
    await checker.inboxBtn.click();
    await checker.pendingProcessesLink.click();
    await expect(page.getByRole('cell', { name: 'BULK MERCHANT ONBOARDING' }).first()).toBeVisible({ timeout: 30000 });
    await checker.reviewBtn.click();
    await checker.approveBtn.click();
    await checker.commentsInput.fill('TC_BULK_004 approved');
    await checker.confirmBtn.click();
    await expect(checker.approvalSuccessToast).toBeVisible({ timeout: 30000 });
    await checker.closeToastBtn.click();
  });

  // ── TC_BULK_005 ────────────────────────────────────────────────────────────────
  test('TC_BULK_005 - Onboarding History: filter by CHECKER PENDING status', async ({ page }) => {
    test.setTimeout(60_000);
    const bulk = await loginMaker(page);

    await bulk.navigateToOnboardingHistory();
    await bulk.filterBtn.click();
    await bulk.statusDropdown.click();
    await page.getByLabel('Select status').getByText('CHECKER PENDING', { exact: true }).click();
    await bulk.applyFiltersBtn.click();

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
    // All visible rows should show CHECKER PENDING
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByText('CHECKER PENDING')).toBeVisible();
    }
  });

  // ── TC_BULK_006 ────────────────────────────────────────────────────────────────
  test('TC_BULK_006 - Onboarding History: filter by file name', async ({ page }) => {
    test.setTimeout(60_000);
    const bulk = await loginMaker(page);

    await bulk.navigateToOnboardingHistory();
    await bulk.filterBtn.click();
    await bulk.fileNameInput.fill('bulk_individual');
    await bulk.applyFiltersBtn.click();

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/no results|bulk_individual/i)).toBeVisible({ timeout: 10000 });
  });

  // ── TC_BULK_007 ────────────────────────────────────────────────────────────────
  test('TC_BULK_007 - Onboarding History: filter by date range Today', async ({ page }) => {
    test.setTimeout(60_000);
    const bulk = await loginMaker(page);

    await bulk.navigateToOnboardingHistory();
    await bulk.filterBtn.click();
    await bulk.quickSelectToday.click();
    await bulk.applyFiltersBtn.click();

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
  });

  // ── TC_BULK_008 ────────────────────────────────────────────────────────────────
  test('TC_BULK_008 - Onboarding History: View Details modal shows upload info', async ({ page }) => {
    test.setTimeout(60_000);
    const bulk = await loginMaker(page);

    await bulk.navigateToOnboardingHistory();
    // First row must exist
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    await bulk.viewDetailsBtn.click();
    await expect(bulk.uploadDetailsHeading).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
    await bulk.closeModalBtn.click();
    await expect(bulk.uploadDetailsHeading).not.toBeVisible();
  });
});
