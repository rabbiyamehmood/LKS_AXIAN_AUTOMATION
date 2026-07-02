import { Page, Locator, expect } from '@playwright/test';

export class RolePage {
  readonly page: Page;

  // Navigation
  readonly userRoleMgmtBtn: Locator;
  readonly roleListLink: Locator;
  readonly addRoleBtn: Locator;

  // Form fields
  readonly roleNameInput: Locator;
  readonly roleDescriptionInput: Locator;
  readonly saveBtn: Locator;

  // Permissions — parent "select all" checkbox (first checkbox on the tree)
  readonly selectAllPermissions: Locator;

  // Feedback
  readonly successToast: Locator;
  readonly closeToastBtn: Locator;

  // Logout
  readonly userMenuBtn: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.userRoleMgmtBtn = page.getByRole('button', { name: 'User & Role Management' });
    this.roleListLink    = page.getByRole('link', { name: 'Role List' });
    this.addRoleBtn      = page.getByRole('button', { name: 'Add Role' });

    this.roleNameInput        = page.getByRole('textbox', { name: 'Enter role name' });
    this.roleDescriptionInput = page.getByRole('textbox', { name: 'Enter role description' });
    this.saveBtn              = page.getByRole('button', { name: 'Save' });

    // First checkbox = select-all parent node in the permission tree
    this.selectAllPermissions = page.getByRole('checkbox').first();

    this.successToast  = page.getByText('Processed OK');
    this.closeToastBtn = page.getByRole('button', { name: 'Close toast' });

    this.userMenuBtn = page.getByRole('button', { name: /a admin/i });
    this.logoutBtn   = page.getByRole('banner').getByRole('button', { name: 'Logout' });
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  async navigateToRoleList() {
    await this.userRoleMgmtBtn.click();
    await this.roleListLink.click();
    await expect(this.addRoleBtn).toBeVisible();
  }

  async openAddRoleForm() {
    await this.addRoleBtn.click();
    await expect(this.roleNameInput).toBeVisible();
  }

  // ── Form ──────────────────────────────────────────────────────────────────────

  async fillRoleForm(data: { name: string; description: string }) {
    await this.roleNameInput.fill(data.name);
    await this.roleDescriptionInput.fill(data.description);
  }

  /**
   * Selects all permissions by clicking the parent "select all" checkbox,
   * then individually selects each child item (li items 2–15) to match
   * the recorded codegen flow.
   */
  async selectAllPermissionItems() {
    // Click the root select-all checkbox
    await this.selectAllPermissions.click();

    // Select each individual permission row (li 2–15)
    const treeRoot = this.page.locator('[id^="rct-"] > ol');
    for (let i = 2; i <= 15; i++) {
      const checkbox = treeRoot.locator(`li:nth-child(${i})`).locator('.rct-checkbox').first();
      await checkbox.click();
    }
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  async assertSuccessToastVisible() {
    await expect(this.successToast).toBeVisible({ timeout: 15000 });
  }

  async assertStillOnForm() {
    await expect(this.roleNameInput).toBeVisible();
  }

  async assertSaveBtnDisabled() {
    await expect(this.saveBtn).toBeDisabled();
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  async save() {
    await this.saveBtn.click();
  }

  async closeSuccessToast() {
    await this.closeToastBtn.click();
  }

  async logout() {
    await this.userMenuBtn.click();
    await this.logoutBtn.click();
    await expect(this.page).toHaveURL(/\/login/);
  }

  // ── Full create flow ──────────────────────────────────────────────────────────

  async createRole(data: { name: string; description: string }) {
    await this.navigateToRoleList();
    await this.openAddRoleForm();
    await this.fillRoleForm(data);
    await this.selectAllPermissionItems();
    await this.save();
    await this.assertSuccessToastVisible();
    await this.closeSuccessToast();
  }
}
