import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { ConfigPage } from '../../pages/mmp/ConfigPage';

/**
 * Config Module — Positive Scenarios
 *
 * TC_CFG_001 — KYC Setup attribute updated → AdminChecker approves
 * TC_CFG_002 — LOV Setup new value added → AdminChecker approves
 * TC_CFG_003 — Document Setup name/description updated → AdminChecker approves
 * TC_CFG_004 — Field Validation regex updated → AdminChecker approves
 */

async function loginAsAdminMaker(loginPage: LoginPage) {
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(loginPage.page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

async function loginAsAdminChecker(loginPage: LoginPage) {
  await loginPage.navigate();
  await loginPage.loginAsAdminChecker();
  await expect(loginPage.page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

test.describe('Config Module — Positive Scenarios', () => {

  // ── TC_CFG_001 ───────────────────────────────────────────────────────────────
  test('TC_CFG_001 - KYC Setup attribute updated and approved by AdminChecker', async ({ page }) => {
    test.setTimeout(120_000);
    const loginPage = new LoginPage(page);
    const configPage = new ConfigPage(page);

    // PHASE 1: AdminMaker edits KYC attribute
    await loginAsAdminMaker(loginPage);
    await configPage.navigateToKYCSetup();
    await configPage.editFirstKYCAttribute('text');

    await page.getByRole('button', { name: /a admin/i }).click();
    await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // PHASE 2: AdminChecker approves
    await loginAsAdminChecker(loginPage);
    await configPage.approveFromInbox('KYC', 'approved');
  });

  // ── TC_CFG_002 ───────────────────────────────────────────────────────────────
  test('TC_CFG_002 - LOV Setup new value added and approved by AdminChecker', async ({ page }) => {
    test.setTimeout(120_000);
    const loginPage = new LoginPage(page);
    const configPage = new ConfigPage(page);

    // PHASE 1: AdminMaker adds LOV value
    await loginAsAdminMaker(loginPage);
    await configPage.navigateToLOVSetup();
    await configPage.addLOVValue(`TestVal_${Date.now()}`);

    await page.getByRole('button', { name: /a admin/i }).click();
    await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // PHASE 2: AdminChecker approves
    await loginAsAdminChecker(loginPage);
    await configPage.approveFromInbox('LOV', 'approved');
  });

  // ── TC_CFG_003 ───────────────────────────────────────────────────────────────
  test('TC_CFG_003 - Document Setup name and description updated and approved', async ({ page }) => {
    test.setTimeout(120_000);
    const loginPage = new LoginPage(page);
    const configPage = new ConfigPage(page);

    // PHASE 1: AdminMaker edits document
    await loginAsAdminMaker(loginPage);
    await configPage.navigateToDocumentSetup();
    await configPage.editDocumentNameAndDescription(
      `AutoDoc_${Date.now()}`,
      'Automated test description'
    );

    await page.getByRole('button', { name: /a admin/i }).click();
    await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // PHASE 2: AdminChecker approves
    await loginAsAdminChecker(loginPage);
    await configPage.approveFromInbox('DOCUMENT', 'approved');
  });

  // ── TC_CFG_004 ───────────────────────────────────────────────────────────────
  test('TC_CFG_004 - Field Validation regex updated and approved by AdminChecker', async ({ page }) => {
    test.setTimeout(120_000);
    const loginPage = new LoginPage(page);
    const configPage = new ConfigPage(page);

    // PHASE 1: AdminMaker edits field validation
    await loginAsAdminMaker(loginPage);
    await configPage.navigateToFieldValidationSetup();
    await configPage.editFieldValidation(
      '^[0-9]{9,12}$',
      'Must be 9 to 12 digits'
    );

    await page.getByRole('button', { name: /a admin/i }).click();
    await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // PHASE 2: AdminChecker approves
    await loginAsAdminChecker(loginPage);
    await configPage.approveFromInbox('FIELD VALIDATION', 'approved');
  });
});
