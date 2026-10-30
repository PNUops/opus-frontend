# OPUS Browser QA — 구현·검증 참고 문서

> 이 문서는 [Browser QA 운영 가이드](./browser-qa.md)의 기술적 보조 자료입니다. 구체적인 설정·실행 방법·검증 이력을 관리하며, 운영 정책은 가이드를 따릅니다.
>
> **기준:** 현재 로컬 작업트리의 코드·설정·실행 방법. 6절의 로컬 검증 기록은 2026-10-30 수행 결과입니다.

## 1. 현재 구현

Playwright Test Runner 기반 도메인 테스트, 기존 MSW를 재사용하는 시나리오 Fixture, 네트워크 가드, 실행 명령과 CI 설정이 구현되어 있습니다. 이 문서는 해당 코드를 사용하는 방법과 동작 범위를 설명합니다.

| 항목           | 구현과 확인 위치                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Runner         | [playwright.config.ts](../playwright.config.ts), `tests/browser/<domain>/*.spec.ts` 자동 발견                                            |
| 의존성·명령    | [package.json](../package.json), [package-lock.json](../package-lock.json)에 `@playwright/test@1.64.1` 고정 및 `test:browser*` 명령 등록 |
| 실제 기능 예제 | [인증](../tests/browser/auth/sign-in.spec.ts), [대회](../tests/browser/contest/list.spec.ts)                                             |
| 공통 Fixture   | [fixtures/test.ts](../tests/browser/fixtures/test.ts): 가드 설치, 시나리오 전달, MSW·오류 확인, 진단 첨부                                |
| MSW 재사용     | [기존 worker](../src/mocks/browsers.ts), [도메인 핸들러](../src/mocks/handlers/index.ts), `src/mocks/data/`                              |
| QA 진입점      | [support/vite.config.ts](../tests/browser/support/vite.config.ts), [support/bootstrap.ts](../tests/browser/support/bootstrap.ts)         |
| 네트워크 검증  | [infrastructure/network.spec.ts](../tests/browser/infrastructure/network.spec.ts)                                                        |
| CI 설정        | [.github/workflows/visual-qa.yml](../.github/workflows/visual-qa.yml): 이름 `Browser QA`, 타입 검사 및 전체 테스트                       |
| PR 템플릿      | [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md): 현재 운영 가이드 참조, 실제 변경 화면 검토 및 이미지 요구       |
| 레거시 정리    | `qa:visual`, `tests/browser-visual-qa.cjs` 제거. `docs/visual-qa.md`를 현재 두 문서로 대체                                               |

## 2. 설치와 로컬 실행

Node.js 22를 사용합니다. 다음 명령은 현재 로컬 `package.json`에 등록되어 있습니다.

```bash
npm ci
npx playwright install chromium
npm run test:browser                    # 전체 도메인 + 인프라
npm run test:browser -- auth            # 인증 도메인
npm run test:browser -- contest         # 대회 도메인
npm run test:browser -- auth --grep "서버 오류"
npm run test:browser -- auth --workers=1 # 순차 실행으로 격리 점검
npm run test:browser -- --list           # 발견된 테스트 목록
npm run test:browser:ui                  # 테스트 탐색·재실행 UI
npm run test:browser:debug -- auth       # Inspector 디버깅
npm run test:browser:typecheck
npm run test:browser:report              # 마지막 HTML report
npm run test:browser:trace -- .qa/browser/results/<test>/trace.zip
```

Trace 명령의 `<test>`는 실제 실패 결과 디렉터리명으로 바꿉니다. Linux CI는 `npx playwright install --with-deps chromium`으로 OS 라이브러리도 설치합니다. Windows PowerShell 정책으로 npm 스크립트를 실행하지 못하면 `npm.cmd`와 `npx.cmd`를 사용합니다.

### 실행 설정

