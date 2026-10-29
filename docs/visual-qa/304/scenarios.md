# 재현 시나리오

#314의 기존 QA checkout과 설치된 Playwright/Chromium을 재사용한다. 아래 코드를 해당 checkout의 `.qa/`에 각 이름으로 저장한다. `admin-298.cjs`는 기존 관리자 QA 어댑터이며 동일 runner의 가드·폰트·캡처를 읽는다. 새로운 검증 환경을 설치하지 않는다.

제품 checkout을 `VITE_USE_MSW=true`, `VITE_API_BASE_URL` 빈 값으로 127.0.0.1:4199에서 실행한다. 운영 주소나 실제 계정은 사용하지 않는다. 기존 `docs/visual-qa.md`의 준비·폰트·네트워크 격리 지침을 먼저 따른다.

```powershell
$env:ADMIN_QA_BASE_URL='http://127.0.0.1:4199'
$env:PLAYWRIGHT_BROWSERS_PATH='<기존 QA checkout>\.qa\browsers'
node .qa/sidebar-304.cjs sidebar304-pages
node .qa/sidebar-304-interactions.cjs sidebar304-interactions
node .qa/sidebar-304-states.cjs sidebar304-states
node .qa/sidebar-304-extra.cjs sidebar304-extra
```

Before는 develop의 Mock 서버(4194)에 `ADMIN_QA_BASE_URL`을 지정하고 `SIDEBAR_QA_BEFORE=1`로 기본 시나리오만 실행한다. After에서는 해당 변수를 제거한다. 결과는 `.qa/admin-298-<실행 이름>`의 PNG와 JSON이다.

통합은 별도 임시 checkout에서 #339 + #337 + #332를 결합한 뒤 #304 소스를 적용하고 `integration-337-339.patch`의 Header/Sidebar 차이를 반영했다. 해당 Mock 서버(4200)로 URL을 바꿔 interactions/extra와 `sidebar-304-integration.cjs`를 실행한다. 제품 브랜치에 다른 PR을 병합하지 않는다.

정렬 요청은 MSW가 수집하고 실제 서버에 보내지 않는다. 키보드 DnD는 라이브 영역/이동 처리 후 다음 키를 입력한다. 저장 요청의 실제 ID·순서를 검사하며 강제 클릭으로 오버레이 문제를 우회하지 않는다. 읽기 준비와 이미지 캡처가 성공한 뒤에도 PNG를 직접 열어 검토해야 한다.


## admin-298.cjs

