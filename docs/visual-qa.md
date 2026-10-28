# OPUS 시각적 QA (Playwright)

## 목적

기능 검증과 **시각적 완성도 검토**를 분리합니다. 화면 캡처는 시각적 리뷰를 위한 증거이며, 캡처 성공 자체가 UI/UX 또는 심미성의 합격을 의미하지는 않습니다.

초기 범위는 공개 화면(홈, 로그인, 회원가입)과 모바일 홈 사이드바입니다. 실제 백엔드, 운영 서버, 사용자 계정 없이 **MSW의 개발용 합성 데이터**로 확인합니다. 관리자·권한별 화면은 안전한 역할 fixture를 확보한 뒤 확대합니다.

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
- `.qa/visual/results.json`: 스크린샷 목록, JavaScript 오류와 문서의 가로 넘침 수치
- GitHub Actions `Visual QA` 실행 결과의 artifact: 동일한 캡처 및 진단 자료

`.qa/`는 Git에서 제외됩니다. 이 시각적 QA는 공개 화면만 캡처하도록 설계되었습니다. 실사용자 정보나 로그인 토큰을 넣지 마세요.

가로 넘침은 **초기 도입 시 경고/진단 데이터**로 수집합니다. 기존 화면의 베이스라인 문제를 파악한 다음 회귀 차단 규칙을 별도 적용합니다. 홈에서는 실제 대회·아카이브·공지 콘텐츠를 기다리고 오류 패널이 없는지 확인합니다. 한글 표본을 사용해 Noto Sans KR의 400·700 굵기 폰트를 제한 시간 안에 로드하고 확인하며, 캡처별 `koreanFontLoaded`에 기록합니다. 폰트·화면 준비 실패, 처리되지 않은 JavaScript 오류와 차단된 네트워크 요청도 결과에 반영합니다. `passed: true`는 이 자동화 조건의 통과이며 시각적 품질 승인과는 별개입니다.

## UI 변경 PR 리뷰 순서

1. 관련 Notion 정책, Figma의 정확한 node, 기존 OPUS 화면과 토큰을 확인합니다.
2. Playwright 캡처를 생성해 **실제 이미지**를 검토합니다. 코드만 보고 화면 완성도를 확정하지 않습니다.
3. 타이포그래피, 간격과 정렬, 정보 위계, 색상 대비, 콘텐츠 밀도, 모바일 구조, Hover/Focus/Disabled/Empty/Error 상태를 확인합니다.
4. 발견한 시각적 문제를 수정한 후 **다시 캡처**합니다. 가능하면 Before/After 이미지를 제공합니다.
5. 코드·기능 검증과 시각적 검증을 구분해 PR 리뷰에 반영합니다. 브라우저 접근이 불가능한 경우 시각적 QA를 완료했다고 표시하지 않습니다.

현재 자동화는 레이아웃 진단과 이미지 생성까지만 보장합니다. AI의 심미성 검토, Figma와의 일치 여부, 상세 관리자 플로우 검증은 별도 리뷰 단계입니다.

첫 공개 화면의 실제 이미지 검토와 후속 이슈는 [2026-10-29 검토 기록](./visual-qa-review-2026-10-29.md)에 정리했습니다.
