# Browser QA scenarios

Reuse the existing #314 checkout and its Playwright/browser installation. The adapter below imports its network guard, font readiness and Chromium. No extra framework is introduced.

For isolated Vite caches, use a local config that merges the existing config with `cacheDir: ".qa/vite-cache"`; set `ADMIN_QA_BASE_URL` to its localhost URL and `ADMIN_QA_MSW_MODULE=/.qa/vite-cache/deps/msw.js`. The original default cache path remains supported.

## .qa/admin-298.cjs

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

## .qa/notification-307.cjs

```javascript
const fs = require('node:fs');
const path = require('node:path');
process.env.ADMIN_QA_BASE_URL ||= 'http://127.0.0.1:4201';
process.argv[2] ||= 'notification307-initial';
const {capture,qa,out,checks,failures} = require('./admin-298.cjs');
async function settle(p){await p.waitForFunction(()=>window.__qaQueryClient.isFetching()===0);await p.waitForLoadState('networkidle');await p.waitForTimeout(350);}
async function setup(p,role){
 await p.goto(process.env.ADMIN_QA_BASE_URL,{waitUntil:'domcontentloaded'});await p.evaluate(value=>window.__qaMswModule=value,process.env.ADMIN_QA_MSW_MODULE||'/node_modules/.vite/deps/msw.js');await p.waitForFunction(()=>navigator.serviceWorker.controller);await qa.screens[0].ready(p);await p.addStyleTag({content:'.tsqd-parent-container { display: none !important; }'});
 await p.evaluate(async()=>{await document.fonts.ready;await Promise.all(['400 16px "Noto Sans KR"','500 16px "Noto Sans KR"','700 16px "Noto Sans KR"'].map(font=>document.fonts.load(font,document.body.innerText+'알림 제출물 피드백 지도교수 멘토')));});
 await p.evaluate(async role=>{window.__qaQueryClient=(await import('/src/stores/queryClient.ts')).default;const{useTokenStore}=await import('/src/stores/useTokenStore.ts');const e=v=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(v)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');useTokenStore.getState().setToken(e({alg:'none'})+'.'+e({sub:role==='student'?'9001':role==='professor'?'9002':'9003',name:'QA 사용자',roles:[role==='student'?'ROLE_팀원':role==='professor'?'ROLE_교수':'ROLE_외부멘토']})+'.mock');},role);await settle(p);
}
async function nav(p,url){await p.evaluate(url=>{history.pushState({key:crypto.randomUUID()},'',url);dispatchEvent(new PopStateEvent('popstate'));},url);await settle(p);}
async function openNotifications(p){await p.getByRole('button',{name:/^프로필 메뉴 열기/}).click();await p.getByRole('menuitem',{name:/^알림/}).click();await p.getByRole('heading',{name:'알림',exact:true}).waitFor();await settle(p);}
async function main(){const b=await qa.chromium.launch({channel:'chromium',headless:true});try{
 for(const width of [1440,768,390]){for(const role of ['student','professor','mentor']){
  const c=await b.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));await setup(p,role);await openNotifications(p);await capture(p,role+'-notifications',width,false);await p.mouse.click(10,110);
  await nav(p,role==='student'?'/me/contests/1/teams/101/submissions?submissionItemId=12':'/me/advisor-activity/contests/1?teamId=103');
  if(role==='student')await p.getByRole('button',{name:'다시 제출하기',exact:true}).waitFor();
  else await p.getByRole('textbox',{name:'피드백 내용'}).waitFor();
  await settle(p);await p.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  if(width===390&&role!=='student')await p.waitForFunction(()=>{const a=[...document.querySelectorAll('article')].find(a=>a.querySelector('h3')?.textContent==='프로젝트 103');return a&&a.getBoundingClientRect().top>=0&&a.getBoundingClientRect().top<120;});
  await capture(p,role+'-arrival',width,false);
  const target=role==='student'?p.getByRole('heading',{name:'제출물 목록',exact:true}):p.getByRole('heading',{name:'담당 프로젝트',exact:true});await target.scrollIntoViewIfNeeded();await capture(p,role+'-content',width,false);await c.close();
 }}
 if(qa.errors.length)throw Error(qa.errors.join('\n'));if(checks.some(c=>c.overflow))throw Error('Horizontal document overflow');
}catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(out,'notification-checks.json'),JSON.stringify({checks,failures:[...failures,...qa.errors]},null,2));}}
module.exports={setup,settle,nav,openNotifications,capture,qa,out,checks,failures};
if(require.main===module)main();

```

