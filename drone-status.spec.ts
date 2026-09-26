import { test, expect } from '@playwright/test';
import { takeOff, land, setDroneConnected } from '../utils/fixtures';

/**
 * Level 1, category: data/state correctness.
 * The UI badge is only a rendering of underlying telemetry — these tests
 * check the badge against the state we know we just set, rather than just
 * checking "a badge exists".
 */
test.describe('Drone status badge matches real state', () => {
  test('shows "offline" when the drone has no connection', async ({ page, request }) => {
    await setDroneConnected(request, 'drone-1', false);
    await page.goto('/cockpit');
    const badge = page.locator('[data-testid="drone-1-status"]');
    await expect(badge).toHaveText(/offline/i, { timeout: 10_000 });
  });

  test('shows "online" once connectivity is restored', async ({ page, request }) => {
    await setDroneConnected(request, 'drone-1', true);
    await page.goto('/cockpit');
    const badge = page.locator('[data-testid="drone-1-status"]');
    await expect(badge).toHaveText(/online/i, { timeout: 10_000 });
  });

  test('take off transitions the pill taking_off -> in_flight', async ({ page, request }) => {
    await page.goto('/cockpit');
    const pill = page.locator('[data-testid="drone-1-flight-status"]');

    await takeOff(request, 'drone-1');
    await expect(pill).toHaveText(/taking_off/i);
    await expect(pill).toHaveText(/in_flight/i, { timeout: 15_000 });

    await land(request, 'drone-1');
    await expect(pill).toHaveText(/landed|on_ground/i, { timeout: 15_000 });
  });

  test('battery temperature shown matches the telemetry store, not a stale value', async ({ page, request }) => {
    await takeOff(request, 'drone-1');
    await page.goto('/cockpit');

    const shown = await page.locator('[data-testid="telemetry-battery-temp"]').innerText();
    const res = await request.get('http://localhost:4000/api/drones/drone-1/telemetry');
    const body = await res.json();

    // Compare the numeric part only; formatting adds a °C suffix.
    const shownValue = parseFloat(shown);
    expect(shownValue).toBeCloseTo(body.battery.temperature, 0);
  });
});
