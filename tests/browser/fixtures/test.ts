import { test as base, expect } from '@playwright/test';
import { guardNetwork, type NetworkViolation } from '../support/network';
import { expectMswReady } from '../support/ready';

type BrowserDiagnostics = { blockedRequests: NetworkViolation[]; pageErrors: string[] };

export const test = base.extend<{ mockModules: string[]; browserGuard: BrowserDiagnostics }>({
  mockModules: [[], { option: true }],
  browserGuard: [
    async ({ context, baseURL, mockModules }, use) => {
      const blockedRequests: NetworkViolation[] = [];
      const pageErrors: string[] = [];
      await guardNetwork(context, baseURL!, blockedRequests);
      await context.addInitScript((modules) => {
        window.__BROWSER_QA_MOCKS__ = modules;
      }, mockModules);
      context.on('page', (page) => {
        // Keep application messages out of diagnostics: they may embed request data.
        page.on('pageerror', (error) => pageErrors.push(error.name));
      });
      await use({ blockedRequests, pageErrors });
    },
    { auto: true },
  ],
});

// Check while the page and Playwright's artifact recorder are still alive.
test.afterEach(async ({ page, browserGuard }, testInfo) => {
  try {
    if (!page.isClosed() && page.url() !== 'about:blank') await expectMswReady(page);
    expect(browserGuard.blockedRequests, 'Unexpected network access (including MSW passthrough)').toEqual([]);
    expect(browserGuard.pageErrors, 'Unhandled browser JavaScript errors').toEqual([]);
  } finally {
    if (
      browserGuard.blockedRequests.length ||
      browserGuard.pageErrors.length ||
      testInfo.status !== testInfo.expectedStatus
    ) {
      await testInfo.attach('browser-diagnostics', {
        body: JSON.stringify(browserGuard, null, 2),
        contentType: 'application/json',
      });
    }
  }
});

export { expect };
