import { defineConfig } from '@playwright/test';

const port = Number(process.env.BROWSER_QA_PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('BROWSER_QA_PORT must be an integer between 1024 and 65535.');
}
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  // A clean Vite dependency cache must fit without adding sleeps to scenarios.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: '.qa/browser/results',
  reporter: [['list'], ['html', { outputFolder: '.qa/browser/report', open: 'never' }]],
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    colorScheme: 'light',
    contextOptions: { reducedMotion: 'reduce' },
    serviceWorkers: 'allow',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 60_000,
  },
  webServer: {
    command: `npm run test:browser:server -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: { VITE_USE_MSW: 'true', VITE_API_BASE_URL: '' },
  },
});