| 항목      | 현재 설정                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| 서버      | `http://127.0.0.1:4173`의 Vite 개발 서버                                                                      |
| 포트 변경 | `BROWSER_QA_PORT`, 정수 1024~65535                                                                            |
| 서버 관리 | Playwright `webServer`가 시작·종료. `reuseExistingServer: false`, Vite `strictPort: true`로 포트 충돌 시 실패 |
| 환경      | `VITE_USE_MSW=true`, 빈 `VITE_API_BASE_URL` 강제. QA Vite 설정에서 기존 환경변수보다 우선 적용                |
| 브라우저  | Chromium, 1440×900, `ko-KR`, `Asia/Seoul`, light, reduced motion                                              |
| 병렬 실행 | `fullyParallel: true`, worker 2개. CLI의 `--workers`로 변경 가능                                              |
| 제한 시간 | 테스트·탐색·서버 시작 60초, assertion·action 10초                                                             |
| 재시도    | `retries: 0`, CI에서 `test.only` 금지                                                                         |

PowerShell 포트 변경 예: `$env:BROWSER_QA_PORT = '4174'`. 원격 base URL이나 기존 서버 재사용 옵션은 제공하지 않습니다. `test:browser:server`는 Runner가 호출하는 QA 전용 서버 명령이며, 일반 개발에는 `npm run dev`를 사용합니다.

## 3. 아키텍처와 도메인 테스트 추가

```text
playwright.config.ts                    실행 설정, Chromium, webServer, 결과
tests/browser/auth/*.spec.ts            인증 시나리오
tests/browser/contest/*.spec.ts         대회 시나리오
tests/browser/fixtures/test.ts          공통 Fixture·진단·네트워크 격리
tests/browser/fixtures/msw/<domain>/*.ts 상태별 MSW 오버라이드
tests/browser/support/                 준비 확인·선택적 캡처·QA 진입점
tests/browser/infrastructure/          네트워크 격리 검증
tests/browser/tsconfig.json             테스트와 관련 코드 타입 검사
```

QA Vite 설정만 HTML의 `/src/main.tsx` 진입점을 `support/bootstrap.ts`로 바꿉니다. 일반 개발·빌드의 진입점은 바뀌지 않습니다. HTML 진입점 경로가 달라지면 QA 설정도 갱신해야 하며, 현재 설정은 예상한 진입점이 없으면 오류를 발생시킵니다.

Bootstrap은 기존 `src/mocks/browsers.ts`의 worker를 가져와 핸들러를 초기화하고, 선택한 시나리오의 `worker.use()`를 적용한 뒤 실제 `src/main.tsx`를 import합니다. 앱의 기존 MSW 시작, React Provider, Router, 인증 로직을 사용하므로 **React의 첫 API 요청 전에** 오버라이드가 설치됩니다.

### 3.1 공통 Fixture 사용

새 파일을 `tests/browser/<domain>/<feature>.spec.ts`에 추가합니다. 중앙 목록에 등록할 필요가 없습니다. **일반 도메인 테스트는 반드시 다음 import를 사용합니다.**

```ts
import { test, expect } from '../fixtures/test';
```

이 Fixture가 네트워크 가드, 시나리오 전달, 페이지 JavaScript 오류 수집을 준비하고 `afterEach`에서 MSW·네트워크 위반·미처리 오류를 검사합니다. `@playwright/test`에서 `test`를 직접 가져오면 이 보호가 적용되지 않습니다. 현재 인프라 테스트는 의도적으로 차단 요청을 만들기 위해 가드를 직접 설치하고 차단 기록을 검사하는 예외입니다.

### 3.2 시나리오 Fixture 작성과 선택

기본 응답은 기존 MSW 핸들러를 재사용합니다. 필요한 상태만 `tests/browser/fixtures/msw/<domain>/<scenario>.ts`에 `handlers` 배열로 export합니다. 파일은 glob으로 발견되며 별도 등록 코드가 없습니다.

```ts
// tests/browser/fixtures/msw/contest/empty.ts
import { http, HttpResponse } from 'msw';
import type { CurrentContestResponseDto } from '../../../../../src/types/DTO/contestsDto';

export const handlers = [
  http.get('/api/contests/current', () => HttpResponse.json([] satisfies CurrentContestResponseDto[])),
];
```

