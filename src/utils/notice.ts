import dayjs from 'dayjs';
import type { NoticeListDto } from '@dto/noticeDto';

type NoticeTimestamps = Pick<NoticeListDto, 'createdAt' | 'updatedAt'>;

const NOTICE_RECENT_DAYS = 3;

export const isRecentNotice = ({ createdAt, updatedAt }: NoticeTimestamps) => {
  const threshold = dayjs().subtract(NOTICE_RECENT_DAYS, 'day');

  return [createdAt, updatedAt].some((timestamp) => !!timestamp && dayjs(timestamp).isAfter(threshold));
};

export const isNoticeUpdated = ({ createdAt, updatedAt }: NoticeTimestamps) =>
  !!updatedAt && dayjs(updatedAt).isAfter(dayjs(createdAt));

export const getNoticeDisplayAt = (timestamps: NoticeTimestamps) =>
  isNoticeUpdated(timestamps) ? timestamps.updatedAt! : timestamps.createdAt;

export const getNoticePath = (noticeId: number, contestId?: number) =>
  contestId ? `/notices/${contestId}/${noticeId}` : `/notices/${noticeId}`;
