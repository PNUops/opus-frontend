import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { IoRemoveCircle } from 'react-icons/io5';
import { RiPencilFill } from 'react-icons/ri';

import { deleteComment, editComment } from '@apis/projectViewer';
import ConfirmModal from '@components/ConfirmModal';
import { CommentDto } from '@dto/projectViewerDto';
import useAuth from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import { teamCommentKeys } from '@queries/teamComments';

const MAX_FEEDBACK_LENGTH = 3000;

interface FeedbackItemProps {
  feedback: CommentDto;
  teamId: number;
}

const getRoleLabel = (roleType: CommentDto['memberRoleType']) => {
  if (roleType === 'ROLE_교수') return '지도교수';
  if (roleType === 'ROLE_외부멘토') return '멘토';
  return null;
};

const FeedbackItem = ({ feedback, teamId }: FeedbackItemProps) => {
  const { commentId, description, memberId, memberName, memberRoleType, createdAt } = feedback;
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const queryKey = teamCommentKeys.list(teamId, 'TEAM');

  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [showConfirm, setShowConfirm] = useState(false);

  const editMutation = useMutation({
    mutationFn: () => editComment({ teamId, commentId, description: editedDescription }),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey });
      toast('피드백이 수정되었어요.');
    },
    onError: () => toast('피드백 수정에 실패했어요.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment({ teamId, commentId }),
    onSuccess: () => {
      setShowConfirm(false);
      queryClient.invalidateQueries({ queryKey });
      toast('피드백이 삭제되었어요.');
    },
    onError: () => toast('피드백 삭제에 실패했어요.'),
  });

  const handleEdit = () => {
    if (!editedDescription.trim()) {
      toast('피드백을 입력해주세요.');
      return;
    }
    if (editedDescription.trim() === description.trim()) {
      setIsEditing(false);
      return;
    }
    if (!editMutation.isPending) editMutation.mutate();
  };

  const isMine = memberId === user?.id;
  const roleLabel = getRoleLabel(memberRoleType);

  return (
    <article className="border-lightGray rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="bg-lightGray text-midGray flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {memberName?.slice(0, 1) ?? '?'}
          </div>
          <span className="text-darkGray truncate text-sm font-semibold">{memberName ?? '알 수 없음'}</span>
          {roleLabel && (
            <span className="bg-subGreen text-mainGreen shrink-0 rounded-md px-2 py-0.5 text-xs font-medium">
              {roleLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <time dateTime={createdAt} className="text-midGray text-xs">
            {dayjs(createdAt).format('YYYY.MM.DD HH:mm')}
          </time>
          {isMine && (
            <div className="bg-whiteGray text-midGray flex items-center rounded-md">
              <button
                type="button"
                aria-label="피드백 수정"
                onClick={() => {
                  setEditedDescription(description);
                  setIsEditing(true);
                }}
                className="hover:text-mainGreen focus:text-mainGreen cursor-pointer px-2 py-1 focus:outline-none"
              >
                <RiPencilFill size={16} />
              </button>
              <div className="bg-lightGray h-4 w-px" />
              <button
                type="button"
                aria-label="피드백 삭제"
                onClick={() => setShowConfirm(true)}
                className="hover:text-mainRed focus:text-mainRed cursor-pointer px-2 py-1 focus:outline-none"
              >
                <IoRemoveCircle size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-4">
          <div className="bg-whiteGray focus-within:ring-lightGray flex h-36 flex-col gap-2 rounded p-3 text-sm focus-within:ring-1">
            <textarea
              value={editedDescription}
              onChange={(event) => setEditedDescription(event.target.value)}
              maxLength={MAX_FEEDBACK_LENGTH}
              placeholder="피드백을 입력하세요 (최대 3000자)"
              className="placeholder:text-lightGray w-full flex-1 resize-none bg-transparent p-1 focus:outline-none"
            />
            <div className="text-exsm text-midGray text-right">
              <span className={editedDescription.length >= 2700 ? 'text-mainRed' : ''}>{editedDescription.length}</span>{' '}
              / {MAX_FEEDBACK_LENGTH}자
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleEdit}
              disabled={editMutation.isPending}
              className="bg-mainGreen text-exsm rounded-full px-5 py-1 text-white transition hover:bg-emerald-600 focus:bg-emerald-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editMutation.isPending ? '저장 중' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={editMutation.isPending}
              className="text-exsm border-lightGray text-midGray hover:bg-lightGray focus:bg-lightGray rounded-full border px-5 py-1 transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p className="text-darkGray mt-4 text-sm leading-relaxed break-words whitespace-pre-wrap">{description}</p>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={() => {
          if (!deleteMutation.isPending) deleteMutation.mutate();
        }}
        onCancel={() => {
          if (!deleteMutation.isPending) setShowConfirm(false);
        }}
        message="피드백을 삭제하시겠어요?"
        description="삭제한 피드백은 복구할 수 없습니다."
      />
    </article>
  );
};

export default FeedbackItem;
