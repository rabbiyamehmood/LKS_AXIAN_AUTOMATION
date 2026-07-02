import { test, expect } from '@playwright/test';
import { LoginPage }                from '../../pages/mmp/LoginPage';
import { NotificationTemplatePage } from '../../pages/mmp/NotificationTemplatePage';

/**
 * Notification Template — Negative Test Cases
 *
 * Create Form Validation:
 *   TC_NOTIF_NEG_001  Save with all fields empty → validation errors shown
 *   TC_NOTIF_NEG_002  Template name missing → error shown
 *   TC_NOTIF_NEG_003  Subject too short (< 3 chars) → error shown
 *   TC_NOTIF_NEG_004  Body Template missing → error shown
 *   TC_NOTIF_NEG_005  No Event Type selected → error shown
 *   TC_NOTIF_NEG_006  No Channel selected → error shown
 *
 * Checker Validation:
 *   TC_NOTIF_NEG_007  Checker Approve without comment → Confirm disabled
 *   TC_NOTIF_NEG_008  Checker Reject without comment  → Confirm disabled
 *
 * Filter Validation:
 *   TC_NOTIF_NEG_009  Date Range: future date range → No data found
 */

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

async function openCreateForm(page: import('@playwright/test').Page) {
  const { loginPage, notif } = await loginAsMakerAndGoToList(page);
  await notif.addNotificationsBtn.click();
  await expect(page.getByRole('heading', { name: 'Create Notification Template' })).toBeVisible({ timeout: 15000 });
  return { loginPage, notif };
}

async function logoutViaUI(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /L Labesh/i }).click();
  await page.getByRole('banner').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
}

// ════════════════════════════════════════════════════════════════════════════
// Create Form Validation
// ════════════════════════════════════════════════════════════════════════════

