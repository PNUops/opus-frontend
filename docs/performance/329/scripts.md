# 측정 스크립트 원본

이 문서는 #314 기존 QA checkout의 .qa/perf-329에서 실행한 조사 스크립트 원본이다. 별도 Playwright 설정이나 제품 테스트 러너를 추가하지 않는다. 아래 코드 블록을 같은 이름의 파일로 복사한다. QA runner 545203c의 실행부 앞 선언을 재사용하는 일회성 조사 방식으로, 공개 API가 아니므로 runner 변경 시 재검토해야 한다.

## collect-fixtures.cjs

```javascript
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
process.env.VISUAL_QA_BASE_URL = 'http://127.0.0.1:4186';
const script = path.resolve(__dirname, '../../tests/browser-visual-qa.cjs');
const sandbox = { __dirname: path.dirname(script), require: createRequire(script), exports: {}, process, console, URL, AbortSignal, fetch, setTimeout, clearTimeout };
vm.runInNewContext(fs.readFileSync(script, 'utf8').split('\n(async () => {')[0] + '\nexports.qa={chromium,guardNetwork,assertPageReady,screens,errors};', sandbox);
const { qa } = sandbox.exports;
const fixtures = { public: {}, admin: {} };
const fonts = {};
const pending = [];
const collectionErrors = [];
const queue = (task) => pending.push(task.catch(error => collectionErrors.push(error.message)));
(async () => {
  const browser = await qa.chromium.launch({ headless: true });
  try {
    for (const role of ['public', 'admin']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR', serviceWorkers: 'allow' });
      await qa.guardNetwork(context);
      await context.addInitScript(() => localStorage.setItem('signupLeaderMsgConfirmed', 'true'));
      const page = await context.newPage();
      page.on('requestfailed', request => console.error('Synthetic fixture request failed:', role, new URL(request.url()).pathname, request.failure()?.errorText));
      page.on('response', response => {
        const url = new URL(response.url());
        if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) {
          queue((async () => { fonts[url.href] = { contentType: response.headers()['content-type'], body: (await response.body()).toString('base64') }; })());
          return;
        }
        if (url.origin !== process.env.VISUAL_QA_BASE_URL || !url.pathname.startsWith('/api/')) return;
        queue((async () => {
          const body = await response.body();
          fixtures[role][response.request().method() + ' ' + url.pathname + url.search] = { status: response.status(), contentType: response.headers()['content-type'] || 'application/octet-stream', body: body.toString('base64') };
        })());
      });
      await page.goto(process.env.VISUAL_QA_BASE_URL, { waitUntil: 'domcontentloaded' });
      await qa.assertPageReady(page, qa.screens[0]);
      if (role === 'admin') {
        await page.evaluate(async () => {
          const { worker } = await import('/src/mocks/browsers.ts');
          const { http, HttpResponse } = await import('/node_modules/.vite/deps/msw.js');
          const { mockGroupedContestsResponse } = await import('/src/mocks/data/contest.ts');
          worker.use(http.get('/api/categories', () => HttpResponse.json(mockGroupedContestsResponse.map(group => ({ categoryId: group.categoryId, categoryName: group.categoryName, updatedAt: '2026-10-01T00:00:00Z' })))));
          worker.use(http.get('/api/notifications', () => HttpResponse.json([])));
          const { useTokenStore } = await import('/src/stores/useTokenStore.ts');
          const encode = value => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value)))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
          useTokenStore.getState().setToken(encode({ alg: 'none', typ: 'JWT' }) + '.' + encode({ sub: '9001', name: 'QA 관리자', roles: ['ROLE_관리자'] }) + '.mock');
        });
        await page.getByRole('button', { name: '정렬', exact: true }).waitFor();
        await page.evaluate(() => { history.pushState(null, '', '/admin'); window.dispatchEvent(new PopStateEvent('popstate')); });
        await page.getByRole('heading', { name: '전체 공지사항 목록', exact: true }).waitFor();
        await page.getByRole('heading', { name: '서비스 관련 정보', exact: true }).waitFor();
      }
      await page.evaluate(async () => { await Promise.all(['400 16px "Noto Sans KR"', '700 16px "Noto Sans KR"'].map(font => document.fonts.load(font, '부산대학교 프로젝트 회원가입'))); });
      await page.waitForLoadState('networkidle');
      let observedCount = 0;
      do { observedCount = pending.length; await Promise.all(pending); } while (observedCount !== pending.length);
      await context.close();
    }
    if (qa.errors.length || collectionErrors.length) throw new Error([...qa.errors, ...collectionErrors].join('\n'));
    fs.writeFileSync(path.join(__dirname, 'fixtures.json'), JSON.stringify(fixtures, null, 2));
    fs.writeFileSync(path.join(__dirname, 'fonts.json'), JSON.stringify(fonts));
    console.log(JSON.stringify(Object.fromEntries(Object.entries(fixtures).map(([role, entries]) => [role, Object.keys(entries)]))));
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { await browser.close(); }
})();

```

