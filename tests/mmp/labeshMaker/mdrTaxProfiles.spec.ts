import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/mmp/LoginPage';
import { MDRProfilePage } from '../../../pages/mmp/MDRProfilePage';
import { TaxProfilePage } from '../../../pages/mmp/TaxProfilePage';

/**
 * LabeshMaker — MDR Profile & Tax Profile CRUD
 *
 * TC_MDR_001 — Create MDR Profile (positive)
 * TC_MDR_002 — Update MDR Profile (positive)
 * TC_MDR_NEG_001 — Create MDR Profile with blank name → error
 * TC_MDR_NEG_002 — Create MDR Profile with no rules → error
 * TC_TAX_001 — Create Tax Profile (positive)
 * TC_TAX_002 — Update Tax Profile (positive)
 * TC_TAX_NEG_001 — Create Tax Profile with blank name → error
 */

const MAKER_USER = process.env.LABESH_MAKER_USERNAME ?? 'Labesh_Maker';
const MAKER_PASS = process.env.LABESH_MAKER_PASSWORD ?? 'Pakistan@1234';

async function loginMaker(page: any) {
  const lp = new LoginPage(page);
  await lp.navigate();
  await page.getByRole('textbox', { name: /username/i }).fill(MAKER_USER);
  await page.getByRole('textbox', { name: /password/i }).fill(MAKER_PASS);
  await page.getByRole('button', { name: /^login$/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

test.describe('LabeshMaker — MDR Profile CRUD', () => {
  test.setTimeout(120_000);

  test('TC_MDR_001 - Create MDR Profile with valid data', async ({ page }) => {
    await loginMaker(page);
    const mdr = new MDRProfilePage(page);

    await mdr.navigateToMDRProfileList();
    await mdr.createProfile({
      name: `AutoMDR_${Date.now()}`,
      description: 'Automated MDR profile creation',
      merchantCategory: 'GENERAL',
      paymentMethod: 'MOBILE MONEY',
      mdrValue: 2.5,
      minimumAmount: 1000,
      maximumAmount: 500000,
    });

    await expect(page.getByText(/processed ok|success/i)).toBeVisible({ timeout: 15000 });
  });

  test('TC_MDR_002 - Update existing MDR Profile', async ({ page }) => {
    await loginMaker(page);
    const mdr = new MDRProfilePage(page);

    await mdr.navigateToMDRProfileList();
    // Open the first profile in the list and update description
    await page.locator('tbody tr').first().getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('textbox', { name: /description/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('textbox', { name: /description/i }).clear();
    await page.getByRole('textbox', { name: /description/i }).fill(`Updated at ${new Date().toISOString()}`);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(/processed ok|success/i)).toBeVisible({ timeout: 15000 });
  });

  test('TC_MDR_NEG_001 - Create MDR Profile with blank name shows validation error', async ({ page }) => {
    test.setTimeout(60_000);
    await loginMaker(page);
    const mdr = new MDRProfilePage(page);

    await mdr.navigateToMDRProfileList();
    await page.getByRole('button', { name: 'MDR Profile Add' }).click();
    await expect(page.getByRole('textbox', { name: 'Enter profile name' })).toBeVisible({ timeout: 10000 });
    // Leave name blank
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByText(/profile name is required|cannot be empty/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC_MDR_NEG_002 - Create MDR Profile with no rules shows validation error', async ({ page }) => {
    test.setTimeout(60_000);
    await loginMaker(page);
    const mdr = new MDRProfilePage(page);

    await mdr.navigateToMDRProfileList();
    await page.getByRole('button', { name: 'MDR Profile Add' }).click();
    await expect(page.getByRole('textbox', { name: 'Enter profile name' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('textbox', { name: 'Enter profile name' }).fill(`NoRuleMDR_${Date.now()}`);
    // Skip adding rules, attempt to save
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByText(/at least one rule|rules are required/i)
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('LabeshMaker — Tax Profile CRUD', () => {
  test.setTimeout(120_000);

  test('TC_TAX_001 - Create Tax Profile with valid data', async ({ page }) => {
    await loginMaker(page);
    const tax = new TaxProfilePage(page);

    await tax.navigateToTaxProfileList();
    await tax.createProfile({
      name: `AutoTAX_${Date.now()}`,
      region: 'MAINLAND',
      taxValue: 18,
      minimumAmount: 1000,
      maximumAmount: 1000000,
    });

    await expect(page.getByText(/processed ok|success/i)).toBeVisible({ timeout: 15000 });
  });

  test('TC_TAX_002 - Update existing Tax Profile', async ({ page }) => {
    await loginMaker(page);
    const tax = new TaxProfilePage(page);

    await tax.navigateToTaxProfileList();
    await page.locator('tbody tr').first().getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('textbox', { name: 'Enter profile name' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('textbox', { name: 'Enter profile name' }).clear();
    await page.getByRole('textbox', { name: 'Enter profile name' }).fill(`UpdatedTAX_${Date.now()}`);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(/processed ok|success/i)).toBeVisible({ timeout: 15000 });
  });

  test('TC_TAX_NEG_001 - Create Tax Profile with blank name shows validation error', async ({ page }) => {
    test.setTimeout(60_000);
    await loginMaker(page);
    const tax = new TaxProfilePage(page);

    await tax.navigateToTaxProfileList();
    await page.getByRole('button', { name: 'Tax Profile Add' }).click();
    await expect(page.getByRole('heading', { name: 'Add Tax Profile' })).toBeVisible({ timeout: 10000 });
    // Leave name blank, attempt to save
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByText(/profile name is required|cannot be empty/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
