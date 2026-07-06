import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ChangeMpinPage } from '../../pages/ChangeMpinPage';
import { USER, PROFILE_ACCOUNT, CHANGE_MPIN } from '../../data/testData';

test.use({ ignoreHTTPSErrors: true });

test.describe('Profile — Change MPIN', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAndSelectAccountByNumber(
      USER.email, USER.password, USER.otp, PROFILE_ACCOUNT.accountNumber
    );
  });

  // ── POSITIVE ──────────────────────────────────────────────────
  test('TC_MPIN_001 | Change MPIN with correct old MPIN — success message shown', async ({ page }) => {
    const changeMpinPage = new ChangeMpinPage(page);
    await changeMpinPage.navigate();
    await changeMpinPage.changeMpin(
      CHANGE_MPIN.oldMpin,
      CHANGE_MPIN.newMpin,
      CHANGE_MPIN.confirmMpin
    );
    await expect(page.getByText('MPIN changed successfully')).toBeVisible();
  });

  // ── NEGATIVE ──────────────────────────────────────────────────

  /**
   * BUG TC_MPIN_NEG_001: Wrong old MPIN — shows generic "invalid process error"
   * instead of a clear "Incorrect MPIN" message. Expected: user-friendly error.
   */
  test('TC_MPIN_NEG_001 | Wrong old MPIN — should show error [BUG: shows "invalid process error"]', async ({ page }) => {
    const changeMpinPage = new ChangeMpinPage(page);
    await changeMpinPage.navigate();
    await changeMpinPage.fillOldMpin(CHANGE_MPIN.wrongOldMpin);
    await changeMpinPage.fillNewMpin(CHANGE_MPIN.newMpin);
    await changeMpinPage.fillConfirmMpin(CHANGE_MPIN.confirmMpin);
    await changeMpinPage.submit();
    // BUG: shows generic "invalid process error" — expected a clear MPIN error
    await expect(
      page.getByText(/invalid|incorrect|wrong|error/i)
    ).toBeVisible({ timeout: 8_000 });
    // MPIN must NOT have changed — success message should not appear
    await expect(page.getByText('MPIN changed successfully')).not.toBeVisible();
  });

  test('TC_MPIN_NEG_002 | New MPIN and Confirm MPIN mismatch — should show error', async ({ page }) => {
    const changeMpinPage = new ChangeMpinPage(page);
    await changeMpinPage.navigate();
    await changeMpinPage.fillOldMpin(CHANGE_MPIN.oldMpin);
    await changeMpinPage.fillNewMpin(CHANGE_MPIN.newMpin);
    await changeMpinPage.fillConfirmMpin(CHANGE_MPIN.mismatchedConfirm);
    await changeMpinPage.submit();
    await expect(
      page.locator('[class*="error"], [role="alert"]')
        .or(page.getByText(/do not match|mismatch|confirm/i))
    ).toBeVisible({ timeout: 8_000 });
  });

  test('TC_MPIN_NEG_003 | Empty old MPIN — should show validation error', async ({ page }) => {
    const changeMpinPage = new ChangeMpinPage(page);
    await changeMpinPage.navigate();
    await changeMpinPage.fillNewMpin(CHANGE_MPIN.newMpin);
    await changeMpinPage.fillConfirmMpin(CHANGE_MPIN.confirmMpin);
    await changeMpinPage.submit();
    await expect(
      page.locator('[class*="error"], [role="alert"]')
        .or(page.getByText(/required|empty|fill/i))
    ).toBeVisible({ timeout: 8_000 });
  });

  test('TC_MPIN_NEG_004 | Empty new MPIN — should show validation error', async ({ page }) => {
    const changeMpinPage = new ChangeMpinPage(page);
    await changeMpinPage.navigate();
    await changeMpinPage.fillOldMpin(CHANGE_MPIN.oldMpin);
    await changeMpinPage.submit();
    await expect(
      page.locator('[class*="error"], [role="alert"]')
        .or(page.getByText(/required|empty|fill/i))
    ).toBeVisible({ timeout: 8_000 });
  });

});
