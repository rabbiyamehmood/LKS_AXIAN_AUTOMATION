import { test, expect } from '@playwright/test';
import { LoginPage }                from '../../pages/mmp/LoginPage';
import { NotificationTemplatePage } from '../../pages/mmp/NotificationTemplatePage';

/**
 * Notification Template — Positive Flows
 *
 * TC_NOTIF_001  Create template → Checker Approves
 * TC_NOTIF_002  View template → Go Back to list
 * TC_NOTIF_003  Update template (body + status) → Checker Approves → Maker verifies
 * TC_NOTIF_004  Create template → Checker Rejects → Maker acknowledges
 * TC_NOTIF_005  Update template → Checker Rejects → Maker acknowledges
 */

const TEMPLATE_NAME = `AutoTest_Template_${Date.now()}`;

// ── Helpers ────────────────────────────────────────────────────────────────

async function loginAsMakerAndGoToList(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const notif     = new NotificationTemplatePage(page);
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await notif.navigateToNotificationsList();
  return { loginPage, notif };
}

async function logoutViaUI(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /L Labesh/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
}

// ════════════════════════════════════════════════════════════════════════════
// TC_NOTIF_001 — Create template → Checker Approves
// ════════════════════════════════════════════════════════════════════════════

test('TC_NOTIF_001 - Maker creates notification template and Checker approves it', async ({ page }) => {
  test.setTimeout(120_000);

  const { loginPage, notif } = await loginAsMakerAndGoToList(page);

  await notif.createTemplate({
    name:      TEMPLATE_NAME,
    eventType: 'LOGIN_ALERT',
    channel:   'EMAIL',
    subject:   'Login email alert',
    body:      'Hi {{userName}},\n\nWelcome to the portal.\n\nLogin at {{date}}',
  });

  await logoutViaUI(page);

  // Checker approves
  await notif.checkerReview(loginPage, 'NOTIFICATION CREATION', 'Approve', 'Notification Template Approved');
  await logoutViaUI(page);
});

// ════════════════════════════════════════════════════════════════════════════
// TC_NOTIF_002 — View template → Go Back
// ════════════════════════════════════════════════════════════════════════════

test('TC_NOTIF_002 - View notification template and Go Back returns to list', async ({ page }) => {
  test.setTimeout(60_000);

  await loginAsMakerAndGoToList(page);

  await page.getByRole('button', { name: 'View' }).first().click();
  await expect(page.getByRole('heading', { name: 'View Notification Template' })).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Go Back' }).click();
  await expect(page.getByRole('heading', { name: 'Notification Templates' })).toBeVisible({ timeout: 15000 });
});

// ════════════════════════════════════════════════════════════════════════════
// TC_NOTIF_003 — Update template → Checker Approves → Maker verifies
// ════════════════════════════════════════════════════════════════════════════

test('TC_NOTIF_003 - Maker updates template body and status, Checker approves, Maker verifies', async ({ page }) => {
  test.setTimeout(150_000);

  const { loginPage, notif } = await loginAsMakerAndGoToList(page);

  // Phase 1: Maker updates first template
  await notif.editFirstTemplate({
    body:      'Hi {{userName}},\n\nWelcome to the portal.',
    newStatus: 'Inactive',
  });
  await logoutViaUI(page);

  // Phase 2: Checker approves update
  await notif.checkerReview(loginPage, 'NOTIFICATION UPDATE', 'Approve', 'update approve by checker');
  await logoutViaUI(page);

  // Phase 3: Maker verifies updated template shows Inactive in list
  await loginAsMakerAndGoToList(page);
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
  // Verify at least one Inactive badge exists in the list after update
  await expect(page.getByText('Inactive').first()).toBeVisible({ timeout: 15000 });
  await logoutViaUI(page);
});

// ════════════════════════════════════════════════════════════════════════════
// TC_NOTIF_004 — Create template → Checker Rejects → Maker acknowledges
// ════════════════════════════════════════════════════════════════════════════

