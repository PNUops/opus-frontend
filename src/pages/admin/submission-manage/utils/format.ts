import dayjs from 'dayjs';

/** ISO 문자열 → 'YYYY-MM-DD HH:mm', 없으면 '-' */
export const formatDateTime = (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-');

/** bytes → 사람이 읽기 쉬운 용량 (소수 1자리 MB/GB) */
export const formatFileSize = (bytes: number) => {
  const mb = bytes / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${mb.toFixed(1)}MB`;
};