## measure.cjs

```javascript
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const phase = process.argv[2] || 'before';
const port = process.argv[3] || '4190';
const base = `http://127.0.0.1:${port}`;
process.env.VISUAL_QA_BASE_URL = base;
const script = path.resolve(__dirname, '../../tests/browser-visual-qa.cjs');
const sandbox = { __dirname: path.dirname(script), require: createRequire(script), exports: {}, process, console, URL, AbortSignal, fetch, setTimeout, clearTimeout };
vm.runInNewContext(fs.readFileSync(script, 'utf8').split('\n(async () => {')[0] + '\nexports.qa={chromium,guardNetwork,screens,errors};', sandbox);
const { qa } = sandbox.exports;
const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures.json'), 'utf8'));
const fonts = JSON.parse(fs.readFileSync(path.join(__dirname, 'fonts.json'), 'utf8'));
const samples = [];
const failures = [];
const tokenPart = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const adminToken = tokenPart({ alg: 'none', typ: 'JWT' }) + '.' + tokenPart({ sub: '9001', name: 'QA 관리자', roles: ['ROLE_관리자'] }) + '.mock';
const options = { cpuRate: 4, latencyMs: 50, bytesPerSecond: 1250000, runs: 5, viewport: { width: 1440, height: 900 } };
async function metrics(page, session) {
  const browserMetrics = await session.send('Performance.getMetrics');
  const values = Object.fromEntries(browserMetrics.metrics.map(metric => [metric.name, metric.value]));
  const resources = await page.evaluate(() => ({
    lcpMs: window.__lcp329 ?? null,
    scripts: performance.getEntriesByType('resource').filter(entry => new URL(entry.name).pathname.endsWith('.js')).map(entry => ({ path: new URL(entry.name).pathname, transferSize: entry.transferSize, encodedBodySize: entry.encodedBodySize, decodedBodySize: entry.decodedBodySize })),
  }));
  return { ...resources, scriptDurationMs: values.ScriptDuration * 1000, taskDurationMs: values.TaskDuration * 1000 };
}
async function settled(page) {
  await page.evaluate(async () => { await Promise.all(['400 16px "Noto Sans KR"', '700 16px "Noto Sans KR"'].map(font => document.fonts.load(font, '부산대학교 프로젝트 회원가입'))); });
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
(async () => {
  const browser = await qa.chromium.launch({ headless: true });
  try {
    for (let run = 0; run < options.runs; run++) for (const scenario of ['home', 'signin', 'admin-transition']) {
      const role = scenario === 'admin-transition' ? 'admin' : 'public';
      const context = await browser.newContext({ viewport: options.viewport, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce', serviceWorkers: 'block' });
      context.setDefaultTimeout(30000);
      await qa.guardNetwork(context);
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin === base && url.pathname.startsWith('/api/')) {
          const fixture = fixtures[role][route.request().method() + ' ' + url.pathname + url.search];
          if (!fixture) { failures.push('Missing fixture: ' + route.request().method() + ' ' + url.pathname); return route.abort(); }
          return route.fulfill({ status: fixture.status, contentType: fixture.contentType, body: Buffer.from(fixture.body, 'base64') });
        }
        if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) {
          const font = fonts[url.href];
          if (!font) { failures.push('Missing font fixture: ' + url.hostname); return route.abort(); }
          return route.fulfill({ status: 200, contentType: font.contentType, body: Buffer.from(font.body, 'base64') });
        }
        return route.fallback();
      });
      if (role === 'admin') await context.addCookies([{ name: 'access_token', value: adminToken, url: base }]);
      await context.addInitScript(() => {
        localStorage.setItem('signupLeaderMsgConfirmed', 'true');
        new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__lcp329 = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      const page = await context.newPage();
      page.on('pageerror', error => failures.push(error.message));
      const session = await context.newCDPSession(page);
      await session.send('Network.enable');
      await session.send('Network.setCacheDisabled', { cacheDisabled: true });
      await session.send('Network.emulateNetworkConditions', { offline: false, latency: options.latencyMs, downloadThroughput: options.bytesPerSecond, uploadThroughput: options.bytesPerSecond });
      await session.send('Emulation.setCPUThrottlingRate', { rate: options.cpuRate });
      await session.send('Performance.enable');
      try {
        await page.goto(base + (scenario === 'signin' ? '/signin' : '/'), { waitUntil: 'domcontentloaded' });
        await qa.screens[scenario === 'signin' ? 1 : 0].ready(page);
        await settled(page);
        assert.equal(await page.getByRole('alert').count(), 0);
        const initial = await metrics(page, session);
        const result = { run: run + 1, scenario, initial, initialJsRequests: initial.scripts.length, initialJsTransferBytes: initial.scripts.reduce((sum, script) => sum + script.transferSize, 0), initialJsBodyBytes: initial.scripts.reduce((sum, script) => sum + script.encodedBodySize, 0) };
        if (scenario === 'admin-transition') {
          await page.getByRole('button', { name: /^프로필 메뉴 열기/ }).click();
          const start = await page.evaluate(() => performance.now());
          await page.getByRole('menuitem', { name: '관리자페이지', exact: true }).click();
          await page.getByRole('heading', { name: '전체 공지사항 목록', exact: true }).waitFor();
          result.adminReadyMs = await page.evaluate(start => performance.now() - start, start);
          await settled(page);
          const after = await metrics(page, session);
          const beforePaths = new Set(initial.scripts.map(script => script.path));
          result.adminScripts = after.scripts.filter(script => !beforePaths.has(script.path));
          result.adminAdditionalJsRequests = result.adminScripts.length;
          result.adminAdditionalJsBodyBytes = result.adminScripts.reduce((sum, script) => sum + script.encodedBodySize, 0);
          result.adminScriptDurationMs = after.scriptDurationMs - initial.scriptDurationMs;
          assert.equal(await page.getByRole('alert').count(), 0);
        }
        samples.push(result);
        console.log(JSON.stringify({ run: result.run, scenario, requests: result.initialJsRequests, bodyBytes: result.initialJsBodyBytes, scriptMs: initial.scriptDurationMs, lcpMs: initial.lcpMs, adminReadyMs: result.adminReadyMs, additionalRequests: result.adminAdditionalJsRequests }));
        if (failures.length || qa.errors.length) throw new Error([...failures, ...qa.errors].join('\n'));
      } finally { await context.close(); }
    }
  } catch (error) { failures.push(error.stack || String(error)); console.error(error); process.exitCode = 1; }
  finally { await browser.close(); fs.writeFileSync(path.join(__dirname, `${phase}-measurements.json`), JSON.stringify({ phase, browser: browser.version(), node: process.version, options, conditions: 'Vite preview production build; fresh context and disabled HTTP cache; API and fonts replay local safe fixtures; no MSW runtime; same reduced-motion setting.', samples, failures: [...failures, ...qa.errors] }, null, 2)); }
})();

```

## visual.cjs

```javascript
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const base = 'http://127.0.0.1:4192';
process.env.VISUAL_QA_BASE_URL = base;
const script = path.resolve(__dirname, '../../tests/browser-visual-qa.cjs');
const sandbox = { __dirname: path.dirname(script), require: createRequire(script), exports: {}, process, console, URL, AbortSignal, fetch, setTimeout, clearTimeout };
vm.runInNewContext(fs.readFileSync(script, 'utf8').split('\n(async () => {')[0] + '\nexports.qa={chromium,guardNetwork,screens,errors};', sandbox);
const { qa } = sandbox.exports;
const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures.json'), 'utf8'));
const fonts = JSON.parse(fs.readFileSync(path.join(__dirname, 'fonts.json'), 'utf8'));
const out = path.join(__dirname, 'visual');
fs.mkdirSync(out, { recursive: true });
const checks = [], failures = [];
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const adminToken = encode({alg:'none',typ:'JWT'})+'.'+encode({sub:'9001',name:'QA 관리자',roles:['ROLE_관리자']})+'.mock';
async function prepare(browser, width, admin = false) {
  const context = await browser.newContext({ viewport: {width, height:width===390?844:width===768?1024:900}, locale:'ko-KR', timezoneId:'Asia/Seoul', reducedMotion:'reduce', serviceWorkers:'block' });
  await qa.guardNetwork(context);
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === base && url.pathname.startsWith('/api/')) {
      if (/^\/api\/categories(?:\/\d+\/contests)?\/sort$/.test(url.pathname) && route.request().method()==='GET') return route.fulfill({json:{mode:'ASC'}});
      const fixture = fixtures[admin?'admin':'public'][route.request().method()+' '+url.pathname+url.search];
      if (!fixture) { failures.push('Missing fixture '+route.request().method()+' '+url.pathname); return route.abort(); }
      return route.fulfill({status:fixture.status,contentType:fixture.contentType,body:Buffer.from(fixture.body,'base64')});
    }
    if (fonts[url.href]) return route.fulfill({status:200,contentType:fonts[url.href].contentType,body:Buffer.from(fonts[url.href].body,'base64')});
    return route.fallback();
  });
  if (admin) await context.addCookies([{name:'access_token',value:adminToken,url:base}]);
  await context.addInitScript(() => localStorage.setItem('signupLeaderMsgConfirmed','true'));
  const page = await context.newPage();
  const scripts = [];
  page.on('request', req => { if(new URL(req.url()).pathname.endsWith('.js')) scripts.push(new URL(req.url()).pathname); });
  page.on('pageerror', error => failures.push(error.message));
  return {context,page,scripts};
}
async function capture(page, name, width, allowOverflow = false) {
  await page.evaluate(async () => {
    const faces = await Promise.all(['400 16px "Noto Sans KR"','700 16px "Noto Sans KR"'].map(font=>document.fonts.load(font,document.body.innerText)));
    if (!faces.every(group => group.length > 0 && group.every(face => face.status === 'loaded'))) throw new Error('Korean font faces not loaded');
    if(!document.fonts.check('400 16px "Noto Sans KR"','화면을 불러오지 못했어요.')) throw new Error('Korean font not ready');
  });
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const overflow = await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(!allowOverflow) assert.ok(overflow<=1, `${name} overflow ${overflow}`);
  await page.screenshot({path:path.join(out,`${name}-${width}.png`),animations:'disabled'});
  checks.push({name,width,overflow});
}
(async()=>{
 const browser=await qa.chromium.launch({headless:true});
 try {
  for(const width of [1440,768,390]) {
   {
    const {context,page}=await prepare(browser,width);
    let release; const gate=new Promise(resolve=>release=resolve);
    await context.route('**/assets/SignInPage-*.js',async route=>{await gate;await route.fallback();});
    await page.goto(base+'/signin?next=qa#form',{waitUntil:'domcontentloaded'});
    await page.getByRole('status').filter({hasText:'화면을 준비하고 있어요.'}).waitFor();
    await capture(page,'route-loading',width);
    release();
    await qa.screens[1].ready(page);
    assert.equal(page.url(),base+'/signin?next=qa#form');
    checks.push({name:'direct URL retains search/hash after loading',width});
    await context.close();
   }
   {
    const {context,page}=await prepare(browser,width);
    let blocked=true, documents=0;
    page.on('request',req=>{if(req.isNavigationRequest()&&req.frame()===page.mainFrame())documents++;});
    await context.route('**/assets/SignInPage-*.js',route=>blocked?route.abort():route.fallback());
    await page.goto(base+'/signin?next=qa#form',{waitUntil:'domcontentloaded'});
    await page.getByRole('alert').filter({hasText:'화면을 불러오지 못했어요.'}).waitFor();
    await capture(page,'route-error',width);
    assert.equal(documents,1,'no automatic reload');
    blocked=false;
    await page.getByRole('button',{name:'새로고침',exact:true}).click();
    await qa.screens[1].ready(page);
    assert.equal(page.url(),base+'/signin?next=qa#form');
    assert.equal(documents,2);
    checks.push({name:'manual reload recovers failed chunk and preserves URL',width});
    await context.close();
   }
   {
    const {context,page,scripts}=await prepare(browser,width,true);
    let release; const gate=new Promise(resolve=>release=resolve);
    await context.route('**/assets/SidebarSortEditor-*.js',async route=>{await gate;await route.fallback();});
    await page.goto(base,{waitUntil:'domcontentloaded'}); await qa.screens[0].ready(page);
    assert.ok(!scripts.some(p=>/SidebarSortEditor|Calendar|AdminDashBoardPage/.test(p)));
    if(width<1024) await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();
    await page.getByRole('button',{name:'정렬',exact:true}).first().click();
    await page.getByRole('status').filter({hasText:'정렬 도구를 불러오는 중입니다.'}).waitFor();
    await capture(page,'sidebar-loading',width);
    await page.getByRole('button',{name:'취소',exact:true}).click();
    await page.waitForFunction(()=>document.activeElement?.textContent?.trim()==='정렬');
    release();
    await page.getByRole('button',{name:'정렬',exact:true}).first().click();
    await page.getByLabel('사이드바 순서 편집',{exact:true}).first().waitFor();
    await page.getByRole('button',{name:'저장',exact:true}).first().waitFor();
    await capture(page,'sidebar-ready',width);
    assert.equal(scripts.filter(p=>/SidebarSortEditor-/.test(p)).length,1,'cached module reused after cancel');
    await page.getByRole('button',{name:'정렬 편집 취소',exact:true}).first().click();
    await page.waitForFunction(()=>document.activeElement?.textContent?.trim()==='정렬');
    checks.push({name:'sidebar absent initially, cancel focus returns, reopen uses one request',width});
    await context.close();
   }
   {
    const {context,page}=await prepare(browser,width,true);
    await context.route('**/assets/SidebarSortEditor-*.js',route=>route.abort());
    await page.goto(base,{waitUntil:'domcontentloaded'}); await qa.screens[0].ready(page);
    if(width<1024) await page.getByRole('button',{name:'메뉴 열기',exact:true}).click();
    await page.getByRole('button',{name:'정렬',exact:true}).first().click();
    await page.getByRole('alert').filter({hasText:'화면을 불러오지 못했어요.'}).waitFor();
    await capture(page,'sidebar-error',width);
    await page.getByRole('button',{name:'취소',exact:true}).click();
    await page.waitForFunction(()=>document.activeElement?.textContent?.trim()==='정렬');
    assert.equal(await page.getByRole('alert').count(),0);
    checks.push({name:'sidebar failure preserves home and cancellation restores list',width});
    await context.close();
   }
  }
  {
   const {context,page,scripts}=await prepare(browser,1440);
   await page.goto(base+'/admin');
   await page.getByText('관리자 권한이 없습니다.',{exact:true}).waitFor();
   assert.ok(!scripts.some(p=>/AdminDashBoardPage-/.test(p)));
   await page.goto(base+'/me/account');
   await page.getByText('로그인이 필요합니다.',{exact:true}).waitFor();
   assert.ok(!scripts.some(p=>/AccountPage-/.test(p)));
   checks.push({name:'anonymous admin/my-page guards prevent page chunk requests'});
   await page.goto(base+'/signin'); await qa.screens[1].ready(page);
   await page.getByRole('link',{name:'회원가입',exact:true}).click(); await qa.screens[2].ready(page);
   await page.goBack(); await qa.screens[1].ready(page);
   await page.goForward(); await qa.screens[2].ready(page);
   assert.equal(scripts.filter(p=>/SignUpPage-/.test(p)).length,1);
   checks.push({name:'sign-in/sign-up history navigation reuses module'});
   await page.goto(base+'/qa-route-that-does-not-exist');
   await page.getByRole('link',{name:'메인으로 이동'}).waitFor();
   checks.push({name:'unknown route still renders 404'});
   await context.close();
  }
  if(failures.length||qa.errors.length)throw new Error([...failures,...qa.errors].join('\n'));
 } catch(error){failures.push(error.stack||String(error));console.error(error);process.exitCode=1;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({checks,failures:[...failures,...qa.errors]},null,2));console.log(JSON.stringify({checks:checks.length,failures:failures.length+qa.errors.length}));}
})();

```
