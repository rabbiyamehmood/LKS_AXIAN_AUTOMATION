import { Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../pages/mmp/LoginPage';

/**
 * Creates an authenticated browser context for a specific user role.
 * Saves the storage state so sessions can be reused across tests.
 */
export async function createAuthenticatedContext(
  context: BrowserContext,
  role: 'adminMaker' | 'adminChecker' | 'labeshMaker' | 'labeshChecker'
): Promise<Page> {
  const page = await context.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.navigate();

  switch (role) {
    case 'adminMaker':
      await loginPage.loginAsAdminMaker();
      break;
    case 'adminChecker':
      await loginPage.loginAsAdminChecker();
      break;
    case 'labeshMaker':
      await loginPage.loginAsLabeshMaker();
      break;
    case 'labeshChecker':
      await loginPage.loginAsLabeshChecker();
      break;
  }

  return page;
}
