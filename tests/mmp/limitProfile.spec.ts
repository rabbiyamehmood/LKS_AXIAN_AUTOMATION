import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';
import { LimitProfilePage } from '../../pages/mmp/LimitProfilePage';
import { generateLimitProfileFlowData } from '../../test-data/limitProfile.data';

async function loginAsMaker(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAsLabeshMaker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
}

async function loginAsChecker(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAsLabeshChecker();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
}

test.describe('Merchant Onboarding - Limit Profile', () => {
  test('TC_LIMIT_001 - Create limit profile and checker approves creation', async ({ page }) => {
    const data = generateLimitProfileFlowData('TC_LIMIT_001');
    const limitProfilePage = new LimitProfilePage(page);

    await loginAsMaker(page);
    await limitProfilePage.navigateToLimitProfileList();
    await limitProfilePage.openCreateForm();
    await limitProfilePage.fillProfileHeader(data.createName, data.description);
    await limitProfilePage.addRule(data.createRule);
    await limitProfilePage.saveNewProfile();
    await limitProfilePage.logout();

    await loginAsChecker(page);
    await limitProfilePage.navigateToCheckerPendingProcesses();
    await limitProfilePage.openFirstReviewByRequestType('LIMIT DEFINITION CREATION');
    await limitProfilePage.approveCurrentProcess(data.checkerApproveComment);
  });

  test('TC_LIMIT_002 - View limit profile details after approval', async ({ page }) => {
    const data = generateLimitProfileFlowData('TC_LIMIT_002');
    const limitProfilePage = new LimitProfilePage(page);

    await loginAsMaker(page);
    await limitProfilePage.navigateToLimitProfileList();
    await limitProfilePage.openCreateForm();
    await limitProfilePage.fillProfileHeader(data.createName, data.description);
    await limitProfilePage.addRule(data.createRule);
    await limitProfilePage.saveNewProfile();
    await limitProfilePage.logout();

    await loginAsChecker(page);
    await limitProfilePage.navigateToCheckerPendingProcesses();
    await limitProfilePage.openFirstReviewByRequestType('LIMIT DEFINITION CREATION');
    await limitProfilePage.approveCurrentProcess(data.checkerApproveComment);
    await limitProfilePage.logout();

    await loginAsMaker(page);
    await limitProfilePage.navigateToLimitProfileList();
    await limitProfilePage.openFirstForView();
    await limitProfilePage.goBackFromView();
  });

  test('TC_LIMIT_003 - Update limit profile and checker approves update', async ({ page }) => {
    const data = generateLimitProfileFlowData('TC_LIMIT_003');
    const limitProfilePage = new LimitProfilePage(page);

    await loginAsMaker(page);
    await limitProfilePage.navigateToLimitProfileList();
    await limitProfilePage.openCreateForm();
    await limitProfilePage.fillProfileHeader(data.createName, data.description);
    await limitProfilePage.addRule(data.createRule);
    await limitProfilePage.saveNewProfile();
    await limitProfilePage.logout();

    await loginAsChecker(page);
    await limitProfilePage.navigateToCheckerPendingProcesses();
    await limitProfilePage.openFirstReviewByRequestType('LIMIT DEFINITION CREATION');
    await limitProfilePage.approveCurrentProcess(data.checkerApproveComment);
    await limitProfilePage.logout();

    await loginAsMaker(page);
    await limitProfilePage.navigateToLimitProfileList();
    await limitProfilePage.openFirstForEdit();
    await limitProfilePage.updateProfileHeader(data.updateName);
    await limitProfilePage.updateFirstRule(data.updateRule.minimumAmount, data.updateRule.maximumAmount);
    await limitProfilePage.submitUpdate();
    await limitProfilePage.logout();

    await loginAsChecker(page);
    await limitProfilePage.navigateToCheckerPendingProcesses();
    await limitProfilePage.openFirstReviewByRequestType('LIMIT DEFINITION UPDATE');
    await limitProfilePage.approveCurrentProcess(data.checkerApproveComment);
  });

  test('TC_LIMIT_004 - Checker rejects update then maker rejects pending maker process', async ({ page }) => {
    const data = generateLimitProfileFlowData('TC_LIMIT_004');
    const limitProfilePage = new LimitProfilePage(page);

    await loginAsMaker(page);
    await limitProfilePage.navigateToLimitProfileList();
    await limitProfilePage.openCreateForm();
    await limitProfilePage.fillProfileHeader(data.createName, data.description);
    await limitProfilePage.addRule(data.createRule);
    await limitProfilePage.saveNewProfile();
    await limitProfilePage.logout();

    await loginAsChecker(page);
    await limitProfilePage.navigateToCheckerPendingProcesses();
    await limitProfilePage.openFirstReviewByRequestType('LIMIT DEFINITION CREATION');
    await limitProfilePage.approveCurrentProcess(data.checkerApproveComment);
    await limitProfilePage.logout();

    await loginAsMaker(page);
    await limitProfilePage.navigateToLimitProfileList();
    await limitProfilePage.openFirstForEdit();
    await limitProfilePage.updateProfileHeader(data.updateName);
    await limitProfilePage.updateFirstRule(data.updateRule.minimumAmount, data.updateRule.maximumAmount);
    await limitProfilePage.submitUpdate();
    await limitProfilePage.logout();

    await loginAsChecker(page);
    await limitProfilePage.navigateToCheckerPendingProcesses();
    await limitProfilePage.openFirstReviewByRequestType('LIMIT DEFINITION UPDATE');
    await limitProfilePage.rejectCurrentProcess(data.checkerRejectComment);
    await limitProfilePage.logout();

    await loginAsMaker(page);
    await limitProfilePage.navigateToMakerPendingProcesses();
    await limitProfilePage.openFirstReviewByRequestType('LIMIT DEFINITION UPDATE');
    await limitProfilePage.rejectCurrentProcess(data.makerRejectComment);
  });
});
