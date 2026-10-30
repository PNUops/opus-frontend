import { Download, FileText, X } from 'lucide-react';

import type { AdvisorSubmissionFile } from '../types';
import { formatFileSize } from '../utils/format';

interface AdvisorFileListProps {
  files: AdvisorSubmissionFile[];
  onDownload: (file: AdvisorSubmissionFile) => void;
  onRemove?: (file: AdvisorSubmissionFile) => void;
}

export const AdvisorFileList = ({ files, onDownload, onRemove }: AdvisorFileListProps) => {
  if (files.length === 0) {
    return <span className="text-midGray text-xs">제출 파일 없음</span>;
  }

  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {files.map((file) => (
        <div
          key={`${file.source ?? 'file'}-${file.submissionId ?? 'none'}-${file.fileId}-${file.fileName}`}
          className="border-lightGray bg-whiteGray hover:border-mainBlue/60 flex max-w-full items-center rounded-md border transition-colors hover:bg-blue-50"
        >
          <button
            type="button"
            onClick={() => onDownload(file)}
            className="focus-visible:outline-mainBlue flex min-h-11 min-w-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-left focus-visible:outline-2"
          >
            <FileText size={16} className="text-midGray shrink-0" />
            <span className="min-w-0 flex-1 text-xs leading-5 break-all text-neutral-800">
              {file.fileName}
              <span className="block text-neutral-600">{formatFileSize(file.fileSize)}</span>
            </span>
            <Download size={14} className="text-midGray shrink-0" />
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(file)}
              aria-label={`${file.fileName} 첨부 제거`}
              className="hover:text-mainRed focus-visible:outline-mainBlue flex size-11 shrink-0 items-center justify-center rounded-r-md text-neutral-600 transition-colors focus-visible:outline-2"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
