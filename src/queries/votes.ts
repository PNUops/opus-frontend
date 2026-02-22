import { queryOptions } from '@tanstack/react-query';
import { getVoteTerm } from 'apis/votes';

export const voteTermOption = (contestId: number) => {
  return queryOptions({
    queryKey: ['voteTerm', contestId],
    queryFn: () => getVoteTerm(contestId),
    enabled: !!contestId,
  });
};
