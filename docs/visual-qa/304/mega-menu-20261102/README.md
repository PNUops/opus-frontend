# 메가 메뉴·헤더·푸터 최종 UI 캡처

- PR: [#341](https://github.com/PNUops/opus-frontend/pull/341)
- 화면 코드 기준: `8e2b328f1104f9bf1258f4b679aaebc65596c1ab`
- 캡처 날짜: 2026-11-02, Asia/Seoul
- 데이터: MSW 합성 카테고리·대회·공지·프로젝트. 실제 계정이나 운영 데이터는 사용하지 않았다.
- 환경: 기존 Playwright/Chromium, Noto Sans KR 400/600/700 로딩 확인, reduced motion, device scale factor 1.
- 실제 서비스 화면을 캡처했다. 배너와 프로젝트 썸네일은 기존 목 이미지이며, 개발 도구 UI만 숨겼다. 외부 네트워크 요청은 차단했다.

이 폴더는 헤더 메가 메뉴로 전환한 최종 화면을 기록한다. 상위 폴더의 2026-10-29 사이드바 캡처와 구분한다.

## 화면

| 파일                                                     | 확인할 변경사항                                           |
| -------------------------------------------------------- | --------------------------------------------------------- |
| [contest-desktop-1440.png](contest-desktop-1440.png)     | 사이드바를 제거한 대회 콘텐츠와 헤더의 카테고리 탐색      |
| [mega-menu-desktop-1440.png](mega-menu-desktop-1440.png) | 호버로 펼친 4열 목록, 검색, 선택 대회, 카테고리별 더 보기 |
| [mega-menu-mobile-390.png](mega-menu-mobile-390.png)     | 모바일 세로 메뉴, 긴 이름 줄바꿈과 내부 스크롤            |
| [mega-menu-home-1440.png](mega-menu-home-1440.png)       | 홈 전체 다크 배경과 다크 메가 메뉴                        |
| [header-scroll-1440.png](header-scroll-1440.png)         | 스크롤 후 상단 고정, 불투명도 15%와 4px backdrop blur     |
| [footer-desktop-1440.png](footer-desktop-1440.png)       | OPUS 소개, 주요 링크, 기관 명칭과 의견 보내기             |
| [footer-mobile-390.png](footer-mobile-390.png)           | 모바일 푸터 재배치와 관련 사이트 이름 줄바꿈              |
| [footer-home-1440.png](footer-home-1440.png)             | 홈 테마의 다크 푸터                                       |

데스크톱 뷰포트는 1440×1000, 모바일 메뉴는 390×844이다. 푸터는 요소 전체를 캡처했고, 스크롤 헤더는 화면 상단 1440×360을 캡처했다. 개별 경로·스크롤 위치·뷰포트·파일 크기는 [captures.json](captures.json)에 기록했다.

## 캡처 확인

- 8장 모두 직접 열어 메뉴 정렬, 긴 이름, 테마, 푸터 기관 명칭과 잘림 여부를 검토했다.
- 캡처 전 한글 폰트와 표시되는 이미지 로딩을 확인했다. 깨진 이미지와 브라우저 실행 오류는 0개다.
- 제품 코드는 수정하지 않았으며, 이번 커밋에는 검토 자료만 포함한다.
