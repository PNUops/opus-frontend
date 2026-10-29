import { queryOptions } from '@tanstack/react-query';
import { getVoteReport } from '@apis/voteReport';

export const voteReportOption = (contestId: number) =>
  queryOptions({
    queryKey: ['voteReport', contestId],
    queryFn: ({ signal }) => getVoteReport(contestId, signal),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });
