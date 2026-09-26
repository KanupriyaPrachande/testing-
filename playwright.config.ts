import { defineConfig, devices } from '@playwright/test';

/**
 * Level 1 test suite config.
 * BASE_URL defaults to the docker-compose cockpit (nginx on :4010).
 * If you're running `npm run dev` instead, set BASE_URL=http://localhost:5173.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4010',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-iphone', // catches "pushed off screen at phone width" mutations
      use: { ...devices['iPhone 13'] },
    },
  ],
});