```javascript
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const base = process.env.ADMIN_QA_BASE_URL || 'http://127.0.0.1:4193';
const phase = process.argv[2] || 'before';
process.env.VISUAL_QA_BASE_URL = base;
const script = path.resolve(__dirname, '../tests/browser-visual-qa.cjs');
const sandbox = { __dirname:path.dirname(script), require:createRequire(script), exports:{}, process, console, URL, AbortSignal, fetch, setTimeout, clearTimeout };
vm.runInNewContext(fs.readFileSync(script,'utf8').split('\n(async () => {')[0]+'\nexports.qa={chromium,guardNetwork,screens,errors};',sandbox);
const {qa} = sandbox.exports;
const out = path.join(__dirname, 'admin-298-'+phase);
fs.mkdirSync(out,{recursive:true});
const checks=[],failures=[];
async function setup(page) {
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/mockServiceWorker.js'));
 await qa.screens[0].ready(page);
 if(process.env.ADMIN_QA_HIDE_DEVTOOLS==='1')await page.addStyleTag({content:'.tsqd-parent-container { display: none !important; }'});
 await page.evaluate(async()=>{
  const {worker}=await import('/src/mocks/browsers.ts');
  const {http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');
  const {mockGroupedContestsResponse,mockProjectsAdminResponse}=await import('/src/mocks/data/contest.ts');
  const {defaultRequiredFields}=await import('/src/constants/requiredFields.ts');
  const {mockNotices,mockNoticeDetail}=await import('/src/mocks/data/notices.ts');
  const categories=mockGroupedContestsResponse.map(g=>({categoryId:g.categoryId,categoryName:g.categoryName,updatedAt:'2026-10-01T00:00:00Z'}));
  const tracks=[{trackId:1,trackName:'SW 개발'},{trackId:2,trackName:'서비스 기획'}];
  const items=['IN_PROGRESS','SCHEDULED','CLOSED'].map((operationStatus,i)=>({contestSubmissionItemId:i+1,name:['최종 발표 자료','중간 보고서','결과 보고서'][i],trackName:i===0?null:'SW 개발',startAt:'2026-10-01T09:00:00',endAt:'2026-11-01T18:00:00',allowLateSubmission:i===0,visibility:['PUBLIC','STAFF','TEAM'][i],operationStatus}));
  window.__adminQa={mode:'normal',requests:[]};
  window.__qaQueryClient=(await import('/src/stores/queryClient.ts')).default;
  const json=(data)=>HttpResponse.json(window.__adminQa.mode==='empty'?[]:data);
  worker.use(
   http.get('/api/notifications',()=>HttpResponse.json([])),
   http.get('/api/categories',()=>json(categories)),
   http.get('/api/contests/:id/tracks',()=>json(tracks)),
   http.get('/api/contests/:id/awards',()=>json([{awardId:1,awardName:'대상',awardColor:'#f59e0b'}])),
   http.get('/api/contests/:id/template',()=>HttpResponse.json(defaultRequiredFields)),
   http.get('/api/contests/:id/vote',()=>HttpResponse.json({voteStartAt:'2026-10-01T09:00:00',voteEndAt:'2026-11-01T18:00:00'})),
   http.get('/api/contests/:id/votes',()=>HttpResponse.json({maxVotesLimit:3})),
   http.get('/api/contests/:id/sort',()=>HttpResponse.json({currentMode:'ASC'})),
   http.get('/api/contests/:id/notices',()=>json(mockNotices)),
   http.get('/api/contests/:id/notices/:noticeId',()=>HttpResponse.json(mockNoticeDetail)),
   http.get('/api/contests/:id/team-detail-submissions',()=>json(mockProjectsAdminResponse)),
   http.get('/api/contests/:id/staff',()=>json([{contestMemberId:1,memberId:9002,name:'테스트 교수',email:'professor@example.test',roleType:'ROLE_교수',teams:[{teamId:1,teamName:'테스트 프로젝트팀'}]}])),
   http.get('/api/contests/:id/submission-items',()=>json(items)),
   http.get('/api/contests/:id/submission-items/:itemId',({params})=>HttpResponse.json({...items[Number(params.itemId)-1],contestTrackId:null,description:'공개 시연용 제출 항목입니다.',allowedFileFormats:['PDF'],maxFileSizeMb:20,maxFileCount:3})),
   http.get('/api/admin/contests/:id/submissions',()=>json([{submissionId:1,teamId:1,teamName:'테스트 프로젝트팀',trackName:'SW 개발',submissionItemName:'최종 발표 자료',status:'SUBMITTED',firstSubmittedAt:'2026-10-20T13:00:00',lastModifiedAt:'2026-10-20T13:00:00'}])),
   http.get('/api/contests/:id/submissions/downloads',()=>json([{submissionTypeId:1,submissionItemName:'최종 발표 자료',trackId:1,trackName:'SW 개발',submittedTeamCount:1,estimatedSize:1024}]))
  );
  const {useTokenStore}=await import('/src/stores/useTokenStore.ts');
  const encode=v=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(v)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  useTokenStore.getState().setToken(encode({alg:'none',typ:'JWT'})+'.'+encode({sub:'9001',name:'QA 관리자',roles:['ROLE_관리자']})+'.mock');
 });
}
async function navigate(page,url){
 await page.evaluate(url=>{history.pushState(null,'',url);window.dispatchEvent(new PopStateEvent('popstate'));},url);
 const headings={projects:'프로젝트 관리','submission-manage':'제출 자료 관리',sort:'정렬 관리',awards:'수상 관리','required-fields':'필수 항목 설정',manage:'대회 수정','team-setting':'팀·참여자 설정',roles:'지도교수 및 멘토 지정',tracks:'분과 관리',votes:'투표 기간',notices:'공지 관리',banners:'현재 배너',statistics:'투표 집계'};
 const heading=url==='/admin'?'대회 카테고리':headings[url.split('/').pop()];
 if(heading)await page.getByRole('heading',{name:heading,exact:true}).waitFor();
 else await page.getByText('대회 카테고리 및 이름을 설정해주세요.',{exact:true}).waitFor();
 await page.waitForFunction(()=>window.__qaQueryClient.isFetching()===0);
 await page.waitForLoadState('networkidle');
 await page.waitForFunction(()=>document.querySelectorAll('.animate-pulse').length===0);
 assert.equal(await page.getByText('데이터 조회 중 오류가 발생했습니다.',{exact:true}).count(),0);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function capture(page,name,width,fullPage=true){
 await page.evaluate(async()=>{
  const groups=await Promise.all(['400 16px "Noto Sans KR"','700 16px "Noto Sans KR"'].map(f=>document.fonts.load(f,document.body.innerText)));
  if(!groups.every(g=>g.length>0&&g.every(f=>f.status==='loaded')))throw Error('Korean font not ready');
 });
 await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage,animations:'disabled'});
 checks.push({name,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),dialogs:await page.locator('[role="dialog"]').count()});
 console.log(name,width);
}
async function main(){
 const browser=await qa.chromium.launch({headless:true});
 try{
  for(const width of [1440,768,390]){
   const context=await browser.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});
   await qa.guardNetwork(context);
   const page=await context.newPage();
   page.on('pageerror',error=>failures.push(error.message));
   page.on('requestfailed',request=>console.error('failed',new URL(request.url()).pathname));
   await setup(page);
   const routes=[['dashboard','/admin'],['create','/admin/contest/create'],...['projects','submission-manage','sort','awards','required-fields','manage','team-setting','roles','tracks','votes','notices','banners','statistics'].map(n=>[n,'/admin/contest/1/'+n])];
   for(const [name,url]of routes){await navigate(page,url);await capture(page,name,width);if(failures.length||qa.errors.length)throw Error([...failures,...qa.errors].join('\n'));}
   await navigate(page,'/admin');
   await page.getByRole('button',{name:'+ 새 카테고리',exact:true}).click();
   await page.getByRole('dialog').waitFor();await capture(page,'category-create',width,false);
   await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'+ 새 공지',exact:true}).click();
   await page.getByRole('dialog').waitFor();await capture(page,'notice-create',width,false);
   await page.keyboard.press('Escape');
   await context.close();
  }
 }catch(error){failures.push(error.stack||String(error));console.error(error);process.exitCode=1;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({checks,failures:[...failures,...qa.errors]},null,2));}
}
module.exports={setup,navigate,capture,qa,out,checks,failures,base};
if(require.main===module)main();

```


## sidebar-304.cjs

