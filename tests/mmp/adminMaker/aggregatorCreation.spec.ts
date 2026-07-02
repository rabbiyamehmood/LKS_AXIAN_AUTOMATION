import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/mmp/LoginPage';
import { AggregatorPage } from '../../../pages/mmp/AggregatorPage';
import { generateAggregatorData, negativeAggregatorData } from '../../../test-data/aggregator.data';

/**
 * Aggregator Creation Tests — AdminMaker
 * Covers: Positive (valid data) + Negative (form validation)
 */

// ── POSITIVE TESTS ─────────────────────────────────────────────────────────────

test.describe('TC_AGG - AdminMaker: Aggregator Creation - Positive', () => {

  test('TC_AGG_001 - AdminMaker should create aggregator successfully with valid data', async ({ page }) => {
    const loginPage      = new LoginPage(page);
    const aggregatorPage = new AggregatorPage(page);
    const testData       = generateAggregatorData();

    // Step 1: Login as AdminMaker
    await loginPage.navigate();
    await loginPage.loginAsAdminMaker();
    await expect(page).not.toHaveURL(/\/login/);

    // Step 2: Navigate to Aggregator List
    await aggregatorPage.navigateToAggregatorList();
    await expect(aggregatorPage.addAggregatorBtn).toBeVisible();

    // Step 3: Open Add Aggregator form
    await aggregatorPage.openAddAggregatorForm();
    await expect(aggregatorPage.nameInput).toBeVisible();

    // Step 4: Fill the form with unique data
    await aggregatorPage.fillAggregatorForm(testData);

    // Step 5: Verify Save button is enabled before submitting
    await aggregatorPage.assertSaveBtnEnabled();

    // Step 6: Save
    await aggregatorPage.saveAggregator();

    // Step 7: Verify success toast
    await aggregatorPage.assertSuccessToastVisible();
    await aggregatorPage.closeSuccessToast();

    // Step 8: Logout
    await aggregatorPage.logout();
    await expect(page).toHaveURL(/\/login/);
  });

});

// ── NEGATIVE TESTS ─────────────────────────────────────────────────────────────

test.describe('TC_AGG - AdminMaker: Aggregator Creation - Negative', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdminMaker();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC_AGG_002 - Should show validation errors when Save is clicked with empty fields', async ({ page }) => {
    const aggregatorPage = new AggregatorPage(page);

    // Navigate to form
    await aggregatorPage.navigateToAggregatorList();
    await aggregatorPage.openAddAggregatorForm();

    // Do NOT fill any field
    // Save button should be enabled
    await aggregatorPage.assertSaveBtnEnabled();

    // Click Save - validation errors should appear
    await aggregatorPage.saveAggregator();

    // Assert all validation errors are visible
    await aggregatorPage.assertFieldError(aggregatorPage.nameRequiredError);
    await aggregatorPage.assertFieldError(aggregatorPage.contactPersonRequiredError);
    await aggregatorPage.assertFieldError(aggregatorPage.phoneRequiredError);
    await aggregatorPage.assertFieldError(aggregatorPage.paymentMethodRequiredError);

    // Form should remain open
    await aggregatorPage.assertStillOnForm();
  });

  test('TC_AGG_003 - Should show validation error when name is empty', async ({ page }) => {
    const aggregatorPage = new AggregatorPage(page);
    const data           = negativeAggregatorData.emptyName;

    await aggregatorPage.navigateToAggregatorList();
    await aggregatorPage.openAddAggregatorForm();

    // Fill all fields except name
    await aggregatorPage.contactPersonInput.fill(data.contactPerson);
    await aggregatorPage.emailInput.fill(data.email);
    await aggregatorPage.phoneInput.fill(data.phone);
    await aggregatorPage.qrAuthOption.click();

    // Save button should be enabled
    await aggregatorPage.assertSaveBtnEnabled();

    // Click Save - name validation error should appear
    await aggregatorPage.saveAggregator();

    // Assert name required error is visible
    await aggregatorPage.assertFieldError(aggregatorPage.nameRequiredError);

    // Form should remain open
    await aggregatorPage.assertStillOnForm();
  });

  test('TC_AGG_004 - Should show validation error for invalid email format', async ({ page }) => {
    const aggregatorPage = new AggregatorPage(page);
    const data           = negativeAggregatorData.invalidEmail;

    await aggregatorPage.navigateToAggregatorList();
    await aggregatorPage.openAddAggregatorForm();
    await aggregatorPage.fillAggregatorForm(data);

    // Either Save is disabled or clicking Save keeps us on the form
    const isSaveDisabled = await aggregatorPage.saveBtn.isDisabled();
    if (!isSaveDisabled) {
      await aggregatorPage.saveAggregator();
    }

    // Should remain on the form (not navigate away / no success toast)
    await aggregatorPage.assertStillOnForm();
    await expect(aggregatorPage.successToast).not.toBeVisible();
  });

  test('TC_AGG_005 - Should show validation error for non-numeric phone number', async ({ page }) => {
    const aggregatorPage = new AggregatorPage(page);
    const data           = negativeAggregatorData.invalidPhone;

    await aggregatorPage.navigateToAggregatorList();
    await aggregatorPage.openAddAggregatorForm();
    await aggregatorPage.fillAggregatorForm(data);

    const isSaveDisabled = await aggregatorPage.saveBtn.isDisabled();
    if (!isSaveDisabled) {
      await aggregatorPage.saveAggregator();
    }

    // No success toast should appear
    await expect(aggregatorPage.successToast).not.toBeVisible();
    await aggregatorPage.assertStillOnForm();
  });

  test('TC_AGG_006 - Should show validation error for phone number that is too short', async ({ page }) => {
    const aggregatorPage = new AggregatorPage(page);
    const data           = negativeAggregatorData.shortPhone;

    await aggregatorPage.navigateToAggregatorList();
    await aggregatorPage.openAddAggregatorForm();
    await aggregatorPage.fillAggregatorForm(data);

    const isSaveDisabled = await aggregatorPage.saveBtn.isDisabled();
    if (!isSaveDisabled) {
      await aggregatorPage.saveAggregator();
    }

    await expect(aggregatorPage.successToast).not.toBeVisible();
    await aggregatorPage.assertStillOnForm();
  });

});
