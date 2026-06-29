import type { AxiosResponse } from 'axios';

/** Content-Disposition 헤더에서 파일명 추출 (없으면 null) */
const getFileNameFromContentDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) {
    return null;
  }

  const utf8FileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8FileName) {
    return decodeURIComponent(utf8FileName);
  }

  const fileName = contentDisposition.match(/filename="?([^"]+)"?/i)?.[1];
  return fileName ? decodeURIComponent(fileName) : null;
};

/** Blob을 브라우저 다운로드로 트리거 (Content-Disposition 파일명 우선, 없으면 fallback) */
export const downloadBlob = (blob: Blob, fallbackFileName: string, contentDisposition?: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = getFileNameFromContentDisposition(contentDisposition) ?? fallbackFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** Blob 응답을 Content-Disposition 파일명으로 다운로드 (없으면 fallback) */
export const downloadFromResponse = (response: AxiosResponse<Blob>, fallback: string) => {
  downloadBlob(response.data, fallback, response.headers['content-disposition']);
};
