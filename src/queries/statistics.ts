import { queryOptions } from '@tanstack/react-query';
import { getVoteRanking } from 'apis/statistics';

export const voteRankingOption = (contestId: number) => {
  return queryOptions({ queryKey: ['voteRanking', contestId], queryFn: () => getVoteRanking(contestId) });
};
