import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { RolePage } from '../../pages/mmp/RolePage';
import { generateRoleData, roleCheckerComments } from '../../test-data/role.data';

/**
 * TC_ROLE_E2E_001 — Full Role Creation & Approval Flow (BACKOFFICE type)
 * AdminMaker creates BACKOFFICE role → AdminChecker approves it
 */

test('TC_ROLE_E2E_001 - Full role creation and approval flow - BACKOFFICE type', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const rolePage  = new RolePage(page);
  const testData  = generateRoleData();

  // ── PHASE 1: AdminMaker creates BACKOFFICE role ─────────────────────────────────────────

  // Step 1: Login as AdminMaker
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 2: Navigate to User & Role Management → Role List
  await page.getByRole('button', { name: 'User & Role Management' }).click();
  await page.getByRole('link', { name: 'Role List' }).click();
  await expect(page.getByRole('button', { name: 'Add Role' })).toBeVisible();

  // Step 3: Click Add Role
  await page.getByRole('button', { name: 'Add Role' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter role name' })).toBeVisible();

  // Step 4: Fill role name and description with unique data
  await page.getByRole('textbox', { name: 'Enter role name' }).fill(testData.name);
  
  // Step 4.5: Select Role Type (required for permissions to appear)
  await page.getByRole('button', { name: 'Role Type*' }).click();
  await page.getByText('BACKOFFICE').click();
  
  // Step 4.6: Fill description after role type selection
  await page.getByRole('textbox', { name: 'Enter role description' }).fill(testData.description);
  
  // Wait for permissions tree to load
  await page.waitForSelector('label:has-text("Dashboard")', { timeout: 10000 });

  // Step 5: Select BACKOFFICE permissions
  await page.locator('label').filter({ hasText: 'Dashboard' }).getByRole('checkbox').click();
  await page.locator('label').filter({ hasText: 'User & Role Management' }).getByRole('checkbox').click();
  await page.locator('label').filter({ hasText: 'Aggregator Management' }).getByRole('checkbox').click();
  await page.locator('li:nth-child(4) > span > label > .rct-checkbox').first().click();
  await page.locator('li:nth-child(5) > span > label > .rct-checkbox').first().click();
  await page.locator('li:nth-child(6) > span > label > .rct-checkbox').click();
  await page.locator('li:nth-child(7) > .rct-text > label > .rct-checkbox').click();
  await page.locator('li:nth-child(8) > .rct-text > label > .rct-checkbox').click();

  // Step 6: Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Step 7: Assert success toast
  await expect(page.getByText('Processed OK')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 8: Logout AdminMaker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);

  // ── PHASE 2: AdminChecker approves the role ───────────────────────────────────

  // Step 9: Login as AdminChecker
  await loginPage.loginAsAdminChecker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 10: Navigate to Inbox → Pending Processes
  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();

  // Step 11: Find ROLE CREATION row
  await expect(page.getByRole('cell', { name: 'ROLE CREATION' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('cell', { name: 'ROLE CREATION' }).first().click();

  // Step 12: Click Review
  await page.getByRole('button', { name: 'Review' }).first().click();
  await expect(page.getByRole('heading', { name: 'Review Role' })).toBeVisible();

  // Step 13: Approve with comment
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill(roleCheckerComments.approve);
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Step 14: Assert approval success
  await expect(page.getByText('Process approved successfully')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 15: Logout AdminChecker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
});

/**
 * TC_ROLE_E2E_002 — Full Role Creation & Approval Flow (AGGREGATOR type)
 * AdminMaker creates AGGREGATOR role → AdminChecker approves it
 */

test('TC_ROLE_E2E_002 - Full role creation and approval flow - AGGREGATOR type', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const rolePage  = new RolePage(page);
  const testData  = generateRoleData();

  // ── PHASE 1: AdminMaker creates AGGREGATOR role ─────────────────────────────────────────

  // Step 1: Login as AdminMaker
  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 2: Navigate to User & Role Management → Role List
  await page.getByRole('button', { name: 'User & Role Management' }).click();
  await page.getByRole('link', { name: 'Role List' }).click();
  await expect(page.getByRole('button', { name: 'Add Role' })).toBeVisible();

  // Step 3: Click Add Role
  await page.getByRole('button', { name: 'Add Role' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter role name' })).toBeVisible();

  // Step 4: Fill role name
  await page.getByRole('textbox', { name: 'Enter role name' }).fill(testData.name);
  
  // Step 4.5: Select Role Type - AGGREGATOR
  await page.getByRole('button', { name: 'Role Type*' }).click();
  await page.getByText('AGGREGATOR', { exact: true }).click();
  
  // Step 4.6: Fill description after role type selection
  await page.getByRole('textbox', { name: 'Enter role description' }).fill(testData.description);
  
  // Wait for permissions tree to load
  await page.waitForSelector('label:has-text("Merchant List")', { timeout: 10000 });

  // Step 5: Select AGGREGATOR permissions
  await page.locator('label').filter({ hasText: 'Merchant List' }).getByRole('checkbox').click();
  await page.locator('label').filter({ hasText: 'MDR Profile List' }).getByRole('checkbox').click();
  await page.locator('label').filter({ hasText: 'Tax Profile List' }).getByRole('checkbox').click();
  await page.locator('label').filter({ hasText: 'Limit Profile List' }).getByRole('checkbox').click();
  
  // Expand and select Inbox permissions
  await page.locator('label').filter({ hasText: /^Inbox$/ }).click(); // Expand Inbox
  await page.locator('label').filter({ hasText: 'Pending Processes' }).getByRole('checkbox').click();
  await page.locator('label').filter({ hasText: 'Maker Pending Process' }).getByRole('checkbox').click();
  
  // Select View and Update
  await page.locator('label').filter({ hasText: /^View$/ }).getByRole('checkbox').click();
  await page.locator('label').filter({ hasText: /^Update$/ }).getByRole('checkbox').click();
  
  // Expand and select Till Management
  await page.locator('label').filter({ hasText: 'Till Management' }).click(); // Expand
  await page.locator('label').filter({ hasText: 'Till List' }).getByRole('checkbox').click();
  
  // Expand and select Notifications Management
  await page.locator('label').filter({ hasText: 'Notifications Management' }).click(); // Expand
  await page.locator('label').filter({ hasText: 'Notifications List' }).getByRole('checkbox').click();
  
  // Expand Bulk Operations
  await page.locator('label').filter({ hasText: 'Bulk Operations' }).click();

  // Step 6: Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Step 7: Assert success toast
  await expect(page.getByText('Processed OK')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 8: Logout AdminMaker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);

  // ── PHASE 2: AdminChecker approves the role ───────────────────────────────────

  // Step 9: Login as AdminChecker
  await loginPage.loginAsAdminChecker();
  await expect(page).not.toHaveURL(/\/login/);

  // Step 10: Navigate to Inbox → Pending Processes
  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();

  // Step 11: Find ROLE CREATION row
  await expect(page.getByRole('cell', { name: 'ROLE CREATION' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('cell', { name: 'ROLE CREATION' }).first().click();

  // Step 12: Click Review
  await page.getByRole('button', { name: 'Review' }).first().click();
  await expect(page.getByRole('heading', { name: 'Review Role' })).toBeVisible();

  // Step 13: Approve with comment
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill(roleCheckerComments.approve);
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Step 14: Assert approval success
  await expect(page.getByText('Process approved successfully')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close toast' }).click();

  // Step 15: Logout AdminChecker
  await page.getByRole('button', { name: /a admin/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);
});
