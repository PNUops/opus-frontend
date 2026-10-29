# #299 재현 시나리오

이 문서는 기존 #314의 QA 기반을 사용하는 작업별 재현 기록이다. 별도 Playwright 패키지, 설정 또는 CI를 추가하지 않는다.

## 준비

1. #314의 기존 `docs/visual-qa.md`에 설명된 설치/실행 환경을 사용한다. 기준 커밋은 아래에 기록했다.
2. 검증 대상 #299 checkout에서 `VITE_USE_MSW=true`, 빈 `VITE_API_BASE_URL`로 Vite를 127.0.0.1:4195에 실행한다. develop 기준 화면은 별도 checkout의 4194를 사용했다.
3. 아래 파일별 코드 블록을 기존 QA checkout의 `.qa/<파일명>`으로 저장한다. 모든 파일을 같은 폴더에 둔다. 도우미는 기존 `tests/browser-visual-qa.cjs`의 Chromium/네트워크 가드/공개 화면 준비 조건을 재사용한다. 해당 스크립트 내부를 변경하면 이 진단용 도우미도 검토해야 한다.
4. `ADMIN_QA_BASE_URL=http://127.0.0.1:4195`, `ADMIN_QA_HIDE_DEVTOOLS=1`을 지정한다. 기존 브라우저 경로를 사용했다면 같은 `PLAYWRIGHT_BROWSERS_PATH`도 지정한다. 실제 계정, 운영 API 또는 민감한 데이터를 사용하지 않는다.

기준 QA 커밋: `545203c4e13aed2e90adc1c01c87db5bbd546b73`.

## 실행과 판정

기존 QA checkout에서 다음 순서로 실행한다. `ADMIN_QA_HIDE_DEVTOOLS`는 캡처에서 개발 전용 TanStack 패널만 숨긴다.

```text
node .qa/admin-298.cjs mobile299-pages-final
node .qa/admin-299.cjs mobile299-verified
node .qa/admin-299-stress.cjs mobile299-stress-final
node .qa/admin-298-extra.cjs mobile299-extra
```

출력은 `.qa/admin-298-<인자>`에 저장된다. JSON의 failures, 문서 넘침, 동작 판정과 PNG를 함께 확인한다. 1440×900 / 768×1024 / 390×844이며 작은 높이 시나리오는 390×420이다. 스크린샷 생성만으로 디자인 검토를 완료하지 않는다.

기준 화면은 ADMIN_QA_BASE_URL을 4194로 바꾼 뒤 `node .qa/admin-299-before.cjs mobile299-before-viewport`로 생성한다. 공개 화면은 기존 #314 스크립트에 VISUAL_QA_BASE_URL=4195와 별도 출력 폴더를 지정해 캡처하고 develop의 13개 PNG와 비교했다. 준비된 브라우저/폰트/로케일이 같아야 이미지 비교가 의미 있다.

## #338과의 임시 조합

`integration-338.patch`는 #338 커밋 `193a5ddee112bd57a4c9d063844436d429cf3fb5`에 적용하는 검토용 해결안이다. #299의 소스 커밋은 `2d1160c`이며 두 기능 브랜치를 서로 의존하게 만들지 않았다. 별도 깨끗한 checkout에서 패치를 적용하고 4196으로 Vite를 실행한 뒤 ADMIN_QA_BASE_URL을 4196으로 변경한다.

```text
node .qa/admin-298.cjs integration299-pages
node .qa/admin-299.cjs integration299-interactions
node .qa/admin-299-stress.cjs integration299-stress
node .qa/admin-298-states.cjs integration299-states-final
```

마지막 시나리오는 #338의 저장 중 닫힘 방지, 오류 후 입력 유지, 재시도 기능을 함께 점검한다. 기본 develop의 동작을 이 시나리오에 맞춰 변경하는 테스트가 아니다. 모바일에서는 표 대신 이름이 있는 목록의 행과 필터 결과를 확인하도록 선택자를 조정했다.

## admin-298.cjs

