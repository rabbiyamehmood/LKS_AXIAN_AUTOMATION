import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { ChangePasswordPage } from '../../pages/mmp/ChangePasswordPage';

/**
 * Change Password Module — Positive & Negative Scenarios
 *
 * TC_PWD_001 — Change password successfully with valid current + new password
 * TC_PWD_002 — Verify new password enforced on next login (old password rejected)
 * TC_PWD_NEG_001 — Wrong current password → no error shown (known bug)
 * TC_PWD_NEG_002 — New password does not match confirm password → inline error
 * TC_PWD_NEG_003 — New password less than 8 characters → inline error
 * TC_PWD_NEG_004 — New password same as current password → inline error
 * TC_PWD_NEG_005 — New password missing uppercase/lowercase/number → inline error
 * TC_PWD_NEG_006 — All fields empty → validation errors shown
 */

const BASE_URL   = 'https://mixxmmp-test.tigo.co.tz';
const USERNAME   = process.env.ADMIN_MAKER_USERNAME  ?? 'AdminMaker';
const OLD_PASS   = process.env.ADMIN_MAKER_PASSWORD  ?? 'Pakistan@1234';
const NEW_PASS   = 'Password@123';

test.use({ ignoreHTTPSErrors: true });

// ════════════════════════════════════════════════════════════════════════════
// POSITIVE SCENARIOS
// ════════════════════════════════════════════════════════════════════════════

test.describe('Change Password — Positive Scenarios', () => {
  test.setTimeout(120_000);

  /**
   * TC_PWD_001
   * Change password successfully with valid current and new password.
   * Then restore original password so suite remains repeatable.
   */
  test('TC_PWD_001 - Change password successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const pwdPage   = new ChangePasswordPage(page);

    // Step 1: Login with original password
    await loginPage.navigate();
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Step 2: Open Change Password form
    await pwdPage.openChangePasswordForm();

    // Step 3: Change to new password
    await pwdPage.changePasswordSuccessfully(OLD_PASS, NEW_PASS);

    // Step 4: Assert success toast was shown (already asserted inside helper)

    // Step 5: Logout
    await pwdPage.logout();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Step 6: Assert old password is now rejected
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page.getByText('Invalid credentials for user')).toBeVisible({ timeout: 10000 });

    // Step 7: Login with new password succeeds
    await page.locator('form').getByRole('button').filter({ hasText: /^$/ }).click(); // clear error toast
    await loginPage.login(USERNAME, NEW_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Step 8: Restore original password so suite stays repeatable
    await pwdPage.openChangePasswordForm();
    await pwdPage.changePasswordSuccessfully(NEW_PASS, OLD_PASS);
    await pwdPage.logout();
  });

  /**
   * TC_PWD_002
   * After password change, verify old password is rejected and new password works.
   * (Standalone verification flow without restoration — for evidence/reporting.)
   */
  test('TC_PWD_002 - Old password rejected after successful change, new password accepted', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const pwdPage   = new ChangePasswordPage(page);

    // Login and change password
    await loginPage.navigate();
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await pwdPage.openChangePasswordForm();
    await pwdPage.changePasswordSuccessfully(OLD_PASS, NEW_PASS);
    await pwdPage.logout();

    // Old password must fail
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page.getByText('Invalid credentials for user')).toBeVisible({ timeout: 10000 });

    // New password must succeed
    await page.locator('form').getByRole('button').filter({ hasText: /^$/ }).click();
    await loginPage.login(USERNAME, NEW_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Restore
    await pwdPage.openChangePasswordForm();
    await pwdPage.changePasswordSuccessfully(NEW_PASS, OLD_PASS);
    await pwdPage.logout();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NEGATIVE SCENARIOS
// ════════════════════════════════════════════════════════════════════════════

test.describe('Change Password — Negative Scenarios', () => {
  test.setTimeout(60_000);

  /**
   * TC_PWD_NEG_001
   * Wrong current password — app should show an error but does NOT (known bug).
   * Expected result: FAIL (bug)
   */
  test('TC_PWD_NEG_001 - Wrong current password should show error (known bug)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const pwdPage   = new ChangePasswordPage(page);

    await loginPage.navigate();
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await pwdPage.openChangePasswordForm();
    await pwdPage.fillAndSubmit('WrongPassword@999', NEW_PASS, NEW_PASS);

    // Expected: error message shown for wrong current password
    // Actual: app processes silently with no error — known bug
    await expect(
      page.getByText(/incorrect|invalid|wrong|current password/i)
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * TC_PWD_NEG_002
   * New password and confirm password do not match → inline error expected.
   */
  test('TC_PWD_NEG_002 - Mismatched new and confirm password shows inline error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const pwdPage   = new ChangePasswordPage(page);

    await loginPage.navigate();
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await pwdPage.openChangePasswordForm();
    await pwdPage.fillAndSubmit(OLD_PASS, 'Password@123', 'Different@999');

    await expect(
      page.getByText(/password.*match|match.*password|do not match/i)
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * TC_PWD_NEG_003
   * New password less than 8 characters → inline error expected.
   */
  test('TC_PWD_NEG_003 - New password less than 8 characters shows inline error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const pwdPage   = new ChangePasswordPage(page);

    await loginPage.navigate();
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await pwdPage.openChangePasswordForm();
    await pwdPage.fillAndSubmit(OLD_PASS, 'Ab1@', 'Ab1@');

    await expect(
      page.getByText(/at least 8|minimum 8|8 characters/i)
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * TC_PWD_NEG_004
   * New password same as current password → should be rejected per requirements.
   */
  test('TC_PWD_NEG_004 - New password same as current password should be rejected', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const pwdPage   = new ChangePasswordPage(page);

    await loginPage.navigate();
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await pwdPage.openChangePasswordForm();
    await pwdPage.fillAndSubmit(OLD_PASS, OLD_PASS, OLD_PASS);

    await expect(
      page.getByText(/different from current|same as current|must not match/i)
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * TC_PWD_NEG_005
   * New password missing uppercase/lowercase/number → inline error expected.
   */
  test('TC_PWD_NEG_005 - New password missing complexity requirements shows inline error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const pwdPage   = new ChangePasswordPage(page);

    await loginPage.navigate();
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await pwdPage.openChangePasswordForm();

    // No uppercase, no number
    await pwdPage.fillAndSubmit(OLD_PASS, 'alllowercase@', 'alllowercase@');
    await expect(
      page.getByText(/uppercase|lowercase|number|complexity|8 characters/i)
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * TC_PWD_NEG_006
   * All fields left empty → validation errors shown, button blocked.
   */
  test('TC_PWD_NEG_006 - All fields empty shows required field validation errors', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const pwdPage   = new ChangePasswordPage(page);

    await loginPage.navigate();
    await loginPage.login(USERNAME, OLD_PASS);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await pwdPage.openChangePasswordForm();
    await pwdPage.changePasswordBtn.click();

    await expect(
      page.getByText(/required|cannot be empty|mandatory/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
