import { test, expect } from '@playwright/test';

/**
 * Level 1, category: element presence/absence.
 * Adjust the data-testid values below to match the real DOM — these are
 * placeholders following the `testid` convention already used in
 * TelemetryPanel.tsx (e.g. "telemetry-battery-temp").
 */
test.describe('Login screen — required elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows an email field', async ({ page }) => {
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible();
  });

  test('shows an OTP field', async ({ page }) => {
    await expect(page.locator('[data-testid="login-otp"]')).toBeVisible();
  });

  test('shows a sign-in button that is enabled', async ({ page }) => {
    const button = page.locator('[data-testid="login-submit"]');
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('sign-in button is inside the visible viewport at phone width', async ({ page }) => {
    // Runs against the mobile-iphone project via playwright.config.ts
    const button = page.locator('[data-testid="login-submit"]');
    const box = await button.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    if (box && viewport) {
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
  });

  test('submitting valid email + OTP navigates away from /login', async ({ page }) => {
    await page.locator('[data-testid="login-email"]').fill('pilot@example.com');
    await page.locator('[data-testid="login-otp"]').fill('000000'); // seeded test OTP
    await page.locator('[data-testid="login-submit"]').click();
    await expect(page).not.toHaveURL(/\/login$/);
  });
});
