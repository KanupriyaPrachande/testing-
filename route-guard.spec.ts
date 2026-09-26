import { test, expect } from '@playwright/test';
import { signOut } from '../utils/fixtures';

/**
 * Level 1, category: access control.
 * Catches "let a signed-out user open a page that should need sign-in".
 */
test.describe('Route guard — signed out', () => {
  const protectedRoutes = ['/cockpit', '/dashboard', '/settings'];

  for (const route of protectedRoutes) {
    test(`redirects to /login when visiting ${route} signed out`, async ({ page }) => {
      await page.goto('/');
      await signOut(page);
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
      // Belt-and-suspenders: the protected content itself must not render,
      // even briefly, in case the redirect is client-side and delayed.
      await expect(page.locator('[data-testid="cockpit-root"]')).toHaveCount(0);
    });
  }

  test('a stale/invalid token is treated the same as signed out', async ({ page }) => {
    await page.context().addCookies([
      { name: 'auth_token', value: 'not-a-real-token', url: 'http://localhost:4010' },
    ]);
    await page.goto('/cockpit');
    await expect(page).toHaveURL(/\/login/);
  });
});
