import { useEffect, useRef, useState } from 'react';
import ConfirmModal from '../../../components/ConfirmModal';
import { RiPencilFill } from 'react-icons/ri';
import { IoRemoveCircle } from 'react-icons/io5';
import { CommentDeleteRequestDto, CommentDto, CommentEditRequestDto } from '@dto/projectViewerDto';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteComment, editComment } from '@apis/projectViewer';
import { useToast } from '@hooks/useToast';
import { useTeamId } from '@hooks/useId';
import useAuth from '@hooks/useAuth';

interface CommentProps {
  comment: CommentDto;
}

const Comment = ({ comment }: CommentProps) => {
  const { commentId, description, memberId, memberName } = comment;
  const teamId = useTeamId();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const queryClient = useQueryClient();
  const toast = useToast();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedDescription, setEditedDescription] = useState<string>(description);

  const editRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isOutside = editRef.current && !editRef.current.contains(e.target as Node);
      if (isEditing && isOutside) setIsEditing(false);
    };
    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [isEditing, description, setIsEditing]);

  const { mutate: handleDeleteComment } = useMutation({
    mutationFn: (request: CommentDeleteRequestDto) => deleteComment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', teamId] });
      toast('댓글이 삭제되었어요.');
      setShowConfirm(false);
    },
    onError: () => toast('댓글 삭제에 실패했어요.'),
  });

  const { mutate: handleEditComment } = useMutation({
    mutationFn: (request: CommentEditRequestDto) => editComment(request),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['comments', teamId] });
      toast('댓글이 편집되었어요.');
    },
    onError: () => toast('댓글 편집에 실패했어요.'),
  });

  return (
    <div className="relative flex flex-col gap-3 border-b border-gray-100 p-5 text-sm" ref={editRef}>
      <span className="flex justify-between font-bold">
        {memberName}
        {memberId === currentUserId && (
          <div className="text-midGray bg-whiteGray flex items-center rounded-md">
            <div className="group relative">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedDescription(description);
                }}
                className={`cursor-pointer px-3 ${isEditing ? 'text-mainGreen' : 'hover:text-mainGreen'} focus:text-mainGreen text-midGray focus:outline-none`}
              >
                <RiPencilFill size={18} />
              </button>
              <div className="bg-mainGreen absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-xs font-normal whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-50">
                댓글 수정
              </div>
            </div>
            <div className="bg-lightGray h-4 w-px" />
            <div className="group relative">
              <button
                onClick={() => setShowConfirm(true)}
                className="text-midGray hover:text-mainRed focus:text-mainRed cursor-pointer px-3 focus:outline-none"
              >
                <IoRemoveCircle size={18} />
              </button>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-red-500 px-2 py-1 text-xs font-normal whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-50">
                댓글 삭제
              </div>
            </div>
          </div>
        )}
      </span>

      {isEditing ? (
        <div className="animate-fade-in flex flex-col gap-5">
          <div className="bg-whiteGray focus-within:ring-lightGray flex h-36 flex-col gap-2 rounded p-3 text-sm transition-all duration-300 ease-in-out focus-within:ring-1 focus:outline-none">
            <textarea
              className="placeholder:text-lightGray w-full flex-1 resize-none p-2 focus:outline-none"
              placeholder="댓글을 입력하세요 (최대 255자)"
              maxLength={255}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
            <div className="text-exsm text-midGray text-right">
              <span className={editedDescription.length >= 200 ? 'text-mainRed' : ''}>{editedDescription.length}</span>{' '}
              / 255자
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="bg-mainGreen text-exsm text-whiteGray rounded-full px-5 py-1 transition hover:cursor-pointer hover:bg-emerald-600 focus:bg-emerald-600 focus:outline-none"
              onClick={() => {
                if (editedDescription.trim() === description.trim() || !editedDescription) {
                  setIsEditing(false);
                  return;
                }
                handleEditComment({ commentId, description: editedDescription, teamId: teamId ?? -1 });
              }}
            >
              저장
            </button>
            <button
              className="text-exsm border-lightGray text-midGray hover:bg-lightGray focus:bg-lightGray rounded-full border px-5 py-1 transition hover:cursor-pointer focus:outline-none"
              onClick={() => setIsEditing(false)}
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
        onConfirm={() => handleDeleteComment({ commentId, teamId: teamId ?? -1 })}
        onCancel={() => setShowConfirm(false)}
        description="삭제한 댓글은 복구할 수 없습니다."
      />
    </div>
  );
};

export default Comment;
