# Reproduction

Use the existing PR #314 checkout at 545203c4 and its docs/visual-qa.md. Do not add a second Playwright installation or run against production.

Start this feature checkout with VITE_USE_MSW=true and VITE_API_BASE_URL empty on 127.0.0.1:4205. The temporary Vite config merges the normal config with cacheDir: node_modules/.vite-submission-dialog-309. A unique cache avoids collisions between concurrent worktrees sharing node_modules. The runner imports that cache path.

Save the two scripts below under the QA checkout .qa directory. Set PLAYWRIGHT_BROWSERS_PATH to its existing .qa/browsers. Execute node .qa/submission-309.cjs review. Optional QA_SCENARIO=long, one, or last runs the additional focused checks. The helper exports the existing tests/browser-visual-qa.cjs network guard and browser. Its admin setup/main functions are not called by this submission runner.

The browser wrapper mounts the production modal with the same conditional open/unmount pattern as SubmissionDetailPanel. It uses the real query key/options, QueryClient, multipart APIs, and a stateful MSW server. It does not test page-level role authorization. All IDs and files are synthetic.

## .qa/submission-309.cjs

```javascript
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
process.env.ADMIN_QA_BASE_URL = 'http://127.0.0.1:4205';
const phase = process.argv[2] || 'before';
process.argv[2] = 'submission309-'+phase;
const {qa,capture,out,checks,failures,base} = require('./admin-298.cjs');
const cases = [];
async function setup(p, options={}) {
 await p.goto(base,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/mockServiceWorker.js'));
 await p.addStyleTag({content:'.tsqd-parent-container { display: none !important; }'});
 await p.evaluate(async options=>{
  const prefix='/node_modules/.vite-submission-dialog-309/deps/';
  const React=(await import(prefix+'react.js')).default;
  const {createRoot}=(await import(prefix+'react-dom_client.js')).default;
  const {QueryClientProvider,useQuery}=await import(prefix+'@tanstack_react-query.js');
  const {worker}=await import('/src/mocks/browsers.ts');
  const {http,HttpResponse,delay}=await import(prefix+'msw.js');
  const {Dialog}=await import('/src/components/ui/dialog.tsx');
  const {SubmissionUploadModal}=await import('/src/pages/me/activity/components/SubmissionUploadModal.tsx');
  const {submissionDetailOption}=await import('/src/queries/submission.ts');
  const client=(await import('/src/stores/queryClient.ts')).default;
  const sample=Array.from({length:options.count??3},(_,i)=>({fileId:i+1,fileName:i===0?'졸업과제_중간발표_프로젝트_설계와구현_최종검토자료_2026.pdf':`참고자료_${i+1}.pdf`,fileSize:1024*1024*(i+1)}));
  const state=window.__uploadQA={files:sample,requests:[],reads:0,delay:0,failDelete:false,failPost:false};
  worker.use(
   http.get('/api/contests/1/submissions/1011',()=>{state.reads++;return HttpResponse.json({submissionId:1011,teamId:101,files:state.files});}),
   http.post('/api/contests/1/submissions/1011/files',async({request})=>{
    const files=(await request.formData()).getAll('files'); state.requests.push({method:'POST',names:files.map(f=>f.name)});await delay(state.delay);
    if(state.failPost)return HttpResponse.json({message:'파일 저장에 실패했습니다.'},{status:500});
    state.files.push(...files.map((f,i)=>({fileId:100+i,fileName:f.name,fileSize:f.size})));return new HttpResponse(null,{status:201});
   }),
   http.delete('/api/contests/1/submissions/1011/files/:id',async({params})=>{
    state.requests.push({method:'DELETE',id:Number(params.id)});if(state.pause)await new Promise(resolve=>window.__releaseUpload=resolve);await delay(state.delay);
    if(state.failDelete)return HttpResponse.json({message:'파일 삭제에 실패했습니다.'},{status:500});
    state.files=state.files.filter(f=>f.fileId!==Number(params.id));return new HttpResponse(null,{status:204});
   }),
   http.post('/api/contests/1/submission-items/11/submissions',async({request})=>{
    const files=(await request.formData()).getAll('files');state.requests.push({method:'CREATE',teamId:new URL(request.url).searchParams.get('teamId'),names:files.map(f=>f.name)});
    state.files=files.map((f,i)=>({fileId:100+i,fileName:f.name,fileSize:f.size}));return HttpResponse.json({submissionId:1011},{status:201});
   })
  );
  function Harness(){
   const [open,setOpen]=React.useState(true);
   const {data}=useQuery(submissionDetailOption(1,1011));
   window.__openUploadQA=()=>setOpen(true);
   const setting={name:'중간 발표 자료',description:'',startAt:'2020-06-18T09:00:00',endAt:options.expired?'2021-07-18T23:59:00':'2099-07-18T23:59:00',allowLateSubmission:!options.expired,allowedFileFormats:['PDF'],maxFileSizeMb:10,maxFileCount:options.max??5,visibility:'TEAM'};
   return React.createElement(QueryClientProvider,{client},React.createElement(Dialog,{open,onOpenChange:setOpen},open&&data&&React.createElement(SubmissionUploadModal,{contestId:1,teamId:101,submissionItemId:11,submissionId:options.initial?null:1011,submissionItemName:'중간 발표 자료',description:options.long?'프로젝트의 설계와 구현 결과를 정리한 발표 자료를 제출해주세요. '.repeat(8):'프로젝트의 설계와 구현 결과를 정리한 발표 자료를 제출해주세요.',setting,existingFiles:data.files,onClose:()=>setOpen(false)})));
  }
  const host=document.createElement('div');document.body.appendChild(host);
  createRoot(host).render(React.createElement(QueryClientProvider,{client},React.createElement(Harness)));
 },options);
 await p.getByRole('dialog').waitFor();
 await p.evaluate(()=>document.fonts.ready);
}
async function shot(p,name,width){
 await capture(p,'submission-'+name,width,false);
 const geometry=await p.getByRole('dialog').evaluate(el=>{const r=el.getBoundingClientRect();const save=[...el.querySelectorAll('button')].find(b=>b.textContent==='저장'||b.textContent==='저장 중...');const b=save?.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,scroll:el.scrollWidth-el.clientWidth,viewport:innerHeight,saveTop:b?.top,saveBottom:b?.bottom};});
 checks.at(-1).geometry=geometry;
 checks.at(-1).scrolling=await p.getByRole('dialog').evaluate(el=>{const b=el.querySelector('.overflow-y-auto'),h=el.querySelector('h4');return {top:b?.scrollTop,bodyTop:b?.getBoundingClientRect().top,itemTop:h?.getBoundingClientRect().top,active:document.activeElement?.tagName};});
 if(phase!=='before'){assert(geometry.top>=7&&geometry.bottom<=geometry.viewport-7,JSON.stringify(geometry));assert.equal(geometry.scroll,0);assert(geometry.saveTop>=0&&geometry.saveBottom<=geometry.viewport);}
}
async function reopen(p){await p.evaluate(()=>window.__openUploadQA());await p.getByRole('dialog').waitFor();}
async function state(p){return p.evaluate(()=>structuredClone(window.__uploadQA));}
const file={name:'새_발표자료.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 QA synthetic')};
const remove=p=>p.getByRole('dialog').getByRole('button',{name:/파일 삭제$|삭제$/}).first();
async function main(){
 const browser=await qa.chromium.launch({headless:true});
 try{
  for(const width of process.env.QA_SCENARIO?[]:[1440,768,390]){
   const context=await browser.newContext({viewport:{width,height:width===390?844:width===768?1024:900},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});
   await qa.guardNetwork(context);const p=await context.newPage();p.on('pageerror',e=>failures.push(e.message));
   await setup(p);await shot(p,'normal',width);
   if(phase==='before'){await p.setViewportSize({width,height:420});await shot(p,'short',width);await context.close();continue;}
   assert.equal(await p.getByRole('dialog').locator('.overflow-y-auto').evaluate(el=>el.scrollTop),0);
   for(let i=0;i<9;i++){await p.keyboard.press('Tab');assert(await p.getByRole('dialog').evaluate(el=>el.contains(document.activeElement)));}
   for(const close of ['취소','Close','Escape','outside']){
    await remove(p).click();await p.locator('input[type=file]').setInputFiles(file);
    if(close==='Escape')await p.keyboard.press('Escape');else if(close==='outside')await p.mouse.click(2,2);else await p.getByRole('button',{name:close,exact:true}).click();
    await p.getByRole('dialog').waitFor({state:'hidden'});assert.equal((await state(p)).requests.length,0);await reopen(p);assert.equal(await p.getByRole('dialog').getByRole('button',{name:/파일 삭제$|삭제$/}).count(),3);
   }cases.push({width,case:'cancel, close, Escape, backdrop discard without API'});
   await remove(p).click();await shot(p,'delete-draft',width);
   await p.evaluate(()=>window.__uploadQA.pause=true);await p.getByRole('button',{name:'저장',exact:true}).click();await p.waitForFunction(()=>!!window.__releaseUpload);
   await p.keyboard.press('Escape');await p.mouse.click(2,2);await p.getByRole('dialog').waitFor();assert(await p.getByRole('button',{name:'Close',exact:true}).isDisabled());await shot(p,'saving',width);
   await p.evaluate(()=>{window.__uploadQA.pause=false;window.__releaseUpload();});await p.getByRole('dialog').waitFor({state:'hidden'});assert.deepEqual((await state(p)).requests,[{method:'DELETE',id:1}]);assert.equal((await state(p)).files.length,2);
   await reopen(p);assert.equal(await p.getByRole('dialog').getByRole('button',{name:/파일 삭제$|삭제$/}).count(),2);cases.push({width,case:'delete-only; save lock and detail requery'});
   await remove(p).click();await p.locator('input[type=file]').setInputFiles(file);await p.evaluate(()=>{window.__uploadQA.failDelete=true;window.__uploadQA.delay=0;});
   await p.getByRole('button',{name:'저장',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});
   let s=await state(p);assert.deepEqual(s.requests.map(r=>r.method),['DELETE','POST','DELETE']);assert.equal(s.files.length,3);assert(s.reads>=3);await reopen(p);await shot(p,'partial-failure-reopened',width);cases.push({width,case:'partial failure refresh, discarded draft, upload before delete'});
   await p.setViewportSize({width,height:420});await shot(p,'short',width);await p.getByRole('dialog').locator('.overflow-y-auto').evaluate(el=>el.scrollTop=el.scrollHeight);await shot(p,'short-files',width);await context.close();
  }
  if(phase!=='before')for(const scenario of process.env.QA_SCENARIO?[process.env.QA_SCENARIO]:['one','last','long','initial','expired','limits','addition','replacement','full-limit']){
   const context=await browser.newContext({viewport:{width:390,height:844},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'allow'});await qa.guardNetwork(context);const p=await context.newPage();p.on('pageerror',e=>failures.push(e.message));
   await setup(p,{count:['one','last'].includes(scenario)?1:scenario==='initial'?0:3,max:scenario==='one'?1:['limits','full-limit'].includes(scenario)?3:5,long:scenario==='long',initial:scenario==='initial',expired:scenario==='expired'});
   if(['one','last'].includes(scenario)){await remove(p).click();if(scenario==='one')await p.locator('input[type=file]').setInputFiles(file);assert(await p.getByRole('button',{name:'저장',exact:true}).isDisabled());assert.equal((await state(p)).requests.length,0);}
   if(scenario==='initial'){await p.locator('input[type=file]').setInputFiles(file);await p.getByRole('button',{name:'저장',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});assert.equal((await state(p)).requests[0].method,'CREATE');assert.equal((await state(p)).requests[0].teamId,'101');await reopen(p);}
   if(scenario==='expired'){await remove(p).click();await p.getByRole('button',{name:'저장',exact:true}).click();assert.equal((await state(p)).requests.length,0);await p.getByRole('dialog').waitFor();}
   if(scenario==='limits'){await p.locator('input[type=file]').setInputFiles([file,{...file,name:'bad.exe'},{...file,name:'large.pdf',buffer:Buffer.alloc(11*1024*1024)}]);assert.equal(await p.getByRole('dialog').getByRole('button',{name:/파일 삭제$|삭제$/}).count(),3);assert.equal((await state(p)).requests.length,0);}
   if(['addition','replacement','full-limit'].includes(scenario)){
    if(scenario!=='addition')await remove(p).click();await p.locator('input[type=file]').setInputFiles(file);await p.getByRole('button',{name:'저장',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});
    const s=await state(p);assert.deepEqual(s.requests.map(r=>r.method),scenario==='addition'?['POST']:scenario==='full-limit'?['DELETE','POST']:['POST','DELETE']);assert.equal(s.files.length,scenario==='addition'?4:3);await reopen(p);
   }
   if(scenario==='long')assert.equal(await p.getByRole('dialog').locator('.overflow-y-auto').evaluate(el=>el.scrollTop),0);
   await shot(p,scenario,390);cases.push({width:390,case:scenario});
   if(['one','last'].includes(scenario)){
    await p.setViewportSize({width:390,height:420});await shot(p,scenario+'-short',390);
    assert(await p.getByRole('alert').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}));
   }
   await context.close();
  }
 }catch(e){failures.push(e.stack||String(e));console.error(e);process.exitCode=1;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'submission-checks.json'),JSON.stringify({checks,cases,failures:[...failures,...qa.errors]},null,2));console.log(JSON.stringify({out,captures:checks.length,cases:cases.length,failures:[...failures,...qa.errors]}));}
}
main();

```

## .qa/admin-298.cjs (shared local adapter)

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