```javascript
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
process.env.ADMIN_QA_BASE_URL ||= 'http://127.0.0.1:4199';
process.argv[2] ||= 'sidebar304-initial';
const { capture, qa, out, checks, failures } = require('./admin-298.cjs');
const behavior = [];
async function setup(p) {
  await p.goto(process.env.ADMIN_QA_BASE_URL, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => navigator.serviceWorker.controller?.scriptURL.endsWith('/mockServiceWorker.js'));
  await qa.screens[0].ready(p);
  await p.addStyleTag({ content: '.tsqd-parent-container { display: none !important; }' });
  await p.evaluate(async () => {
    window.__qaQueryClient = (await import('/src/stores/queryClient.ts')).default;
  });
}
async function settle(p) {
  await p.waitForFunction(() => window.__qaQueryClient.isFetching() === 0);
  await p.waitForLoadState('networkidle');
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}
async function fixtures(p) {
  await p.evaluate(async () => {
    const { worker } = await import('/src/mocks/browsers.ts');
    const { http, HttpResponse } = await import('/node_modules/.vite/deps/msw.js');
    const { mockGroupedContestsResponse } = await import('/src/mocks/data/contest.ts');
    const { mockNotices } = await import('/src/mocks/data/notices.ts');
    worker.use(
      http.get('/api/notifications', () => HttpResponse.json([])),
      http.get('/api/contests/:id/notices', () => HttpResponse.json(mockNotices)),
      http.get('/api/contests/:id/vote', () =>
        HttpResponse.json({ voteStartAt: '2026-10-01T09:00:00', voteEndAt: '2026-10-21T18:00:00' }),
      ),
    );
    window.__sidebarQa = {
      groups: structuredClone(mockGroupedContestsResponse),
      mode: 'normal',
      requests: [],
      sortMode: 'ASC',
      contestModes: {},
    };
    window.__sidebarQa.groups[0].categoryId = 1;
    window.__sidebarQa.groups[1].categoryId = 2;
    window.__sidebarQa.groups[0].contests[0].contestId = 1;
    window.__sidebarQa.groups[0].contests[1].contestId = 2;
    window.__sidebarQa.groups[1].contests[0].contestId = 3;
    worker.use(
      http.get(
        '/api/teams/:id/image/thumbnail',
        () =>
          new HttpResponse(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="400" height="240" fill="#edf2f3"/><text x="200" y="120" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#64748b">QA project</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } },
          ),
      ),
      http.get('/api/sidebar', async () => {
        const q = window.__sidebarQa;
        if (q.mode === 'pending') await new Promise((r) => (q.release = r));
        if (q.mode === 'error') return HttpResponse.json({ message: '시연용 조회 오류' }, { status: 500 });
        return HttpResponse.json(q.groups);
      }),
      http.get('/api/categories/sort', () => HttpResponse.json({ mode: window.__sidebarQa.sortMode })),
      http.get('/api/categories/:id/contests/sort', ({ params }) =>
        HttpResponse.json({ mode: window.__sidebarQa.contestModes[params.id] || 'ASC' }),
      ),
      http.put('/api/categories/sort', async ({ request }) => {
        const body = await request.json();
        window.__sidebarQa.requests.push({ path: '/categories/sort', body });
        return new HttpResponse(null, { status: 204 });
      }),
      http.put('/api/categories/:id/contests/sort', async ({ request, params }) => {
        window.__sidebarQa.requests.push({
          path: `/categories/${params.id}/contests/sort`,
          body: await request.json(),
        });
        return new HttpResponse(null, { status: 204 });
      }),
      http.put('/api/categories/sort/custom', async ({ request }) => {
        window.__sidebarQa.requests.push({ path: '/categories/sort/custom', body: await request.json() });
        return new HttpResponse(null, { status: 204 });
      }),
      http.put('/api/categories/:id/contests/sort/custom', async ({ request, params }) => {
        window.__sidebarQa.requests.push({
          path: `/categories/${params.id}/contests/sort/custom`,
          body: await request.json(),
        });
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await window.__qaQueryClient.cancelQueries({ queryKey: ['groupedContests'] });
    window.__qaQueryClient.setQueryData(['groupedContests'], window.__sidebarQa.groups);
    await window.__qaQueryClient.invalidateQueries({ queryKey: ['groupedContests'] });
  });
  await settle(p);
}
async function open(p, width) {
  if (width < (process.env.SIDEBAR_QA_BEFORE === '1' ? 1024 : 1280)) {
    await p
      .getByRole('button', {
        name: process.env.SIDEBAR_QA_BEFORE === '1' ? '메뉴 열기' : '대회 목록 열기',
        exact: true,
      })
      .click();
    await p.waitForTimeout(600);
  }
}
async function close(p, width) {
  if (width < (process.env.SIDEBAR_QA_BEFORE === '1' ? 1024 : 1280)) {
    if (process.env.SIDEBAR_QA_BEFORE === '1') await p.mouse.click(width - 8, 120);
    else await p.getByRole('button', { name: '대회 목록 닫기', exact: true }).click();
    await p.waitForTimeout(350);
  }
}
async function nav(p, url) {
  await p.evaluate((url) => {
    history.pushState(null, '', url);
    dispatchEvent(new PopStateEvent('popstate'));
  }, url);
  if (url.startsWith('/contest/')) await p.locator('main h3').first().waitFor();
  await settle(p);
  if (url.startsWith('/contest/'))
    await p.waitForFunction(() =>
      Array.from(document.querySelectorAll('main img')).every((img) => img.complete && img.naturalWidth > 0),
    );
}
async function long(p) {
  await p.evaluate(async () => {
    const q = window.__sidebarQa;
    q.groups = structuredClone(q.groups);
    q.groups[0].categoryName = '창의융합 소프트웨어 프로젝트와 지역 사회 문제 해결을 위한 장기 공동 연구 카테고리';
    q.groups[0].contests = Array.from({ length: 30 }, (_, i) => ({
      contestId: i + 1,
      contestName:
        i === 0
          ? '지역 사회와 함께하는 창의융합 소프트웨어 프로젝트 — 접근성과 지속가능성을 높이는 서비스 개발 및 성과 공유 대회'
          : `제${i + 1}회 지역과 함께하는 SW 창의융합 프로젝트`,
      isCurrent: i === 0,
    }));
    await window.__qaQueryClient.invalidateQueries({ queryKey: ['groupedContests'] });
  });
  await settle(p);
}
async function main() {
  const b = await qa.chromium.launch({ channel: 'chromium', headless: true });
  try {
    for (const width of JSON.parse(process.env.ADMIN_QA_WIDTHS || '[1440,768,390]')) {
      const c = await b.newContext({
        viewport: { width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 },
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
        reducedMotion: 'reduce',
        serviceWorkers: 'allow',
      });
      await qa.guardNetwork(c);
      c.on('requestfailed', (r) => {
        const u = new URL(r.url());
        if (u.hostname === '127.0.0.1') console.log('FAILED LOCAL', u.pathname);
      });
      const p = await c.newPage();
      p.on('pageerror', (e) => failures.push(e.message));
      await setup(p);
      await fixtures(p);
      await capture(p, 'home', width, false);
      await open(p, width);
      await capture(p, 'home-navigation', width, false);
      await close(p, width);
      await nav(p, '/contest/1');
      await open(p, width);
      await capture(p, 'contest-navigation', width, false);
      await long(p);
      await capture(p, 'long-navigation', width, false);
      const navigation = p.getByRole('navigation', { name: '대회 사이드바' }).last();
      const last = navigation.getByRole('link', { name: '제30회 지역과 함께하는 SW 창의융합 프로젝트', exact: true });
      if (process.env.SIDEBAR_QA_BEFORE !== '1') {
        await last.scrollIntoViewIfNeeded();
        await capture(p, 'long-last', width, false);
        const box = await last.boundingBox();
        assert.ok(box.y >= 0 && box.y + box.height <= p.viewportSize().height);
        behavior.push(`${width} final contest reachable`);
      }
      await c.close();
      if (failures.length || qa.errors.length) throw Error([...failures, ...qa.errors].join('\n'));
    }
  } catch (e) {
    failures.push(e.stack || String(e));
    console.error(e);
    process.exitCode = 1;
  } finally {
    await b.close();
    fs.writeFileSync(
      path.join(out, 'sidebar-checks.json'),
      JSON.stringify({ behavior, checks, failures: [...failures, ...qa.errors] }, null, 2),
    );
  }
}
module.exports = { setup, fixtures, settle, open, close, nav, long, capture, qa, out, checks, failures };
if (require.main === module) main();

```


