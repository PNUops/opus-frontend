# OPUS 시각적 QA (Playwright)

## 목적

기능 검증과 **시각적 완성도 검토**를 분리합니다. 화면 캡처는 시각적 리뷰를 위한 증거이며, 캡처 성공 자체가 UI/UX 또는 심미성의 합격을 의미하지는 않습니다.

현재 CI의 `npm run qa:visual`은 **고정된 공개 화면(홈, 로그인, 회원가입)과 모바일 홈 사이드바를 검사하는 Browser Smoke QA**입니다. 실제 백엔드, 운영 서버, 사용자 계정 없이 **MSW의 개발용 합성 데이터**로 확인합니다. 관리자·권한별 화면은 안전한 역할 fixture를 확보한 뒤 확대합니다.

이 명령은 **PR에서 변경한 화면을 자동으로 찾아 캡처하지 않으며**, 이전 스크린샷과 현재 스크린샷을 자동 비교하는 Visual Regression Test도 아닙니다. CI 통과만으로 변경한 UI가 검증되었다고 표시하지 마세요.

## 로컬 실행

Node.js 22 이상과 Chromium 실행에 필요한 OS 라이브러리가 필요합니다. 기존 `npm ci`/앱 lockfile을 바꾸지 않도록 Playwright를 `.qa/`에 별도 설치합니다.

```bash
npm ci
npm install --prefix .qa --no-save --package-lock=false playwright@1.55.0
node .qa/node_modules/playwright/cli.js install chromium
npm run qa:visual
```

Linux CI에서는 브라우저 OS 라이브러리도 설치하도록 `install --with-deps chromium`을 사용합니다. Windows PowerShell에서 실행 정책 때문에 `npm`을 실행할 수 없으면 `npm.cmd`를 사용합니다.

실행 스크립트가 `127.0.0.1:4173`에 Vite 개발 서버를 기동하며, `VITE_USE_MSW=true`, 빈 `VITE_API_BASE_URL`을 강제합니다. 다른 포트가 필요하면 `VISUAL_QA_PORT`를 지정합니다. 자식 Vite 프로세스의 준비 신호를 확인하므로 포트 충돌 시 기존 서버로 연결하지 않고 실패합니다. Vite는 Node의 모듈 탐색으로 찾으므로 상위 의존성을 공유하는 worktree에서도 사용할 수 있습니다.

기존 로컬 서버를 사용해야 하면 `VISUAL_QA_BASE_URL=http://127.0.0.1:<port>`를 설정할 수 있으나 **해당 서버에서 MSW가 활성화되어 있어야 합니다**. 주소에는 인증 정보·경로·쿼리·해시를 넣지 않습니다. 각 viewport는 저장된 계정 정보가 없는 새 브라우저 context를 사용하며 MSW controller 활성화를 확인합니다. 자신이 시작한 Vite와 브라우저는 성공·실패·중단 시 정리하며, 결과 파일 저장 실패가 프로세스 정리를 막지 않습니다.

브라우저의 실제 네트워크 요청은 동일 origin의 앱 파일만 허용합니다. `/api` 요청은 MSW가 응답해야 하며, 미처리 API가 네트워크로 전달되면 차단하고 QA를 실패 처리합니다. 외부 요청도 차단하되 현재 OPUS 한글 폰트를 위한 `https://fonts.googleapis.com/css2`와 `https://fonts.gstatic.com/s/`만 허용합니다. 차단 기록에는 origin과 리소스 종류만 남기며 경로·쿼리·헤더·본문을 저장하지 않습니다. 운영 주소나 실제 계정 정보를 넣지 마세요.