```js
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

## admin-299.cjs

```js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.argv[2]=process.argv[2]||'mobile299-interactions';
const {setup,navigate,capture,qa,out,checks,failures,base}=require('./admin-298.cjs');
const behavior=[];
const settle=async p=>{await p.waitForFunction(()=>window.__qaQueryClient.isFetching()===0);await p.waitForLoadState('networkidle');await p.waitForFunction(()=>document.querySelectorAll('.animate-pulse').length===0);};
async function snap(p,name,w,full=true){await settle(p);if(full)await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await capture(p,name,w,full);assert.equal(checks.at(-1).overflow,0,`${name}: horizontal overflow`);}
async function dialogBounds(p,w){await p.getByRole('dialog').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{})));});const b=await p.getByRole('dialog').boundingBox();assert.ok(b&&b.x>=-1&&b.x+b.width<=w+1&&b.y>=-1&&b.y+b.height<=p.viewportSize().height+1,JSON.stringify(b));}
async function fixture(p){await p.evaluate(async()=>{
 const{worker}=await import('/src/mocks/browsers.ts');const{http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');
 const row={submissionId:1,teamId:1,teamName:'테스트 프로젝트팀',trackName:'SW 개발',submissionItemName:'최종 발표 자료',status:'SUBMITTED',firstSubmittedAt:'2026-10-20T13:00:00',lastModifiedAt:'2026-10-20T13:00:00'};
 window.__mobileQa={rows:[row],archives:[{submissionTypeId:1,submissionItemName:'최종 발표 자료',trackId:1,trackName:'SW 개발',submittedTeamCount:1,estimatedSize:1048576},{submissionTypeId:2,submissionItemName:'중간 보고서',trackId:2,trackName:'서비스 기획',submittedTeamCount:2,estimatedSize:2097152}],downloads:[],sort:[]};
 worker.use(
 http.get('/api/admin/contests/:id/submissions',()=>HttpResponse.json(window.__mobileQa.rows)),
 http.get('/api/contests/:id/submissions/downloads',()=>HttpResponse.json({targets:window.__mobileQa.archives})),
 http.post('/api/contests/:id/submissions/downloads',async({request})=>{window.__mobileQa.downloads.push(await request.json());return new HttpResponse(new Uint8Array([80,75,3,4]),{headers:{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="qa-only.zip"'}});}),
 http.get('/api/contests/:id/submissions/:submissionId',()=>HttpResponse.json({...row,projectOverview:'안전한 시연용 프로젝트 설명입니다. '.repeat(8),deadlineAt:'2026-11-01T18:00:00',files:[{fileId:1,fileName:'팀명과발표주제가함께들어있는긴이름의최종발표자료.pdf',fileSize:1024}],feedbackCount:1})),
 http.get('/api/contests/:id/submissions/:submissionId/feedbacks',()=>HttpResponse.json([{feedbackId:1,memberId:9002,memberName:'테스트 교수',memberRoleType:'ROLE_교수',description:'분석의 근거와 구현 과정을 잘 설명했습니다. 보완 사항은 다음 발표에 반영해주세요. '.repeat(4),createdAt:'2026-10-20T13:00:00',updatedAt:'2026-10-20T13:00:00',files:[]}])),
 http.get('/api/admin/teams/:id/awards',()=>HttpResponse.json({awards:[{awardId:1,awardName:'대상',awardColor:'#f59e0b'}]})),
 http.put('/api/contests/:id/sort/custom',async({request})=>{window.__mobileQa.sort.push(await request.json());return HttpResponse.json({});}),
 http.get('/api/contests/:id/vote-log',()=>HttpResponse.json({content:[{votedAt:'2026-10-20T13:00:00',teamName:'테스트 프로젝트팀',voterName:'테스트 사용자',voterEmail:'reviewer@example.test'}],totalElements:1,totalPages:1,size:20,number:0}))
 );
});}
async function main(){const browser=await qa.chromium.launch({headless:true});try{
 for(const width of JSON.parse(process.env.ADMIN_QA_WIDTHS || '[1440,768,390]')){
  const context=await browser.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow',acceptDownloads:true});await qa.guardNetwork(context);
  const p=await context.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);await fixture(p);
  await navigate(p,'/admin/contest/1/submission-manage');
  if(width<1024){
   const trigger=p.getByRole('button',{name:'관리자 메뉴 열기',exact:true});await trigger.click();await p.getByRole('dialog',{name:'관리자 메뉴'}).waitFor();await dialogBounds(p,width);await snap(p,'navigation',width,false);
   await p.getByRole('button',{name:'대회 설정',exact:true}).click();assert.equal(await p.getByRole('button',{name:'대회 설정',exact:true}).getAttribute('aria-expanded'),'true');
   await p.getByRole('button',{name:'대회 설정',exact:true}).click();assert.equal(await p.getByRole('button',{name:'대회 설정',exact:true}).getAttribute('aria-expanded'),'false');
   await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);
   await trigger.click();await p.getByRole('link',{name:'제출 자료 관리',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});
   await trigger.click();await p.getByRole('button',{name:'대회 콘텐츠',exact:true}).click();await p.getByRole('link',{name:'대회 공지',exact:true}).click();await p.getByRole('heading',{name:'공지 관리',exact:true}).waitFor();await p.getByRole('dialog').waitFor({state:'hidden'});
   await trigger.click();await p.setViewportSize({width:1440,height:900});await p.getByRole('dialog').waitFor({state:'hidden'});await p.getByRole('complementary',{name:'관리자 사이드 내비게이션'}).waitFor();assert.equal(await p.evaluate(()=>document.body.style.pointerEvents),'');
   await p.setViewportSize({width,height:width===390?844:1024});await trigger.waitFor();assert.equal(await trigger.getAttribute('aria-expanded'),'false');behavior.push(`${width} navigation bounds, tap collapse, Escape focus, same route, route change, breakpoint cleanup`);
  }
  await navigate(p,'/admin/contest/1/submission-manage');await p.getByRole('button',{name:'제출 현황',exact:true}).click();await settle(p);await snap(p,'submission-status',width);
  if(width===390){
   const f=p.getByRole('button',{name:'필터',exact:true});await f.click();await p.getByRole('dialog',{name:'제출 현황 필터'}).waitFor();await dialogBounds(p,width);await snap(p,'filters',width,false);
   await p.getByLabel('제출 상태',{exact:true}).click();await p.getByRole('option',{name:'미제출',exact:true}).click();await p.getByRole('button',{name:'결과 보기',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});await p.getByText('제출 현황이 없어요.',{exact:true}).waitFor();await snap(p,'filter-empty',width);
   await p.getByRole('button',{name:/필터/}).click();await p.getByRole('button',{name:'초기화',exact:true}).click();await p.getByLabel('제출 상태',{exact:true}).click();await p.getByRole('listbox').waitFor();await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.keyboard.press('Escape');assert.equal(await p.getByRole('dialog').count(),1);await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await f.evaluate(e=>e===document.activeElement),true);
   await f.click();await p.setViewportSize({width:390,height:420});await dialogBounds(p,390);await snap(p,'filters-short',390,false);await p.getByRole('button',{name:'결과 보기',exact:true}).click();await p.setViewportSize({width:390,height:844});
   await f.click();await p.setViewportSize({width:768,height:1024});await p.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await p.evaluate(()=>document.body.style.pointerEvents),'');await p.setViewportSize({width:390,height:844});behavior.push('390 bottom sheet selection/reset, nested Escape, focus, short viewport, breakpoint cleanup');
  }
  await p.getByRole('button',{name:'상세보기',exact:true}).click();await p.getByRole('heading',{name:'제출 상세보기'}).waitFor();await settle(p);await dialogBounds(p,width);await snap(p,'submission-detail',width,false);await p.keyboard.press('Escape');
  await p.getByRole('button',{name:'피드백',exact:true}).click();await p.getByRole('heading',{name:'피드백 보기'}).waitFor();await settle(p);await dialogBounds(p,width);await snap(p,'submission-feedback',width,false);await p.keyboard.press('Escape');
  await p.getByRole('button',{name:'제출 파일 다운로드',exact:true}).click();await settle(p);await snap(p,'submission-download',width);
  const allName=width<1024?'표시된 항목 전체 선택':'전체 선택';const all=p.getByRole('checkbox',{name:allName,exact:true});await all.focus();await p.keyboard.press('Space');assert.equal(await all.isChecked(),true);
  const downloaded=p.waitForEvent('download');await p.getByRole('button',{name:'선택 다운로드',exact:true}).click();await downloaded;assert.deepEqual(await p.evaluate(()=>window.__mobileQa.downloads),[{targets:[{submissionTypeId:1,trackId:1},{submissionTypeId:2,trackId:2}]}]);behavior.push(`${width} accessible select-all and exact archive targets`);
  if(width===390){await p.getByRole('button',{name:'필터',exact:true}).click();await p.getByLabel('분과',{exact:true}).click();await p.getByRole('option',{name:'서비스 기획',exact:true}).click();await snap(p,'download-filters',width,false);await p.getByRole('button',{name:'결과 보기',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await p.getByRole('list',{name:'제출 파일 다운로드 목록'}).getByRole('listitem').count(),1);await p.getByRole('button',{name:/필터/}).click();await p.getByRole('button',{name:'초기화',exact:true}).click();await p.keyboard.press('Escape');assert.equal(await all.isChecked(),false);behavior.push('390 download filter/reset');}
  await p.getByRole('button',{name:'제출 항목 설정',exact:true}).click();await p.getByRole('button',{name:'+ 제출 항목 추가',exact:true}).click();await dialogBounds(p,width);await snap(p,'submission-form',width,false);await p.getByLabel('공개 범위 안내').hover();await p.getByRole('tooltip').waitFor();await snap(p,'visibility-tooltip',width,false);await p.keyboard.press('Escape');await p.keyboard.press('Escape');
  await navigate(p,'/admin/contest/1/sort');await p.evaluate(()=>window.__qaQueryClient.setQueryData(['sortStatus'],'CUSTOM'));await p.getByRole('heading',{name:'직접 설정',exact:true}).waitFor();await snap(p,'custom-sort',width);
  const handles=p.getByRole('button',{name:/순서 변경$/});const before=await handles.allTextContents();const firstName=await handles.first().getAttribute('aria-label');await handles.first().focus();await p.keyboard.press('Space');await p.waitForFunction(()=>document.querySelector('[aria-pressed=true]'));await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.keyboard.press('ArrowDown');await p.waitForFunction(()=>[...document.querySelectorAll('[aria-live]')].some(e=>e.textContent.includes('droppable area 2.')));await p.keyboard.press('Space');await p.waitForFunction(()=>!document.querySelector('[aria-pressed=true]'));assert.notEqual(await handles.first().getAttribute('aria-label'),firstName);await p.getByRole('button',{name:'저장하기',exact:true}).click();await p.waitForFunction(()=>window.__mobileQa.sort.length===1);const payload=await p.evaluate(()=>window.__mobileQa.sort[0]);assert.equal(new Set(payload.map(x=>x.teamId)).size,payload.length);assert.ok(payload.every((x,i)=>x.itemOrder===i+1));behavior.push(`${width} keyboard reorder and complete ordered save payload`);
  await navigate(p,'/admin/contest/1/roles');await snap(p,'roles',width);await p.getByRole('button',{name:/지도교수 배정/}).click();await dialogBounds(p,width);await snap(p,'role-form',width,false);await p.keyboard.press('Escape');
  await navigate(p,'/admin/contest/1/statistics');await snap(p,'statistics',width);
  await navigate(p,'/admin');await p.getByRole('button',{name:'+ 새 카테고리',exact:true}).click();await dialogBounds(p,width);await snap(p,'category-form',width,false);await p.keyboard.press('Escape');await p.getByRole('button',{name:'+ 새 공지',exact:true}).click();await dialogBounds(p,width);await snap(p,'notice-form',width,false);await p.keyboard.press('Escape');
  await context.close();if(failures.length||qa.errors.length)throw Error([...failures,...qa.errors].join('\n'));
 }
}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await browser.close();fs.writeFileSync(path.join(out,'interaction-checks.json'),JSON.stringify({behavior,checks,failures:[...failures,...qa.errors]},null,2));}}
module.exports={fixture,settle,snap,dialogBounds};
if(require.main===module)void main();

```

## admin-299-stress.cjs

```js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.argv[2]=process.argv[2]||'mobile299-stress';
const{setup,navigate,capture,qa,out,checks,failures}=require('./admin-298.cjs');
const{fixture,settle,snap,dialogBounds}=require('./admin-299.cjs');
const behavior=[];
(async()=>{const b=await qa.chromium.launch({headless:true});try{
for(const width of [1440,768,390]){
 const c=await b.newContext({viewport:{width,height:width===390?844:1024},locale:'ko-KR',timezoneId:'Asia/Seoul',hasTouch:width===390,reducedMotion:'reduce',serviceWorkers:'allow'});await qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);await fixture(p);
 await p.evaluate(async()=>{const{worker}=await import('/src/mocks/browsers.ts');const{http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');window.__mobileQa.rows[0].teamName='긴프로젝트팀이름'.repeat(8);window.__mobileQa.rows[0].trackName='서비스와소프트웨어융합개발분과'.repeat(4);window.__mobileQa.rows[0].submissionItemName='최종발표자료및설계구현보고서'.repeat(6);window.__mobileQa.archives[0].submissionItemName='최종발표자료및설계구현보고서'.repeat(6);
 worker.use(http.get('/api/contests/:id/staff',()=>HttpResponse.json([{contestMemberId:1,memberId:9002,name:'긴사용자이름'.repeat(8),email:'verylongsyntheticemailaddress'.repeat(4)+'@example.test',roleType:'ROLE_교수',teams:[{teamId:1,teamName:'공백없는아주긴담당팀이름'.repeat(8)}]}])));
 });
 await navigate(p,'/admin/contest/1/submission-manage');await p.getByRole('button',{name:'제출 현황',exact:true}).click();await snap(p,'status-long',width);
 if(width===390){await p.getByRole('button',{name:'필터',exact:true}).click();await p.getByLabel('제출 항목',{exact:true}).click();await p.getByRole('listbox').waitFor();await snap(p,'filter-long-options',width,false);const r=await p.getByRole('listbox').boundingBox();assert.ok(r.x>=0&&r.x+r.width<=width);await p.keyboard.press('Escape');await p.keyboard.press('Escape');}
 await p.getByRole('button',{name:'제출 파일 다운로드',exact:true}).click();await snap(p,'download-long',width);
 await navigate(p,'/admin/contest/1/roles');await snap(p,'roles-long',width);
 await navigate(p,'/admin/contest/1/awards');await p.getByRole('combobox').last().click();await p.getByRole('option').filter({hasText:'1. 코드크래프트'}).click();await p.getByRole('button',{name:'상훈 선택',exact:true}).click();await p.getByLabel('새 상훈 이름').fill('새로운상훈이름'.repeat(12));await p.getByText('새로운상훈이름'.repeat(12),{exact:true}).first().waitFor();await snap(p,'award-long',width,false);await p.keyboard.press('Escape');
 if(width===390){
  await navigate(p,'/admin/contest/1/sort');await p.evaluate(()=>window.__qaQueryClient.setQueryData(['sortStatus'],'CUSTOM'));const h=p.getByRole('button',{name:/순서 변경$/});await h.first().waitFor();await h.first().scrollIntoViewIfNeeded();const original=await h.first().getAttribute('aria-label');const a=await h.first().boundingBox(),z=await h.nth(1).boundingBox();const s=await c.newCDPSession(p);const x=a.x+a.width/2,y=a.y+a.height/2,dy=z.y+z.height/2-y;await s.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=16;i++){await s.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+dy*i/16}]});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));}await s.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForFunction(old=>document.querySelector('button[aria-label$="순서 변경"]')?.getAttribute('aria-label')!==old,original);behavior.push('390 touch drag reorders rows');await snap(p,'sort-touch',390);
  await navigate(p,'/admin/contest/1/submission-manage');await p.getByRole('button',{name:'+ 제출 항목 추가',exact:true}).click();await p.setViewportSize({width:390,height:420});await dialogBounds(p,390);await p.getByRole('button',{name:'추가',exact:true}).scrollIntoViewIfNeeded();await snap(p,'form-short-footer',390,false);await p.keyboard.press('Escape');await p.setViewportSize({width:390,height:844});behavior.push('390 short viewport form footer reachable');
 }
 await c.close();if(failures.length||qa.errors.length)throw Error([...failures,...qa.errors].join('\n'));
}
}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'stress-checks.json'),JSON.stringify({behavior,checks,failures:[...failures,...qa.errors]},null,2));}})();

