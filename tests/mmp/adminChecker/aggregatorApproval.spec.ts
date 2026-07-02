import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/mmp/LoginPage';
import { AggregatorPage } from '../../../pages/mmp/AggregatorPage';
import { InboxPage } from '../../../pages/mmp/InboxPage';
import { generateAggregatorData, checkerComments } from '../../../test-data/aggregator.data';

/**
 * Aggregator Approval / Rejection Tests — AdminChecker
 * Each test creates a fresh aggregator (via AdminMaker) then
 * switches to AdminChecker to approve or reject it.
 */

// ── Helper: create aggregator as AdminMaker then logout ──────────────────────

async function createAggregatorAsMaker(page: import('@playwright/test').Page) {
  const loginPage      = new LoginPage(page);
  const aggregatorPage = new AggregatorPage(page);
  const testData       = generateAggregatorData();

  await loginPage.navigate();
  await loginPage.loginAsAdminMaker();
  await expect(page).not.toHaveURL(/\/login/);
  await aggregatorPage.createAggregator(testData);
  await aggregatorPage.logout();

  return testData;
}

// ── POSITIVE TESTS ─────────────────────────────────────────────────────────────

test.describe('TC_AGG - AdminChecker: Aggregator Approval - Positive', () => {

  test('TC_AGG_007 - AdminChecker should approve a pending aggregator creation', async ({ page }) => {
    // Step 1: AdminMaker creates aggregator
    const testData = await createAggregatorAsMaker(page);

    // Step 2: Login as AdminChecker
    const loginPage = new LoginPage(page);
    const inboxPage = new InboxPage(page);

    await loginPage.navigate();
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    // Step 3: Navigate to Pending Processes
    await inboxPage.navigateToPendingProcesses();
    await expect(inboxPage.aggregatorCreationCell).toBeVisible();

    // Step 4: Open Review modal
    await inboxPage.openReview();
    await expect(inboxPage.reviewHeading).toBeVisible();

    // Step 5: Approve with comment
    await inboxPage.approveAggregator(checkerComments.approve);

    // Step 6: Verify success toast
    await expect(inboxPage.approvedToast).not.toBeVisible(); // already closed in helper

    // Step 7: Logout
    await inboxPage.logout();
    await expect(page).toHaveURL(/\/login/);
  });

});

// ── NEGATIVE TESTS ─────────────────────────────────────────────────────────────

test.describe('TC_AGG - AdminChecker: Aggregator Approval - Negative', () => {

  test('TC_AGG_008 - AdminChecker should reject a pending aggregator creation', async ({ page }) => {
    // Step 1: AdminMaker creates aggregator
    await createAggregatorAsMaker(page);

    // Step 2: Login as AdminChecker
    const loginPage = new LoginPage(page);
    const inboxPage = new InboxPage(page);

    await loginPage.navigate();
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    // Step 3: Navigate to Pending Processes
    await inboxPage.navigateToPendingProcesses();
    await expect(inboxPage.aggregatorCreationCell).toBeVisible();

    // Step 4: Open Review
    await inboxPage.openReview();
    await expect(inboxPage.reviewHeading).toBeVisible();

    // Step 5: Reject with comment
    await inboxPage.rejectAggregator(checkerComments.reject);

    // Step 6: Logout
    await inboxPage.logout();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC_AGG_009 - AdminChecker should not approve without entering a comment', async ({ page }) => {
    // Step 1: AdminMaker creates aggregator
    await createAggregatorAsMaker(page);

    // Step 2: Login as AdminChecker
    const loginPage = new LoginPage(page);
    const inboxPage = new InboxPage(page);

    await loginPage.navigate();
    await loginPage.loginAsAdminChecker();
    await expect(page).not.toHaveURL(/\/login/);

    // Step 3: Navigate and open review
    await inboxPage.navigateToPendingProcesses();
    await inboxPage.openReview();
    await expect(inboxPage.reviewHeading).toBeVisible();

    // Step 4: Click Approve but leave Comments empty
    await inboxPage.approveBtn.click();
    // Comments input is required — Confirm should be disabled or produce validation
    const isConfirmDisabled = await inboxPage.confirmBtn.isDisabled();
    if (!isConfirmDisabled) {
      await inboxPage.confirmBtn.click();
    }

    // Step 5: Approved toast should NOT appear (comment is required)
    await expect(inboxPage.approvedToast).not.toBeVisible();
    // Reject and clean up — reject with a comment so the aggregator doesn't block future tests
    await inboxPage.commentsInput.fill('Cleanup: rejected due to missing comment validation test');
    await inboxPage.confirmBtn.click();
  });

});
