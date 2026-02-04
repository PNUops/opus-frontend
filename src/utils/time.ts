/**
 * 초를 MM:SS 형식으로 변환하는 유틸함수
 * @param totalSeconds MM:SS형식으로 변환할 값(sec)
 * @returns string 형식의 MM:SS
 */
export const formatToMMSS = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const formatDateTime = (data: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    data.getFullYear() +
    '-' +
    pad(data.getMonth() + 1) +
    '-' +
    pad(data.getDate()) +
    'T' +
    pad(data.getHours()) +
    ':' +
    pad(data.getMinutes()) +
    ':' +
    pad(data.getSeconds())
  );
};