```

## admin-298-extra.cjs

```js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.argv[2]=process.argv[2]||'extra';
const {setup,navigate,capture,qa,out,checks,failures,base}=require('./admin-298.cjs');
const behavior=[];
async function settle(page){await page.waitForFunction(()=>window.__qaQueryClient.isFetching()===0);await page.waitForLoadState('networkidle');}
async function setRole(page,role){await page.evaluate(async role=>{const{useTokenStore}=await import('/src/stores/useTokenStore.ts');const e=v=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(v)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');useTokenStore.getState().setToken(role?e({alg:'none'})+'.'+e({sub:'9001',name:'QA 사용자',roles:[role]})+'.mock':null);},role);}
(async()=>{const browser=await qa.chromium.launch({headless:true});try{
 for(const width of [1440,768,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await qa.guardNetwork(context);
  const page=await context.newPage();page.on('pageerror',e=>failures.push(e.message));await setup(page);
  await page.evaluate(async()=>{const{worker}=await import('/src/mocks/browsers.ts');const{http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');worker.use(
    http.get('/api/contests/:id/submissions/downloads',()=>HttpResponse.json({targets:[{submissionTypeId:1,submissionItemName:'최종 발표 자료',trackId:1,trackName:'SW 개발',submittedTeamCount:1,estimatedSize:1024}]})),
    http.get('/api/contests/:id/submissions/:submissionId',()=>HttpResponse.json({submissionId:1,teamId:1,teamName:'테스트 프로젝트팀',projectOverview:'다양한 사용자 환경을 고려하는 안전한 시연용 프로젝트 설명입니다.',trackName:'SW 개발',submissionItemName:'최종 발표 자료',status:'SUBMITTED',deadlineAt:'2026-11-01T18:00:00',firstSubmittedAt:'2026-10-20T13:00:00',lastModifiedAt:'2026-10-20T13:00:00',files:[{fileId:1,fileName:'팀명과발표주제가함께들어있는긴이름의최종발표자료.pdf',fileSize:1024}],feedbackCount:1})),
    http.get('/api/contests/:id/submissions/:submissionId/feedbacks',()=>HttpResponse.json([{feedbackId:1,memberId:9002,memberName:'테스트 교수',memberRoleType:'ROLE_교수',description:'분석의 근거와 구현 과정을 잘 설명했습니다. 보완 사항은 다음 발표에 반영해주세요. '.repeat(4),createdAt:'2026-10-20T13:00:00',updatedAt:'2026-10-20T13:00:00',files:[]}]))
  );});
  await navigate(page,'/admin/contest/1/submission-manage');await page.getByRole('button',{name:'제출 현황',exact:true}).click();await settle(page);await capture(page,'submission-status',width);
  await page.getByRole('button',{name:'상세보기',exact:true}).click();await page.getByRole('heading',{name:'제출 상세보기'}).waitFor();await settle(page);await capture(page,'submission-detail',width,false);await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'피드백',exact:true}).click();await page.getByRole('heading',{name:'피드백 보기'}).waitFor();await settle(page);await capture(page,'submission-feedback',width,false);await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'제출 파일 다운로드',exact:true}).click();await settle(page);await capture(page,'submission-download',width);
  await navigate(page,'/admin/contest/1/submission-manage');await page.getByRole('button',{name:'제출 항목 설정',exact:true}).click();await page.getByRole('button',{name:'+ 제출 항목 추가',exact:true}).click();await page.getByLabel('공개 범위 안내').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.getByLabel('공개 범위 안내').hover();await page.getByRole('tooltip').waitFor();await capture(page,'visibility-tooltip',width,false);assert.equal(await page.getByRole('tooltip').count(),1);const tooltipBounds=await page.locator('[data-slot=tooltip-content]').boundingBox();assert.ok(tooltipBounds.x>=15&&tooltipBounds.x+tooltipBounds.width<=width-15,'tooltip horizontal bounds');await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  await navigate(page,'/admin');
  await page.evaluate(async()=>{window.__adminQa.categoryMode='empty';window.__qaQueryClient.setDefaultOptions({queries:{retry:false,refetchOnWindowFocus:false}});const{worker}=await import('/src/mocks/browsers.ts');const{http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');worker.use(http.get('/api/categories',async()=>{const mode=window.__adminQa.categoryMode;if(mode==='loading')await new Promise(r=>window.__adminQa.releaseCategory=r);if(mode==='error')return HttpResponse.json({message:'시연 조회 오류'},{status:500});return HttpResponse.json(mode==='long'?[{categoryId:1,categoryName:'긴카테고리이름'.repeat(60),updatedAt:'2026-10-01'}]:[]);}));await window.__qaQueryClient.resetQueries({queryKey:['category']});});
  await settle(page);await page.getByText('데이터가 없습니다.',{exact:true}).first().waitFor();await capture(page,'category-empty',width);
  await page.evaluate(()=>{window.__adminQa.categoryMode='loading';void window.__qaQueryClient.resetQueries({queryKey:['category']});});await page.locator('.animate-pulse').first().waitFor();await capture(page,'category-loading',width);
  await page.evaluate(()=>window.__adminQa.releaseCategory());await settle(page);
  await page.evaluate(()=>{window.__adminQa.categoryMode='error';void window.__qaQueryClient.resetQueries({queryKey:['category']});});await page.getByText('데이터 조회 중 오류가 발생했습니다.',{exact:true}).waitFor();await capture(page,'category-error',width);
  await page.evaluate(()=>{window.__adminQa.categoryMode='long';});await page.getByRole('button',{name:'다시 시도',exact:true}).click();await page.getByText('긴카테고리이름'.repeat(60),{exact:true}).waitFor();await settle(page);await page.waitForFunction(()=>document.querySelectorAll('.animate-pulse').length===0);await capture(page,'category-long',width);behavior.push(`${width} query empty/loading/error/retry/long`);
  await setRole(page,'ROLE_학생');await page.getByText('관리자 권한이 없습니다.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'+ 새 카테고리',exact:true}).count(),0);await capture(page,'student-denied',width);behavior.push(`${width} student guard`);
  await setRole(page,null);await page.getByText('관리자 권한이 없습니다.',{exact:true}).waitFor();await capture(page,'anonymous-denied',width);behavior.push(`${width} anonymous guard`);
  await context.close();if(failures.length||qa.errors.length)throw Error([...failures,...qa.errors].join('\n'));
 }
}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await browser.close();fs.writeFileSync(path.join(out,'extra-checks.json'),JSON.stringify({behavior,checks,failures:[...failures,...qa.errors]},null,2));}})();

```

## admin-299-before.cjs

```js
const fs=require('node:fs'),path=require('node:path');
const{setup,navigate,capture,qa,out,checks,failures}=require('./admin-298.cjs');
(async()=>{const b=await qa.chromium.launch({headless:true});try{const c=await b.newContext({viewport:{width:390,height:844},locale:'ko-KR',reducedMotion:'reduce',serviceWorkers:'allow'});await qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);for(const [name,url]of [['projects','/admin/contest/1/projects'],['submission','/admin/contest/1/submission-manage']]){await navigate(p,url);await p.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));await capture(p,name,390,false);}await c.close();}catch(e){failures.push(e.stack);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'before-checks.json'),JSON.stringify({checks,failures:[...failures,...qa.errors]},null,2));}})();

