import { APIRequestContext, Page, expect } from '@playwright/test';

/**
 * Talks to the backend control API (see docs/reference.md) instead of the
 * dashboard UI, so cockpit tests aren't coupled to two UIs at once.
 * Adjust the path/payload to match your actual control API shape.
 */
export async function takeOff(request: APIRequestContext, droneId = 'drone-1') {
  const res = await request.post(`http://localhost:4000/api/drones/${droneId}/takeoff`);
  expect(res.ok(), `takeoff request failed: ${res.status()}`).toBeTruthy();
}

export async function land(request: APIRequestContext, droneId = 'drone-1') {
  const res = await request.post(`http://localhost:4000/api/drones/${droneId}/land`);
  expect(res.ok(), `land request failed: ${res.status()}`).toBeTruthy();
}

export async function setDroneConnected(request: APIRequestContext, droneId: string, connected: boolean) {
  // Placeholder: wire this up to whatever fault/mutation endpoint the backend
  // exposes for forcing a drone offline (see docs/reference.md#faults).
  const res = await request.post(`http://localhost:4000/api/drones/${droneId}/fault`, {
    data: { type: 'connectivity', connected },
  });
  expect(res.ok()).toBeTruthy();
}

/**
 * Fails the test if `locator` exists in the DOM but is rendered outside the
 * visible viewport (off-screen / clipped) — catches the "pushed off screen
 * at phone width" style mutation, which a plain `toBeVisible()` can miss if
 * the element is technically painted but scrolled out of view.
 */
export async function expectWithinViewport(page: Page, testId: string) {
  const locator = page.locator(`[data-testid="${testId}"]`);
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error(`Could not measure [data-testid="${testId}"]`);

  expect(box.x, 'element x-origin is off the left edge').toBeGreaterThanOrEqual(0);
  expect(box.y, 'element y-origin is off the top edge').toBeGreaterThanOrEqual(0);
  expect(box.x + box.width, 'element right edge exceeds viewport width').toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height, 'element bottom edge exceeds viewport height').toBeLessThanOrEqual(viewport.height);
}

/** Clears any stored auth token/cookie so the next navigation is "signed out". */
export async function signOut(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
}
