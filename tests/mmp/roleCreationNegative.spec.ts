import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { generateRoleData } from '../../test-data/role.data';

/**
 * Role Creation — Negative Test Cases
 * Based on validation errors from UI screenshots:
 *   1. "Name must be at least 4 characters"
 *   2. "Role type is required"
 *   3. "Description must be at least 4 characters"
 *   4. "Please select at least one permission"
 */

test.describe('Role Creation - Negative Validation', () => {

  test('TC_ROLE_NEG_001 - Empty role name shows "Name must be at least 4 characters"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testData = generateRoleData();

    // Step 1: Login as AdminMaker
    await loginPage.navigate();
    await loginPage.loginAsAdminMaker();
    await expect(page).not.toHaveURL(/\/login/);

    // Step 2: Navigate to Add Role
    await page.getByRole('button', { name: 'User & Role Management' }).click();
    await page.getByRole('link', { name: 'Role List' }).click();
    await page.getByRole('button', { name: 'Add Role' }).click();

    // Step 3: Select role type (BACKOFFICE)
    await page.getByRole('button', { name: 'Role Type*' }).click();
    await page.getByText('BACKOFFICE').click();

    // Step 4: Fill description but leave name empty
    await page.getByRole('textbox', { name: 'Enter role description' }).fill(testData.description);

    // Step 5: Wait for permissions and select one
    await page.waitForSelector('label:has-text("Dashboard")', { timeout: 10000 });
    await page.locator('label').filter({ hasText: 'Dashboard' }).getByRole('checkbox').click();

    // Step 6: Try to click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Step 7: Verify validation error
    await expect(page.getByText('Name must be at least 4 characters')).toBeVisible();
  });

  test('TC_ROLE_NEG_002 - No role type selected shows "Role type is required"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testData = generateRoleData();

    // Step 1: Login as AdminMaker
    await loginPage.navigate();
    await loginPage.loginAsAdminMaker();
    await expect(page).not.toHaveURL(/\/login/);

    // Step 2: Navigate to Add Role
    await page.getByRole('button', { name: 'User & Role Management' }).click();
    await page.getByRole('link', { name: 'Role List' }).click();
    await page.getByRole('button', { name: 'Add Role' }).click();

    // Step 3: Fill name and description but don't select role type
    await page.getByRole('textbox', { name: 'Enter role name' }).fill(testData.name);
    await page.getByRole('textbox', { name: 'Enter role description' }).fill(testData.description);

    // Step 4: Try to click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Step 5: Verify validation error
    await expect(page.getByText('Role type is required')).toBeVisible();
  });

  test('TC_ROLE_NEG_003 - Empty description shows "Description must be at least 4 characters"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testData = generateRoleData();

    // Step 1: Login as AdminMaker
    await loginPage.navigate();
    await loginPage.loginAsAdminMaker();
    await expect(page).not.toHaveURL(/\/login/);

    // Step 2: Navigate to Add Role
    await page.getByRole('button', { name: 'User & Role Management' }).click();
    await page.getByRole('link', { name: 'Role List' }).click();
    await page.getByRole('button', { name: 'Add Role' }).click();

    // Step 3: Fill name and select role type
    await page.getByRole('textbox', { name: 'Enter role name' }).fill(testData.name);
    await page.getByRole('button', { name: 'Role Type*' }).click();
    await page.getByText('BACKOFFICE').click();

    // Step 4: Wait for permissions and select one
    await page.waitForSelector('label:has-text("Dashboard")', { timeout: 10000 });
    await page.locator('label').filter({ hasText: 'Dashboard' }).getByRole('checkbox').click();

    // Step 5: Leave description empty and try to Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Step 6: Verify validation error
    await expect(page.getByText('Description must be at least 4 characters')).toBeVisible();
  });

  test('TC_ROLE_NEG_004 - No permissions selected shows "Please select at least one permission"', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testData = generateRoleData();

    // Step 1: Login as AdminMaker
    await loginPage.navigate();
    await loginPage.loginAsAdminMaker();
    await expect(page).not.toHaveURL(/\/login/);

    // Step 2: Navigate to Add Role
    await page.getByRole('button', { name: 'User & Role Management' }).click();
    await page.getByRole('link', { name: 'Role List' }).click();
    await page.getByRole('button', { name: 'Add Role' }).click();

    // Step 3: Fill all fields but don't select any permissions
    await page.getByRole('textbox', { name: 'Enter role name' }).fill(testData.name);
    await page.getByRole('button', { name: 'Role Type*' }).click();
    await page.getByText('BACKOFFICE').click();
    await page.getByRole('textbox', { name: 'Enter role description' }).fill(testData.description);

    // Step 4: Wait for permissions to load
    await page.waitForSelector('label:has-text("Dashboard")', { timeout: 10000 });

    // Step 5: Try to Save without selecting any permissions
    await page.getByRole('button', { name: 'Save' }).click();

    // Step 6: Verify validation error
    await expect(page.getByText('Please select at least one permission')).toBeVisible();
  });

});