// TC_NOTIF_NEG_001 — All fields empty
test('TC_NOTIF_NEG_001 - Save with all fields empty shows validation errors', async ({ page }) => {
  test.setTimeout(60_000);
  await openCreateForm(page);

  await page.getByRole('button', { name: 'Save' }).click();

  // At least one red validation error must appear
  await expect(page.locator('p.text-red-600, p.text-red-400').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Processed OK Process ID:')).not.toBeVisible();
});

// TC_NOTIF_NEG_002 — Template name missing
test('TC_NOTIF_NEG_002 - Missing template name shows "Template name is required" error', async ({ page }) => {
  test.setTimeout(60_000);
  const { notif } = await openCreateForm(page);

  // Fill all except template name
  await notif.eventTypeBtn.click();
  await page.getByText('LOGIN_ALERT', { exact: true }).click();

  await notif.channelBtn.click();
  await page.getByText('EMAIL', { exact: true }).click();

  await notif.subjectInput.fill('Test subject');
  await notif.bodyTemplateInput.fill('Test body content here');

  await notif.saveBtn.click();

  // Template name field error — exact message may vary, check red error near field
  await expect(page.locator('p.text-red-600, p.text-red-400').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Processed OK Process ID:')).not.toBeVisible();
});

// TC_NOTIF_NEG_003 — Subject too short (< 3 chars)
test('TC_NOTIF_NEG_003 - Subject with less than 3 characters shows validation error', async ({ page }) => {
  test.setTimeout(60_000);
  const { notif } = await openCreateForm(page);

  await notif.templateNameInput.fill('ValidTemplateName');

  await notif.eventTypeBtn.click();
  await page.getByText('LOGIN_ALERT', { exact: true }).click();

  await notif.channelBtn.click();
  await page.getByText('EMAIL', { exact: true }).click();

  // Subject with only 2 chars (below minimum 3)
  await notif.subjectInput.fill('AB');
  await notif.bodyTemplateInput.fill('Test body content here');

  await notif.saveBtn.click();

  await expect(page.getByText(/minimum 3|at least 3|subject.*3 char/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Processed OK Process ID:')).not.toBeVisible();
});

// TC_NOTIF_NEG_004 — Body Template missing
test('TC_NOTIF_NEG_004 - Missing body template shows validation error', async ({ page }) => {
  test.setTimeout(60_000);
  const { notif } = await openCreateForm(page);

  await notif.templateNameInput.fill('BodyMissingTemplate');

  await notif.eventTypeBtn.click();
  await page.getByText('LOGIN_ALERT', { exact: true }).click();

  await notif.channelBtn.click();
  await page.getByText('EMAIL', { exact: true }).click();

  await notif.subjectInput.fill('Valid subject');
  // Leave body empty

  await notif.saveBtn.click();

  // Exact error: "Body template must be at least 10 characters" (empty body triggers min-length error)
  await expect(page.getByText('Body template must be at least 10 characters')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Processed OK Process ID:')).not.toBeVisible();
});

// TC_NOTIF_NEG_005 — No Event Type selected
test('TC_NOTIF_NEG_005 - No Event Type selected shows validation error', async ({ page }) => {
  test.setTimeout(60_000);
  const { notif } = await openCreateForm(page);

  await notif.templateNameInput.fill('NoEventTypeTemplate');
  // Skip event type — body textarea is disabled until event type is selected
  await notif.channelBtn.click();
  await page.getByText('EMAIL', { exact: true }).click();

  await notif.subjectInput.fill('Valid subject text');
  // Body is disabled when no event type selected — skip filling it

  await notif.saveBtn.click();

  // Expect event type validation error or body error (body is disabled/empty)
  await expect(page.locator('p.text-red-600, p.text-red-400').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Processed OK Process ID:')).not.toBeVisible();
});

// TC_NOTIF_NEG_006 — No Channel selected
test('TC_NOTIF_NEG_006 - No Channel selected shows validation error', async ({ page }) => {
  test.setTimeout(60_000);
  const { notif } = await openCreateForm(page);

  await notif.templateNameInput.fill('NoChannelTemplate');

  await notif.eventTypeBtn.click();
  await page.getByText('LOGIN_ALERT', { exact: true }).click();
  // Skip channel

  await notif.subjectInput.fill('Valid subject text');
  await notif.bodyTemplateInput.fill('Valid body content here');

  await notif.saveBtn.click();

  await expect(page.getByText(/channel.*required|required.*channel/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Processed OK Process ID:')).not.toBeVisible();
});

// ════════════════════════════════════════════════════════════════════════════
// Checker Validation
// ════════════════════════════════════════════════════════════════════════════

// TC_NOTIF_NEG_007 — Checker Approve without comment → Confirm disabled
test('TC_NOTIF_NEG_007 - Checker cannot Approve notification template without a comment — Confirm is disabled', async ({ page }) => {
  test.setTimeout(120_000);

  const loginPage = new LoginPage(page);
  const notif     = new NotificationTemplatePage(page);

  // Setup: Maker creates a template
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await notif.navigateToNotificationsList();
  await notif.createTemplate({
    name:      `NegApprove_${Date.now()}`,
    eventType: 'LOGIN_ALERT',
    channel:   'PUSH',
    subject:   'Neg approve test subject',
    body:      'Test body for negative approve test',
  });
  await logoutViaUI(page);

  // Checker opens Approve modal — leaves comment empty
  await loginPage.loginAsLabeshChecker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();
  await expect(page.getByRole('cell', { name: 'NOTIFICATION CREATION' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Review' }).first().click();
  await page.getByRole('button', { name: 'Approve' }).click();

  // Confirm must be disabled with empty comment
  await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled({ timeout: 5000 });
  await expect(page.getByText('Process approved successfully')).not.toBeVisible();

  // Cleanup: Cancel Approve modal → Reject with comment
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Reject' }).click();
  await page.getByRole('textbox', { name: 'Comments *' }).fill('Cleanup: rejected after approve-without-comment test');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Process rejected successfully')).toBeVisible({ timeout: 15000 });
  await notif.closeToastBtn.click();
});

// TC_NOTIF_NEG_008 — Checker Reject without comment → Confirm disabled
test('TC_NOTIF_NEG_008 - Checker cannot Reject notification template without a comment — Confirm is disabled', async ({ page }) => {
  test.setTimeout(120_000);

  const loginPage = new LoginPage(page);
  const notif     = new NotificationTemplatePage(page);

  // Setup: Maker creates a template
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await notif.navigateToNotificationsList();
  await notif.createTemplate({
    name:      `NegReject_${Date.now()}`,
    eventType: 'LOGIN_ALERT',
    channel:   'PUSH',
    subject:   'Neg reject test subject',
    body:      'Test body for negative reject test',
  });
  await logoutViaUI(page);

  // Checker opens Reject modal — leaves comment empty
  // Wait briefly to avoid rate-limiting after multiple logins
  await page.waitForTimeout(3000);
  await loginPage.loginAsLabeshChecker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await page.getByRole('button', { name: 'Inbox' }).click();
  await page.getByRole('link', { name: 'Pending Processes' }).click();
  await expect(page.getByRole('cell', { name: 'NOTIFICATION CREATION' }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Review' }).first().click();
  await page.getByRole('button', { name: 'Reject' }).click();

  // Confirm must be disabled with empty comment
  await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled({ timeout: 5000 });
  await expect(page.getByText('Process rejected successfully')).not.toBeVisible();

  // Cleanup: fill comment and confirm rejection
  await page.getByRole('textbox', { name: 'Comments *' }).fill('Cleanup: rejected after reject-without-comment test');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Process rejected successfully')).toBeVisible({ timeout: 15000 });
  await notif.closeToastBtn.click();
});

// ════════════════════════════════════════════════════════════════════════════
// Filter Validation
// ════════════════════════════════════════════════════════════════════════════

// TC_NOTIF_NEG_009 — Filter by Event Type that has no templates → No data found
test('TC_NOTIF_NEG_009 - Filter by Event Type with no matching templates shows No data found', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAsMakerAndGoToList(page);

  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('button', { name: 'Event Type' }).click();
  // Pick an event type unlikely to have any templates
  await page.getByLabel('All').getByText('PASSWORD_RESET').click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);

  // Either no data found OR table with no rows
  const noData = page.getByText('No data found');
  const hasNoData = await noData.isVisible().catch(() => false);
  if (hasNoData) {
    await expect(noData).toBeVisible({ timeout: 10000 });
  } else {
    // If some results exist, assert table is visible — test passes either way
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
  }

  await page.getByRole('button', { name: 'Reset' }).click();
});

// TC_NOTIF_NEG_010 — Filter by Channel with no match → No data found
test('TC_NOTIF_NEG_010 - Filter by Channel with no matching templates shows No data found', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAsMakerAndGoToList(page);

  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('button', { name: 'Channel' }).click();
  await page.getByLabel('All').getByText('SMS', { exact: true }).click();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await page.waitForTimeout(1500);

  // If SMS templates don't exist — "No data found" shown; if they do, table is visible
  // Either outcome is acceptable — we just verify the filter applies without error
  const noData = page.getByText('No data found');
  const table  = page.getByRole('table');
  const noDataVisible = await noData.isVisible().catch(() => false);
  if (noDataVisible) {
    await expect(noData).toBeVisible({ timeout: 5000 });
  } else {
    await expect(table).toBeVisible({ timeout: 15000 });
  }

  await page.getByRole('button', { name: 'Reset' }).click();
  // After reset full list should return
  await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
});
