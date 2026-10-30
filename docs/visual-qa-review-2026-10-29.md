# 공개 화면 시각 검토 — 2026-10-29

> 아래는 당시 고정 캡처 방식의 역사적 검토 기록입니다. 해당 명령·환경 변수·갤러리는 현재 제거되었습니다. 현재 실행 방법과 검증 범위는 [Browser QA 가이드](./browser-qa.md)를 따릅니다.

## 검토 범위

PR #314의 기존 Playwright 환경을 Windows/Chromium에서 실행하고 합성 MSW 데이터로 생성한 이미지를 직접 검토했다. 기준 앱은 `develop@0fd079e`, 최초 QA 실행은 `85947aa`다. 운영 서버·실제 계정·인증 토큰은 사용하지 않았다.

검토한 화면은 홈, 로그인 최초 안내, 로그인 기본, 회원가입 각각의 1440×900 / 768×1024 / 390×844 캡처와 390px 홈 메뉴 열림이다. 총 13개 이미지를 확인했다. 최초 측정에서 문서 가로 넘침은 모두 0px이었지만, 이 수치만으로 심미성과 UX를 합격 처리하지 않았다.

QA 보완 후 같은 기준 앱을 재촬영하여 13개 캡처 모두 한글 폰트 로딩과 가로 넘침 0px을 확인했다. 포트 충돌, MSW 미처리 API와 다른 origin 요청 차단, 서버 종료는 별도의 합성 요청으로 확인했다. 최초 실행에서 확인하지 못했던 폰트 준비 상태와 오버레이 촬영 범위를 보완한 결과다.

스크린샷 원본과 갤러리는 실행별 GitHub Actions `Visual QA` artifact의 `index.html`, `results.json`, PNG 파일로 확인한다. 전체 페이지 캡처는 콘텐츠 길이를, 최초 안내·드로어처럼 고정 위치 레이어가 있는 화면은 실제 viewport 캡처를 기준으로 검토한다.

## 디자인 근거

OPUS Renewal의 SCREENS(`14:6`)와 ARCHIVE(`14:11`)를 확인했다. 회의록의 `14:12`는 관리자 Phase 2 전체 흐름으로, 공개 홈·일반 로그인·회원가입의 최종 디자인이 아니다. 일반 공개 화면과 일치하는 최종 node는 확인되지 않아 다음 공통 컴포넌트와 기존 OPUS 실제 화면을 함께 참고했다.

