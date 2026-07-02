import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';

/**
 * Login Smoke Tests - MMP Portal
 * Covers: AdminMaker, AdminChecker, Labesh_Maker, LabeshChecker
 * Tests: Positive (valid credentials) + Negative (invalid credentials)
 */

test.describe('MMP Login - AdminMaker', () => {
  test('TC_LOGIN_001 - AdminMaker should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdminMaker();

    // After login, URL should change away from /login
    await expect(page).not.toHaveURL(/\/login/);
    // Dashboard/home should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC_LOGIN_002 - AdminMaker should fail login with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.ADMIN_MAKER_USERNAME!, 'WrongPassword@999');

    await expect(page).toHaveURL(/\/login/);
  });

  test('TC_LOGIN_003 - AdminMaker should fail login with invalid username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('InvalidUser_999', process.env.ADMIN_MAKER_PASSWORD!);

    await expect(page).toHaveURL(/\/login/);
  });

  test('TC_LOGIN_004 - Login button should be disabled when credentials are empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    // Button should be disabled when no credentials are entered
    await expect(loginPage.loginButton).toBeDisabled();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('MMP Login - AdminChecker', () => {
  test('TC_LOGIN_005 - AdminChecker should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdminChecker();

    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC_LOGIN_006 - AdminChecker should fail login with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.ADMIN_CHECKER_USERNAME!, 'Invalid@Pass');

    await expect(page).toHaveURL(/\/login/);
  });

  test('TC_LOGIN_007 - AdminChecker should fail login with invalid username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('InvalidChecker_999', process.env.ADMIN_CHECKER_PASSWORD!);

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('MMP Login - Labesh_Maker', () => {
  test('TC_LOGIN_008 - Labesh_Maker should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsLabeshMaker();

    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC_LOGIN_009 - Labesh_Maker should fail login with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.LABESH_MAKER_USERNAME!, 'Wrong@Pass');

    await expect(page).toHaveURL(/\/login/);
  });

  test('TC_LOGIN_010 - Labesh_Maker should fail login with invalid username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('InvalidLabesh_999', process.env.LABESH_MAKER_PASSWORD!);

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('MMP Login - LabeshChecker', () => {
  test('TC_LOGIN_011 - LabeshChecker should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsLabeshChecker();

    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC_LOGIN_012 - LabeshChecker should fail login with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.LABESH_CHECKER_USERNAME!, 'Wrong@Pass');

    await expect(page).toHaveURL(/\/login/);
  });

  test('TC_LOGIN_013 - LabeshChecker should fail login with invalid username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('InvalidLabeshChecker_999', process.env.LABESH_CHECKER_PASSWORD!);

    await expect(page).toHaveURL(/\/login/);
  });
});
