import { FileText, PanelRightClose } from 'lucide-react';

import { SheetClose, SheetTitle } from '@components/ui/sheet';
import type { SubmissionDetailResponseDto } from '@dto/submissionDto';

import { formatFileSize } from '../utils/format';
import { SubmissionTeamSummary } from './SubmissionTeamSummary';

interface SubmissionDetailDrawerProps {
  detail: SubmissionDetailResponseDto;
  onViewFeedbacks: () => void;
}

export const SubmissionDetailDrawer = ({ detail, onViewFeedbacks }: SubmissionDetailDrawerProps) => {
  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-lightGray flex items-center gap-2 border-b px-5 py-4">
        <SheetClose asChild>
          <button type="button" aria-label="닫기" className="text-midGray hover:text-darkGray">
            <PanelRightClose size={20} />
          </button>
        </SheetClose>
        <SheetTitle className="text-base font-semibold">제출 상세보기</SheetTitle>
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        <SubmissionTeamSummary detail={detail} />

        {/* 제출 파일 */}
        <section className="border-lightGray rounded-xl border p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            제출 파일
            <span className="text-mainBlue">{detail.files.length}</span>
          </h4>
          <div className="flex flex-col">
            {detail.files.map((file) => (
              <div key={file.fileId} className="flex items-center gap-3 py-2">
                <FileText size={18} className="text-midGray shrink-0" />
                <span className="text-darkGray flex-1 truncate text-sm">{file.fileName}</span>
                <span className="text-midGray shrink-0 text-xs">{formatFileSize(file.fileSize)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 피드백 */}
        <section className="border-lightGray flex items-center justify-between gap-4 rounded-xl border p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            피드백
            <span className="text-mainBlue">{detail.feedbackCount}</span>
          </h4>
          <button
            type="button"
            onClick={onViewFeedbacks}
            className="border-mainBlue text-mainBlue rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-blue-50"
          >
            피드백 보기
          </button>
        </section>
      </div>
    </div>
  );
};
