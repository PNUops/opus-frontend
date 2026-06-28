import { queryOptions } from '@tanstack/react-query';
import { getMySubmissions, getSubmissionDetail, getSubmissionItems } from '@apis/submission';

export const SUBMISSION_ITEMS_QUERY_KEY = 'submissionItems';
export const MY_SUBMISSION_LIST_QUERY_KEY = 'mySubmissionList';
export const SUBMISSION_DETAIL_QUERY_KEY = 'submissionDetail';

export const submissionItemsOption = (contestId: number) =>
  queryOptions({
    queryKey: [SUBMISSION_ITEMS_QUERY_KEY, contestId],
    queryFn: () => getSubmissionItems(contestId),
    enabled: !!contestId,
  });

export const mySubmissionsOption = (contestId: number, teamId: number) =>
  queryOptions({
    queryKey: [MY_SUBMISSION_LIST_QUERY_KEY, contestId, teamId],
    queryFn: () => getMySubmissions(contestId, teamId),
    enabled: !!contestId && !!teamId,
  });

export const submissionDetailOption = (contestId: number, submissionId: number) =>
  queryOptions({
    queryKey: [SUBMISSION_DETAIL_QUERY_KEY, contestId, submissionId],
    queryFn: () => getSubmissionDetail(contestId, submissionId),
    enabled: !!contestId && !!submissionId,
  });