## sidebar-304-interactions.cjs

```javascript
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
process.argv[2] ||= 'sidebar304-interactions';
const {
  setup,
  fixtures,
  settle,
  open,
  close,
  nav,
  long,
  capture,
  qa,
  out,
  checks,
  failures,
} = require('./sidebar-304.cjs');
const behavior = [];
const ok = (s) => {
  behavior.push(s);
  console.log('PASS', s);
};
async function role(p, admin) {
  await p.evaluate(async (admin) => {
    const { useTokenStore } = await import('/src/stores/useTokenStore.ts');
    const e = (v) =>
      btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(v))))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    if (admin)
      useTokenStore
        .getState()
        .setToken(e({ alg: 'none' }) + '.' + e({ sub: '9001', name: 'QA 관리자', roles: ['ROLE_관리자'] }) + '.mock');
    else useTokenStore.getState().clearToken();
  }, admin);
  await settle(p);
}
async function go(p, url) {
  await nav(p, url);
  await p.getByRole('navigation', { name: '대회 사이드바' }).waitFor();
}
async function drag(p, from, to) {
  await p.mouse.move(from, 250);
  await p.mouse.down();
  await p.mouse.move(to, 250, { steps: 8 });
  await p.mouse.up();
}
async function width(p) {
  return Number(await p.getByRole('separator', { name: '대회 목록 너비 조절' }).getAttribute('aria-valuenow'));
}
async function saved(p) {
  return p.evaluate(() => localStorage.getItem('opus:contest-sidebar-width'));
}
(async () => {
  const b = await qa.chromium.launch({ channel: 'chromium', headless: true });
  try {
    for (const w of [1440, 768, 390]) {
      const c = await b.newContext({
        viewport: { width: w, height: w === 390 ? 844 : w === 768 ? 1024 : 900 },
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
        reducedMotion: 'reduce',
        serviceWorkers: 'allow',
      });
      await qa.guardNetwork(c);
      c.on('requestfailed', (r) => {
        const u = new URL(r.url());
        if (u.hostname === '127.0.0.1') console.log('FAILED LOCAL', u.pathname, r.resourceType());
      });
      const p = await c.newPage();
      p.on('pageerror', (e) => failures.push(e.message));
      await setup(p);
      await fixtures(p);
      await nav(p, '/contest/1');
      await open(p, w);
      let n = p.getByRole('navigation', { name: '대회 사이드바' });
      let selected = n.locator('a[aria-current="page"]');
      await selected.waitFor();
      assert.equal(await selected.count(), 1);
      assert.match(await selected.getAttribute('class'), /bg-subGreen/);
      await capture(p, 'selected', w, false);
      const category = n.getByRole('button', { name: '창의융합 SW해커톤', exact: true });
      await category.click();
      assert.equal(await n.getByRole('link', { name: '제6회 PNU 창의융합 SW해커톤', exact: true }).isVisible(), false);
      await p.evaluate(() => window.__qaQueryClient.invalidateQueries({ queryKey: ['groupedContests'] }));
      await settle(p);
      assert.equal(await category.getAttribute('aria-expanded'), 'false');
      await category.focus();
      await p.keyboard.press('Tab');
      assert.equal(
        await n.getByRole('button', { name: '졸업과제', exact: true }).evaluate((e) => e === document.activeElement),
        true,
      );
      ok(`${w} selection / collapsed items not focusable / refresh preserves collapse`);
      await category.click();
      if (w < 1280) {
        await p.keyboard.press('Escape');
        await p.getByRole('dialog').waitFor({ state: 'hidden' });
        assert.equal(
          await p
            .getByRole('button', { name: '대회 목록 열기', exact: true })
            .evaluate((e) => e === document.activeElement),
          true,
        );
        await open(p, w);
        for (let i = 0; i < 12; i++) {
          await p.keyboard.press('Tab');
          assert.equal(await p.getByRole('dialog').evaluate((el) => el.contains(document.activeElement)), true);
        }
        await p.mouse.click(w - 8, 120);
        await p.getByRole('dialog').waitFor({ state: 'hidden' });
        await open(p, w);
        await n.locator('a[aria-current="page"]').click();
        await p.getByRole('dialog').waitFor({ state: 'hidden' });
        await open(p, w);
        await n.getByRole('link', { name: '제5회 PNU 창의융합 SW해커톤', exact: true }).click();
        await p.waitForURL('**/contest/2');
        await p.getByRole('dialog').waitFor({ state: 'hidden' });
        await open(p, w);
        assert.equal(await n.locator('a[aria-current="page"]').getAttribute('href'), '/contest/2');
        await p.setViewportSize({ width: 1440, height: 900 });
        await p.getByRole('dialog').waitFor({ state: 'hidden' });
        await p.getByRole('separator').waitFor();
        assert.equal(await p.evaluate(() => document.body.style.pointerEvents), '');
        await p.setViewportSize({ width: w, height: w === 390 ? 844 : 1024 });
        await open(p, w);
        assert.equal(await p.getByRole('separator', { name: '대회 목록 너비 조절' }).count(), 0);
        ok(`${w} Escape / focus trap / backdrop / same-route / route / breakpoint close`);
      } else {
        await drag(p, 280, 352);
        assert.equal(await width(p), 352);
        assert.equal(await saved(p), '352');
        await capture(p, 'resized', w, false);
        await nav(p, '/');
        await qa.screens[0].ready(p);
        await settle(p);
        await p.reload();
        await qa.screens[0].ready(p);
        await p.waitForFunction(() => navigator.serviceWorker.controller);
        await p.getByRole('separator').waitFor();
        assert.equal(await width(p), 352);
        await p.addStyleTag({ content: '.tsqd-parent-container { display: none !important; }' });
        await p.evaluate(async () => (window.__qaQueryClient = (await import('/src/stores/queryClient.ts')).default));
        await fixtures(p);
        await nav(p, '/contest/1');
        const handle = p.getByRole('separator', { name: '대회 목록 너비 조절' });
        await handle.focus();
        await p.keyboard.press('End');
        assert.equal(await width(p), 400);
        await p.setViewportSize({ width: 1280, height: 900 });
        await p.waitForFunction(
          () => document.querySelector('[role=separator]').getAttribute('aria-valuenow') === '320',
        );
        assert.equal(await width(p), 320);
        assert.equal(await saved(p), '400');
        await capture(p, 'narrow-desktop', 1280, false);
        await p.setViewportSize({ width: 1440, height: 900 });
        await p.waitForFunction(
          () => document.querySelector('[role=separator]').getAttribute('aria-valuenow') === '400',
        );
        assert.equal(await width(p), 400);
        await handle.focus();
        await p.keyboard.press('Home');
        assert.equal(await width(p), 240);
        await p.keyboard.press('ArrowRight');
        assert.equal(await width(p), 250);
        await p.mouse.move(250, 250);
        await p.mouse.down();
        await p.mouse.move(360, 250, { steps: 5 });
        await p.keyboard.press('Escape');
        await p.mouse.up();
        assert.equal(await width(p), 250);
        assert.equal(await saved(p), '250');
        await p.getByRole('button', { name: '사이드바 너비 기본값 복원' }).click();
        assert.equal(await width(p), 280);
        assert.equal(await saved(p), null);
        await capture(p, 'restored', w, false);
        ok('1440 drag / reload / keyboard / viewport cap without overwriting preference / Escape / reset');
      }
      await role(p, true);
      await n.getByRole('button', { name: '정렬', exact: true }).click();
      await n.getByRole('button', { name: '직접 정렬', exact: true }).first().click();
      const categoryHandle = n.getByRole('button', { name: '1번째 창의융합 SW해커톤 카테고리 순서 이동', exact: true });
      await categoryHandle.focus();
      await p.keyboard.press('Space');
      await p.waitForTimeout(600);
      await p.keyboard.press('ArrowDown');
      await p.waitForTimeout(600);
      await p.keyboard.press('Space');
      await p.waitForTimeout(250);
      await capture(p, 'category-sort', w, false);
      if (w === 1440) {
        await drag(p, 280, 320);
        assert.equal(
          await n.getByRole('button', { name: '1번째 졸업과제 카테고리 순서 이동', exact: true }).count(),
          1,
        );
        ok('1440 resize retains sort draft');
      }
      await n.getByRole('button', { name: '저장', exact: true }).click();
      await n.getByRole('button', { name: '정렬', exact: true }).waitFor();
      const requests = await p.evaluate(() => window.__sidebarQa.requests);
      assert.deepEqual(requests.find((r) => r.path === '/categories/sort/custom').body, [
        { categoryId: 2, itemOrder: 1 },
        { categoryId: 1, itemOrder: 2 },
      ]);
      ok(`${w} category keyboard reorder / exact save payload`);
      await n.getByRole('button', { name: '정렬', exact: true }).click();
      const toggle = n.getByRole('button', { name: '창의융합 SW해커톤', exact: true });
      if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
      await n.getByRole('button', { name: '창의융합 SW해커톤 대회 정렬 설정', exact: true }).click();
      await p
        .getByRole('dialog')
        .filter({ has: p.getByText('대회 순서', { exact: true }) })
        .getByRole('button', { name: '직접 정렬', exact: true })
        .click();
      await p.keyboard.press('Escape');
      const contestHandle = n.getByRole('button', {
        name: '1번째 제6회 PNU 창의융합 SW해커톤 대회 순서 이동',
        exact: true,
      });
      await contestHandle.focus();
      await p.keyboard.press('Space');
      await p.waitForTimeout(600);
      await p.keyboard.press('ArrowDown');
      await p.waitForTimeout(600);
      await p.keyboard.press('Space');
      await p.waitForTimeout(250);
      await capture(p, 'contest-sort', w, false);
      await n.getByRole('button', { name: '저장', exact: true }).click();
      await n.getByRole('button', { name: '정렬', exact: true }).waitFor();
      const cr = await p.evaluate(() =>
        window.__sidebarQa.requests.find((r) => r.path === '/categories/1/contests/sort/custom'),
      );
      assert.deepEqual(cr.body, [
        { contestId: 2, itemOrder: 1 },
        { contestId: 1, itemOrder: 2 },
      ]);
      ok(`${w} nested contest keyboard reorder / exact save payload`);
      await c.close();
      if (failures.length || qa.errors.length) throw Error([...failures, ...qa.errors].join('\n'));
    }
  } catch (e) {
    failures.push(e.stack || String(e));
    console.error(e);
    process.exitCode = 1;
  } finally {
    await b.close();
    fs.writeFileSync(
      path.join(out, 'interaction-checks.json'),
      JSON.stringify({ behavior, checks, failures: [...failures, ...qa.errors] }, null, 2),
    );
  }
})();

```


