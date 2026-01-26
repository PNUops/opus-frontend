import { queryOptions } from '@tanstack/react-query';
import { getCurrentContest } from 'apis/contests';

export const currentContestOption = () => {
  return queryOptions({
    queryKey: ['currentContests'],
    queryFn: getCurrentContest,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