## .qa/notification-307-interactions.cjs

```javascript
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
process.argv[2] ||= 'notification307-interactions';
const q = require('./notification-307.cjs');
const results=[];
async function fixture(p,role){
 await q.setup(p,role);
 await p.evaluate(async role=>{
  const {worker}=await import('/src/mocks/browsers.ts');
  const {http,HttpResponse,delay}=await import(window.__qaMswModule);
  const {createScenarioNotifications}=await import('/src/mocks/data/notificationScenario.ts');
  const {mockTeamDetail}=await import('/src/mocks/data/teams.ts');
  const s=window.__notifyQA={list:createScenarioNotifications(role!=='student',role==='mentor'),mode:'normal',readDelay:0,readError:false,getDelay:0,teamDelay:0,requests:[]};
  window.__qaQueryClient.setDefaultOptions({queries:{retry:false},mutations:{retry:false}});
  worker.use(
   http.get('/api/notifications',async()=>{const snapshot=structuredClone(s.list);const mode=s.mode;await delay(s.getDelay);return mode==='error'?HttpResponse.json({message:'Synthetic failure'},{status:500}):HttpResponse.json(mode==='empty'?[]:snapshot);}),
   http.patch('/api/notifications/:id',async({params})=>{s.requests.push('read:'+params.id);await delay(s.readDelay);if(s.readError)return HttpResponse.json({message:'Synthetic failure'},{status:500});const n=s.list.find(n=>n.id===Number(params.id));if(n)n.isRead=true;return new HttpResponse(null,{status:204});}),
   http.patch('/api/notifications',async()=>{s.requests.push('read:all');await delay(s.readDelay);if(s.readError)return HttpResponse.json({message:'Synthetic failure'},{status:500});s.list.forEach(n=>n.isRead=true);return new HttpResponse(null,{status:204});}),
   http.get('/api/teams/:id',async({params})=>{s.requests.push('team:'+params.id);await delay(s.teamDelay);return HttpResponse.json({...mockTeamDetail,teamId:Number(params.id),contestId:1,githubPath:null,youTubePath:null,productionPath:null,previewIds:[]});}),
  );
  await window.__qaQueryClient.invalidateQueries({queryKey:['notifications']});
 },role);await q.settle(p);
}
const dialog=p=>p.getByRole('dialog',{name:'알림',exact:true});
const notification=(p,title)=>dialog(p).getByRole('button').filter({has:p.getByText('[MSW] '+title,{exact:true})});
async function check(name,fn){await fn();results.push(name);console.log('PASS',name);}
async function main(){const b=await q.qa.chromium.launch({channel:'chromium',headless:true});try{
 const c=await b.newContext({viewport:{width:390,height:844},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await q.qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>q.failures.push(e.message));await fixture(p,'student');
 await check('all seven student notification types preserve server URLs and submission-item selection',async()=>{
  const entries=await p.evaluate(()=>window.__notifyQA.list.slice(0,7));
  for(const n of entries){await q.nav(p,'/');await q.openNotifications(p);await notification(p,n.title.replace('[MSW] ','')).click();await p.waitForURL(url=>url.pathname+url.search===n.redirectUrl);await q.settle(p);if(n.redirectUrl.includes('submissions')){await p.getByRole('heading',{name:'제출물 목록',exact:true}).waitFor();const selected=p.locator('button[aria-expanded=true]').filter({hasText:'자세히 보기'});await selected.waitFor();assert.equal(await selected.count(),1);assert.equal(new URL(p.url()).searchParams.get('submissionItemId'),n.redirectUrl.split('=').pop());}}
 });
 await check('unknown submission item opens no unrelated detail and duplicate query blocks navigation',async()=>{
  await q.nav(p,'/');await q.openNotifications(p);await notification(p,'존재하지 않는 제출 항목').click();await q.settle(p);assert.equal(await p.locator('button[aria-expanded=true]').filter({hasText:'자세히 보기'}).count(),0);
  await q.nav(p,'/');await q.openNotifications(p);await notification(p,'중복 제출 항목 ID').click();await q.settle(p);assert.equal(new URL(p.url()).pathname,'/');assert.equal(await dialog(p).count(),1);
 });
 await check('external target is blocked without a fallback route',async()=>{await notification(p,'외부 URL 차단').click();await q.settle(p);assert.equal(new URL(p.url()).pathname,'/');});
 await check('Escape restores the profile trigger; hidden panel is inert',async()=>{await p.keyboard.press('Escape');await p.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')?.startsWith('프로필 메뉴 열기'));assert.equal(await p.locator('[role=dialog][inert]').count(),1);});
 await check('failed bulk read rolls back the optimistic badge and blocks duplicate individual requests',async()=>{
  await p.evaluate(()=>{const s=window.__notifyQA;s.list.forEach(n=>n.isRead=false);s.readError=true;s.readDelay=600;s.requests=[];});await q.openNotifications(p);await dialog(p).getByRole('button',{name:'모두 읽음'}).click();await p.waitForFunction(()=>window.__notifyQA.requests.length===1,{},{timeout:5000}).catch(async e=>{console.log('read debug',await p.evaluate(()=>({requests:window.__notifyQA.requests,mutations:window.__qaQueryClient.isMutating(),url:location.pathname,open:!!document.querySelector('[role=dialog]:not([inert])')})));throw e;});assert.equal(await notification(p,'기획서 제출 완료').isDisabled(),true);await p.waitForFunction(()=>!window.__qaQueryClient.isMutating());await q.settle(p);assert.equal(await p.evaluate(()=>window.__qaQueryClient.getQueryData(['notifications']).filter(n=>!n.isRead).length),14);assert.deepEqual(await p.evaluate(()=>window.__notifyQA.requests),['read:all']);await q.capture(p,'read-error',390,false);
 });
 await check('successful bulk read is serialized with pending refetch and is not overwritten by stale data',async()=>{
  await p.evaluate(()=>{const s=window.__notifyQA;s.readError=false;s.readDelay=250;s.getDelay=1200;s.requests=[];void window.__qaQueryClient.refetchQueries({queryKey:['notifications']});});await dialog(p).getByRole('button',{name:'모두 읽음'}).click();await q.settle(p);assert.equal(await p.evaluate(()=>window.__qaQueryClient.getQueryData(['notifications']).filter(n=>!n.isRead).length),0);assert.deepEqual(await p.evaluate(()=>window.__notifyQA.requests),['read:all']);await p.evaluate(()=>window.__notifyQA.getDelay=0);await p.keyboard.press('Escape');
 });
 await check('closing the panel cancels delayed legacy navigation',async()=>{
  await p.evaluate(()=>{window.__notifyQA.teamDelay=1000;window.__qaQueryClient.removeQueries({queryKey:['teamDetail']});});await q.openNotifications(p);await notification(p,'기존 팀 알림').click();await dialog(p).getByRole('button',{name:'알림 닫기'}).click();await p.waitForTimeout(1200);assert.equal(new URL(p.url()).pathname,'/');
 });
 await check('route changes cancel delayed legacy navigation',async()=>{
  await p.evaluate(()=>window.__qaQueryClient.removeQueries({queryKey:['teamDetail']}));await q.openNotifications(p);await notification(p,'기존 팀 알림').click();await q.nav(p,'/me/contests/1/teams/101/submissions');await p.waitForTimeout(1100);assert.equal(new URL(p.url()).pathname,'/me/contests/1/teams/101/submissions');await p.keyboard.press('Escape');
 });
 await check('legacy team/comments/awards preserve canonical route anchors',async()=>{
  await p.evaluate(()=>window.__notifyQA.teamDelay=0);
  for(const [title,hash] of [['기존 팀 알림',''],['기존 댓글 알림','#comments'],['기존 수상 알림','#awards']]){await q.nav(p,'/');await q.openNotifications(p);await notification(p,title).click();await p.waitForURL(url=>url.pathname===(hash?'/contest/1/teams/view/101':'/me/contests/1/teams/101/dashboard')&&url.hash===hash);await q.settle(p);}
 });
 await c.close();
 for(const role of ['professor','mentor']){
  const c2=await b.newContext({viewport:{width:390,height:844},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await q.qa.guardNetwork(c2);const p2=await c2.newPage();p2.on('pageerror',e=>q.failures.push(e.message));await fixture(p2,role);
  await check(role+' single/bulk/unassignment preserve recipient paths and scroll to the assigned team',async()=>{
   for(const [title,url] of [['단일 팀 지정','/me/advisor-activity/contests/1?teamId=103'],['복수 팀 지정','/me/advisor-activity/contests/1'],['지정 해제','/contest/1/teams/view/104']]){await q.nav(p2,'/');await q.openNotifications(p2);await notification(p2,title).click();await p2.waitForURL(u=>u.pathname+u.search===url);await q.settle(p2);if(title==='단일 팀 지정'){const box=await p2.getByRole('article').filter({has:p2.getByRole('heading',{name:'프로젝트 103',exact:true})}).boundingBox();assert.ok(box.y>=0&&box.y<120,JSON.stringify(box));await q.capture(p2,role+'-deep-link',390,false);}}
  });
  await check(role+' rejects unassigned/duplicate team selections and stale permission results',async()=>{
   for(const query of ['?teamId=999','?teamId=101&teamId=103']){await q.nav(p2,'/me/advisor-activity/contests/1'+query);assert.equal(await p2.getByRole('textbox',{name:'피드백 내용'}).count(),0);}
   await q.nav(p2,'/me/advisor-activity/contests/1?teamId=103');await p2.evaluate(async()=>{const {worker}=await import('/src/mocks/browsers.ts');const {http,HttpResponse}=await import(window.__qaMswModule);worker.use(http.get('/api/mentors/me/contests/1/teams',()=>HttpResponse.json({message:'Synthetic revoked role'},{status:403})));await window.__qaQueryClient.invalidateQueries({queryKey:['advisorActivity','projects',1]});});await q.settle(p2);assert.equal(await p2.getByRole('textbox',{name:'피드백 내용'}).count(),0);await p2.getByRole('heading',{name:'지도 활동을 불러오지 못했습니다.'}).waitFor();await q.capture(p2,role+'-permission-error',390,false);
  });
  await c2.close();
 }
 const c3=await b.newContext({viewport:{width:768,height:1024},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await q.qa.guardNetwork(c3);const p3=await c3.newPage();p3.on('pageerror',e=>q.failures.push(e.message));await fixture(p3,'student');
 await check('account change prevents late rollback from restoring old notifications',async()=>{await q.openNotifications(p3);await p3.evaluate(()=>{window.__notifyQA.readError=true;window.__notifyQA.readDelay=800;});await dialog(p3).getByRole('button',{name:'모두 읽음'}).click();await p3.evaluate(async()=>{const {useTokenStore}=await import('/src/stores/useTokenStore.ts');useTokenStore.getState().clearToken();window.__qaQueryClient.clear();});await p3.waitForTimeout(1100);assert.equal(await p3.evaluate(()=>window.__qaQueryClient.getQueryData(['notifications'])),undefined);assert.equal(new URL(p3.url()).pathname,'/');});
 await c3.close();
 if(q.failures.length||q.qa.errors.length)throw Error([...q.failures,...q.qa.errors].join('\n'));if(q.checks.some(c=>c.overflow))throw Error('Horizontal document overflow');
}catch(e){q.failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(q.out,'interactions.json'),JSON.stringify({results,captures:q.checks,failures:[...q.failures,...q.qa.errors]},null,2));}}
main();

```

