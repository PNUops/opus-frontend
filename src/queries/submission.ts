import { queryOptions } from '@tanstack/react-query';
import {
  getConfirmMemo,
  getMySubmissions,
  getMySubmissionSummary,
  getMySubmissionTimeline,
  getSubmissionDetail,
  getSubmissionDownloads,
  getSubmissionFeedbacks,
  getSubmissionItems,
  getSubmissionItemSetting,
  getSubmissionStatuses,
} from '@apis/submission';

/** 제출물 도메인 쿼리 키 팩토리 */
export const submissionKeys = {
  items: (contestId: number) => ['submissionItems', contestId] as const,
  itemSetting: (contestId: number, submissionItemId: number) =>
    ['submissionItemSetting', contestId, submissionItemId] as const,
  statuses: (contestId: number) => ['submissionStatuses', contestId] as const,
  downloads: (contestId: number) => ['submissionDownloads', contestId] as const,
  feedbacks: (contestId: number, submissionId: number) => ['submissionFeedbacks', contestId, submissionId] as const,
  myList: (contestId: number, teamId: number) => ['mySubmissionList', contestId, teamId] as const,
  mySummary: (contestId: number, teamId: number) => ['mySubmissionSummary', contestId, teamId] as const,
  myTimeline: (contestId: number, teamId: number) => ['mySubmissionTimeline', contestId, teamId] as const,
  detail: (contestId: number, submissionId: number) => ['submissionDetail', contestId, submissionId] as const,
  confirmMemo: (contestId: number, teamId: number, submissionId: number) =>
    ['confirmMemo', contestId, teamId, submissionId] as const,
};

export const submissionStatusesOption = (contestId: number) =>
  queryOptions({
    queryKey: submissionKeys.statuses(contestId),
    queryFn: () => getSubmissionStatuses(contestId),
    enabled: !!contestId,
  });

export const submissionDownloadsOption = (contestId: number) =>
  queryOptions({
    queryKey: submissionKeys.downloads(contestId),
    queryFn: () => getSubmissionDownloads(contestId),
    enabled: !!contestId,
  });

export const submissionFeedbacksOption = (contestId: number, submissionId: number) =>
  queryOptions({
    queryKey: submissionKeys.feedbacks(contestId, submissionId),
    queryFn: () => getSubmissionFeedbacks(contestId, submissionId),
    enabled: !!contestId && !!submissionId,
  });

export const submissionItemsOption = (contestId: number) =>
  queryOptions({
    queryKey: submissionKeys.items(contestId),
    queryFn: () => getSubmissionItems(contestId),
    enabled: !!contestId,
  });

export const submissionItemSettingOption = (contestId: number, submissionItemId: number) =>
  queryOptions({
    queryKey: submissionKeys.itemSetting(contestId, submissionItemId),
    queryFn: () => getSubmissionItemSetting(contestId, submissionItemId),
    enabled: !!contestId && !!submissionItemId,
  });

export const mySubmissionsOption = (contestId: number, teamId: number) =>
  queryOptions({
    queryKey: submissionKeys.myList(contestId, teamId),
    queryFn: () => getMySubmissions(contestId, teamId),
    enabled: !!contestId && !!teamId,
  });

export const mySubmissionSummaryOption = (contestId: number, teamId: number) =>
  queryOptions({
    queryKey: submissionKeys.mySummary(contestId, teamId),
    queryFn: () => getMySubmissionSummary(contestId, teamId),
    enabled: !!contestId && !!teamId,
  });

export const mySubmissionTimelineOption = (contestId: number, teamId: number) =>
  queryOptions({
    queryKey: submissionKeys.myTimeline(contestId, teamId),
    queryFn: () => getMySubmissionTimeline(contestId, teamId),
    enabled: !!contestId && !!teamId,
  });

export const submissionDetailOption = (contestId: number, submissionId: number) =>
  queryOptions({
    queryKey: submissionKeys.detail(contestId, submissionId),
    queryFn: () => getSubmissionDetail(contestId, submissionId),
    enabled: !!contestId && !!submissionId,
  });

export const confirmMemoOption = (contestId: number, teamId: number, submissionId: number) =>
  queryOptions({
    queryKey: submissionKeys.confirmMemo(contestId, teamId, submissionId),
    queryFn: () => getConfirmMemo(contestId, teamId, submissionId),
    enabled: !!contestId && !!teamId && !!submissionId,
  });
