import { queryOptions } from '@tanstack/react-query';
import { getNoticeDetail, getNotices, getContestNotices, getContestNoticeDetail } from '@apis/notice';

export const noticeOption = () => {
  return queryOptions({
    queryKey: ['notices'],
    queryFn: getNotices,
  });
};

export const noticeDetailOption = (noticeId: number) => {
  return queryOptions({
    queryKey: ['noticeDetail', noticeId],
    queryFn: () => getNoticeDetail(noticeId),
    enabled: !!noticeId,
  });
};

export const contestNoticeOption = (contestId: number) => {
  return queryOptions({
    queryKey: ['contestNotices', contestId],
    queryFn: () => getContestNotices(contestId),
    enabled: !!contestId,
  });
};

export const contestNoticeDetailOption = (contestId: number, noticeId: number) => {
  return queryOptions({
    queryKey: ['contestNoticeDetail', contestId, noticeId],
    queryFn: () => getContestNoticeDetail(contestId, noticeId),
    enabled: !!contestId && !!noticeId,
  });
};
