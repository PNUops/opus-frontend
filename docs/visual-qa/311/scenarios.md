# #311 재현 시나리오

기존 #314 `545203c4e13aed2e90adc1c01c87db5bbd546b73`의 환경과 네트워크 가드를 재사용하는 작업별 기록이다. 새로운 테스트 프레임워크나 CI 설정을 추가하지 않는다.

## 준비와 실행

1. 기존 #314의 `docs/visual-qa.md` 환경을 사용한다. 아래 코드 블록을 해당 checkout의 `.qa/<파일명>`으로 저장한다. 도우미는 기존 runner 내부의 Chromium/네트워크 가드/화면 준비 조건을 읽으므로 runner 변경 시 함께 검토한다.
2. #311 앱을 `VITE_USE_MSW=true`, 빈 `VITE_API_BASE_URL`, loopback 4197에서 실행한다. develop 비교 앱은 4194다. 실제 계정·운영 주소를 사용하지 않는다.
3. QA checkout에서 `ADMIN_QA_BASE_URL=http://127.0.0.1:4197`, `ADMIN_QA_WIDTHS=[1440]`, `ADMIN_QA_HIDE_DEVTOOLS=1`을 설정한다. 설치된 Chromium 경로를 지정했다면 같은 `PLAYWRIGHT_BROWSERS_PATH`를 사용한다. 개발 전용 TanStack 패널만 캡처에서 숨긴다.
4. PDF를 지원하는 기존 full Chromium을 `channel: 'chromium'`으로 실행한다. 이전 headless shell 캡처를 PDF 검증에 사용하지 않는다.

```text
node .qa/report-311.cjs report311-standalone-final
```

develop 비교는 BASE_URL을 4194로 바꾸고 `node .qa/report-311-before.cjs`를 실행한다. 동일한 네 팀과 집계 값을 사용한다.

## #339와 임시 조합

#339 `8bd8d030d5e57ada7b1202840d7fa5c13c73f170`의 별도 checkout에서 `integration-339.patch`를 적용한다. 소스와 테스트 파일만 포함하며 기능 브랜치의 부모를 변경하지 않는다. 충돌한 집계/순위 컴포넌트는 #311의 단일 응답 props 구조를 사용하고 #339 셸·투표 로그는 유지한다. 이 조합에는 #338이 포함되지 않는다.

조합 앱을 MSW로 4198에서 실행한다. QA의 BASE_URL을 4198, WIDTHS를 `[1440,768,390]`, `REPORT_QA_INTEGRATED=1`로 설정한다.

```text
node .qa/report-311.cjs report311-integrated-final
node .qa/report-311-states.cjs report311-states-final
node .qa/report-311-extra.cjs report311-extra
```

결과는 `.qa/admin-298-<인자>`의 JSON/PNG다. 기본 viewport는 1440×900, 768×1024, 390×844이고 낮은 화면은 390×420이다. JSON의 failures·넘침과 동작 판정 외에 **PNG를 직접 확인**한다. PDF embed 생성 후에도 그림이 나타날 때까지 기다려야 하며 networkidle이나 iframe 존재만으로 성공 판정하지 않는다.


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


## report-311.cjs

