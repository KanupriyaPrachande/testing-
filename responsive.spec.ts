import { test, expect } from '@playwright/test';
import { expectWithinViewport } from '../utils/fixtures';

/**
 * Level 1, category: layout/responsive integrity.
 * Catches "push the main action off screen at phone width" — an element
 * can be in the DOM and technically "visible" while still being clipped or
 * scrolled off, which is why we check bounding boxes, not just presence.
 */
const phoneViewports = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-13', width: 390, height: 844 },
  { name: 'small-android', width: 360, height: 640 },
];

for (const vp of phoneViewports) {
  test.describe(`Cockpit layout @ ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('take off / land control stays within the viewport', async ({ page }) => {
      await page.goto('/cockpit');
      await expectWithinViewport(page, 'drone-1-takeoff-land-button');
    });

    test('telemetry panel does not overflow the screen width', async ({ page }) => {
      await page.goto('/cockpit');
      const panel = page.locator('[data-testid="telemetry-panel"]');
      const box = await panel.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1); // +1px rounding tolerance
      }
    });

    test('no horizontal page scroll is introduced', async ({ page }) => {
      await page.goto('/cockpit');
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(hasHorizontalScroll).toBe(false);
    });
  });
}
