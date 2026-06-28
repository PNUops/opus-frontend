import { getFeedbackRoleLabel } from '@constants/submission';
import type { SubmissionFeedbackResponseDto, SubmissionFileResponseDto } from '@dto/submissionDto';

import { formatDateTime } from '../utils/format';
import { FileChips } from './FileChips';

interface FeedbackListProps {
  feedbacks: SubmissionFeedbackResponseDto[];
  onDownloadFile: (feedbackId: number, file: SubmissionFileResponseDto) => void;
}

export const FeedbackList = ({ feedbacks, onDownloadFile }: FeedbackListProps) => {
  if (feedbacks.length === 0) {
    return (
      <div className="text-midGray border-lightGray rounded-xl border py-8 text-center text-sm">
        아직 피드백이 없어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {feedbacks.map((feedback) => (
        <div key={feedback.feedbackId} className="border-lightGray rounded-xl border p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-lightGray h-8 w-8 shrink-0 rounded-full" />
              <span className="text-darkGray text-sm font-semibold">{feedback.memberName}</span>
              <span className="bg-whiteGray text-midGray rounded-md px-2 py-0.5 text-xs">
                {getFeedbackRoleLabel(feedback.memberRoleType)}
              </span>
            </div>
            <span className="text-midGray shrink-0 text-xs">{formatDateTime(feedback.createdAt)}</span>
          </div>

          <p className="text-darkGray mt-3 text-sm leading-relaxed whitespace-pre-wrap">{feedback.description}</p>

          {feedback.files.length > 0 && (
            <div className="mt-3">
              <p className="text-midGray mb-1.5 text-xs">첨부파일</p>
              <FileChips files={feedback.files} onDownload={(file) => onDownloadFile(feedback.feedbackId, file)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
