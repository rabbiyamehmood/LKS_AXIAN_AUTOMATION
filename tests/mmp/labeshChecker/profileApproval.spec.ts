import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/mmp/LoginPage';
import { MDRProfilePage } from '../../../pages/mmp/MDRProfilePage';
import { TaxProfilePage } from '../../../pages/mmp/TaxProfilePage';

/**
 * LabeshChecker — Approve / Reject MDR Profile & Tax Profile requests
 *
 * TC_MDR_CHK_001 — Approve MDR Profile creation
 * TC_MDR_CHK_002 — Reject MDR Profile creation
 * TC_TAX_CHK_001 — Approve Tax Profile creation
 * TC_TAX_CHK_002 — Reject Tax Profile creation
 */

const CHECKER_USER = process.env.LABESH_CHECKER_USERNAME ?? 'LabeshChecker';
const CHECKER_PASS = process.env.LABESH_CHECKER_PASSWORD ?? 'Pakistan@1234';

async function loginChecker(page: any) {
  const lp = new LoginPage(page);
  await lp.navigate();
  await page.getByRole('textbox', { name: /username/i }).fill(CHECKER_USER);
  await page.getByRole('textbox', { name: /password/i }).fill(CHECKER_PASS);
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

async function reviewPendingProcess(page: any, action: 'Approve' | 'Reject', comment: string) {
  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();
  await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 20000 });
  await page.getByRole('button', { name: 'Review' }).first().click();
  await page.getByRole('button', { name: action }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill(comment);
  await page.getByRole('button', { name: 'Confirm' }).click();
  const successText = action === 'Approve' ? /approved successfully|process approved/i : /rejected successfully|process rejected/i;
  await expect(page.getByText(successText)).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();
}

test.describe('LabeshChecker — MDR Profile Approval', () => {
  test.setTimeout(120_000);

  test('TC_MDR_CHK_001 - LabeshChecker approves MDR Profile creation', async ({ page }) => {
    await loginChecker(page);
    await reviewPendingProcess(page, 'Approve', 'TC_MDR_CHK_001 — approved');
  });

  test('TC_MDR_CHK_002 - LabeshChecker rejects MDR Profile creation', async ({ page }) => {
    await loginChecker(page);
    await reviewPendingProcess(page, 'Reject', 'TC_MDR_CHK_002 — rejected invalid data');
  });
});

test.describe('LabeshChecker — Tax Profile Approval', () => {
  test.setTimeout(120_000);

  test('TC_TAX_CHK_001 - LabeshChecker approves Tax Profile creation', async ({ page }) => {
    await loginChecker(page);
    await reviewPendingProcess(page, 'Approve', 'TC_TAX_CHK_001 — approved');
  });

  test('TC_TAX_CHK_002 - LabeshChecker rejects Tax Profile creation', async ({ page }) => {
    await loginChecker(page);
    await reviewPendingProcess(page, 'Reject', 'TC_TAX_CHK_002 — rejected');
  });
});
