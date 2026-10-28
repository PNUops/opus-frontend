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
      await page.locator('.opus-contest-card').first().waitFor({ timeout: 20000 });
      await page.locator('.opus-archive-section[aria-busy="true"]').waitFor({ state: 'hidden', timeout: 20000 });
      await page.locator('.opus-masthead [aria-busy="true"]').waitFor({ state: 'hidden', timeout: 20000 });
    },
  },
  {
    name: 'signin',
    path: '/signin',
    ready: (page) => page.getByRole('heading', { name: '로그인', exact: true }).waitFor(),
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

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server && server.exitCode !== null) throw new Error('Vite 서버가 시작 중 종료되었습니다.');
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return;
    } catch {
      // The server may still be starting.
    }
    await delay(250);
  }
  throw new Error('30초 이내에 로컬 Vite 서버가 준비되지 않았습니다.');
}

function startServer() {
  if (process.env.VISUAL_QA_BASE_URL) return;
  server = spawn(
    process.execPath,
    [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    {
      cwd: root,
      env: { ...process.env, VITE_USE_MSW: 'true', VITE_API_BASE_URL: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  server.stdout.on('data', (chunk) => process.stdout.write(chunk));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));
}

async function capture(page, name, viewport) {
  // The development-only TanStack Query toggle is not part of the product UI.
  await page.addStyleTag({ content: '.tsqd-open-btn-container { display: none !important; }' });
  await page.mouse.move(0, 0);
  const filename = `${name}-${viewport.name}.png`;
  await page.screenshot({
    path: path.join(outputDirectory, filename),
    fullPage: true,
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
  captures.push({ name, viewport: viewport.name, file: filename, ...layout });
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
  fs.mkdirSync(outputDirectory, { recursive: true });
  try {
    startServer();
    await waitForServer();
    browser = await chromium.launch({ headless: true });

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
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      try {
        for (const screen of screens) {
          await page.goto(new URL(screen.path, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
          await screen.ready(page);
          if (screen.name === 'signin') {
            await capture(page, 'signin-onboarding', viewport);
            await page.getByRole('button', { name: '확인', exact: true }).first().click();
            await page.waitForFunction(() => localStorage.getItem('signupLeaderMsgConfirmed') === 'true');
          }
          await capture(page, screen.name, viewport);
        }

        if (viewport.name === 'mobile') {
          await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
          await page.locator('.opus-contest-card').first().waitFor({ timeout: 20000 });
          await page.getByRole('button', { name: '메뉴 열기' }).click();
          await capture(page, 'home-sidebar-open', viewport);
        }

        assert.deepEqual(pageErrors, [], `${viewport.name} 화면에서 처리되지 않은 JavaScript 오류가 발생했습니다.`);
      } finally {
        await context.close();
      }
    }
  } catch (error) {
    errors.push(error.stack || String(error));
    process.exitCode = 1;
    console.error(error);
  } finally {
    writeArtifacts();
    await browser?.close();
    server?.kill('SIGTERM');
    console.log(`시각적 QA 결과: ${outputDirectory}`);
  }
})();