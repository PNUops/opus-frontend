import dayjs from 'dayjs';
import type { SortType, DateType } from '@pages/me/activity/types/filter';

export const normalize = (v: unknown): string => {
  if (v === undefined || v === null) return '';
  return String(v);
};

export const parseSort = (v: string | null): SortType => {
  if (v === 'oldest') return 'oldest';
  return 'latest';
};

const DATE_PRESET = {
  '1m': 32,
  '3m': 95,
} as const;

export const inferDateType = (startDate?: string, endDate?: string): DateType => {
  if (!startDate || !endDate) return '';

  const now = dayjs().startOf('day');
  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');

  if (!start.isValid() || !end.isValid()) return '';

  const diffDays = now.diff(start, 'day');

  for (const [key, maxDays] of Object.entries(DATE_PRESET)) {
    if (diffDays <= maxDays) return key as DateType;
  }

  return 'custom';
};
