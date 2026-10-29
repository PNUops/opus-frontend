# #298 시각적 QA 재현 시나리오

PR #314의 QA checkout (검토 당시 545203c4e13aed2e90adc1c01c87db5bbd546b73)에서 기존 docs/visual-qa.md에 따라 Playwright를 준비한다. 아래 파일은 그 checkout의 .qa/에 저장한다. 기능 브랜치에는 새 Playwright 의존성이나 설정을 설치하지 않는다.

기능 브랜치에서 VITE_USE_MSW=true, 빈 VITE_API_BASE_URL로 Vite를 127.0.0.1:4193에 시작한다. 기존 runner의 네트워크 가드가 외부 API와 MSW가 처리하지 못한 요청을 차단한다. 각 시나리오는 새 context에서 합성 관리자 토큰과 로컬 fixture만 사용하며 실제 계정에 접근하지 않는다. 실제 계정 정보로 교체하지 않는다.

공통 helper는 기존 runner의 main 직전 선언부를 읽어 Chromium, guardNetwork, 공개 홈 준비 조건을 재사용한다. #314 구현을 복제하지 않기 위한 일회성 연결이며 해당 runner의 구조가 변경되면 연결부도 검토해야 한다. 이 문서는 상시 CI 체계를 대체하지 않는다.

PowerShell 실행 예시 (QA checkout 기준):

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.qa/browsers'
$env:ADMIN_QA_BASE_URL = 'http://127.0.0.1:4193'
node .qa/admin-298.cjs after
node .qa/admin-298-states.cjs states
node .qa/admin-298-extra.cjs extra
node .qa/admin-298-query-states.cjs query-states
node .qa/admin-298-awards.cjs awards
node .qa/admin-298-reset.cjs
```

변경 전에는 같은 fixture로 develop 기준 서버를 별도 포트에서 실행해 ADMIN_QA_BASE_URL만 바꾼다. 기본 화면 스크립트는 양쪽에서 실행하고, 신규 접근성 이름/상태 UI를 검사하는 상세 시나리오는 변경 후에 실행한다. 공개 화면 비교는 기존 tests/browser-visual-qa.cjs로 양쪽에서 13장을 촬영한 뒤 파일별 Buffer.equals로 비교했다.

원시 JSON의 failures 배열이 비어 있는지 반드시 확인한다. 종료 코드만으로 검증 완료를 판단하지 않는다. 캡처도 직접 열어 검토한다. 가로 넘침 값은 #299의 알려진 실패를 보존하는 진단값이며 0으로 바꾸거나 성공으로 오인하지 않는다. 모바일 수상 선택은 키보드만 검증하며, 포인터가 고정 사이드바에 막히는 기존 레이아웃 결함은 #299에 남아 있다.

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

## admin-298-states.cjs

```javascript
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
   assert.equal(await page.locator('tbody tr').count(),1);
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

## admin-298-extra.cjs

