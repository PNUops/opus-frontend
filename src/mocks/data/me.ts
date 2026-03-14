import { GetMyProjectsResponseDto, GetMyVotesResponseDto, GetMyLikesResponseDto } from 'types/DTO/meDto';

export const mockMyProjects: GetMyProjectsResponseDto = [
  {
    contestId: 1,
    contestName: '2026 SW 프로젝트 경진대회',
    teamId: 101,
    teamName: '코드마스터',
    projectName: 'AI 챗봇 플랫폼',
    thumbnailUrl: 'https://placehold.co/100x100',
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
    thumbnailUrl: null,
    awards: [],
  },
  {
    contestId: 3,
    contestName: '2024 아이디어톤',
    teamId: 103,
    teamName: '아이디어러버',
    projectName: '친환경 에너지 솔루션',
    thumbnailUrl: 'https://placehold.co/100x100',
    awards: [{ awardName: '우수상', awardColor: '#C0C0C0' }],
  },
  {
    contestId: 4,
    contestName: '2023 기술 포럼',
    teamId: 105,
    teamName: '백엔드러버',
    projectName: '마이크로서비스 아키텍처',
    thumbnailUrl: null,
    awards: [{ awardName: '장려상', awardColor: '#CD7F32' }],
  },
  {
    contestId: 5,
    contestName: '2022 모바일 개발 경진대회',
    teamId: 106,
    teamName: '모바일러버',
    projectName: '모바일 앱 개발',
    thumbnailUrl: null,
    awards: [],
  },
  {
    contestId: 6,
    contestName: '2021 게임잼',
    teamId: 107,
    teamName: '게임러버',
    projectName: '인디 게임 개발',
    thumbnailUrl: null,
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
    thumbnailUrl: 'https://placehold.co/100x100',
  },
  {
    contestId: 2,
    contestName: '2025 해커톤',
    teamId: 103,
    teamName: '데이터러버',
    projectName: '빅데이터 분석툴',
    thumbnailUrl: null,
  },
];

export const mockMyLikesPreview: GetMyLikesResponseDto = [
  {
    teamId: 101,
    teamName: '코드마스터',
    contestId: 1,
    projectName: 'AI 챗봇 플랫폼',
    thumbnailUrl: 'https://placehold.co/100x100',
    contestName: '2026 SW 프로젝트 경진대회',
  },
  {
    teamId: 104,
    teamName: '프론트엔드러버',
    contestId: 3,
    projectName: 'UI/UX 디자인 툴',
    thumbnailUrl: null,
    contestName: '2024 디자인 공모전',
  },
  {
    teamId: 105,
    teamName: '백엔드러버',
    contestId: 4,
    projectName: '마이크로서비스 아키텍처',
    thumbnailUrl: null,
    contestName: '2023 기술 포럼',
  },
];

export const mockMyLikes: GetMyLikesResponseDto = [
  {
    teamId: 101,
    teamName: '코드마스터',
    contestId: 1,
    projectName: 'AI 챗봇 플랫폼',
    thumbnailUrl: 'https://placehold.co/100x100',
    contestName: '2026 SW 프로젝트 경진대회',
  },
  {
    teamId: 104,
    teamName: '프론트엔드러버',
    contestId: 3,
    projectName: 'UI/UX 디자인 툴',
    thumbnailUrl: null,
    contestName: '2024 디자인 공모전',
  },
  {
    teamId: 105,
    teamName: '백엔드러버',
    contestId: 4,
    projectName: '마이크로서비스 아키텍처',
    thumbnailUrl: null,
    contestName: '2023 기술 포럼',
  },
  {
    teamId: 106,
    teamName: '모바일러버',
    contestId: 5,
    projectName: '모바일 앱 개발',
    thumbnailUrl: null,
    contestName: '2022 모바일 개발 경진대회',
  },
  {
    teamId: 107,
    teamName: '게임러버',
    contestId: 6,
    projectName: '인디 게임 개발',
    thumbnailUrl: null,
    contestName: '2021 게임잼',
  },
];
