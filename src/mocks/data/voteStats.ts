import { VoteStatisticsDto, RankingDto } from 'types/DTO';

export const mockVoteStatistics: VoteStatisticsDto = {
  totalVotes: 366, // 총 좋아요 수
  totalVoters: 249, // 좋아요한 사람
  averageVotesPerVoter: 1.5, // 1인당 평균
};

export const mockLikeRanking: RankingDto[] = [
  { rank: 1, teamId: 1, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 A', likeCount: 999 },
  { rank: 1, teamId: 2, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 A', likeCount: 999 },
  { rank: 1, teamId: 3, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 B', likeCount: 999 },
  { rank: 1, teamId: 4, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 B', likeCount: 999 },
  { rank: 1, teamId: 5, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 D', likeCount: 999 },
  { rank: 2, teamId: 6, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 C', likeCount: 989 },
  { rank: 3, teamId: 7, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 C', likeCount: 979 },
  { rank: 4, teamId: 8, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 D', likeCount: 969 },
];

export const mockParticipationRate = {
  voteRate: 0.68,
  totalVoteCount: 366,
};

export const mockVoteApiStatistics = {
  totalVotes: 123,
  voters: 45,
  average: 2.7,
};

// vote log mock data
export const mockVoteLogs = [
  {
    votedAt: '2025-07-15T16:02:00.000Z',
    teamId: 11,
    teamName: '구름',
    voterName: '홍지연',
    voterEmail: 'aaa@pusan.ac.kr',
  },
  {
    votedAt: '2025-07-15T16:02:00.000Z',
    teamId: 11,
    teamName: '구름',
    voterName: '홍지연',
    voterEmail: 'aaa@pusan.ac.kr',
  },
  {
    votedAt: '2025-07-15T16:02:00.000Z',
    teamId: 12,
    teamName: '운동',
    voterName: '홍지연',
    voterEmail: 'bbb@pusan.ac.kr',
  },
  {
    votedAt: '2025-07-15T16:05:00.000Z',
    teamId: 13,
    teamName: '바다',
    voterName: '김철수',
    voterEmail: 'ccc@pusan.ac.kr',
  },
  {
    votedAt: '2025-07-15T16:10:00.000Z',
    teamId: 14,
    teamName: '하늘',
    voterName: '이영희',
    voterEmail: 'ddd@pusan.ac.kr',
  },
];