MSW 자체의 네트워크 요청까지 검사하기 위해 Playwright 1.55의 `PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS=1`을 스크립트가 활성화합니다. [Playwright의 Service Worker 네트워크 처리 문서](https://playwright.dev/docs/service-workers#network-events-and-routing)를 참고하세요. Playwright를 변경할 때에는 미처리 API·외부 요청이 실제로 차단되는지 다시 확인해야 합니다.

## 결과 확인

- `.qa/visual/index.html`: 화면별 이미지 갤러리
- `.qa/visual/*.png`: 1440×900 / 768×1024 / 390×844 각 화면 캡처. 일반 화면은 전체 페이지, 온보딩·사이드바 오버레이는 viewport 영역만 촬영합니다.
- `.qa/visual/results.json`: 성공적으로 캡처한 화면 목록, 화면별 실패 기록·JavaScript 오류와 문서의 가로 넘침 수치
- GitHub Actions `Visual QA` 실행 결과의 artifact: 동일한 캡처 및 진단 자료

`.qa/`는 Git에서 제외됩니다. 이 시각적 QA는 공개 화면만 캡처하도록 설계되었습니다. 실사용자 정보나 로그인 토큰을 넣지 마세요.

매 실행 시작 시 `.qa/visual/`의 이전 결과물을 삭제합니다. 개별 화면 캡처가 실패하면 화면명과 뷰포트를 오류로 남기고 가능한 나머지 화면 검사를 계속합니다. 브라우저·서버 자체가 실행되지 않는 경우에는 검사를 중단합니다. 하나라도 실패하면 최종 CI는 실패하며, 성공한 캡처와 오류 기록은 가능한 범위에서 업로드합니다.

가로 넘침은 **초기 도입 시 경고/진단 데이터**로 수집합니다. 기존 화면의 베이스라인 문제를 파악한 다음 회귀 차단 규칙을 별도 적용합니다. 홈에서는 실제 대회·아카이브·공지 콘텐츠를 기다리고 오류 패널이 없는지 확인합니다. 한글 표본을 사용해 Noto Sans KR의 400·700 굵기 폰트를 제한 시간 안에 로드하고 확인하며, 캡처별 `koreanFontLoaded`에 기록합니다. 폰트·화면 준비 실패, 처리되지 않은 JavaScript 오류와 차단된 네트워크 요청도 결과에 반영합니다. `passed: true`는 이 자동화 조건의 통과이며 시각적 품질 승인과는 별개입니다.

## UI 변경 PR의 개발자 검증 절차

1. 변경한 기능의 최신 Notion 정책, 정확한 Figma node(있는 경우), 기존 OPUS 화면·컴포넌트·토큰을 확인합니다.
2. **변경한 화면을 실제 브라우저에서 열어** 데스크톱·모바일 레이아웃을 확인합니다. 브라우저 개발자 도구나 Playwright를 활용해 캡처할 수 있지만, `npm run qa:visual`만으로 변경 화면이 검증되지는 않습니다.
3. 변경 범위에 맞춰 타이포그래피·여백·정렬·정보 위계·색상 대비와 관련 Hover/Focus/Disabled/Loading/Empty/Error 상태 및 상호작용을 확인합니다. 해당하지 않는 상태를 억지로 만들 필요는 없습니다.
4. 발견한 문제를 수정하고 변경 화면을 다시 확인합니다. UI 변경 PR에는 **실제 변경 화면의 스크린샷 또는 영상**과 확인한 뷰포트·상태를 첨부합니다. 변경 전후 비교가 의미 있으면 Before/After를 제공합니다.
5. 기능 검증, 수동 시각적 검토, CI의 공통 Smoke QA 결과를 구분해 PR에 기록합니다. 실제 브라우저로 확인하지 못한 항목은 **미검증**으로 밝힙니다.

현재 스크립트의 `screens` 배열은 공통 공개 화면만 정의합니다. 단일 기능 화면을 검증하기 위해 이 배열에 임시 URL을 추가하거나 인증 정보·실사용자 데이터를 넣는 방식은 사용하지 마세요. 반복 검증이 필요한 핵심 사용자 흐름의 Playwright Test·권한별 fixture·스크린샷 기준 이미지 비교는 후속 작업으로 설계합니다.

현재 자동화는 공통 공개 화면의 렌더링 검사·레이아웃 진단과 이미지 생성까지만 보장합니다. 심미성 검토, Figma와의 일치 여부, 상세 관리자 플로우 검증은 변경 UI의 별도 리뷰 단계입니다.

첫 공개 화면의 실제 이미지 검토와 후속 이슈는 [2026-10-29 검토 기록](./visual-qa-review-2026-10-29.md)에 정리했습니다.
