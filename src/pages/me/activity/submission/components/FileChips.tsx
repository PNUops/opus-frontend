import { FileText } from 'lucide-react';

import type { SubmissionFileResponseDto } from '@dto/submissionDto';

import { formatFileSize } from '../utils/format';

interface FileChipsProps {
  files: SubmissionFileResponseDto[];
  /** 첨부파일 클릭 시 다운로드 */
  onDownload: (file: SubmissionFileResponseDto) => void;
}

export const FileChips = ({ files, onDownload }: FileChipsProps) => {
  if (files.length === 0) {
    return <span className="text-midGray text-sm">첨부된 파일이 없어요.</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {files.map((file) => (
        <button
          key={file.fileId}
          type="button"
          onClick={() => onDownload(file)}
          className="bg-whiteGray hover:bg-lightGray flex max-w-xs items-center gap-2 rounded-md px-3 py-2 transition-colors"
        >
          <FileText size={16} className="text-midGray shrink-0" />
          <span className="text-darkGray truncate text-sm">{file.fileName}</span>
          <span className="text-midGray shrink-0 text-xs">{formatFileSize(file.fileSize)}</span>
        </button>
      ))}
    </div>
  );
};
