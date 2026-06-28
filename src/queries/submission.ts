import { queryOptions } from '@tanstack/react-query';
import {
  getMySubmissions,
  getSubmissionDetail,
  getSubmissionDownloads,
  getSubmissionFeedbacks,
  getSubmissionItems,
  getSubmissionItemSetting,
  getSubmissionStatuses,
} from '@apis/submission';

export const SUBMISSION_ITEMS_QUERY_KEY = 'submissionItems';
export const SUBMISSION_ITEM_SETTING_QUERY_KEY = 'submissionItemSetting';
export const SUBMISSION_STATUSES_QUERY_KEY = 'submissionStatuses';
export const SUBMISSION_DOWNLOADS_QUERY_KEY = 'submissionDownloads';
export const SUBMISSION_FEEDBACKS_QUERY_KEY = 'submissionFeedbacks';
export const MY_SUBMISSION_LIST_QUERY_KEY = 'mySubmissionList';
export const SUBMISSION_DETAIL_QUERY_KEY = 'submissionDetail';

export const submissionStatusesOption = (contestId: number) =>
  queryOptions({
    queryKey: [SUBMISSION_STATUSES_QUERY_KEY, contestId],
    queryFn: () => getSubmissionStatuses(contestId),
    enabled: !!contestId,
  });

export const submissionDownloadsOption = (contestId: number) =>
  queryOptions({
    queryKey: [SUBMISSION_DOWNLOADS_QUERY_KEY, contestId],
    queryFn: () => getSubmissionDownloads(contestId),
    enabled: !!contestId,
  });

export const submissionFeedbacksOption = (contestId: number, submissionId: number) =>
  queryOptions({
    queryKey: [SUBMISSION_FEEDBACKS_QUERY_KEY, contestId, submissionId],
    queryFn: () => getSubmissionFeedbacks(contestId, submissionId),
    enabled: !!contestId && !!submissionId,
  });

export const submissionItemsOption = (contestId: number) =>
  queryOptions({
    queryKey: [SUBMISSION_ITEMS_QUERY_KEY, contestId],
    queryFn: () => getSubmissionItems(contestId),
    enabled: !!contestId,
  });

export const submissionItemSettingOption = (contestId: number, submissionItemId: number) =>
  queryOptions({
    queryKey: [SUBMISSION_ITEM_SETTING_QUERY_KEY, contestId, submissionItemId],
    queryFn: () => getSubmissionItemSetting(contestId, submissionItemId),
    enabled: !!contestId && !!submissionItemId,
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
