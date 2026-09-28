import { useEffect, useRef, useState } from 'react';
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
  const { commentId, description, memberId, memberName, memberRoleType, createdAt, updatedAt } = feedback;
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const queryKey = teamCommentKeys.list(teamId, 'TEAM');

  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [showConfirm, setShowConfirm] = useState(false);

  const editRef = useRef<HTMLElement>(null);
  const isEdited = !dayjs(createdAt).isSame(updatedAt);
  const displayedAt = isEdited ? updatedAt : createdAt;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = editRef.current && !editRef.current.contains(event.target as Node);
      if (isEditing && isOutside) setIsEditing(false);
    };
    document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, [isEditing]);

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
    <article className="relative flex flex-col gap-3 border-b border-gray-100 p-5 text-sm" ref={editRef}>
      <div className="flex items-center justify-between gap-3 font-bold">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate">{memberName ?? '알 수 없음'}</span>
          {roleLabel && (
            <span className="bg-subGreen text-mainGreen shrink-0 rounded-md px-2 py-0.5 text-xs font-medium">
              {roleLabel}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <time dateTime={displayedAt} className="text-midGray text-xs font-normal">
            {dayjs(displayedAt).format('YYYY.MM.DD HH:mm')}
            {isEdited && ' (수정됨)'}
          </time>
          {isMine && (
            <div className="text-midGray bg-whiteGray flex items-center rounded-md">
              <div className="group relative">
                <button
                  type="button"
                  aria-label="피드백 수정"
                  onClick={() => {
                    setEditedDescription(description);
                    setIsEditing(true);
                  }}
                  className={`cursor-pointer px-3 ${isEditing ? 'text-mainGreen' : 'hover:text-mainGreen'} focus:text-mainGreen text-midGray focus:outline-none`}
                >
                  <RiPencilFill size={18} />
                </button>
                <div className="bg-mainGreen absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-xs font-normal whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-50">
                  피드백 수정
                </div>
              </div>
              <div className="bg-lightGray h-4 w-px" />
              <div className="group relative">
                <button
                  type="button"
                  aria-label="피드백 삭제"
                  onClick={() => setShowConfirm(true)}
                  className="text-midGray hover:text-mainRed focus:text-mainRed cursor-pointer px-3 focus:outline-none"
                >
                  <IoRemoveCircle size={18} />
                </button>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-red-500 px-2 py-1 text-xs font-normal whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-50">
                  피드백 삭제
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="animate-fade-in flex flex-col gap-5">
          <div className="bg-whiteGray focus-within:ring-lightGray flex h-36 flex-col gap-2 rounded p-3 text-sm transition-all duration-300 ease-in-out focus-within:ring-1 focus:outline-none">
            <textarea
              value={editedDescription}
              onChange={(event) => setEditedDescription(event.target.value)}
              maxLength={MAX_FEEDBACK_LENGTH}
              placeholder="피드백을 입력하세요 (최대 3000자)"
              className="placeholder:text-lightGray w-full flex-1 resize-none p-2 focus:outline-none"
            />
            <div className="text-exsm text-midGray text-right">
              <span className={editedDescription.length >= 2700 ? 'text-mainRed' : ''}>{editedDescription.length}</span>{' '}
              / {MAX_FEEDBACK_LENGTH}자
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleEdit}
              disabled={editMutation.isPending}
              className="bg-mainGreen text-exsm text-whiteGray rounded-full px-5 py-1 transition hover:cursor-pointer hover:bg-emerald-600 focus:bg-emerald-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editMutation.isPending ? '저장 중' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={editMutation.isPending}
              className="text-exsm border-lightGray text-midGray hover:bg-lightGray focus:bg-lightGray rounded-full border px-5 py-1 transition hover:cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="break-words whitespace-pre-wrap text-gray-700 transition-all duration-300 ease-in-out">
          {description}
        </div>
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
