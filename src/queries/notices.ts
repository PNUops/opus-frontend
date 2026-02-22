import { queryOptions } from '@tanstack/react-query';
import { getNoticeDetail, getNotices } from 'apis/notice';

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
