import { ContestBulkAddTeamsErrorDto, ContestBulkAddTeamsResponseDto, ContestResponseDto } from 'types/DTO';
import { ProjectsAdminResponseDto, GetContestTracksResponseDto, GetContestAwardsResponseDto } from 'types/DTO';

export const mockContestsResponse: ContestResponseDto[] = [
  {
    categoryId: 1,
    categoryName: '해커톤',
    isCurrent: true,
    contestId: 1,
    contestName: '제6회PNU창의융합SW해커톤',
    updatedAt: new Date('2025-06-28T14:30:00Z'),
  },
  {
    categoryId: 1,
    categoryName: '해커톤',
    isCurrent: false,
    contestId: 2,
    contestName: '제5회PNU창의융합SW해커톤',
    updatedAt: new Date('2025-06-20T09:15:45Z'),
  },
  {
    categoryId: 1,
    categoryName: '해커톤',
    isCurrent: false,
    contestId: 3,
    contestName: '제4회PNU창의융합SW해커톤',
    updatedAt: new Date('2025-06-20T09:15:45Z'),
  },
  {
    categoryId: 1,
    categoryName: '해커톤',
    isCurrent: false,
    contestId: 4,
    contestName: '제3회PNU창의융합SW해커톤',
    updatedAt: new Date('2025-06-20T09:15:45Z'),
  },
];

export const mockContestBulkAddTeamsResponse: ContestBulkAddTeamsResponseDto = {
  teamCount: 3,
  teams: [
    {
      rowNumber: 5,
      teamName: '태윤팀',
      teamId: 101,
    },
    {
      rowNumber: 6,
      teamName: '오푸스팀',
      teamId: 102,
    },
    {
      rowNumber: 7,
      teamName: '태영팀',
      teamId: 103,
    },
  ],
};

export const mockContestBulkAddTeamsError: { errors: ContestBulkAddTeamsErrorDto[] } = {
  errors: [
    {
      rowNumber: 5,
      message: '팀 이름은 필수입니다.',
    },
    {
      rowNumber: 7,
      message: '팀원 이름, 학번, 이메일의 개수가 일치하지 않습니다.',
    },
  ],
};

export const mockProjectsAdminResponse: ProjectsAdminResponseDto[] = [
  {
    teamId: 1,
    teamName: '슈퍼팀',
    projectName: 'AI 프로젝트',
    trackName: '1 트랙',
    isSubmitted: true,
  },
  {
    teamId: 2,
    teamName: 'OPS A',
    projectName: 'AI 기반 문제추천',
    trackName: '2 트랙',
    isSubmitted: true,
  },
  {
    teamId: 3,
    teamName: 'OPS B',
    projectName: '수어 번역기',
    trackName: '웹 개발 트랙',
    isSubmitted: false,
  },
  {
    teamId: 4,
    teamName: 'OPS C',
    projectName: 'AI 면접 분석기',
    trackName: '3 트랙',
    isSubmitted: true,
  },
  {
    teamId: 5,
    teamName: 'OPS D',
    projectName: '헬스 자세 교정 AI',
    trackName: '1 트랙',
    isSubmitted: false,
  },
];

export const mockTracksAdminResponse: GetContestTracksResponseDto = [
  {
    trackId: 1,
    trackName: '1 트랙',
    updatedAt: '25.07.07 16:45',
  },
  {
    trackId: 2,
    trackName: '2 트랙',
    updatedAt: '25.07.07 16:45',
  },
  {
    trackId: 3,
    trackName: '웹 개발 트랙',
    updatedAt: '25.07.07 16:45',
  },
  {
    trackId: 4,
    trackName: '모바일 개발 트랙',
    updatedAt: '25.07.07 16:45',
  },
  {
    trackId: 5,
    trackName: 'AI 트랙',
    updatedAt: '25.07.07 16:45',
  },
];

export const mockContestAwardsResponse: GetContestAwardsResponseDto = [
  {
    awardId: 1,
    awardName: '우수상',
    awardColor: '#BBBEEE',
  },
  {
    awardId: 2,
    awardName: '장려상',
    awardColor: '#ABBDDD',
  },
  {
    awardId: 3,
    awardName: '최우수상',
    awardColor: '#FFD700',
  },
  {
    awardId: 4,
    awardName: '대상',
    awardColor: '#FF5733',
  },
];
