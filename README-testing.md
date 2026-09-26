# Level 1 test scaffold

Playwright suite for static-UI / basic-security checks against the cockpit app.

## Setup

1. Drop this `tests/`, `playwright.config.ts`, and this README into the root
   of the `flytbase-ahc-swe-qa-hackathon` project (alongside `docker-compose.yml`).
2. Install Playwright:
   ```bash
   npm init -y   # only if this folder has no package.json yet
   npm install -D @playwright/test
   npx playwright install --with-deps
   ```
3. Start the app (either `docker compose watch` or `npm run dev`, per the
   project's main README).
4. Run the suite:
   ```bash
   npx playwright test
   # or against the Vite dev server instead of the nginx build:
   BASE_URL=http://localhost:5173 npx playwright test
   ```
5. View the HTML report after a run:
   ```bash
   npx playwright show-report
   ```

## What you'll need to wire up

These tests are written against **assumed** `data-testid` attributes and
**assumed** control-API routes, since I don't have your actual DOM or backend
in front of me. Before they'll pass, go through and fix:

- `tests/utils/fixtures.ts` — the `takeOff`, `land`, and `setDroneConnected`
  endpoint paths/payloads. Check `docs/reference.md` in the main repo for the
  real control API and fault-injection shape.
- Every `[data-testid="..."]` selector — either add matching `data-testid`
  props to the real components (`CockpitPage.tsx`, `TelemetryPanel.tsx`,
  your login page, etc.), reusing the `testid` prop pattern already used for
  telemetry rows, or swap the selectors for whatever your components
  actually expose (role, text, etc.).
- `route-guard.spec.ts` — the real protected route paths and the real
  cookie/localStorage key your auth uses.

## Extending beyond these four examples

Categories worth adding tests for as you go:
- **Race conditions**: click Land immediately after Take off; assert the UI
  settles on one consistent final state, not a flicker between two.
- **Reconnect handling**: kill the socket connection mid-flight and assert
  the UI shows a "disconnected" state rather than freezing on stale data.
- **Form validation**: submit the login form with a malformed email / wrong
  OTP length and assert an inline error appears (not just "nothing happens").
- **Multi-drone selection**: with more than one drone, assert telemetry
  panel data always matches the currently *selected* drone, not drone-1 by
  default.
