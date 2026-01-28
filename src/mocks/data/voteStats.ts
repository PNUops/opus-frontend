import { VoteStatisticsDto, RankingDto } from 'types/DTO';

export const mockVoteStatistics: VoteStatisticsDto = {
  totalVotes: 366,
  totalVoters: 249,
  averageVotesPerVoter: 1.5,
};

export const mockLikeRanking: RankingDto[] = [
  { rank: 1, teamId: 1, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 A', likeCount: 999 },
  { rank: 1, teamId: 2, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 A', likeCount: 999 },
  { rank: 1, teamId: 3, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 B', likeCount: 999 },
  { rank: 2, teamId: 4, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 C', likeCount: 989 },
  { rank: 3, teamId: 5, teamName: 'ByteBusters', projectName: 'MediConnect', trackName: '분과 D', likeCount: 979 },
];