- [Header — 14:90](https://www.figma.com/design/HbyxwchvTkzD4pbtdjCHkg/OPUS-Renewal?node-id=14-90): 데스크톱 전체 로고와 모바일 심볼, 우측 계정 액션의 위계.
- [Button — 14:73](https://www.figma.com/design/HbyxwchvTkzD4pbtdjCHkg/OPUS-Renewal?node-id=14-73): 파란 주요 액션과 중립 보조 액션의 구분.
- [TextField — 687:3271](https://www.figma.com/design/HbyxwchvTkzD4pbtdjCHkg/OPUS-Renewal?node-id=687-3271): 절제된 테두리·배경과 입력값/placeholder 구분.
- [Sidebar — 33:263](https://www.figma.com/design/HbyxwchvTkzD4pbtdjCHkg/OPUS-Renewal?node-id=33-263)는 관리자 메뉴이므로 공개 대회 탐색의 직접 기준으로 사용하지 않는다.
- `src/index.css`의 Noto Sans KR, mainBlue/mainGreen/Gray 토큰과 기존 홈 `EditorialHome.css` 테마를 확인했다. Renewal을 전체 서비스 디자인 시스템으로 간주하지 않는다.

이 검토는 공개 화면이 Figma 최종 화면과 일치함을 보증하지 않는다.

## 이미지별 판단

| 캡처 | 확인한 점 | 개선할 점 |
|---|---|---|
| home-desktop | 홈의 남색·청록 테마, 공지→대회→프로젝트 위계와 정렬이 유지됨 | 긴 공지 제목 식별성, 본문 대비 작은 날짜·보조 정보는 후속 개선 시 함께 검토 |
| home-tablet | 드로어 진입점과 한 열 대회 배치, 프로젝트 영역의 반응형 전환 확인 | 4개 대회를 한 열로 나열할 때 카드 높이·빈 공간이 누적됨 |
| home-mobile | 가로 넘침 없이 대회·프로젝트가 쌓이고 텍스트가 겹치지 않음 | 마스코트와 공지의 두 열 구조가 공지 폭을 과도하게 줄임. 제목이 짧게 잘려 내용을 구분하기 어려움 |
| home-sidebar-open-mobile | 카테고리·대회 계층과 선택점은 식별 가능 | 헤더 진입점 목적·긴 이름·확장/선택 구분은 기존 #304 범위에서 개선. 전체 페이지 이미지의 viewport 밖을 실제 열린 드로어 모습으로 해석하면 안 됨 |
| signin-desktop/tablet/mobile | 입력·로그인 버튼·소셜 로그인·보조 링크가 분리되어 있음 | 폼 아래 큰 빈 공간과 화면 높이를 넘는 footer, 희미하고 작은 보조 링크, 제목과 폼 간격 재검토 필요 |
| signin-onboarding-desktop/tablet | 안내 문구·확인 버튼과 가입 링크 연결을 읽을 수 있음 | 전체 화면 blur와 안내 집중 방식은 기존 동작으로 기록. 화면 전체가 실제 상호작용 영역인지 별도 기능 QA 필요 |
| signin-onboarding-mobile | 안내 문구와 확인 동작이 화면 안에 있음 | 말풍선 오른쪽 경계가 viewport에 붙어 안전한 여백이 부족함 |
| signup-desktop/tablet | 레이블·입력 열과 이메일 인증 액션의 정렬이 유지됨 | 작은 원형 가입 버튼과 약한 강조가 로그인 주요 액션과 불일치. 보조 문구/레이블 대비 검토 필요 |
| signup-mobile | 필드·인증 버튼이 한 열로 전환되어 겹치지 않음 | 그룹 사이 여백이 크게 누적되고, 하단 가입 액션이 중립 회색으로 표시되어 중요도와 상태를 읽기 어려움 |

Mock Banner 글자, 반복되는 샘플 프로젝트와 과거 샘플 날짜는 fixture 특성이며 운영 콘텐츠 결함으로 분류하지 않았다. 날짜가 실제로 지난 경우의 투표 종료 표시는 상태 예시다. 스크린샷 축소 표시 때문에 작아 보이는 글자와 실제 원본의 작은 텍스트를 구분해 검토했다.

## 후속 이슈와 경계

- [#330](https://github.com/PNUops/opus-frontend/issues/330): 홈 공지의 모바일 가독성과 콘텐츠 밀도.
- [#331](https://github.com/PNUops/opus-frontend/issues/331): 로그인·가입 여백, 주요 액션, 모바일 안내 배치.
- [#304](https://github.com/PNUops/opus-frontend/issues/304): 기존 사이드바/헤더 탐색 개선.

당시 작업은 캡처 기반의 검증·보완이며, 위 제품 UI를 수정하거나 시각적으로 최종 승인한 작업은 아니었다. 이후 #314는 도메인별 Browser QA 기반으로 개편되었다. 기존 `VISUAL_QA_BASE_URL` 연결 방식은 더 이상 지원하지 않는다. 제품 변경은 실제 변경 화면을 동일 조건의 Before/After로 직접 검토한다.

관리자·마이페이지, 역할별 권한, 로그인/가입의 성공·실패·인증 진행 상태, 모든 Hover/Focus/Empty/Error는 이번 13개 정적 캡처에 포함되지 않는다. 해당 화면을 검증할 때 기존 QA 환경에 합성 역할 fixture와 시나리오를 추가한다. 접근성 검사는 화면 검토만으로 완료됐다고 판단하지 않는다.
