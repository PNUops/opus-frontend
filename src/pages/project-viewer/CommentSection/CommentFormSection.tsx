import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import { CommentCreateRequestDto, CommentDto } from '@dto/projectViewerDto';
import { postCommentForm } from '@apis/projectViewer';
import { MY_COMMENTS_QUERY_KEY } from '@queries/me';
import { teamCommentKeys } from '@queries/teamComments';

const MAX_COMMENT_LENGTH = 3000;

interface CommentFormSection {
  teamId: number;
}

interface PreviousComments {
  previousComments: CommentDto[] | undefined;
}

const CommentFormSection = ({ teamId }: CommentFormSection) => {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toast = useToast();
  const queryKey = teamCommentKeys.list(teamId, 'PUBLIC');

  const commentMutation = useMutation<void, Error, string, PreviousComments>({
    mutationFn: (comment) => {
      const requestDto: CommentCreateRequestDto = {
        teamId,
        description: comment,
        visibility: 'PUBLIC',
      };
      return postCommentForm(requestDto);
    },
    onMutate: async (newCommentText) => {
      await queryClient.cancelQueries({ queryKey });
      const previousComments = queryClient.getQueryData<CommentDto[]>(queryKey);
      const now = new Date().toISOString();

      const optimisticComment: CommentDto = {
        commentId: Date.now(),
        description: newCommentText,
        visibility: 'PUBLIC',
        memberId: user?.id ?? 0,
        memberName: user?.name ?? '',
        memberRoleType: null,
        teamId,
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData<CommentDto[]>(queryKey, (old = []) => [optimisticComment, ...old]);

      return { previousComments };
    },
    onError: (_error, _comment, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousComments);
      }
      toast('댓글 등록에 실패했어요.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_COMMENTS_QUERY_KEY });
      setNewComment('');
      toast('댓글이 등록되었어요.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleClick = () => {
    if (!newComment.trim()) return toast('댓글을 입력해주세요.');
    if (commentMutation.isPending) return;
    commentMutation.mutate(newComment);
  };

  return (
    <>
      <div className="ring-lightGray focus-within:ring-mainGreen text-exsm flex h-36 flex-col gap-2 rounded p-3 text-sm ring-1 transition-all duration-300 ease-in-out focus-within:ring-1 sm:text-sm">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder="프로젝트에 대해 댓글을 남겨보세요."
          className="placeholder-lightGray w-full flex-1 resize-none p-2 focus:outline-none"
        />
        <div className="text-exsm text-midGray text-right">
          <span className={newComment.length >= 2700 ? 'text-mainRed' : ''}>{newComment.length}</span> /{' '}
          {MAX_COMMENT_LENGTH}자
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={handleClick}
          disabled={commentMutation.isPending}
          className="text-mainGreen text-exsm w-32 rounded-full bg-[#D1F3E1] py-2 font-medium transition-colors duration-200 hover:cursor-pointer hover:bg-[#b2e8cf] focus:bg-[#b2e8cf] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          {commentMutation.isPending ? '등록 중' : '등록'}
        </button>
      </div>
    </>
  );
};

export default CommentFormSection;
