import { test, expect } from '@playwright/test';

/**
 * Level 1, category: data/state correctness.
 *
 * Fixes applied after first real run:
 * 1. Take off -> Land is now ONE serial test, not two independent tests,
 *    so we never click "Land" before the drone has actually taken off.
 * 2. Buttons are targeted directly by their real data-testid
 *    (dash-takeoff-drone-2 / dash-land-drone-2) and clicked with
 *    { force: true }, because the dashboard table re-renders on every
 *    telemetry tick and a strict actionability wait never settles.
 * 3. The battery-temperature test is removed for now — that field only
 *    exists if you've done the "Step 2" tutorial edit from the main
 *    README; it isn't present in the app out of the box.
 */

test.describe.configure({ mode: 'serial' });

const CONTROL_PANEL_URL = 'http://localhost:4000/dashboard';
const COCKPIT_URL = 'http://localhost:4010';

function droneRow(page: import('@playwright/test').Page, droneId: string) {
  return page.getByTestId(`device-row-drone-${droneId}`);
}

function flightPill(page: import('@playwright/test').Page, droneId: string) {
  return droneRow(page, droneId).locator('.device-pills .pill').last();
}

test.describe('Drone status pill matches real state', () => {
  test('Drone 2 row and status pill are present on load', async ({ page }) => {
    await page.goto(COCKPIT_URL);
    await expect(droneRow(page, '2')).toBeVisible();
    await expect(flightPill(page, '2')).toBeVisible();
  });

  test('take off then land: pill goes to in_flight, then away from it', async ({ page }) => {
    await page.goto(CONTROL_PANEL_URL);

    const takeoffBtn = page.getByTestId('dash-takeoff-drone-2');
    await expect(takeoffBtn).toBeVisible();
    await takeoffBtn.click({ force: true });

    await page.goto(COCKPIT_URL);
    const pill = flightPill(page, '2');
    await expect(pill).toHaveText(/in_flight/i, { timeout: 30_000 });

    await page.goto(CONTROL_PANEL_URL);
    const landBtn = page.getByTestId('dash-land-drone-2');
    await expect(landBtn).toBeEnabled({ timeout: 15_000 });
    await landBtn.click({ force: true });

    await page.goto(COCKPIT_URL);
    await expect(pill).not.toHaveText(/in_flight/i, { timeout: 30_000 });
  });
});