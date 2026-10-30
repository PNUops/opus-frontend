import { cn } from '@utils/classname';

import type { AdvisorSubmission, AdvisorSubmissionFile } from '../types';
import { AdvisorFeedbackEditor } from './AdvisorFeedbackEditor';
import { AdvisorFileList } from './AdvisorFileList';
import { AdvisorStatusBadge } from './AdvisorStatusBadge';

interface AdvisorSubmissionPanelProps {
  isLoading?: boolean;
  savingSubmissionId?: number | null;
  submissions: AdvisorSubmission[];
  selectedSubmissionId: number | null;
  feedbackDrafts: Record<number, string>;
  onAttachFeedbackFiles: (submissionId: number, files: File[]) => void;
  onChangeFeedback: (submissionId: number, value: string) => void;
  onDownloadFile: (file: AdvisorSubmissionFile) => void;
  onRemoveFeedbackFile: (submissionId: number, file: AdvisorSubmissionFile) => void;
  onSaveFeedback: (submissionId: number) => void;
  onSelectSubmission: (submissionId: number) => void;
}

export const AdvisorSubmissionPanel = ({
  isLoading = false,
  savingSubmissionId = null,
  submissions,
  selectedSubmissionId,
  feedbackDrafts,
  onAttachFeedbackFiles,
  onChangeFeedback,
  onDownloadFile,
  onRemoveFeedbackFile,
  onSaveFeedback,
  onSelectSubmission,
}: AdvisorSubmissionPanelProps) => {
  if (isLoading) {
    return (
      <div className="border-lightGray text-midGray mt-4 flex min-h-28 items-center justify-center rounded-md border bg-white text-sm font-medium">
        제출물을 불러오는 중입니다.
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="border-lightGray text-midGray mt-4 flex min-h-28 items-center justify-center rounded-md border bg-white text-sm font-medium">
        제출물이 없습니다.
      </div>
    );
  }

  return (
    <div className="border-lightGray mt-4 overflow-hidden rounded-md border bg-white">
      <div className="bg-whiteGray hidden grid-cols-[minmax(0,1.4fr)_100px_minmax(0,2fr)_110px] gap-4 px-4 py-3 text-xs font-medium text-neutral-800 xl:grid">
        <span>제출물 항목</span>
        <span>피드백 상태</span>
        <span>제출 파일</span>
        <span className="text-center">작업</span>
      </div>

      <div className="flex flex-col">
        {submissions.map((submission) => {
          const selected = submission.submissionId === selectedSubmissionId;

          return (
            <div
              key={submission.submissionId}
              className={cn(
                'rounded-lg bg-white',
                selected ? 'border-mainBlue border' : 'border-lightGray border-t first:border-t-0',
              )}
            >
              <div className="grid grid-cols-2 gap-3 px-4 py-4 xl:grid-cols-[minmax(0,1.4fr)_100px_minmax(0,2fr)_110px] xl:items-center xl:gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-sm leading-6 font-medium break-words text-neutral-950">
                    {submission.submissionItemName}
                  </span>
                  <span className="text-xs text-neutral-600 xl:hidden">제출물 항목</span>
                </div>
                <div className="flex justify-end xl:justify-start">
                  <AdvisorStatusBadge status={submission.feedbackStatus} />
                </div>
                <div className="col-span-2 min-w-0 xl:col-span-1">
                  <AdvisorFileList files={submission.files} onDownload={onDownloadFile} />
                </div>
                <button
                  type="button"
                  onClick={() => onSelectSubmission(submission.submissionId)}
                  className="border-mainBlue text-mainBlue focus-visible:outline-mainBlue col-span-2 inline-flex min-h-11 items-center justify-center justify-self-end rounded-md border px-3 text-xs font-medium transition-colors hover:bg-blue-50 focus-visible:outline-2 xl:col-span-1 xl:justify-self-center"
                  aria-expanded={selected}
                >
                  자세히 보기
                </button>
              </div>

              <div
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
                  selected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  {selected && (
                    <div className="px-3 pb-4 xl:px-5 xl:pb-5">
                      <AdvisorFeedbackEditor
                        value={feedbackDrafts[submission.submissionId] ?? ''}
                        files={submission.feedbackFiles ?? []}
                        isLoading={submission.isFeedbackLoading}
                        isSaving={savingSubmissionId === submission.submissionId}
                        onAttachFiles={(files) => onAttachFeedbackFiles(submission.submissionId, files)}
                        onChange={(value) => onChangeFeedback(submission.submissionId, value)}
                        onDownloadFile={onDownloadFile}
                        onRemoveFile={(file) => onRemoveFeedbackFile(submission.submissionId, file)}
                        onSave={() => onSaveFeedback(submission.submissionId)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
