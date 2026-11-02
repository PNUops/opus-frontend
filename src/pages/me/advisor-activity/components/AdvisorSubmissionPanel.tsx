import { useId } from 'react';
import { ChevronRight } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { cn } from '@utils/classname';

import type { AdvisorSubmission, AdvisorSubmissionFile } from '../types';
import { getFeedbackStatusLabel } from '../utils/format';
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
  const panelId = useId();
  const detailsId = `${panelId}-details`;
  const selectedSubmission = submissions.find((submission) => submission.submissionId === selectedSubmissionId);

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
    <div className="border-lightGray mt-5 grid min-w-0 gap-5 border-t pt-5 xl:grid-cols-[minmax(180px,0.85fr)_minmax(0,2.4fr)] xl:gap-6">
      <div className="hidden min-w-0 xl:block" role="group" aria-labelledby={`${panelId}-list-title`}>
        <div className="flex items-center justify-between gap-2 px-3">
          <h4 id={`${panelId}-list-title`} className="text-sm font-semibold text-neutral-900">
            제출물
          </h4>
          <span className="text-xs text-neutral-500">{submissions.length}개</span>
        </div>
        <ul className="mt-3 flex max-h-[480px] flex-col gap-1 overflow-y-auto pr-1">
          {submissions.map((submission) => {
            const selected = submission.submissionId === selectedSubmissionId;
            return (
              <li key={submission.submissionId}>
                <button
                  type="button"
                  onClick={() => onSelectSubmission(submission.submissionId)}
                  aria-label={`${submission.submissionItemName} 선택`}
                  aria-pressed={selected}
                  aria-controls={detailsId}
                  className={cn(
                    'focus-visible:outline-mainBlue flex min-h-20 w-full items-center gap-2 rounded-md px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2',
                    selected ? 'bg-whiteGray text-mainBlue' : 'hover:bg-whiteGray text-neutral-800',
                  )}
                >
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-2">
                    <span className="w-full text-sm leading-5 font-medium break-words">
                      {submission.submissionItemName}
                    </span>
                    <AdvisorStatusBadge status={submission.feedbackStatus} />
                  </span>
                  <ChevronRight size={16} aria-hidden className={cn('shrink-0', !selected && 'invisible')} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex min-w-0 flex-col gap-2 xl:hidden">
        <label htmlFor={`${panelId}-select`} className="text-sm font-semibold text-neutral-900">
          제출물 선택
        </label>
        <Select
          value={selectedSubmissionId?.toString() ?? ''}
          onValueChange={(value) => onSelectSubmission(Number(value))}
        >
          <SelectTrigger
            id={`${panelId}-select`}
            aria-label="제출물 선택"
            className="border-lightGray focus:border-mainBlue h-11 min-w-0 gap-3 bg-white text-neutral-900 shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none"
          >
            <SelectValue placeholder="제출물을 선택해주세요." />
          </SelectTrigger>
          <SelectContent className="w-(--radix-select-trigger-width) max-w-[calc(100vw-2rem)]">
            {submissions.map((submission) => (
              <SelectItem
                key={submission.submissionId}
                value={submission.submissionId.toString()}
                className="min-h-11 whitespace-normal [&>span:last-child]:min-w-0 [&>span:last-child]:break-words"
              >
                {submission.submissionItemName} · {getFeedbackStatusLabel(submission.feedbackStatus)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section id={detailsId} aria-label="선택한 제출물 검토" className="border-lightGray min-w-0 xl:border-l xl:pl-6">
        {selectedSubmission ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <h4 className="min-w-0 text-base leading-6 font-semibold break-words text-neutral-950">
                {selectedSubmission.submissionItemName}
              </h4>
              <div className="shrink-0">
                <AdvisorStatusBadge status={selectedSubmission.feedbackStatus} />
              </div>
            </div>
            <div className="border-lightGray mt-5 flex min-w-0 flex-col gap-2 border-b pb-5">
              <h5 className="text-xs font-semibold text-neutral-700">제출 파일</h5>
              <AdvisorFileList files={selectedSubmission.files} onDownload={onDownloadFile} />
            </div>
            <div className="mt-5">
              <AdvisorFeedbackEditor
                key={selectedSubmission.submissionId}
                submissionItemName={selectedSubmission.submissionItemName}
                value={feedbackDrafts[selectedSubmission.submissionId] ?? ''}
                files={selectedSubmission.feedbackFiles ?? []}
                isLoading={selectedSubmission.isFeedbackLoading}
                isSaving={savingSubmissionId === selectedSubmission.submissionId}
                onAttachFiles={(files) => onAttachFeedbackFiles(selectedSubmission.submissionId, files)}
                onChange={(value) => onChangeFeedback(selectedSubmission.submissionId, value)}
                onDownloadFile={onDownloadFile}
                onRemoveFile={(file) => onRemoveFeedbackFile(selectedSubmission.submissionId, file)}
                onSave={() => onSaveFeedback(selectedSubmission.submissionId)}
              />
            </div>
          </>
        ) : (
          <p className="py-10 text-center text-sm text-neutral-600">검토할 제출물을 선택해주세요.</p>
        )}
      </section>
    </div>
  );
};
