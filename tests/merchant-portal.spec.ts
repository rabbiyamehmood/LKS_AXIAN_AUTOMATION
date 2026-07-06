import { test, expect } from '@playwright/test';

test.describe('Tigo Merchant Portal', () => {

  test('should open merchant portal login page', async ({ page }) => {
    await page.goto('/login');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');

    // Take a screenshot so we can see what the page looks like
    await page.screenshot({ path: 'test-results/merchant-portal-login.png', fullPage: true });

    // Verify the page loaded (not a network error)
    const title = await page.title();
    console.log('Page title:', title);

    expect(page.url()).toContain('mixxmmp-test.tigo.co.tz');
  });

});