```javascript
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

## admin-298-query-states.cjs

```javascript
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.argv[2]=process.argv[2]||'query-states';
const{setup,navigate,capture,qa,out,checks,failures}=require('./admin-298.cjs');const behavior=[];
(async()=>{const b=await qa.chromium.launch({headless:true});try{
 for(const width of[1440,768,390]){const c=await b.newContext({viewport:{width,height:width===390?844:1024},serviceWorkers:'allow',locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce'});await qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);
  for(const[route,url,key,empty]of[
   ['tracks','/api/contests/:id/tracks','tracks','아직 등록된 분과가 없어요.'],['projects','/api/contests/:id/team-detail-submissions','projects','아직 등록된 프로젝트가 없어요.'],['notices','/api/contests/:id/notices','contestNotices','아직 등록된 공지사항이 없어요.'],['roles','/api/contests/:id/staff','contestStaff','배정된 역할이 없어요.']]){
   await navigate(p,'/admin/contest/1/'+route);
   await p.evaluate(async({url,key})=>{window.__adminQa.listMode='loading';window.__qaQueryClient.setDefaultOptions({queries:{retry:false,refetchOnWindowFocus:false}});const{worker}=await import('/src/mocks/browsers.ts');const{http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');worker.use(http.get(url,async()=>{if(window.__adminQa.listMode==='loading')await new Promise(r=>window.__adminQa.releaseList=r);return window.__adminQa.listMode==='error'?HttpResponse.json({message:'안전한 시연 오류'},{status:500}):HttpResponse.json([]);}));void window.__qaQueryClient.resetQueries({queryKey:[key]});},{url,key});
   await p.getByText('목록을 불러오고 있어요.',{exact:true}).waitFor();assert.equal(await p.getByText(empty,{exact:true}).count(),0);await capture(p,route+'-loading',width);
   await p.evaluate(()=>{window.__adminQa.listMode='error';window.__adminQa.releaseList();});await p.getByText('목록을 불러오지 못했어요.',{exact:true}).waitFor();assert.equal(await p.getByText(empty,{exact:true}).count(),0);await capture(p,route+'-error',width);
   await p.evaluate(()=>{window.__adminQa.listMode='empty';});await p.getByRole('button',{name:'다시 시도',exact:true}).click();await p.getByText(empty,{exact:true}).waitFor();await capture(p,route+'-empty',width);behavior.push(`${width} ${route} loading/error/retry/empty`);
  }await c.close();
 }
}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'query-checks.json'),JSON.stringify({checks,behavior,failures:[...failures,...qa.errors]},null,2));}})();

```

## admin-298-awards.cjs

```javascript
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.argv[2]=process.argv[2]||'awards';const{setup,navigate,capture,qa,out,checks,failures}=require('./admin-298.cjs');const behavior=[];
(async()=>{const b=await qa.chromium.launch({headless:true});try{
 for(const width of[1440,768,390]){const c=await b.newContext({viewport:{width,height:width===390?844:1024},serviceWorkers:'allow',locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce'});await qa.guardNetwork(c);c.on('requestfailed',r=>console.log('mock request failed',new URL(r.url()).pathname));const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);
  await p.evaluate(async()=>{const{worker}=await import('/src/mocks/browsers.ts');const{http,HttpResponse}=await import('/node_modules/.vite/deps/msw.js');worker.use(http.get('/api/admin/teams/:id/awards',()=>HttpResponse.json({awards:[{awardId:1,awardName:'대상',awardColor:'#ffd700'}]})),http.patch('/api/contests/:id/current',()=>{window.__adminQa.requests.push('current');return HttpResponse.json({});}));});
  await navigate(p,'/admin');const current=p.getByRole('button',{name:/진행 중 대회 설정 해제$/}).first();await current.focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>window.__adminQa.requests.includes('current'));behavior.push(`${width} current contest keyboard action`);
  await navigate(p,'/admin/contest/1/awards');await capture(p,'awards-list',width);await p.getByRole('combobox',{name:'수상 팀',exact:true}).focus();await p.keyboard.press('Space');await p.getByRole('option').nth(1).focus();await p.keyboard.press('Enter');await p.getByRole('button',{name:'상훈 선택',exact:true}).focus();await p.keyboard.press('Enter');await p.getByLabel('새 상훈 이름').waitFor();await p.waitForFunction(()=>window.__qaQueryClient.isFetching()===0);await capture(p,'award-options',width,false);
  await p.getByLabel('새 상훈 이름').fill('새로운 상훈');await p.getByRole('button',{name:'새로운 상훈',exact:true}).first().waitFor();await capture(p,'award-colors',width,false);behavior.push(`${width} award keyboard/open/color labels`);await p.keyboard.press('Escape');await p.locator('[data-slot="popover-content"]').waitFor({state:'hidden'});assert.equal(await p.getByRole('button',{name:'상훈 선택',exact:true}).evaluate(e=>e===document.activeElement),true);
  await c.close();if(failures.length||qa.errors.length)throw Error([...failures,...qa.errors].join('\n'));
 }
}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'award-checks.json'),JSON.stringify({checks,behavior,failures:[...failures,...qa.errors]},null,2));}})();

```

## admin-298-reset.cjs

```javascript
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
process.argv[2]='reset-final';
const{setup,navigate,capture,qa,out,checks,failures}=require('./admin-298.cjs');
const{fixtures,release,rowAction}=require('./admin-298-states.cjs');
const behavior=[];
(async()=>{const b=await qa.chromium.launch({headless:true});try{
 for(const width of[1440,390]){const c=await b.newContext({viewport:{width,height:900},serviceWorkers:'allow',locale:'ko-KR',timezoneId:'Asia/Seoul'});await qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p);await fixtures(p);
  for(const route of['roles','projects','submission-manage']){await navigate(p,'/admin/contest/1/'+route);await rowAction(p,'삭제');const submit=p.getByRole('dialog').getByRole('button',{name:'삭제',exact:true});await submit.click();await p.waitForFunction(()=>window.__adminQa.releases.length===1);await release(p,500);await p.getByRole('dialog').getByRole('alert').waitFor();await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});await rowAction(p,'삭제');assert.equal(await p.getByRole('dialog').getByRole('alert').count(),0);await capture(p,route+'-reset',width,false);behavior.push(`${width} ${route} delete error reset on reopen`);await p.keyboard.press('Escape');}
  await c.close();
 }
}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'reset-checks.json'),JSON.stringify({checks,behavior,failures:[...failures,...qa.errors]},null,2));}})();

```
