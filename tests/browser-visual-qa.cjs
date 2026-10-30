'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const root = path.resolve(__dirname, '..');
const outputDirectory = path.join(root, '.qa', 'visual');
const port = Number(process.env.VISUAL_QA_PORT || '4173');
const baseUrl = process.env.VISUAL_QA_BASE_URL || `http://127.0.0.1:${port}`;
const target = new URL(baseUrl);

assert.equal(target.protocol, 'http:', '시각적 QA는 로컬 HTTP 서버에서만 실행할 수 있습니다.');
assert(
  ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname),
  '시각적 QA는 운영·외부 서버에 연결할 수 없습니다.',
);
assert(
  !target.username && !target.password && !target.search && !target.hash && target.pathname === '/',
  '시각적 QA 주소에는 인증 정보, 경로, 쿼리 또는 해시를 넣을 수 없습니다.',
);

// Playwright 1.55 requires this flag to route network requests made by MSW itself.
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = '1';

let chromium;
try {
  ({ chromium } = require(path.join(root, '.qa', 'node_modules', 'playwright')));
} catch {
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.error('Playwright가 없습니다. docs/visual-qa.md의 설치 방법을 확인하세요.');
    process.exit(1);
  }
}

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const screens = [
  {
    name: 'home',
    path: '/',
    ready: async (page) => {
      await page.locator('.opus-masthead').waitFor();
      await page.locator('.opus-contest-card').first().waitFor();
      await page.locator('.opus-archive-feature__link').waitFor();
      await page.locator('[aria-labelledby="opus-signal-title"] ol li').first().waitFor();
      await page.waitForFunction(() => !document.querySelector('.opus-contest-card__poster[data-loading="true"]'));
    },
  },
  {
    name: 'signin',
    path: '/signin',
    // A modal onboarding notice hides the background from the accessibility tree, not visually.
    ready: (page) => page.getByRole('heading', { name: '로그인', exact: true, includeHidden: true }).waitFor(),
  },
  {
    name: 'signup',
    path: '/signup',
    ready: (page) => page.getByRole('heading', { name: '회원가입', exact: true }).waitFor(),
  },
];

const captures = [];
const errors = [];
let browser;
let server;
let interrupted = false;

async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (interrupted) throw new Error('시각적 QA 실행이 중단되었습니다.');
    if (server && server.exitCode !== null) throw new Error('Vite 서버가 시작 중 종료되었습니다.');
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1500), redirect: 'error' });
      if (response.ok) return;
    } catch {
      // The server may still be starting.
    }
    await delay(250);
  }
  throw new Error('30초 이내에 로컬 Vite 서버가 준비되지 않았습니다.');
}

async function startServer() {
  if (process.env.VISUAL_QA_BASE_URL) return;
  const viteDirectory = path.dirname(require.resolve('vite/package.json', { paths: [root] }));
  server = spawn(
    process.execPath,
    [path.join(viteDirectory, 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    {
      cwd: root,
      env: { ...process.env, VITE_USE_MSW: 'true', VITE_API_BASE_URL: '', NO_COLOR: '1', FORCE_COLOR: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('30초 이내에 Vite 서버가 준비되지 않았습니다.')), 30000);
    let output = '';
    server.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
      output = (output + chunk).slice(-4096);
      // A response from another process on this port must not count as our server being ready.
      if (output.includes(`http://127.0.0.1:${port}/`)) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.once('error', () => {
      clearTimeout(timeout);
      reject(new Error('Vite 프로세스를 시작하지 못했습니다.'));
    });
    server.once('exit', () => {
      clearTimeout(timeout);
      reject(new Error('Vite 서버가 종료되었습니다. 포트 충돌과 서버 출력을 확인하세요.'));
    });
  });
}

async function stopServer() {
  if (!server?.pid || server.exitCode !== null || server.signalCode !== null) return;
  let exited = false;
  const closed = new Promise((resolve) =>
    server.once('exit', () => {
      exited = true;
      resolve();
    }),
  );
  server.kill('SIGTERM');
  await Promise.race([closed, delay(5000, undefined, { ref: false })]);
  if (!exited) {
    server.kill('SIGKILL');
    await Promise.race([closed, delay(5000, undefined, { ref: false })]);
    assert(exited, 'Vite 서버 종료를 확인하지 못했습니다.');
  }
}

async function guardNetwork(context) {
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const isLocalAsset = url.origin === target.origin && !/^\/api(?:\/|$)/.test(url.pathname);
    const isFont =
      url.protocol === 'https:' &&
      ((url.hostname === 'fonts.googleapis.com' && url.pathname === '/css2') ||
        (url.hostname === 'fonts.gstatic.com' && url.pathname.startsWith('/s/')));
    if (isLocalAsset || isFont) return route.continue();

    // Never include request paths, query strings, headers, bodies or credentials in diagnostics.
    const message = `허용되지 않은 네트워크 요청: ${url.origin} (${request.resourceType()})`;
    if (!errors.includes(message)) errors.push(message);
    await route.abort('blockedbyclient');
  });
}

async function assertPageReady(page, screen) {
  await page.waitForFunction(() => navigator.serviceWorker.controller?.scriptURL.endsWith('/mockServiceWorker.js'));
  await screen.ready(page);
  assert.equal(await page.getByRole('alert').count(), 0, '오류 상태의 화면은 정상 캡처할 수 없습니다.');
}

