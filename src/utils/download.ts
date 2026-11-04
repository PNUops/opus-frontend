import type { AxiosResponse } from 'axios';

/** Content-Disposition 헤더에서 파일명 추출 (없으면 null) */
const getFileNameFromContentDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) {
    return null;
  }

  const utf8FileName = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1]?.trim();
  const fileName = contentDisposition.match(/(?:^|;)\s*filename\s*=\s*(?:"([^"]*)"|([^;]*))/i);
  const encodedName = utf8FileName || fileName?.[1] || fileName?.[2]?.trim();
  if (!encodedName) return null;
  try {
    return decodeURIComponent(encodedName);
  } catch {
    // 잘못된 헤더가 파일 다운로드와 Object URL 정리를 막지 않게 합니다.
    return null;
  }
};

/** Blob을 브라우저 다운로드로 트리거 (Content-Disposition 파일명 우선, 없으면 fallback) */
export const downloadBlob = (blob: Blob, fallbackFileName: string, contentDisposition?: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  try {
    link.href = url;
    link.download = getFileNameFromContentDisposition(contentDisposition) ?? fallbackFileName;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
};

/** Blob 응답을 Content-Disposition 파일명으로 다운로드 (없으면 fallback) */
export const downloadFromResponse = (response: AxiosResponse<Blob>, fallback: string) => {
  downloadBlob(response.data, fallback, response.headers['content-disposition']);
};