## sidebar-304-states.cjs

```javascript
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
process.argv[2] ||= 'sidebar304-states';
const {
  setup,
  fixtures,
  settle,
  open,
  close,
  nav,
  long,
  capture,
  qa,
  out,
  checks,
  failures,
} = require('./sidebar-304.cjs');
const behavior = [];
const ok = (s) => {
  behavior.push(s);
  console.log('PASS', s);
};
async function admin(p) {
  await p.evaluate(async () => {
    const { useTokenStore } = await import('/src/stores/useTokenStore.ts');
    const e = (v) =>
      btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(v))))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    useTokenStore
      .getState()
      .setToken(e({ alg: 'none' }) + '.' + e({ sub: '9001', name: 'QA 관리자', roles: ['ROLE_관리자'] }) + '.mock');
  });
  await settle(p);
}
(async () => {
  const b = await qa.chromium.launch({ channel: 'chromium', headless: true });
  try {
    for (const w of [1440, 768, 390]) {
      const c = await b.newContext({
        viewport: { width: w, height: w === 390 ? 844 : w === 768 ? 1024 : 900 },
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
        reducedMotion: 'reduce',
        serviceWorkers: 'allow',
      });
      await qa.guardNetwork(c);
      const p = await c.newPage();
      p.on('pageerror', (e) => failures.push(e.message));
      await setup(p);
      await fixtures(p);
      await open(p, w);
      const n = p.getByRole('navigation', { name: '대회 사이드바' });
      assert.equal(await n.getByRole('button', { name: '정렬', exact: true }).count(), 0);
      await p.evaluate(async () => {
        window.__qaQueryClient.setQueryDefaults(['groupedContests'], { retry: false });
        window.__sidebarQa.mode = 'error';
        await window.__qaQueryClient.invalidateQueries({ queryKey: ['groupedContests'] });
      });
      await n.getByText('목록을 새로 불러오지 못했어요.', { exact: true }).waitFor();
      await capture(p, 'stale-error', w, false);
      await p.evaluate(() => {
        window.__sidebarQa.mode = 'pending';
        void window.__qaQueryClient.resetQueries({ queryKey: ['groupedContests'] });
      });
      await n.getByRole('status').waitFor();
      await capture(p, 'loading', w, false);
      await p.evaluate(() => {
        window.__sidebarQa.mode = 'error';
        window.__sidebarQa.release();
      });
      await n.getByText('대회 목록을 불러오지 못했어요.', { exact: true }).waitFor();
      await capture(p, 'error', w, false);
      await p.evaluate(() => (window.__sidebarQa.mode = 'normal'));
      await n.getByRole('button', { name: '다시 시도' }).click();
      await n.getByRole('button', { name: '창의융합 SW해커톤', exact: true }).waitFor();
      ok(`${w} initial/loading/error/retry/stale distinction`);
      await p.evaluate(async () => {
        window.__sidebarQa.groups = [];
        await window.__qaQueryClient.invalidateQueries({ queryKey: ['groupedContests'] });
      });
      await n.getByText('등록된 대회가 없어요.', { exact: true }).waitFor();
      await capture(p, 'empty', w, false);
      await p.evaluate(async () => {
        window.__sidebarQa.groups = [{ categoryId: 1, categoryName: '준비 중인 대회', contests: [] }];
        await window.__qaQueryClient.invalidateQueries({ queryKey: ['groupedContests'] });
      });
      await n.getByRole('button', { name: '준비 중인 대회' }).waitFor();
      await capture(p, 'empty-category', w, false);
      ok(`${w} empty list / empty category`);
      await fixtures(p);
      await long(p);
      if (w === 1440) {
        const link = n.getByRole('link').first();
        await link.focus();
        await p.getByRole('tooltip').waitFor();
        assert.match(await p.getByRole('tooltip').textContent(), /성과 공유 대회/);
        await capture(p, 'full-name-focus', w, false);
        await p.keyboard.press('Escape');
        ok('1440 full name tooltip on keyboard focus');
      }
      await admin(p);
      await p.evaluate(() => {
        window.__sidebarQa.sortMode = 'CUSTOM';
        window.__sidebarQa.contestModes = { 1: 'CUSTOM' };
      });
      await n.getByRole('button', { name: '정렬', exact: true }).click();
      await n
        .getByRole('button', { name: /카테고리 순서 이동/ })
        .first()
        .waitFor();
      await capture(p, 'long-sort', w, false);
      const last = n.getByRole('button', {
        name: '30번째 제30회 지역과 함께하는 SW 창의융합 프로젝트 대회 순서 이동',
        exact: true,
      });
      await last.scrollIntoViewIfNeeded();
      await capture(p, 'long-sort-last', w, false);
      const box = await last.boundingBox();
      assert.ok(box.y >= 0 && box.y + box.height <= p.viewportSize().height);
      assert.equal(box.width, 44);
      assert.equal(box.height, 44);
      ok(`${w} long sort names / final handle / 44px target`);
      await n.getByRole('button', { name: '정렬 편집 취소' }).click();
      await n.getByRole('button', { name: '정렬', exact: true }).waitFor();
      assert.equal(await p.evaluate(() => window.__sidebarQa.requests.length), 0);
      ok(`${w} sort cancel has no writes`);
      await c.close();
      if (failures.length || qa.errors.length) throw Error([...failures, ...qa.errors].join('\n'));
    }
    for (const mode of ['invalid', 'unavailable']) {
      const c = await b.newContext({
        viewport: { width: 1440, height: 900 },
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
        reducedMotion: 'reduce',
        serviceWorkers: 'allow',
      });
      await qa.guardNetwork(c);
      await c.addInitScript((mode) => {
        const key = 'opus:contest-sidebar-width';
        if (mode === 'invalid') {
          localStorage.setItem(key, '{"width":390}');
        } else {
          for (const method of ['getItem', 'setItem', 'removeItem']) {
            const original = Storage.prototype[method];
            Storage.prototype[method] = function (k, ...args) {
              if (k === key) throw new DOMException('Unavailable', 'SecurityError');
              return original.call(this, k, ...args);
            };
          }
        }
      }, mode);
      const p = await c.newPage();
      p.on('pageerror', (e) => failures.push(e.message));
      await setup(p);
      await fixtures(p);
      const h = p.getByRole('separator', { name: '대회 목록 너비 조절' });
      assert.equal(await h.getAttribute('aria-valuenow'), '280');
      await h.focus();
      await p.keyboard.press('End');
      assert.equal(await h.getAttribute('aria-valuenow'), '400');
      await p.getByRole('button', { name: '사이드바 너비 기본값 복원' }).click();
      assert.equal(await h.getAttribute('aria-valuenow'), '280');
      await capture(p, 'storage-' + mode, 1440, false);
      ok(`storage ${mode} fallback / resize / reset`);
      await c.close();
    }
  } catch (e) {
    failures.push(e.stack || String(e));
    console.error(e);
    process.exitCode = 1;
  } finally {
    await b.close();
    fs.writeFileSync(
      path.join(out, 'state-checks.json'),
      JSON.stringify({ behavior, checks, failures: [...failures, ...qa.errors] }, null, 2),
    );
  }
})();

```