async function capture(page, name, viewport, fullPage = true) {
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  const koreanFontLoaded = await page.evaluate(async () => {
    const sample = '부산대학교 프로젝트 회원가입';
    const fonts = ['400 16px "Noto Sans KR"', '700 16px "Noto Sans KR"'];
    let timeout;
    try {
      const faces = await Promise.race([
        Promise.all(fonts.map((font) => document.fonts.load(font, sample))),
        new Promise((resolve) => {
          timeout = window.setTimeout(() => resolve(null), 15000);
        }),
      ]);
      return (
        faces !== null &&
        faces.every((group) => group.length > 0 && group.every((face) => face.status === 'loaded')) &&
        fonts.every((font) => document.fonts.check(font, sample))
      );
    } catch {
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  });
  assert(koreanFontLoaded, '한글 폰트가 준비되지 않았습니다.');
  // The development-only TanStack Query toggle is not part of the product UI.
  await page.addStyleTag({ content: '.tsqd-open-btn-container { display: none !important; }' });
  await page.mouse.move(0, 0);
  const filename = `${name}-${viewport.name}.png`;
  await page.screenshot({
    path: path.join(outputDirectory, filename),
    fullPage,
    animations: 'disabled',
    timeout: 30000,
  });
  const layout = await page.evaluate(() => {
    const html = document.documentElement;
    return {
      viewportWidth: window.innerWidth,
      documentWidth: html.scrollWidth,
      horizontalOverflowPx: Math.max(0, html.scrollWidth - html.clientWidth),
    };
  });
  captures.push({ name, viewport: viewport.name, file: filename, fullPage, koreanFontLoaded, ...layout });
}

function writeArtifacts() {
  const result = { passed: errors.length === 0, captures, errors };
  fs.writeFileSync(path.join(outputDirectory, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);

  const gallery = captures
    .map(
      ({ name, viewport, file, horizontalOverflowPx }) =>
        `<figure><figcaption>${name} · ${viewport}${horizontalOverflowPx > 1 ? ` · 가로 넘침 ${horizontalOverflowPx}px` : ''}</figcaption><a href="${file}"><img src="${file}" loading="lazy" alt="${name} ${viewport} 캡처" /></a></figure>`,
    )
    .join('\n');
  fs.writeFileSync(
    path.join(outputDirectory, 'index.html'),
    `<!doctype html><html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>OPUS Visual QA</title><style>body{font:15px system-ui,sans-serif;margin:0;padding:24px;background:#f7f7f7;color:#222}h1{margin:0 0 10px}p{max-width:760px;line-height:1.6}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:20px}figure{margin:0;background:white;border:1px solid #ddd;border-radius:10px;padding:12px}figcaption{font-weight:600;margin-bottom:12px}img{display:block;width:100%;height:auto;border:1px solid #eee}</style></head><body><h1>OPUS · Visual QA</h1><p>합성 MSW 데이터로 촬영한 화면입니다. 레이아웃 수치와 캡처는 자동 생성되지만, 타이포그래피·여백·색상·정보 위계·심미성은 이미지를 직접 검토해야 합니다.</p><main>${gallery}</main></body></html>`,
  );
}

(async () => {
  // Prevent screenshots from a previous local run from appearing in this run's artifact.
  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(outputDirectory, { recursive: true });
  try {
    await startServer();
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    if (interrupted) throw new Error('시각적 QA 실행이 중단되었습니다.');

    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
        colorScheme: 'light',
        reducedMotion: 'reduce',
        serviceWorkers: 'allow',
      });
      context.setDefaultTimeout(20000);
      context.setDefaultNavigationTimeout(30000);
      await guardNetwork(context);
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      try {
        for (const screen of screens) {
          try {
            await page.goto(new URL(screen.path, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
            await assertPageReady(page, screen);
            if (screen.name === 'signin') {
              await page.getByRole('button', { name: '확인', exact: true }).first().waitFor();
              await capture(page, 'signin-onboarding', viewport, false);
              await page.getByRole('button', { name: '확인', exact: true }).first().click();
              await page.waitForFunction(() => localStorage.getItem('signupLeaderMsgConfirmed') === 'true');
            }
            await capture(page, screen.name, viewport);
          } catch (error) {
            if (interrupted) throw error;
            const message = `${viewport.name}/${screen.name}: ${error.stack || String(error)}`;
            errors.push(message);
            console.error(message);
          }
        }

        if (viewport.name === 'mobile') {
          try {
            await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
            await assertPageReady(page, screens[0]);
            await page.getByRole('button', { name: '메뉴 열기' }).click();
            await capture(page, 'home-sidebar-open', viewport, false);
          } catch (error) {
            if (interrupted) throw error;
            const message = `${viewport.name}/home-sidebar-open: ${error.stack || String(error)}`;
            errors.push(message);
            console.error(message);
          }
        }

        errors.push(...pageErrors.map((message) => `${viewport.name} 화면의 처리되지 않은 JavaScript 오류: ${message}`));
      } finally {
        await context.close();
      }
    }
  } catch (error) {
    errors.push(error.stack || String(error));
    process.exitCode = 1;
    console.error(error);
  } finally {
    const cleanup = await Promise.allSettled([browser?.close(), stopServer()]);
    for (const result of cleanup) {
      if (result.status === 'rejected') errors.push('브라우저 또는 로컬 서버 종료를 확인하지 못했습니다.');
    }
    if (errors.length > 0) process.exitCode = process.exitCode || 1;
    try {
      writeArtifacts();
    } catch {
      process.exitCode = process.exitCode || 1;
      console.error('시각적 QA 결과 파일을 저장하지 못했습니다.');
    }
    console.log(`시각적 QA 결과: ${outputDirectory}`);
  }
})();

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    interrupted = true;
    errors.push('시각적 QA 실행이 중단되었습니다.');
    process.exitCode = signal === 'SIGINT' ? 130 : 143;
    void browser?.close().catch(() => {});
    server?.kill('SIGTERM');
  });
}
