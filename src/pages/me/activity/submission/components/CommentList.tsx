import { COMMENT_ROLE_LABEL } from '@constants/submission';
import type { SubmissionCommentResponseDto, SubmissionFileResponseDto } from '@dto/submissionDto';

import { formatDateTime } from '../utils/format';
import { FileChips } from './FileChips';

interface CommentListProps {
  comments: SubmissionCommentResponseDto[];
  onDownloadFile: (file: SubmissionFileResponseDto) => void;
}

export const CommentList = ({ comments, onDownloadFile }: CommentListProps) => {
  if (comments.length === 0) {
    return (
      <div className="text-midGray border-lightGray rounded-xl border py-8 text-center text-sm">
        아직 피드백이 없어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => (
        <div key={comment.commentId} className="border-lightGray rounded-xl border p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-lightGray h-8 w-8 shrink-0 rounded-full" />
              <span className="text-darkGray text-sm font-semibold">{comment.memberName}</span>
              <span className="bg-whiteGray text-midGray rounded-md px-2 py-0.5 text-xs">
                {COMMENT_ROLE_LABEL[comment.memberRole]}
              </span>
            </div>
            <span className="text-midGray shrink-0 text-xs">{formatDateTime(comment.createdAt)}</span>
          </div>

          <p className="text-darkGray mt-3 text-sm leading-relaxed whitespace-pre-wrap">{comment.description}</p>

          {comment.files.length > 0 && (
            <div className="mt-3">
              <p className="text-midGray mb-1.5 text-xs">첨부파일</p>
              <FileChips files={comment.files} onDownload={onDownloadFile} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