```js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.env.ADMIN_QA_BASE_URL ||= 'http://127.0.0.1:4197';
process.argv[2] ||= 'report311-initial';
const {setup,capture,qa,out,checks,failures,base}=require('./admin-298.cjs');
const behavior=[];
async function navigate(p,url){await p.evaluate(url=>{history.pushState(null,'',url);dispatchEvent(new PopStateEvent('popstate'));},url);await p.getByRole('heading',{name:'투표 리포트',exact:true}).waitFor();}
async function settle(p){await p.waitForFunction(()=>window.__qaQueryClient.isFetching()===0);await p.waitForLoadState('networkidle');await p.waitForFunction(()=>!document.querySelector('.animate-pulse'));}
async function snap(p,name,width,full=true){await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));if(full)await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await capture(p,name,width,full);}
async function fixtures(p){await p.evaluate(async()=>{
 const{worker}=await import('/src/mocks/browsers.ts');const{http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');
 const{mockVoteReport,createMockVoteReportPdf}=await import('/src/mocks/data/voteReport.ts');
 window.__reportQa={report:structuredClone(mockVoteReport),reportMode:'normal',pdfMode:'normal',pdfRequests:[],reportRequests:[],created:[],revoked:[],releases:[]};
 const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
 URL.createObjectURL=blob=>{const url=create(blob);if(blob.type==='application/pdf')window.__reportQa.created.push(url);return url;};
 URL.revokeObjectURL=url=>{window.__reportQa.revoked.push(url);return revoke(url);};
 worker.use(
  http.get('/api/contests/:id/votes/report',async({params})=>{const q=window.__reportQa;q.reportRequests.push(String(params.id));if(q.reportMode==='loading')await new Promise(r=>q.releaseReport=r);if(q.reportMode==='error')return HttpResponse.json({message:'시연용 조회 실패'},{status:500});return HttpResponse.json({...q.report,contestName:params.id==='1'?q.report.contestName:'두 번째 시연 대회'});}),
  http.get('/api/contests/:id/votes/report/download',async({params})=>{const q=window.__reportQa;q.pdfRequests.push(String(params.id));const mode=q.pdfMode;if(mode==='pending')await new Promise(r=>q.releases.push(r));if(mode==='error')return HttpResponse.json({code:'PDF_GENERATION_FAILED',message:'PDF 생성에 실패했어요. 다시 시도해 주세요.'},{status:500});if(mode==='not-ended')return HttpResponse.json({code:'VOTE_NOT_ENDED',message:'투표가 아직 마감되지 않았어요.'},{status:400});if(mode==='invalid')return HttpResponse.text('<html>invalid document</html>');return new HttpResponse(createMockVoteReportPdf(),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent('시연대회_투표결과.pdf')}`}});}),
  http.get('/api/contests/:id/vote-log',()=>HttpResponse.json({content:[],totalElements:0,totalPages:0,size:20,number:0}))
 );
});}
async function main(){const b=await qa.chromium.launch({channel:'chromium',headless:true});try{for(const width of JSON.parse(process.env.ADMIN_QA_WIDTHS||'[1440,768,390]')){
 const c=await b.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow',acceptDownloads:true});await qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);await fixtures(p);await navigate(p,'/admin/contest/1/statistics');await p.getByRole('heading',{name:'팀별 순위',exact:true}).waitFor();await settle(p);
 assert.equal(await p.getByRole('list',{name:'팀별 투표 순위'}).getByRole('listitem').count(),4);assert.equal(await p.getByLabel('2위',{exact:true}).count(),2);await snap(p,'report',width);
 if(width===1440||process.env.REPORT_QA_INTEGRATED==='1'){
  await p.getByRole('button',{name:'PDF 미리보기',exact:true}).click();await p.locator('iframe[title="투표 리포트 PDF 미리보기"]').waitFor();await p.frameLocator('iframe').locator('embed').waitFor();await p.waitForTimeout(5000);await snap(p,'pdf',width,false);
  const download=p.waitForEvent('download');await p.getByRole('dialog').getByRole('button',{name:'PDF 다운로드',exact:true}).click();assert.equal((await download).suggestedFilename(),'시연대회_투표결과.pdf');assert.equal(await p.evaluate(()=>window.__reportQa.pdfRequests.length),1);behavior.push(`${width} preview/download reuses response`);
  await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await p.getByRole('button',{name:'PDF 미리보기',exact:true}).evaluate(e=>e===document.activeElement),true);assert.equal(await p.evaluate(()=>window.__reportQa.created.every(url=>window.__reportQa.revoked.includes(url))),true);behavior.push(`${width} close/revoke/focus`);
 }
 await p.evaluate(()=>window.__reportQa.report.isVoteEnded=false);await p.getByRole('button',{name:'리포트 새로고침'}).click();await p.getByText('중간 집계',{exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'PDF 미리보기',exact:true}).isDisabled(),true);assert.equal(await p.getByRole('button',{name:'PDF 다운로드',exact:true}).isDisabled(),true);await snap(p,'before-close',width);behavior.push(`${width} server deadline disables PDF`);
 await c.close();if(failures.length||qa.errors.length)throw Error([...failures,...qa.errors].join('\n'));
}}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'report-checks.json'),JSON.stringify({behavior,checks,failures:[...failures,...qa.errors]},null,2));}}
module.exports={fixtures,settle,snap,setup,navigate,capture,qa,out,checks,failures,base};
if(require.main===module)main();
```


## report-311-states.cjs

```js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.argv[2] ||= 'report311-states';
const {setup,fixtures,navigate,settle,snap,qa,out,checks,failures}=require('./report-311.cjs');
const behavior=[];
const ok=name=>{behavior.push(name);console.log('PASS',name);};
async function mode(p,field,value){await p.evaluate(({field,value})=>window.__reportQa[field]=value,{field,value});}
async function refresh(p){await p.getByRole('button',{name:'리포트 새로고침',exact:true}).click();await settle(p);}
async function readyPdf(p){await p.locator('iframe[title="투표 리포트 PDF 미리보기"]').waitFor();await p.frameLocator('iframe').locator('embed').waitFor();}
async function close(p){await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});}
async function release(p){await p.evaluate(()=>window.__reportQa.releases.splice(0).forEach(resolve=>resolve()));}
async function countPdf(p){return p.evaluate(()=>window.__reportQa.pdfRequests.length);}
async function role(p,role){await p.evaluate(async role=>{const{useTokenStore}=await import('/src/stores/useTokenStore.ts');const e=v=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(v)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');useTokenStore.getState().setToken(role?e({alg:'none'})+'.'+e({sub:'9001',name:'QA 사용자',roles:[role]})+'.mock':null);},role);}
(async()=>{const b=await qa.chromium.launch({channel:'chromium',headless:true});try{for(const width of JSON.parse(process.env.ADMIN_QA_WIDTHS||'[1440,768,390]')){
 const c=await b.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow',acceptDownloads:true});await qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);await fixtures(p);await navigate(p,'/admin/contest/1/statistics');await p.getByRole('heading',{name:'팀별 순위'}).waitFor();await settle(p);
 await p.getByRole('combobox',{name:'순위 보기'}).click();await p.getByRole('option',{name:'분과 미지정',exact:true}).click();assert.equal(await p.getByRole('list',{name:'팀별 투표 순위'}).getByRole('listitem').count(),2);await snap(p,'null-track',width);
 await p.getByRole('combobox',{name:'순위 보기'}).click();await p.getByRole('option',{name:'분과별 묶어보기',exact:true}).click();assert.equal(await p.getByRole('list',{name:'팀별 투표 순위'}).count(),2);assert.equal(await p.getByLabel('2위',{exact:true}).count(),2);await snap(p,'grouped',width);ok(`${width} null/group/tie/zero preserved`);
 await p.getByRole('combobox',{name:'순위 보기'}).click();await p.getByRole('option',{name:'전체',exact:true}).click();
 await mode(p,'reportMode','error');await refresh(p);await p.getByText('최신 집계를 가져오지 못했어요. 아래는 마지막 조회 결과입니다.',{exact:true}).waitFor();assert.equal(await p.getByRole('listitem').filter({has:p.getByText('바다',{exact:true})}).count(),1);await snap(p,'stale-error',width);
 await mode(p,'reportMode','normal');await p.getByRole('button',{name:'다시 시도',exact:true}).click();await settle(p);
 await mode(p,'reportMode','loading');await p.evaluate(()=>{void window.__qaQueryClient.resetQueries({queryKey:['voteReport',1]});});await p.getByText('투표 리포트를 불러오고 있어요.',{exact:true}).waitFor();await snap(p,'loading',width);await p.evaluate(()=>{window.__reportQa.reportMode='error';window.__reportQa.releaseReport();});await p.getByText('투표 리포트를 불러오지 못했어요.',{exact:true}).waitFor();await snap(p,'query-error',width);await mode(p,'reportMode','normal');await p.getByRole('button',{name:'다시 시도',exact:true}).click();await settle(p);ok(`${width} loading/error/retry/stale warning`);
 for(const scenario of [['error','PDF 생성에 실패했어요. 다시 시도해 주세요.'],['not-ended','투표가 아직 마감되지 않았어요.'],['invalid','PDF 파일을 받지 못했어요. 다시 시도해 주세요.']]){
  await mode(p,'pdfMode',scenario[0]);await p.getByRole('button',{name:'PDF 미리보기',exact:true}).click();await p.getByRole('dialog').getByRole('alert').getByText(scenario[1],{exact:true}).waitFor();await snap(p,'pdf-'+scenario[0],width,false);await mode(p,'pdfMode','normal');await p.getByRole('dialog').getByRole('button',{name:'다시 시도',exact:true}).click();await readyPdf(p);await close(p);
 }ok(`${width} PDF 500/400/invalid body retry`);
 await mode(p,'pdfMode','pending');let count=await countPdf(p);const download=p.waitForEvent('download');await p.getByRole('button',{name:'PDF 다운로드',exact:true}).evaluate(el=>{el.click();el.click();});await p.waitForFunction(()=>window.__reportQa.releases.length===1);assert.equal(await countPdf(p),count+1);assert.equal(await p.getByRole('button',{name:'PDF 다운로드',exact:true}).getAttribute('aria-busy'),'true');assert.equal(await p.getByRole('button',{name:'PDF 미리보기',exact:true}).isDisabled(),true);await snap(p,'download-pending',width);await release(p);const file=await download;assert.equal(file.suggestedFilename(),'시연대회_투표결과.pdf');assert.ok(fs.readFileSync(await file.path()).subarray(0,5).equals(Buffer.from('%PDF-')));await p.getByRole('button',{name:'PDF 다운로드',exact:true}).waitFor({state:'visible'});await p.waitForFunction(()=>!document.querySelector('[aria-busy="true"]'));ok(`${width} duplicate/direct-download filename/body`);
 const urls=await p.evaluate(()=>window.__reportQa.created.length);await p.getByRole('button',{name:'PDF 미리보기',exact:true}).click();await p.waitForFunction(()=>window.__reportQa.releases.length===1);await snap(p,'preview-pending',width,false);await close(p);await release(p);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>window.__reportQa.created.length),urls);assert.equal(await p.getByRole('dialog').count(),0);ok(`${width} close abort ignores late response`);
 await p.getByRole('button',{name:'PDF 미리보기',exact:true}).click();await p.waitForFunction(()=>window.__reportQa.releases.length===1);await navigate(p,'/admin/contest/2/statistics');await p.getByRole('heading',{name:'두 번째 시연 대회'}).waitFor();await release(p);await settle(p);assert.equal(await p.getByRole('dialog').count(),0);assert.equal(await p.evaluate(()=>window.__reportQa.created.length),urls);ok(`${width} contest change aborts old request`);
 await mode(p,'pdfMode','normal');await p.getByRole('button',{name:'PDF 미리보기',exact:true}).click();await readyPdf(p);const last=await p.evaluate(()=>window.__reportQa.created.at(-1));await navigate(p,'/admin/contest/1/statistics');await settle(p);assert.equal(await p.evaluate(url=>window.__reportQa.revoked.includes(url),last),true);ok(`${width} route unmount revokes preview URL`);
 await p.evaluate(()=>{Object.defineProperty(navigator,'pdfViewerEnabled',{get:()=>false,configurable:true});});await p.getByRole('button',{name:'PDF 미리보기',exact:true}).click();await p.getByText('이 브라우저에서는 PDF 미리보기를 지원하지 않아요. 위의 다운로드 버튼으로 파일을 열어 주세요.',{exact:true}).waitFor();assert.equal(await p.locator('iframe').count(),0);await snap(p,'unsupported-pdf',width,false);await close(p);await p.evaluate(()=>delete navigator.pdfViewerEnabled);ok(`${width} unsupported PDF fallback`);
 await p.evaluate(()=>{const q=window.__reportQa;q.report={...q.report,rankings:[],teamCount:0,totalVotes:0,totalVoters:0,averageVotesPerVoter:0,averageVotesPerTeam:0,zeroVoteTeamCount:0};});await refresh(p);await p.getByText('등록된 팀이 없어요.',{exact:true}).waitFor();await snap(p,'empty',width);assert.equal(await p.getByText(/NaN|Infinity/).count(),0);
 await p.evaluate(async()=>{const{mockVoteReport}=await import('/src/mocks/data/voteReport.ts');window.__reportQa.report={...mockVoteReport,contestName:'긴 이름을 가진 대회 '.repeat(16),rankings:mockVoteReport.rankings.map(r=>({...r,teamName:r.teamName.repeat(30),projectName:r.projectName.repeat(20),trackName:r.trackName?r.trackName.repeat(20):null}))};});await refresh(p);await snap(p,'long',width);const expand=p.getByRole('button',{name:'전체 이름 보기',exact:true}).first();await expand.click();const collapse=p.getByRole('button',{name:'이름 접기',exact:true});assert.equal(await collapse.getAttribute('aria-expanded'),'true');await snap(p,'long-expanded',width);await collapse.click();ok(`${width} zero/empty/long data and full-name disclosure`);
 count=await countPdf(p);await role(p,'ROLE_학생');await p.getByText('관리자 권한이 없습니다.',{exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'PDF 다운로드',exact:true}).count(),0);await snap(p,'student-denied',width);await role(p,null);await p.getByText('관리자 권한이 없습니다.',{exact:true}).waitFor();await snap(p,'anonymous-denied',width);assert.equal(await countPdf(p),count);ok(`${width} student/anonymous guard`);
 await c.close();if(failures.length||qa.errors.length)throw Error([...failures,...qa.errors].join('\n'));
}assert.equal(checks.filter(x=>x.overflow>0).length,0,'integrated document overflow');}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'report-state-checks.json'),JSON.stringify({behavior,checks,failures:[...failures,...qa.errors]},null,2));}})();
```


## report-311-extra.cjs

```js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.argv[2] ||= 'report311-extra';
const {setup,fixtures,navigate,settle,snap,qa,out,checks,failures}=require('./report-311.cjs');
const behavior=[];
(async()=>{const b=await qa.chromium.launch({channel:'chromium',headless:true});try{for(const width of [1440,768,390]){
 const c=await b.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow',acceptDownloads:true});await qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);await fixtures(p);await navigate(p,'/admin/contest/1/statistics');await p.getByRole('heading',{name:'팀별 순위'}).waitFor();await settle(p);
 await p.evaluate(()=>window.__reportQa.pdfMode='error');await p.getByRole('button',{name:'PDF 다운로드',exact:true}).click();await p.getByRole('alert').getByText('PDF 생성에 실패했어요. 다시 시도해 주세요.',{exact:true}).waitFor();assert.equal(await p.getByRole('dialog').count(),0);await snap(p,'download-error',width);await p.evaluate(()=>window.__reportQa.pdfMode='normal');const d=p.waitForEvent('download');await p.getByRole('button',{name:'PDF 다운로드',exact:true}).click();assert.equal((await d).suggestedFilename(),'시연대회_투표결과.pdf');await p.waitForFunction(()=>!document.querySelector('[aria-busy="true"]'));assert.equal(await p.getByRole('alert').count(),0);behavior.push(`${width} direct download inline error/retry`);
 let count=await p.evaluate(()=>window.__reportQa.pdfRequests.length);for(let i=0;i<2;i++){await p.getByRole('button',{name:'PDF 미리보기',exact:true}).click();await p.locator('iframe').waitFor();await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});}assert.equal(await p.evaluate(()=>window.__reportQa.pdfRequests.length),count+2);assert.equal(await p.evaluate(()=>window.__reportQa.created.every(url=>window.__reportQa.revoked.includes(url))),true);behavior.push(`${width} reopening fetches fresh PDF`);
 await p.evaluate(()=>{window.__reportQa.report.rankings[0].trackName='긴분과이름'.repeat(30);});await p.getByRole('button',{name:'리포트 새로고침'}).click();await settle(p);await p.getByRole('combobox',{name:'순위 보기'}).click();const menu=p.getByRole('listbox');await menu.waitFor();const box=await menu.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width);await snap(p,'long-filter',width,false);await p.getByRole('option',{name:'긴분과이름'.repeat(30),exact:true}).click();assert.equal(await p.getByRole('list',{name:'팀별 투표 순위'}).getByRole('listitem').count(),1);behavior.push(`${width} long filter bounds/selection`);
 if(width===390){await p.setViewportSize({width,height:420});await p.getByRole('button',{name:'PDF 미리보기',exact:true}).click();await p.locator('iframe').waitFor();await p.getByRole('dialog').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{})));});const box=await p.getByRole('dialog').boundingBox();assert.ok(box.y>=15&&box.y+box.height<=405);await p.waitForTimeout(5000);await snap(p,'short-pdf',width,false);const download=p.getByRole('dialog').getByRole('button',{name:'PDF 다운로드',exact:true});assert.ok((await download.boundingBox()).y<420);await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});behavior.push('390 short viewport modal/download bounds');}
 await c.close();if(failures.length||qa.errors.length)throw Error([...failures,...qa.errors].join('\n'));
}assert.equal(checks.filter(x=>x.overflow>0).length,0);}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'report-extra-checks.json'),JSON.stringify({behavior,checks,failures:[...failures,...qa.errors]},null,2));}})();
```


## report-311-before.cjs

```js
const fs=require('node:fs'),path=require('node:path');
process.argv[2]='report311-before';
const{setup,navigate,capture,qa,out,checks,failures}=require('./admin-298.cjs');
(async()=>{const b=await qa.chromium.launch({channel:'chromium',headless:true});try{const c=await b.newContext({viewport:{width:1440,height:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);await p.evaluate(async()=>{const{worker}=await import('/src/mocks/browsers.ts');const{http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');worker.use(http.get('/api/contests/:id/ranking',()=>HttpResponse.json([{rank:1,teamName:'바다',projectName:'지역과 함께 만드는 접근성 지도',trackName:'SW 개발',voteCount:120},{rank:2,teamName:'이어봄',projectName:'청년을 위한 지역 정보 서비스',trackName:'SW 개발',voteCount:80},{rank:2,teamName:'이어봄',projectName:'일상을 기록하는 작은 도구',trackName:null,voteCount:80},{rank:4,teamName:'새로운 시작',projectName:'우리 동네 열린 공간',trackName:null,voteCount:0}])),http.get('/api/contests/:id/votes/statistics',()=>HttpResponse.json({totalVotes:280,totalVoters:200,averageVotesPerVoter:1.4})),http.get('/api/contests/:id/vote-log',()=>HttpResponse.json({content:[],totalElements:0,totalPages:0,size:20,number:0})));});await navigate(p,'/admin/contest/1/statistics');await p.getByText('지역과 함께 만드는 접근성 지도',{exact:true}).waitFor();await capture(p,'statistics',1440);await c.close();}catch(e){failures.push(e.stack);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'before-checks.json'),JSON.stringify({checks,failures:[...failures,...qa.errors]},null,2));}})();
```