## sidebar-304-extra.cjs

```javascript
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
process.argv[2] ||= 'sidebar304-extra';
const { setup, fixtures, settle, open, close, capture, qa, out, checks, failures } = require('./sidebar-304.cjs');
const behavior = [];
const ok = (s) => {
  behavior.push(s);
  console.log('PASS', s);
};
(async () => {
  const b = await qa.chromium.launch({ channel: 'chromium', headless: true });
  try {
    for (const w of [350, 1024, 1279, 1280]) {
      const c = await b.newContext({
        viewport: { width: w, height: 900 },
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
        serviceWorkers: 'allow',
        reducedMotion: 'reduce',
      });
      await qa.guardNetwork(c);
      const p = await c.newPage();
      p.on('pageerror', (e) => failures.push(e.message));
      await setup(p);
      await fixtures(p);
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.equal(overflow, 0);
      await capture(p, 'header', w, false);
      if (w < 1280) {
        const trigger = p.getByRole('button', { name: '대회 목록 열기' });
        const button = await trigger.boundingBox();
        const logo = await p.locator('header img:visible').boundingBox();
        const login = await p.getByRole('button', { name: '로그인 / 회원가입', exact: true }).boundingBox();
        assert.ok(logo.x + logo.width <= button.x);
        assert.ok(button.x + button.width <= login.x);
        assert.ok(login.x + login.width <= w);
        assert.ok(button.height >= 44);
        await open(p, w);
        await capture(p, 'drawer', w, false);
        const box = await p.getByRole('dialog').boundingBox();
        assert.ok(box.x >= 0 && box.width <= w - 32);
        await close(p, w);
      } else {
        assert.equal(
          await p.getByRole('separator', { name: '대회 목록 너비 조절' }).getAttribute('aria-valuemax'),
          '320',
        );
        assert.equal(await p.getByRole('button', { name: '대회 목록 열기' }).isVisible(), false);
      }
      ok(`${w} header bounds / logo before navigation / breakpoint`);
      await c.close();
    }
    const c = await b.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 1,
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
      serviceWorkers: 'allow',
      reducedMotion: 'reduce',
    });
    await qa.guardNetwork(c);
    const p = await c.newPage();
    p.on('pageerror', (e) => failures.push(e.message));
    await setup(p);
    await fixtures(p);
    await p.evaluate(async () => {
      const { useTokenStore } = await import('/src/stores/useTokenStore.ts');
      const e = (v) =>
        btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(v))))
          .replace(/=/g, '')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');
      useTokenStore
        .getState()
        .setToken(e({ alg: 'none' }) + '.' + e({ sub: '9001', name: 'QA 관리자', roles: ['ROLE_관리자'] }) + '.mock');
    });
    await open(p, 390);
    const n = p.getByRole('navigation', { name: '대회 사이드바' });
    await n.getByRole('button', { name: '정렬', exact: true }).click();
    await n.getByRole('button', { name: '직접 정렬', exact: true }).first().click();
    const first = n.getByRole('button', { name: '1번째 창의융합 SW해커톤 카테고리 순서 이동', exact: true });
    const second = n.getByRole('button', { name: '2번째 졸업과제 카테고리 순서 이동', exact: true });
    const a = await first.boundingBox(),
      z = await second.boundingBox();
    const x = a.x + a.width / 2,
      y = a.y + a.height / 2,
      target = z.y + z.height / 2;
    const session = await c.newCDPSession(p);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 8; i++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y + ((target - y) * i) / 8 }],
      });
      await p.waitForTimeout(75);
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await n.getByRole('button', { name: '1번째 졸업과제 카테고리 순서 이동', exact: true }).waitFor();
    await capture(p, 'touch-sort', 390, false);
    await n.getByRole('button', { name: '저장', exact: true }).click();
    await n.getByRole('button', { name: '정렬', exact: true }).waitFor();
    assert.deepEqual(
      await p.evaluate(() => window.__sidebarQa.requests.find((r) => r.path === '/categories/sort/custom').body),
      [
        { categoryId: 2, itemOrder: 1 },
        { categoryId: 1, itemOrder: 2 },
      ],
    );
    ok('390 touch category reorder / exact save payload');
    await n.getByRole('button', { name: '정렬', exact: true }).click();
    await n.getByRole('button', { name: '창의융합 SW해커톤 대회 정렬 설정', exact: true }).click();
    await p
      .getByRole('dialog')
      .filter({ has: p.getByText('대회 순서', { exact: true }) })
      .waitFor();
    await capture(p, 'nested-sort-settings', 390, false);
    await p.keyboard.press('Escape');
    await p.getByText('대회 순서', { exact: true }).waitFor({ state: 'hidden' });
    assert.equal(await p.locator('#contest-navigation-drawer').isVisible(), true);
    assert.equal(await p.getByText('대회 순서', { exact: true }).isVisible(), false);
    assert.equal(
      await n
        .getByRole('button', { name: '창의융합 SW해커톤 대회 정렬 설정', exact: true })
        .evaluate((e) => e === document.activeElement),
      true,
    );
    ok('390 nested popup Escape leaves drawer open and restores focus');
    await p.setViewportSize({ width: 390, height: 420 });
    await capture(p, 'short-drawer', 390, false);
    const closeButton = p.getByRole('button', { name: '대회 목록 닫기' });
    const box = await closeButton.boundingBox();
    assert.ok(box.y >= 0 && box.y + box.height <= 420);
    await n.getByRole('button', { name: '정렬 편집 취소' }).click();
    await closeButton.click();
    await p.getByRole('dialog').waitFor({ state: 'hidden' });
    ok('390x420 close/cancel reachable');
    await c.close();
    if (failures.length || qa.errors.length) throw Error([...failures, ...qa.errors].join('\n'));
  } catch (e) {
    failures.push(e.stack || String(e));
    console.error(e);
    process.exitCode = 1;
  } finally {
    await b.close();
    fs.writeFileSync(
      path.join(out, 'extra-checks.json'),
      JSON.stringify({ behavior, checks, failures: [...failures, ...qa.errors] }, null, 2),
    );
  }
})();

```


