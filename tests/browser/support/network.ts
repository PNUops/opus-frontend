import type { BrowserContext } from '@playwright/test';

export type NetworkViolation = { origin: string; resourceType: string; serviceWorker: boolean };

export async function guardNetwork(context: BrowserContext, baseURL: string, violations: NetworkViolation[]) {
  const target = new URL(baseURL);
  if (
    target.protocol !== 'http:' ||
    target.hostname !== '127.0.0.1' ||
    target.username ||
    target.password ||
    target.pathname !== '/' ||
    target.search ||
    target.hash
  ) {
    throw new Error('Browser QA requires a credential-free local origin.');
  }

  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const localAsset = url.origin === target.origin && !/^\/api(?:\/|$)/.test(url.pathname);
    const font =
      url.protocol === 'https:' &&
      ((url.hostname === 'fonts.googleapis.com' && url.pathname === '/css2') ||
        (url.hostname === 'fonts.gstatic.com' && url.pathname.startsWith('/s/')));
    if (localAsset || font) return route.continue();

    // Never record request paths, queries, headers, credentials or bodies here.
    violations.push({
      origin: url.origin,
      resourceType: request.resourceType(),
      serviceWorker: !!request.serviceWorker(),
    });
    await route.abort('blockedbyclient');
  });
  await context.routeWebSocket('**/*', (socket) => {
    const url = new URL(socket.url());
    if (url.protocol === 'ws:' && url.host === target.host) {
      socket.connectToServer();
    } else {
      violations.push({ origin: url.origin, resourceType: 'websocket', serviceWorker: false });
      socket.close();
    }
  });
}
