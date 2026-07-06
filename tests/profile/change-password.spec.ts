import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ChangePasswordPage } from '../../pages/ChangePasswordPage';
import { USER, PROFILE_ACCOUNT, CHANGE_PASSWORD } from '../../data/testData';

test.use({ ignoreHTTPSErrors: true });

test.describe('Profile — Change Password', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAndSelectAccountByNumber(
      USER.email, USER.password, USER.otp, PROFILE_ACCOUNT.accountNumber
    );
  });

  // ── POSITIVE ──────────────────────────────────────────────────
  test('TC_PWD_001 | Change password with valid current password', async ({ page }) => {
    const changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.navigate();
    await changePasswordPage.changePassword(
      CHANGE_PASSWORD.currentPassword,
      CHANGE_PASSWORD.newPassword,
      CHANGE_PASSWORD.confirmNewPassword
    );
    // Expect success message or redirect away from change password page
    await expect(
      page.getByText(/success|changed|updated/i).or(page.getByRole('alert'))
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── NEGATIVE ──────────────────────────────────────────────────

  /**
   * BUG TC_PWD_NEG_001: Wrong current password — no error message shown.
   * Application silently fails or shows no feedback. Expected: validation error.
   */
  test('TC_PWD_NEG_001 | Wrong current password — should show error [BUG: no error shown]', async ({ page }) => {
    const changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.navigate();
    await changePasswordPage.changePassword(
      CHANGE_PASSWORD.wrongCurrentPassword,
      CHANGE_PASSWORD.newPassword,
      CHANGE_PASSWORD.confirmNewPassword
    );
    // BUG: application does not show an error — this assertion documents expected behaviour
    await expect(
      page.locator('[class*="error"], [role="alert"], [class*="invalid"]')
        .or(page.getByText(/incorrect|invalid|wrong|failed/i))
    ).toBeVisible({ timeout: 8_000 });
  });

  test('TC_PWD_NEG_002 | New password and confirm password mismatch — should show error', async ({ page }) => {
    const changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.navigate();
    await changePasswordPage.changePassword(
      CHANGE_PASSWORD.currentPassword,
      CHANGE_PASSWORD.newPassword,
      CHANGE_PASSWORD.mismatchedConfirm
    );
    await expect(
      page.locator('[class*="error"], [role="alert"]')
        .or(page.getByText(/do not match|mismatch|confirm/i))
    ).toBeVisible({ timeout: 8_000 });
  });

  test('TC_PWD_NEG_003 | Weak new password — should show validation error', async ({ page }) => {
    const changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.navigate();
    await changePasswordPage.changePassword(
      CHANGE_PASSWORD.currentPassword,
      CHANGE_PASSWORD.weakPassword,
      CHANGE_PASSWORD.weakPassword
    );
    await expect(
      page.locator('[class*="error"], [role="alert"]')
        .or(page.getByText(/weak|strong|policy|requirement/i))
    ).toBeVisible({ timeout: 8_000 });
  });

  test('TC_PWD_NEG_004 | Empty current password — should show validation error', async ({ page }) => {
    const changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.navigate();
    await changePasswordPage.changePassword('', CHANGE_PASSWORD.newPassword, CHANGE_PASSWORD.confirmNewPassword);
    await expect(
      page.locator('[class*="error"], [role="alert"]')
        .or(page.getByText(/required|empty|fill/i))
    ).toBeVisible({ timeout: 8_000 });
  });

  test('TC_PWD_NEG_005 | Empty new password — should show validation error', async ({ page }) => {
    const changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.navigate();
    await changePasswordPage.changePassword(CHANGE_PASSWORD.currentPassword, '', '');
    await expect(
      page.locator('[class*="error"], [role="alert"]')
        .or(page.getByText(/required|empty|fill/i))
    ).toBeVisible({ timeout: 8_000 });
  });

});
