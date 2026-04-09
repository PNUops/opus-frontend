import { MainStatsDto, VoteLogItemDto, VoteRankingDto, VoteStatsDto } from '@dto/statisticsDto';
import { PaginationResponseDto } from '@dto/commonDto';

export const mockMainStats: MainStatsDto = {
  totalProjects: 1250,
  totalLikes: 45800,
  totalContests: 42,
};

export const mockVoteRanking: VoteRankingDto[] = [
  {
    rank: 1,
    teamName: '팀 A',
    projectName: 'AI 번역기',
    trackName: 'AI 트랙',
    voteCount: 150,
  },
  {
    rank: 2,
    teamName: '팀 B',
    projectName: '헬스 분석기',
    trackName: '헬스케어 트랙',
    voteCount: 120,
  },
  {
    rank: 2,
    teamName: '팀 C',
    projectName: '노인 케어봇',
    trackName: 'AI 트랙',
    voteCount: 120,
  },
  {
    rank: 3,
    teamName: '팀 D',
    projectName: '감정 분석기',
    trackName: 'AI 트랙',
    voteCount: 85,
  },
  {
    rank: 4,
    teamName: '팀 E',
    projectName: '헬스 분석기2',
    trackName: '헬스케어 트랙',
    voteCount: 110,
  },
];

export const mockVoteStats: VoteStatsDto = {
  totalVotes: 366, // 총 좋아요 수
  totalVoters: 249, // 좋아요한 사람
  averageVotesPerVoter: 1.5, // 1인당 평균
};

export const mockVoteLogs: PaginationResponseDto<VoteLogItemDto> = {
  content: [
    {
      votedAt: '2025-07-15T16:02:00.000Z',
      teamName: '구름',
      voterName: '홍지연',
      voterEmail: 'aaa@pusan.ac.kr',
    },
    {
      votedAt: '2025-07-15T16:02:00.000Z',
      teamName: '구름',
      voterName: '홍지연',
      voterEmail: 'aaa@pusan.ac.kr',
    },
    {
      votedAt: '2025-07-15T16:02:00.000Z',
      teamName: '운동',
      voterName: '홍지연',
      voterEmail: 'bbb@pusan.ac.kr',
    },
    {
      votedAt: '2025-07-15T16:05:00.000Z',
      teamName: '바다',
      voterName: '김철수',
      voterEmail: 'ccc@pusan.ac.kr',
    },
    {
      votedAt: '2025-07-15T16:10:00.000Z',
      teamName: '하늘',
      voterName: '이영희',
      voterEmail: 'ddd@pusan.ac.kr',
    },
  ],
  first: true,
  last: true,
  totalElements: 5,
  totalPages: 2,
};