```ts
// tests/browser/contest/<feature>.spec.ts
import { test, expect } from '../fixtures/test';

test.describe('진행 중인 대회가 없는 경우', () => {
  test.use({ mockModules: ['contest/empty'] });

  test('최근 대회를 표시하고 새로고침해도 시나리오를 유지한다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('region', { name: '최근 대회 3개', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('region', { name: '최근 대회 3개', exact: true }).getByRole('link')).toHaveCount(3);
  });
});
```

`mockModules`는 `fixtures/msw/` 기준의 확장자 없는 경로입니다. `test.use`는 파일 또는 describe 선언 범위에서 지정합니다. 여러 모듈을 지정하면 **뒤에 지정한 모듈의 핸들러가 우선**합니다. 하위 describe에서 배열을 지정하면 상위 배열을 대체하므로 함께 필요한 모듈을 모두 적습니다.

| 시나리오                    | 현재 사용하는 데이터·Fixture                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 로그인 성공·잘못된 비밀번호 | 기존 `src/mocks/handlers/sign-in.ts`, `src/mocks/data/sign-in.ts`. 알려진 합성 이메일과 비밀번호 `test`는 성공, 나머지는 400 |
| 역할별 메뉴                 | 기존 학생/팀장·교수 합성 계정으로 실제 로그인. 인증 상태를 제품 로직 우회로 설정하지 않음                                    |
| 로그인 서버 오류            | `auth/unavailable`: 로그인 API에 503 반환                                                                                    |
| 로그인 후 헤더 알림 조회    | `auth/notifications`: 기존 핸들러가 없어 실제 DTO의 빈 배열 응답을 추가                                                      |
| 진행 중인 대회 없음         | `contest/empty`: 빈 배열 응답으로 최근 대회 fallback 검증                                                                    |

기존 대회 팀 일괄 등록 핸들러처럼 오류 응답이 고정된 API는 성공·실패 계약을 확인한 뒤 필요한 시나리오만 추가합니다. `page.route().fulfill()`로 별도 Mock API 체계를 만들지 않습니다.

### 3.3 상태 격리와 쓰기 상태의 한계

- 각 테스트는 새 BrowserContext를 사용하므로 쿠키·localStorage·Service Worker를 다른 테스트와 공유하지 않습니다.
- 선택한 `mockModules`는 `addInitScript`로 전달됩니다. 새로고침이나 전체 문서 이동에도 React 실행 전에 다시 적용됩니다.
- SPA 내부 라우팅에서는 같은 문서의 모듈 상태를 유지하지만, **새 문서에서는 Fixture 모듈과 앱의 메모리 상태가 초기화**됩니다.
- 따라서 현재 대회 테스트가 검증하는 것은 **빈 데이터 시나리오의 재적용**입니다. 쓰기 결과가 새로고침 후에도 유지되는 일반적인 Mock 저장소를 제공하는 것은 아닙니다.
- 같은 문서에서 `생성 → 목록 반영`을 검증하려면 해당 Fixture 안에서 상태를 관리하고 기존 데이터의 복제본으로 초기화합니다. 새로고침 이후의 저장 결과까지 필요하면 해당 테스트 안에서 지속되는 상태를 별도로 설계합니다. 테스트 간 공유 파일·Node 전역 상태에 의존하지 않습니다.

## 4. 네트워크 정책과 진단

[network.ts](../tests/browser/support/network.ts)는 실제 브라우저 네트워크에 다음 정책을 적용합니다.

| 요청                        | 처리                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| 동일 origin의 비 API 리소스 | 허용                                                                |
| `/api` 및 하위 경로         | MSW 응답만 허용. 네트워크로 전달되는 미처리 요청은 차단             |
| 외부 HTTP(S)                | 기본 차단                                                           |
| 한글 폰트 예외              | HTTPS `fonts.googleapis.com/css2`, `fonts.gstatic.com/s/` 경로 허용 |
| WebSocket                   | 같은 host·port의 로컬 `ws:`만 허용하여 Vite HMR 지원                |

