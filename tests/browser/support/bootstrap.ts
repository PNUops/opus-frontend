import type { RequestHandler } from 'msw';
import { worker } from '../../../src/mocks/browsers';

declare global {
  interface Window {
    __BROWSER_QA_MOCKS__?: string[];
  }
}

// A new document gets new module state. Browser contexts isolate cookies, storage
// and Service Workers; overrides are reinstalled before React even on reload.
const modules = import.meta.glob<{ handlers: RequestHandler[] }>('../fixtures/msw/**/*.ts');
worker.resetHandlers();
for (const name of window.__BROWSER_QA_MOCKS__ ?? []) {
  const load = modules[`../fixtures/msw/${name}.ts`];
  if (!load) throw new Error(`Unknown Browser QA MSW fixture: ${name}`);
  worker.use(...(await load()).handlers);
}

// Reuse the real application's MSW startup, React providers and router.
await import('../../../src/main');
