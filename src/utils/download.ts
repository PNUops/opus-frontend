import type { AxiosResponse } from 'axios';

/** Content-Disposition 헤더에서 파일명 추출 (없으면 fallback) */
const extractFilename = (contentDisposition: string | undefined, fallback: string) => {
  if (!contentDisposition) return fallback;
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);
  const match = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return match ? match[1] : fallback;
};

/** Blob을 브라우저 다운로드로 트리거 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

/** Blob 응답을 Content-Disposition 파일명으로 다운로드 (없으면 fallback) */
export const downloadFromResponse = (response: AxiosResponse<Blob>, fallback: string) => {
  const filename = extractFilename(response.headers['content-disposition'], fallback);
  downloadBlob(response.data, filename);
};