앱의 `worker.start({ onUnhandledRequest: 'bypass' })`는 유지합니다. MSW가 처리하지 않은 API가 실제 네트워크로 전달되면 BrowserContext의 가드가 차단합니다. Playwright 1.64.1은 Service Worker 네트워크 라우팅을 기본 지원하므로 예전 `PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS` 환경 변수는 사용하지 않습니다. `serviceWorkers: 'allow'`가 필요하며, `'block'`으로 바꾸면 MSW도 동작하지 않습니다.

[infrastructure/network.spec.ts](../tests/browser/infrastructure/network.spec.ts)는 정상 MSW 응답, worker를 거친 미처리 API·외부 요청 차단, worker가 없는 문서의 외부 요청·WebSocket 차단을 검사합니다. 금지 요청을 차단했을 때 이 검증 테스트 자체는 통과합니다. 라이브러리 버전을 바꿀 때 이 테스트와 공통 Fixture의 실제 실패 처리를 다시 확인하세요.

공통 Fixture는 미처리 `pageerror`와 금지된 네트워크 요청을 테스트 실패로 처리합니다. 예상한 400·503 응답 자체나 모든 `console.error`를 실패로 간주하지는 않습니다. 정상 오류 시나리오는 테스트에서 실제 UI 결과를 검증합니다.

`browser-diagnostics` JSON 첨부는 오류 이름과 차단된 origin·리소스 종류·worker 여부를 기록하며, 요청 경로·쿼리·헤더·본문을 기록하지 않습니다. Trace는 별도로 DOM·네트워크·콘솔을 포함할 수 있습니다. 합성 데이터만 사용하고 공유 전 검토하세요. 진단 JSON의 최소 기록 정책이 Trace 전체의 자동 마스킹을 의미하지 않습니다.

## 5. 결과 확인과 CI

### 5.1 로컬 결과와 선택적 시각 검토

| 결과              | 위치·동작                                                             |
| ----------------- | --------------------------------------------------------------------- |
| HTML Report       | `.qa/browser/report/index.html`, `npm run test:browser:report`로 열기 |
| 실패 스크린샷     | `.qa/browser/results/<test>/test-failed-*.png`                        |
| 실패 Trace        | `.qa/browser/results/<test>/trace.zip`                                |
| 진단 JSON         | HTML Report의 `browser-diagnostics` 첨부                              |
| 성공한 테스트     | 기본 스크린샷·Trace를 남기지 않음                                     |
| 서버 기동 전 실패 | 스크린샷·Trace가 없을 수 있으므로 실행 로그 확인                      |

다음 실행에서 결과 디렉터리가 갱신되므로 보존할 실패 결과는 먼저 복사합니다. `.qa/`는 Git에서 제외됩니다.

시각적 검토가 필요한 테스트만 [support/screenshot.ts](../tests/browser/support/screenshot.ts)의 `attachScreenshot(page, testInfo, '변경 화면')`을 호출합니다. 한글 샘플로 Noto Sans KR 400·700 로딩을 확인한 뒤 전체 페이지 이미지를 report에 첨부합니다. 이 호출을 명시하면 성공한 테스트에도 이미지가 남습니다. 기본 실패 스크린샷은 Playwright가 직접 수집하며 이 폰트 확인을 거치지 않습니다.

뷰포트는 해당 describe에서 `test.use({ viewport: { width: 390, height: 844 } })`처럼 지정할 수 있습니다. 자동 이미지 비교나 baseline 시스템은 아직 구현하지 않았습니다.

### 5.2 로컬 워크플로우 파일의 CI 설정

로컬 [.github/workflows/visual-qa.yml](../.github/workflows/visual-qa.yml)의 설정은 다음과 같습니다.

- `develop` 대상 PR 및 `workflow_dispatch` 실행.
- Node 22 → `npm ci` → Chromium·OS 의존성 설치 → `test:browser:typecheck` → `test:browser`.
- 테스트 실패를 Actions 실패로 전달.
- 실패 시 `.qa/browser/`만 `opus-browser-qa-${{ github.run_id }}` artifact로 업로드. 숨김 경로 포함, 보관 기간 14일.
- 성공 시 기본 artifact 업로드 없음.

