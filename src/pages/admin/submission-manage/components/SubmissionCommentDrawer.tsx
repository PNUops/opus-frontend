import { FileText, PanelRightClose } from 'lucide-react';

import { SheetClose, SheetTitle } from '@components/ui/sheet';
import { COMMENT_ROLE_LABEL } from '@constants/submission';
import type {
  SubmissionCommentResponseDto,
  SubmissionDetailResponseDto,
  SubmissionFileResponseDto,
} from '@dto/submissionDto';

import { formatDateTime, formatFileSize } from '../utils/format';
import { SubmissionTeamSummary } from './SubmissionTeamSummary';

interface SubmissionCommentDrawerProps {
  detail: SubmissionDetailResponseDto;
  comments: SubmissionCommentResponseDto[];
  onDownloadFile: (file: SubmissionFileResponseDto) => void;
}

export const SubmissionCommentDrawer = ({ detail, comments, onDownloadFile }: SubmissionCommentDrawerProps) => {
  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-lightGray flex items-center gap-2 border-b px-5 py-4">
        <SheetClose asChild>
          <button type="button" aria-label="닫기" className="text-midGray hover:text-darkGray">
            <PanelRightClose size={20} />
          </button>
        </SheetClose>
        <SheetTitle className="text-base font-semibold">코멘트 보기</SheetTitle>
      </div>

      {/* 본문 (스크롤) */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        <SubmissionTeamSummary detail={detail} />

        <div className="flex flex-col gap-3">
          {comments.length === 0 ? (
            <div className="text-midGray border-lightGray rounded-xl border py-10 text-center text-sm">
              아직 코멘트가 없어요.
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.commentId} comment={comment} onDownloadFile={onDownloadFile} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: SubmissionCommentResponseDto;
  onDownloadFile: (file: SubmissionFileResponseDto) => void;
}

const CommentItem = ({ comment, onDownloadFile }: CommentItemProps) => {
  return (
    <div className="border-lightGray rounded-xl border p-4">
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
        <div className="mt-3 flex flex-col gap-1">
          {comment.files.map((file) => (
            <button
              key={file.fileId}
              type="button"
              onClick={() => onDownloadFile(file)}
              className="bg-whiteGray hover:bg-lightGray flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors"
            >
              <FileText size={16} className="text-midGray shrink-0" />
              <span className="text-darkGray flex-1 truncate text-sm">{file.fileName}</span>
              <span className="text-midGray shrink-0 text-xs">{formatFileSize(file.fileSize)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
