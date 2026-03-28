import dayjs from 'dayjs';
import type { SortType, DateType } from '@pages/me/activity/types/filter';
import { getDateRange } from './date';

export const normalize = (v: unknown): string => {
  if (v === undefined || v === null) return '';
  return String(v);
};

export const parseSort = (v: string | null): SortType => {
  if (v === 'oldest') return 'oldest';
  return 'latest';
};

export const inferDateType = (startDate?: string, endDate?: string): DateType => {
  if (!startDate || !endDate) return '';

  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');

  if (!start.isValid() || !end.isValid()) return '';

  if (end.isBefore(start)) return '';

  const oneMonthRange = getDateRange('1m');
  if (startDate === oneMonthRange.startDate && endDate === oneMonthRange.endDate) return '1m';

  const threeMonthRange = getDateRange('3m');
  if (startDate === threeMonthRange.startDate && endDate === threeMonthRange.endDate) return '3m';

  return 'custom';
};