```

## admin-298-states.cjs

```js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.argv[2]=process.argv[2]||'states';
const {setup,navigate,capture,qa,out,checks,failures,base}=require('./admin-298.cjs');
const behavior=[];
function ok(name){behavior.push(name);console.log('PASS',name);}
async function fixtures(page){
 await page.evaluate(async()=>{
  const {worker}=await import('/src/mocks/browsers.ts');
  const {http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');
  window.__adminQa.releases=[];
  const mutation=async({request})=>{
   window.__adminQa.requests.push({method:request.method,path:new URL(request.url).pathname});
   const status=await new Promise(resolve=>window.__adminQa.releases.push(resolve));
   return status===200?HttpResponse.json({}):HttpResponse.json({message:'시연용 저장 실패입니다.'},{status});
  };
  const endpoints=['/api/categories','/api/categories/:id','/api/notices','/api/notices/:id','/api/contests/:id/tracks','/api/contests/:id/tracks/:trackId','/api/contests/:id/notices','/api/contests/:id/notices/:noticeId','/api/contests/:id/staff/batch','/api/contests/:id/staff/:staffId','/api/contests/:id/submission-items','/api/contests/:id/submission-items/:itemId','/api/teams/:id'];
  worker.use(...endpoints.flatMap(url=>[http.post(url,mutation),http.patch(url,mutation),http.delete(url,mutation)]),
   http.get('/api/admin/members/search',()=>HttpResponse.json([{memberId:9002,name:'테스트 교수',email:'professor@example.test',roleType:'ROLE_교수'}])),
   http.get('/api/contests/:id/teams',()=>HttpResponse.json([{teamId:1,teamName:'테스트 프로젝트팀',projectName:'안전한 시연 프로젝트'}]))
  );
 });
}
async function release(page,status){await page.evaluate(status=>{const pending=window.__adminQa.releases.splice(0);pending.forEach(resolve=>resolve(status));},status);}
async function saved(page,submit,name,width){
 const before=await page.evaluate(()=>window.__adminQa.requests.length);
 await submit.click();
 await page.waitForFunction(()=>window.__adminQa.releases.length===1);
 assert.equal(await page.getByRole('dialog').count(),1);
 assert.equal(await page.getByRole('dialog').locator('button[aria-busy="true"]').isDisabled(),true);
 await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('dialog').count(),1);
 assert.equal(await page.evaluate(()=>window.__adminQa.requests.length),before+1);
 await capture(page,name+'-pending',width,false);
 await release(page,500);
 await page.waitForFunction(()=>!document.querySelector('[role="dialog"] [aria-busy="true"]'));
 await capture(page,name+'-error',width,false);
 const contrast=await page.getByRole('dialog').getByRole('alert').evaluate(el=>{const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.fillStyle=getComputedStyle(el).color;ctx.fillRect(0,0,1,1);const rgb=Array.from(ctx.getImageData(0,0,1,1).data).slice(0,3).map(v=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;});return 1.05/(rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722+0.05);});assert.ok(contrast>=4.5,`${name} error contrast ${contrast}`);
 assert.equal(await page.getByRole('dialog').count(),1);
 await submit.click();
 await page.waitForFunction(()=>window.__adminQa.releases.length===1);
 await release(page,200);
 await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.waitForFunction(()=>window.__qaQueryClient.isFetching()===0);
 ok(`${width} ${name} pending/escape/error/retry/success`);
}
async function rowAction(page,action){
 await page.getByRole('button',{name:'항목 작업',exact:true}).first().click();
 await page.getByRole('button',{name:action,exact:true}).click();
 await page.getByRole('dialog').waitFor();
}
async function modalFit(page,name,width){
 const r=await page.getByRole('dialog').boundingBox();
 assert.ok(r.x>=15&&r.x+r.width<=width-15,`${name} horizontal inset`);
 assert.ok(r.y>=15&&r.y+r.height<=page.viewportSize().height-15,`${name} vertical inset`);
 assert.equal(await page.getByRole('dialog').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,`${name} inner overflow`);
 ok(`${width} ${name} dialog bounds`);
}
if(require.main===module)(async()=>{
 const browser=await qa.chromium.launch({headless:true});
 try{
  for(const width of [1440,768,390]){
   const context=await browser.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});
   await qa.guardNetwork(context);const page=await context.newPage();
   page.on('pageerror',error=>failures.push(error.message));
   await setup(page);await fixtures(page);
   await navigate(page,'/admin');
   const categoryTrigger=page.getByRole('button',{name:'+ 새 카테고리',exact:true});
   await categoryTrigger.click();
   await modalFit(page,'category',width);
   await page.getByRole('button',{name:'추가하기',exact:true}).click();
   assert.equal(await page.getByRole('dialog').count(),1);
   assert.equal(await page.evaluate(()=>window.__adminQa.requests.length),0);
   await page.getByLabel('카테고리 이름').fill('사용자 경험과 접근성을 함께 검토하는 긴 카테고리 이름');
   await saved(page,page.getByRole('button',{name:'추가하기',exact:true}),'category',width);
   assert.equal(await categoryTrigger.evaluate(e=>e===document.activeElement),true);
   ok(`${width} category focus restored`);
   await page.getByRole('button',{name:'+ 새 공지',exact:true}).click();
   await page.getByLabel('제목',{exact:true}).fill('최종 발표 일정과 제출 자료 안내 — 긴 제목 시연');
   await page.getByLabel('본문',{exact:true}).fill('모든 참가자에게 전달하는 안전한 시연용 공지입니다. '.repeat(30));
   await modalFit(page,'notice',width);
   await saved(page,page.getByRole('button',{name:'추가하기',exact:true}),'notice',width);
   await navigate(page,'/admin/contest/1/tracks');
   await page.getByRole('button',{name:'+ 새 분과',exact:true}).click();
   await page.getByRole('button',{name:'추가하기',exact:true}).click();
   assert.equal(await page.getByRole('dialog').count(),1);
   await page.getByLabel('분과 이름').fill('다양한 사용자 환경을 고려한 긴 이름의 SW 개발 분과');
   await saved(page,page.getByRole('button',{name:'추가하기',exact:true}),'track',width);
   await rowAction(page,'수정');await page.getByLabel('분과 이름').fill('수정한 분과');
   await saved(page,page.getByRole('button',{name:'수정하기',exact:true}),'track-edit',width);
   await page.keyboard.press('Escape');
   await navigate(page,'/admin/contest/1/submission-manage');
   const filter=page.getByRole('combobox',{name:'운영 상태',exact:true});
   await filter.focus();await page.keyboard.press('Space');await page.getByRole('option',{name:'마감',exact:true}).click();
   const filteredRows=await page.getByRole('list',{name:'제출 항목 설정 목록',exact:true}).count()
    ?page.getByRole('list',{name:'제출 항목 설정 목록',exact:true}).getByRole('listitem')
    :page.getByRole('table',{name:'제출 항목 설정 목록',exact:true}).locator('tbody tr');
   assert.equal(await filteredRows.count(),1);
   assert.ok((await filteredRows.first().innerText()).includes('마감'));
   await capture(page,'filter-selected',width);ok(`${width} filter keyboard/select`);
   await page.getByRole('button',{name:'+ 제출 항목 추가',exact:true}).click();
   await page.getByRole('dialog').waitFor();await modalFit(page,'submission',width);
   await capture(page,'submission-create',width,false);
   await page.getByLabel('제출 항목 이름',{exact:true}).fill('최종 발표용 자료');
   await page.getByRole('button',{name:'.pdf',exact:true}).click();
   await saved(page,page.getByRole('dialog').getByRole('button',{name:'추가',exact:true}),'submission',width);
   await navigate(page,'/admin/contest/1/roles');
   await page.getByRole('button',{name:'+ 지도교수 배정',exact:true}).click();
   await modalFit(page,'role',width);await capture(page,'role-create',width,false);
   await page.getByLabel('회원 이메일 검색').fill('professor@example.test');
   await page.getByRole('button',{name:'테스트 교수 professor@example.test',exact:true}).click();
   await page.getByRole('button',{name:'담당 팀 선택',exact:true}).focus();await page.keyboard.press('Enter');
   await page.getByRole('button',{name:'테스트 프로젝트팀',exact:true}).click();await page.keyboard.press('Escape');await page.locator('[data-slot="popover-content"]').waitFor({state:'hidden'});assert.equal(await page.getByRole('dialog').count(),1);
   await saved(page,page.getByRole('button',{name:'일괄 배정',exact:true}),'role',width);
   await rowAction(page,'삭제');await modalFit(page,'role-delete',width);
   await saved(page,page.getByRole('dialog').getByRole('button',{name:'삭제',exact:true}),'role-delete',width);
   await page.keyboard.press('Escape');
   await navigate(page,'/admin/contest/1/projects');await rowAction(page,'삭제');
   assert.equal(await page.getByRole('dialog').count(),1);await capture(page,'project-delete',width,false);
   await page.keyboard.press('Escape');
   await navigate(page,'/admin/contest/1/votes');
   const count=page.getByLabel('1인당 투표권 수');const old=Number(await count.inputValue());
   await page.getByRole('button',{name:'투표권 수 늘리기'}).focus();await page.keyboard.press('Enter');
   assert.equal(Number(await count.inputValue()),old+1);await capture(page,'votes-controls',width);ok(`${width} vote keyboard stepper`);
   await context.close();
   if(failures.length||qa.errors.length)throw Error([...failures,...qa.errors].join('\n'));
  }
 }catch(error){failures.push(error.stack||String(error));console.error(error);process.exitCode=1;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'state-checks.json'),JSON.stringify({behavior,checks,failures:[...failures,...qa.errors]},null,2));}
})();