## .qa/notification-307-states.cjs

```javascript
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
process.argv[2]||='notification307-states';const q=require('./notification-307.cjs');const results=[];
const dialog=p=>p.getByRole('dialog',{name:'알림',exact:true});
async function snap(p,name,w){await q.capture(p,name,w,false);const r=await dialog(p).boundingBox();if(r){assert.ok(r.y>=0&&r.y+r.height<=p.viewportSize().height+1,JSON.stringify(r));}assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);}
async function main(){const b=await q.qa.chromium.launch({channel:'chromium',headless:true});try{
 for(const width of [1440,768,390]){
  const c=await b.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await q.qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>q.failures.push(e.message));await q.setup(p,'student');
  await p.evaluate(async()=>{const {worker}=await import('/src/mocks/browsers.ts');const {http,HttpResponse,delay}=await import(window.__qaMswModule);const {createScenarioNotifications}=await import('/src/mocks/data/notificationScenario.ts');window.__stateQA={mode:'long'};const list=createScenarioNotifications(false,false);list[0].title='졸업과제 최종 발표 자료와 프로젝트 결과 보고서에 대한 지도교수 피드백이 도착했습니다';list[0].content='서버가 보낸 긴 안내입니다. 제출 항목과 피드백 내용을 확인하고 필요한 자료를 준비해 주세요. 서버 문구를 보존합니다.';window.__qaQueryClient.setDefaultOptions({queries:{retry:false}});worker.use(http.get('/api/notifications',async()=>{const mode=window.__stateQA.mode;if(mode==='loading')await delay(2000);return mode==='error'?HttpResponse.json({message:'Synthetic failure'},{status:500}):HttpResponse.json(mode==='empty'?[]:list);}));});
  await q.openNotifications(p);await snap(p,'long-notifications',width);results.push(width+' long title/body remain inside viewport');
  for(const mode of ['empty','error','loading']){await p.evaluate(async mode=>{window.__stateQA.mode=mode;if(mode==='loading')window.__qaQueryClient.removeQueries({queryKey:['notifications']});void window.__qaQueryClient.refetchQueries({queryKey:['notifications']});},mode);if(mode!=='loading')await q.settle(p);else await p.waitForTimeout(100);await snap(p,mode,width);}
  await q.settle(p);await p.evaluate(()=>window.__stateQA.mode='long');await p.keyboard.press('Escape');await q.openNotifications(p);await p.keyboard.press('Tab');assert.equal(await p.getByRole('button',{name:'모두 읽음'}).evaluate(el=>el===document.activeElement),true);await p.keyboard.press('Escape');assert.equal(await p.getByRole('button',{name:/^프로필 메뉴 열기/}).evaluate(el=>el===document.activeElement),true);results.push(width+' keyboard open/Tab/Escape/focus restoration');
  if(width===390){await p.setViewportSize({width:390,height:420});await q.openNotifications(p);await snap(p,'compact',390);await p.keyboard.press('Escape');}
  await c.close();
 }
 const c=await b.newContext({viewport:{width:390,height:844},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await q.qa.guardNetwork(c);const p=await c.newPage();p.on('pageerror',e=>q.failures.push(e.message));await q.setup(p,'professor');
 await q.nav(p,'/me/advisor-activity/contests/1?teamId=103');const editor=p.getByRole('textbox',{name:'피드백 내용'});await editor.fill('첫 번째 제출물의 작성 중인 피드백');await p.getByLabel('참고 자료 파일').setInputFiles({name:'검토의견-접근성과데이터무결성에관한상세참고자료.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 synthetic')});const card=p.getByRole('article').filter({has:p.getByRole('heading',{name:'프로젝트 103',exact:true})});await card.getByRole('button',{name:'자세히 보기',exact:true}).nth(1).click();await q.settle(p);await editor.fill('두 번째 제출물의 피드백');await card.getByRole('button',{name:'자세히 보기',exact:true}).nth(0).click();await q.settle(p);assert.equal(await editor.inputValue(),'첫 번째 제출물의 작성 중인 피드백');assert.equal(await p.getByRole('button',{name:/검토의견.*첨부 제거/}).count(),1);await editor.scrollIntoViewIfNeeded();await q.capture(p,'feedback-draft',390,false);results.push('browser draft text and attached File survive submission changes');
 await editor.fill('[실패] 작성 중인 피드백');await p.getByRole('button',{name:'저장하기',exact:true}).click();await p.waitForFunction(()=>!window.__qaQueryClient.isMutating());await q.settle(p);assert.equal(await editor.inputValue(),'[실패] 작성 중인 피드백');assert.equal(await p.getByRole('button',{name:/검토의견.*첨부 제거/}).count(),1);results.push('failed browser save preserves draft and local file');
 await p.getByRole('button',{name:/검토의견.*첨부 제거/}).click();assert.equal(await p.getByRole('button',{name:/검토의견.*첨부 제거/}).count(),0);await editor.fill('정상 저장 피드백');await p.getByRole('button',{name:'저장하기',exact:true}).click();await p.waitForFunction(()=>!window.__qaQueryClient.isMutating());await q.settle(p);assert.equal(await p.evaluate(async()=>{const{scenarioFeedbacks}=await import('/src/mocks/data/notificationScenario.ts');return scenarioFeedbacks.get('1:1031')?.description;}),'정상 저장 피드백');results.push('browser remove and save use the selected submission ID');
 await q.nav(p,'/me/advisor-activity/contests/2?teamId=102');await editor.fill('다른 대회 임시 내용');await q.nav(p,'/me/advisor-activity/contests/1?teamId=103');assert.equal(await editor.inputValue(),'정상 저장 피드백');results.push('contest URL switches retain independent edits');await c.close();
 if(q.failures.length||q.qa.errors.length||q.checks.some(c=>c.overflow))throw Error([...q.failures,...q.qa.errors,'Overflow: '+q.checks.filter(c=>c.overflow).length].join('\n'));
}catch(e){q.failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}finally{await b.close();fs.writeFileSync(path.join(q.out,'states.json'),JSON.stringify({results,captures:q.checks,failures:[...q.failures,...q.qa.errors]},null,2));}}
main();

```