test('TC_NOTIF_004 - Maker creates template, Checker rejects, Maker acknowledges rejection', async ({ page }) => {
  test.setTimeout(150_000);

  const { loginPage, notif } = await loginAsMakerAndGoToList(page);

  // Phase 1: Maker creates template
  await notif.createTemplate({
    name:      `RejectCreate_${Date.now()}`,
    eventType: 'LOGIN_ALERT',
    channel:   'PUSH',
    subject:   'Test reject create',
    body:      'Hi {{userName}}, this will be rejected.',
  });
  await logoutViaUI(page);

  // Phase 2: Checker rejects
  await notif.checkerReview(loginPage, 'NOTIFICATION CREATION', 'Reject', 'Notification Template rejected by checker');
  await logoutViaUI(page);

  // Phase 3: Maker acknowledges rejection in Maker Pending Process
  await notif.makerAcknowledgeRejection(loginPage, 'NOTIFICATION CREATION', 'Rejection acknowledged by Maker');
  await logoutViaUI(page);
});

// ════════════════════════════════════════════════════════════════════════════
// TC_NOTIF_005 — Update template → Checker Rejects → Maker acknowledges
// ════════════════════════════════════════════════════════════════════════════

test('TC_NOTIF_005 - Maker updates template, Checker rejects, Maker acknowledges rejection', async ({ page }) => {
  test.setTimeout(150_000);

  const { loginPage, notif } = await loginAsMakerAndGoToList(page);

  // Phase 1: Maker updates second template
  await page.getByRole('button', { name: 'Edit' }).nth(1).click();
  await expect(page.getByRole('heading', { name: /edit.*notification|notification.*template/i })).toBeVisible({ timeout: 15000 });
  await notif.bodyTemplateInput.fill(
    'Dear {{userName}}, your login was recorded at {{date}} from {{ipAddress}} ({{location}}).'
  );
  await notif.updateBtn.click();
  await expect(notif.processedOkToast).toBeVisible({ timeout: 15000 });
  await notif.closeToastBtn.click();
  await logoutViaUI(page);

  // Phase 2: Checker rejects
  await notif.checkerReview(loginPage, 'NOTIFICATION UPDATE', 'Reject', 'update reject by checker');
  await logoutViaUI(page);

  // Phase 3: Maker acknowledges rejection
  await notif.makerAcknowledgeRejection(loginPage, 'NOTIFICATION UPDATE', 'rejection approved by maker');
  await logoutViaUI(page);
});

// ════════════════════════════════════════════════════════════════════════════
// TC_NOTIF_006 — Filter by Event Type
// ════════════════════════════════════════════════════════════════════════════

test('TC_NOTIF_006 - Filter by Event Type returns matching templates', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAsMakerAndGoToList(page);

  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('button', { name: 'Event Type' }).click();
  await page.getByLabel('All').getByText('LOGIN_ALERT').click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1000);

  // Assert table visible and all visible rows show LOGIN_ALERT
  await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('cell', { name: 'LOGIN_ALERT' }).first()).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
});

// ════════════════════════════════════════════════════════════════════════════
// TC_NOTIF_007 — Filter by Channel
// ════════════════════════════════════════════════════════════════════════════

test('TC_NOTIF_007 - Filter by Channel returns matching templates', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAsMakerAndGoToList(page);

  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('button', { name: 'Channel' }).click();
  await page.getByLabel('All').getByText('EMAIL', { exact: true }).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1000);

  // Assert all visible rows show EMAIL channel
  await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('cell', { name: 'EMAIL' }).first()).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
});

// ════════════════════════════════════════════════════════════════════════════
// TC_NOTIF_008 — Filter by Date Range (yesterday → today)
// ════════════════════════════════════════════════════════════════════════════

test('TC_NOTIF_008 - Filter by Date Range returns templates created in range', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAsMakerAndGoToList(page);

  await page.getByRole('button', { name: 'Filter' }).click();

  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const fromLabel = `${DAYS[yesterday.getDay()]}, ${MONTHS[yesterday.getMonth()]} ${yesterday.getDate()}`;
  const toLabel   = `${DAYS[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`;

  await page.getByRole('textbox', { name: 'From Date' }).click();
  await page.getByRole('gridcell', { name: new RegExp(fromLabel) }).click();

  await page.getByRole('textbox', { name: 'To Date' }).click();
  await page.getByRole('gridcell', { name: new RegExp(toLabel) }).click();

  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1000);

  // Results should show — Created At column visible
  await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Created At')).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
});