워크플로우 이름은 `Browser QA`, 파일명·job id는 `visual-qa`입니다. 기존 빌드 workflow와 `develop-pr-build` 체크는 유지합니다. 위 내용은 로컬 YAML에 정의된 실행 동작을 설명하며, GitHub Actions에서 실행한 결과를 의미하지 않습니다.

Artifact를 내려받은 경우에도 report 디렉터리를 `playwright show-report`에 전달하거나 Trace zip을 `test:browser:trace` 명령으로 열 수 있습니다.

## 6. 로컬 검증 기록과 범위

다음은 2026-10-30 구현 작업에서 Windows·Node 22·Chromium으로 수행한 로컬 검증 기록입니다. 문서 수정 시 테스트를 다시 실행한 결과로 해석하지 않습니다.

| 검증                                                                               | 결과·범위                                                                                                  |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 최종 lockfile의 `npm ci --offline --cache .qa/npm-cache`                           | 성공. 당시 다운로드한 캐시를 사용했으며 일반 설치 명령은 `npm ci`                                          |
| `npx playwright install chromium`                                                  | 성공                                                                                                       |
| `CI=true` 환경의 `npm run test:browser`                                            | 깨끗한 설치 후 전체 8개 통과                                                                               |
| `npm run test:browser -- auth --workers=1 --reporter=list --output=.qa/auth-check` | 인증 4개 순차 실행 통과                                                                                    |
| `npm run test:browser -- contest --reporter=list --output=.qa/contest-check`       | 대회 2개 통과                                                                                              |
| `npm run test:browser:typecheck`                                                   | 통과                                                                                                       |
| `npm run test:submission`                                                          | 기존 제출물 테스트 15개 통과                                                                               |
| `npm run build`                                                                    | 통과, 기존 청크 크기 경고                                                                                  |
| `npm run lint`                                                                     | 오류 0개, 기존 경고 5개                                                                                    |
| 임시 네트워크·JavaScript 오류 주입                                                 | 의도한 실패 종료와 각 스크린샷·Trace·진단 첨부 확인. 임시 실패 테스트 파일은 제거                          |
| 성공 결과 확인                                                                     | 기본 성공 테스트의 PNG·Trace 없음                                                                          |
| `test:browser:ui -- --ui-host=127.0.0.1 --ui-port=4181`                            | 서버 시작·HTTP 200 확인 후 종료                                                                            |
| `test:browser:debug -- --list`                                                     | 3개 spec, 8개 테스트 발견 확인. Inspector 수동 조작 검증은 미수행                                          |
| `test:browser:report -- --help`, `test:browser:trace -- --help`                    | CLI 인수 처리 확인. 생성된 보고서의 진단 첨부와 Trace zip 구조는 별도 검사, 뷰어의 수동 조작 검증은 미수행 |

실제 기능 테스트는 로그인 오류 후 재시도·홈 이동, 학생/교수 메뉴 차이, 비로그인 관리자 접근 거부, 테스트 간 인증 상태 격리, 기본 대회 목록·빈 데이터·새로고침을 다룹니다. 전체 OPUS 기능이나 실제 백엔드 계약을 검증한 것은 아닙니다.

추후 실제 저장 기능을 추가하면 해당 도메인의 상태 변경·초기화 전략도 검증합니다. Firefox·WebKit·실제 기기, 실백엔드 E2E, Visual Regression baseline은 현재 범위에 포함하지 않습니다.

## 7. 이력과 공식 참고 문서

기존 `qa:visual`은 공개 홈·인증 화면을 고정 캡처하는 스크립트였습니다. 현재 로컬에서는 이를 도메인별 Test Runner 구조로 대체했습니다. 과거 이미지 검토는 [2026-10-29 기록](./visual-qa-review-2026-10-29.md)에 보존합니다.

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Isolation](https://playwright.dev/docs/browser-contexts)
- [Service Workers](https://playwright.dev/docs/service-workers)
- [Web Server](https://playwright.dev/docs/test-webserver)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Visual comparisons](https://playwright.dev/docs/test-snapshots)
- [Retries](https://playwright.dev/docs/test-retries)
