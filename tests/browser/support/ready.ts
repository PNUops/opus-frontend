import { expect, type Page } from '@playwright/test';

export async function expectMswReady(page: Page) {
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL.endsWith('/mockServiceWorker.js')))
    .toBe(true);
}
