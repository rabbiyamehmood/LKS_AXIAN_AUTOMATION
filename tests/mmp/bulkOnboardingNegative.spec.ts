import { test, expect } from '@playwright/test';
import * as path from 'path';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { BulkOnboardingPage } from '../../pages/mmp/BulkOnboardingPage';

/**
 * Bulk Onboarding Module — Negative Scenarios
 *
 * TC_BULK_NEG_001 — No file selected → submit shows validation error
 * TC_BULK_NEG_002 — File selected but no Merchant Type → validation error
 * TC_BULK_NEG_003 — Upload unsupported file type (.txt) → error
 * TC_BULK_NEG_004 — LabeshChecker rejects bulk onboarding request
 */

const DATA_DIR = path.resolve(__dirname, '../../test-data/bulk');

const MAKER_USER    = process.env.LABESH_MAKER_USERNAME    ?? 'Labesh_Maker';
const MAKER_PASS    = process.env.LABESH_MAKER_PASSWORD    ?? 'Pakistan@1234';
const CHECKER_USER  = process.env.LABESH_CHECKER_USERNAME  ?? 'LabeshChecker';
const CHECKER_PASS  = process.env.LABESH_CHECKER_PASSWORD  ?? 'Pakistan@1234';

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

test.describe('Bulk Onboarding — Negative Scenarios', () => {
  test.setTimeout(60_000);

  // ── TC_BULK_NEG_001 ────────────────────────────────────────────────────────────
  test('TC_BULK_NEG_001 - Submit without selecting a file shows validation error', async ({ page }) => {
    const bulk = await loginMaker(page);

    await bulk.navigateToBulkOnboarding();
    // Click submit without uploading anything
    await bulk.submitBtn.click();

    await expect(
      page.getByText(/please upload a file|file is required|no file selected/i)
    ).toBeVisible({ timeout: 10000 });
  });

  // ── TC_BULK_NEG_002 ────────────────────────────────────────────────────────────
  test('TC_BULK_NEG_002 - Submit with file but no Merchant Type shows validation error', async ({ page }) => {
    const bulk = await loginMaker(page);

    await bulk.navigateToBulkOnboarding();
    // Upload file but skip merchant type selection
    await bulk.fileInput.setInputFiles(path.join(DATA_DIR, 'bulk_individual.xlsx'));
    await bulk.submitBtn.click();

    await expect(
      page.getByText(/merchant type is required|please select a merchant type/i)
    ).toBeVisible({ timeout: 10000 });
  });

  // ── TC_BULK_NEG_003 ────────────────────────────────────────────────────────────
  test('TC_BULK_NEG_003 - Upload unsupported .txt file shows format error', async ({ page }) => {
    const bulk = await loginMaker(page);

    await bulk.navigateToBulkOnboarding();
    await bulk.fileInput.setInputFiles(path.join(DATA_DIR, 'invalid_file.txt'));

    await expect(
      page.getByText(/invalid file format|only .xlsx|unsupported file type/i)
    ).toBeVisible({ timeout: 10000 });
  });

  // ── TC_BULK_NEG_004 ────────────────────────────────────────────────────────────
  test('TC_BULK_NEG_004 - LabeshChecker rejects bulk onboarding request', async ({ page }) => {
    test.setTimeout(300_000);
    const bulk = await loginMaker(page);

    // Maker submits a valid request
    await bulk.navigateToBulkOnboarding();
    await bulk.uploadFile(path.join(DATA_DIR, 'bulk_individual.xlsx'), 'Individual');
    await bulk.submitBtn.click();
    await expect(bulk.successToast).toBeVisible({ timeout: 30000 });
    await bulk.closeToastBtn.click();

    await makerLogout(page);

    // Checker rejects it
    const checker = await loginChecker(page);
    await checker.inboxBtn.click();
    await checker.pendingProcessesLink.click();
    await expect(page.getByRole('cell', { name: 'BULK MERCHANT ONBOARDING' }).first()).toBeVisible({ timeout: 30000 });
    await checker.reviewBtn.click();
    await checker.rejectBtn.click();
    await checker.commentsInput.fill('TC_BULK_NEG_004 — rejecting for negative test');
    await checker.confirmBtn.click();

    await expect(
      page.getByText(/rejected|success/i)
    ).toBeVisible({ timeout: 15000 });
    await checker.closeToastBtn.click();
  });
});
