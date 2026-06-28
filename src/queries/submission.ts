import { queryOptions } from '@tanstack/react-query';
import { getSubmissionDetail } from '@apis/submission';

export const SUBMISSION_DETAIL_QUERY_KEY = 'submissionDetail';

export const submissionDetailOption = (contestId: number, submissionId: number) =>
  queryOptions({
    queryKey: [SUBMISSION_DETAIL_QUERY_KEY, contestId, submissionId],
    queryFn: () => getSubmissionDetail(contestId, submissionId),
    enabled: !!contestId && !!submissionId,
  });
