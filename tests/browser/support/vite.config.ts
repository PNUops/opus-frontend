import { defineConfig, mergeConfig } from 'vite';
import appConfig from '../../../vite.config';

// This entry point is used only by Playwright. Normal dev/build use src/main.tsx.
export default mergeConfig(
  appConfig,
  defineConfig({
    define: {
      'import.meta.env.VITE_USE_MSW': JSON.stringify('true'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(''),
    },
    server: { host: '127.0.0.1', strictPort: true, proxy: {} },
    plugins: [
      {
        name: 'browser-qa-entry',
        transformIndexHtml: {
          order: 'pre',
          handler(html) {
            if (!html.includes('src="/src/main.tsx"')) throw new Error('OPUS entry point changed; update Browser QA.');
            return html.replace('src="/src/main.tsx"', 'src="/tests/browser/support/bootstrap.ts"');
          },
        },
      },
    ],
  }),
);
