type SortType = 'latest' | 'oldest';

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

export const inferDateType = (startDate?: string, endDate?: string): '' | '1m' | '3m' | 'custom' => {
  if (!startDate || !endDate) return '';

  const now = new Date();
  const start = new Date(startDate);

  const diffDays = Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  for (const [key, maxDays] of Object.entries(DATE_PRESET)) {
    if (diffDays <= maxDays) return key as '1m' | '3m';
  }

  return 'custom';
};