module.exports={fixtures,release,rowAction};

```

## 공개 홈 반복 확인

```js
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
process.env.VISUAL_QA_BASE_URL='http://127.0.0.1:4195';
const file=path.resolve(__dirname,'../tests/browser-visual-qa.cjs');
const sandbox={__dirname:path.dirname(file),require:createRequire(file),exports:{},process,console,URL,AbortSignal,fetch,setTimeout,clearTimeout};
vm.runInNewContext(fs.readFileSync(file,'utf8').split('\n(async () => {')[0]+'\nexports.qa={chromium,guardNetwork,screens,assertPageReady,capture,errors};',sandbox);
const q=sandbox.exports.qa,results=[];
(async()=>{const b=await q.chromium.launch({headless:true});try{for(let i=1;i<=3;i++){
 const c=await b.newContext({viewport:{width:1440,height:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await q.guardNetwork(c);
 const p=await c.newPage();await p.goto(process.env.VISUAL_QA_BASE_URL,{waitUntil:'domcontentloaded'});await q.assertPageReady(p,q.screens[0]);await p.waitForLoadState('networkidle');
 const before=await p.locator('.opus-contest-region__header h2').evaluate(el=>({font:getComputedStyle(el).fontSize,width:innerWidth,css:document.querySelectorAll('style').length}));
 await q.capture(p,'home',{name:'desktop',width:1440,height:900});
 const after=await p.locator('.opus-contest-region__header h2').evaluate(el=>({font:getComputedStyle(el).fontSize,width:innerWidth}));
 const equal=fs.readFileSync(path.join(__dirname,'visual/home-desktop.png')).equals(fs.readFileSync(path.join(__dirname,'admin-298-public-before/home-desktop.png')));
 results.push({iteration:i,before,after,equal});assert.ok(equal);await c.close();
}assert.equal(q.errors.length,0);}finally{await b.close();fs.writeFileSync(path.join(__dirname,'admin-299-public-home-repeat.json'),JSON.stringify({results,errors:q.errors},null,2));console.log(results);}})().catch(e=>{console.error(e);process.exitCode=1;});

```
