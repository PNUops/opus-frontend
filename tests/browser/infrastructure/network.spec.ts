// These tests intentionally trigger blocked traffic, so inspect guard diagnostics
// directly instead of the domain fixture that automatically fails on violations.
import { test, expect } from '@playwright/test';
import { guardNetwork, type NetworkViolation } from '../support/network';
import { expectMswReady } from '../support/ready';

test('MSW 응답은 허용하고 worker의 미처리 API·외부 요청은 차단한다', async ({ context, page, baseURL }) => {
  const violations: NetworkViolation[] = [];
  await guardNetwork(context, baseURL!, violations);
  await page.goto('/signin');
  await expectMswReady(page);
  const mocked = await page.evaluate(async () => (await fetch('/api/contests/current')).status);
  expect(mocked).toBe(200);
  expect(violations).toEqual([]);

  for (const url of [
    '/api/browser-qa-unhandled?secret=synthetic',
    'https://example.invalid/private?secret=synthetic',
  ]) {
    const failed = await page.evaluate(async (url) => {
      try {
        await fetch(url);
        return false;
      } catch {
        return true;
      }
    }, url);
    expect(failed).toBe(true);
  }
  expect(violations).toHaveLength(2);
  expect(violations.every((violation) => violation.serviceWorker)).toBe(true);
  expect(violations.map((violation) => violation.origin)).toEqual([baseURL, 'https://example.invalid']);
  expect(JSON.stringify(violations)).not.toContain('secret');
});

test('MSW 없는 문서의 외부 요청과 WebSocket도 차단한다', async ({ context, page, baseURL }) => {
  const violations: NetworkViolation[] = [];
  await guardNetwork(context, baseURL!, violations);
  await page.goto('/favicon.png');
  await page.evaluate(async () => {
    await fetch('https://example.invalid/private').catch(() => undefined);
    await new Promise<void>((resolve) => {
      const socket = new WebSocket('wss://example.invalid/socket');
      socket.onclose = () => resolve();
      socket.onerror = () => resolve();
    });
  });
  expect(violations.map((violation) => violation.resourceType)).toEqual(['fetch', 'websocket']);
  expect(violations.every((violation) => !violation.serviceWorker)).toBe(true);
});