## sidebar-304-integration.cjs

```javascript
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
process.env.ADMIN_QA_BASE_URL ||= 'http://127.0.0.1:4200';
process.env.ADMIN_QA_HIDE_DEVTOOLS = '1';
process.argv[2] ||= 'sidebar304-integration-header';
const admin = require('./admin-298.cjs');
const sidebar = require('./sidebar-304.cjs');
const { qa, out, checks, failures, capture } = admin;
const behavior = [];
(async () => {
  const b = await qa.chromium.launch({ channel: 'chromium', headless: true });
  try {
    for (const width of [1440, 768, 390, 350]) {
      const c = await b.newContext({
        viewport: { width, height: 900 },
        locale: 'ko-KR',
        timezoneId: 'Asia/Seoul',
        reducedMotion: 'reduce',
        serviceWorkers: 'allow',
      });
      await qa.guardNetwork(c);
      const p = await c.newPage();
      p.on('pageerror', (e) => failures.push(e.message));
      await admin.setup(p);
      await sidebar.fixtures(p);
      await sidebar.settle(p);
      await capture(p, 'signed-home', width, false);
      const trigger = p.getByRole('button', { name: '대회 목록 열기', exact: true });
      if (width < 1280) {
        await trigger.click();
        await p.locator('#contest-navigation-drawer').waitFor();
        await p.keyboard.press('Escape');
        await p.locator('#contest-navigation-drawer').waitFor({ state: 'hidden' });
        assert.equal(await trigger.evaluate((e) => e === document.activeElement), true);
      }
      await admin.navigate(p, '/admin');
      await capture(p, 'admin-header', width, false);
      assert.equal(await trigger.count(), 0);
      const menu = p.getByRole('button', { name: '관리자 메뉴 열기', exact: true });
      if (width < 1024) {
        await menu.click();
        await p.getByRole('dialog').waitFor();
        await capture(p, 'admin-drawer', width, false);
        await p.keyboard.press('Escape');
        await p.getByRole('dialog').waitFor({ state: 'hidden' });
        assert.equal(await menu.evaluate((e) => e === document.activeElement), true);
      } else assert.equal(await menu.isVisible(), false);
      await sidebar.nav(p, '/contest/1');
      await capture(p, 'signed-contest', width, false);
      assert.equal(await menu.count(), 0);
      if (width < 1280) {
        await trigger.click();
        await p.getByRole('button', { name: '정렬', exact: true }).waitFor();
        await p.keyboard.press('Escape');
        await p.getByRole('dialog').waitFor({ state: 'hidden' });
      }
      behavior.push(`${width} public/admin navigation independent and focus returns`);
      console.log('PASS', behavior.at(-1));
      await c.close();
    }
    if (failures.length || qa.errors.length) throw Error([...failures, ...qa.errors].join('\n'));
  } catch (e) {
    failures.push(e.stack || String(e));
    console.error(e);
    process.exitCode = 1;
  } finally {
    await b.close();
    fs.writeFileSync(
      path.join(out, 'integration-checks.json'),
      JSON.stringify({ behavior, checks, failures: [...failures, ...qa.errors] }, null, 2),
    );
  }
})();

```
