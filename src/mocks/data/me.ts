import {
  GetMyProjectsResponseDto,
  GetMyVotesResponseDto,
  GetMyLikesPreviewResponseDto,
  GetMyLikesResponseDto,
} from 'types/DTO/meDto';

export const mockMyProjects: GetMyProjectsResponseDto = [
  {
    contestId: 1,
    contestName: '2026 SW 프로젝트 경진대회',
    teamId: 101,
    teamName: '코드마스터',
    projectName: 'AI 챗봇 플랫폼',
    awards: [
      { awardName: '최우수상', awardColor: '#FFD700' },
      { awardName: '참가상', awardColor: '#C0C0C0' },
    ],
  },
  {
    contestId: 2,
    contestName: '2025 해커톤',
    teamId: 102,
    teamName: '해커즈',
    projectName: '스마트 출석 시스템',
    awards: [],
  },
  {
    contestId: 3,
    contestName: '2024 아이디어톤',
    teamId: 103,
    teamName: '아이디어러버',
    projectName: '친환경 에너지 솔루션',
    awards: [{ awardName: '우수상', awardColor: '#C0C0C0' }],
  },
  {
    contestId: 4,
    contestName: '2023 기술 포럼',
    teamId: 105,
    teamName: '백엔드러버',
    projectName: '마이크로서비스 아키텍처',
    awards: [{ awardName: '장려상', awardColor: '#CD7F32' }],
  },
  {
    contestId: 5,
    contestName: '2022 모바일 개발 경진대회',
    teamId: 106,
    teamName: '모바일러버',
    projectName: '모바일 앱 개발',
    awards: [],
  },
  {
    contestId: 6,
    contestName: '2021 게임잼',
    teamId: 107,
    teamName: '게임러버',
    projectName: '인디 게임 개발',
    awards: [{ awardName: '참가상', awardColor: '#C0C0C0' }],
  },
];

export const mockMyVotes: GetMyVotesResponseDto = [
  {
    contestId: 1,
    contestName: '2026 SW 프로젝트 경진대회',
    teamId: 101,
    teamName: '코드마스터',
    projectName: 'AI 챗봇 플랫폼',
  },
  {
    contestId: 2,
    contestName: '2025 해커톤',
    teamId: 103,
    teamName: '데이터러버',
    projectName: '빅데이터 분석툴',
  },
];

export const mockMyLikesPreview: GetMyLikesPreviewResponseDto = [
  {
    teamId: 101,
    teamName: '코드마스터',
    contestId: 1,
    projectName: 'AI 챗봇 플랫폼',
    contestName: '2026 SW 프로젝트 경진대회',
  },
  {
    teamId: 104,
    teamName: '프론트엔드러버',
    contestId: 3,
    projectName: 'UI/UX 디자인 툴',
    contestName: '2024 디자인 공모전',
  },
  {
    teamId: 105,
    teamName: '백엔드러버',
    contestId: 4,
    projectName: '마이크로서비스 아키텍처',
    contestName: '2023 기술 포럼',
  },
];

export const mockMyLikes: GetMyLikesResponseDto = {
  content: [
    {
      teamId: 101,
      teamName: '코드마스터',
      contestId: 1,
      projectName: 'AI 챗봇 플랫폼',
      contestName: '2026 SW 프로젝트 경진대회',
    },
    {
      teamId: 104,
      teamName: '프론트엔드러버',
      contestId: 3,
      projectName: 'UI/UX 디자인 툴',
      contestName: '2024 디자인 공모전',
    },
    {
      teamId: 105,
      teamName: '백엔드러버',
      contestId: 4,
      projectName: '마이크로서비스 아키텍처',
      contestName: '2023 기술 포럼',
    },
    {
      teamId: 106,
      teamName: '모바일러버',
      contestId: 5,
      projectName: '모바일 앱 개발',
      contestName: '2022 모바일 개발 경진대회',
    },
    {
      teamId: 107,
      teamName: '게임러버',
      contestId: 6,
      projectName: '인디 게임 개발',
      contestName: '2021 게임잼',
    },
    {
      teamId: 108,
      teamName: '데이터러버',
      contestId: 2,
      projectName: '빅데이터 분석툴',
      contestName: '2025 해커톤',
    },
    {
      teamId: 109,
      teamName: 'AI러버',
      contestId: 7,
      projectName: 'AI 이미지 생성기',
      contestName: '2026 AI 챌린지',
    },
    {
      teamId: 110,
      teamName: '웹러버',
      contestId: 8,
      projectName: '웹 자동화 플랫폼',
      contestName: '2023 웹 해커톤',
    },
    {
      teamId: 111,
      teamName: '클라우드러버',
      contestId: 9,
      projectName: '클라우드 관리 시스템',
      contestName: '2022 클라우드 경진대회',
    },
    {
      teamId: 112,
      teamName: '보안러버',
      contestId: 10,
      projectName: '보안 취약점 분석',
      contestName: '2024 보안 콘테스트',
    },
    {
      teamId: 113,
      teamName: '디자인러버',
      contestId: 11,
      projectName: 'UX 리서치 툴',
      contestName: '2023 디자인 공모전',
    },
    {
      teamId: 114,
      teamName: '로봇러버',
      contestId: 12,
      projectName: '로봇 제어 시스템',
      contestName: '2025 로봇 경진대회',
    },
  ],
  totalElements: 12,
  totalPages: 2,
  currentPage: 0,
  size: 6,
};
