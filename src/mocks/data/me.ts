import { GetMyProjectsResponseDto, GetMyVotesResponseDto, GetMyLikesResponseDto } from '../../types/DTO/meDto';

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
];
