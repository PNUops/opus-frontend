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

export const downloadBlob = (blob: Blob, fallbackFileName: string, contentDisposition?: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = getFileNameFromContentDisposition(contentDisposition) ?? fallbackFileName;
  link.click();
  URL.revokeObjectURL(url);
};
