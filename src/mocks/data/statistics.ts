import { VoteLogItemDto, VoteRankingDto, VoteStatsDto } from 'types/DTO';

export const mockLikeRanking: VoteRankingDto[] = [
  { rank: 1, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 A', likeCount: 999 },
  { rank: 1, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 A', likeCount: 999 },
  { rank: 1, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 B', likeCount: 999 },
  { rank: 1, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 B', likeCount: 999 },
  { rank: 1, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 D', likeCount: 999 },
  { rank: 2, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 C', likeCount: 989 },
  { rank: 3, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 C', likeCount: 979 },
  { rank: 4, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 D', likeCount: 969 },
];

export const mockVoteStatistics: VoteStatsDto = {
  totalVotes: 366, // 총 좋아요 수
  totalVoters: 249, // 좋아요한 사람
  averageVotesPerVoter: 1.5, // 1인당 평균
};

export const mockVoteLogs: VoteLogItemDto[] = [
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
