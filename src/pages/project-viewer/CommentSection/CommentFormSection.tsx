import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import { CommentCreateRequestDto, CommentDto } from '@dto/projectViewerDto';
import { postCommentForm } from '@apis/projectViewer';
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

  const commentMutation = useMutation<void, Error, string, PreviousComments>({
    mutationFn: (comment) => {
      const requestDto: CommentCreateRequestDto = {
        teamId,
        description: comment,
      };
      return postCommentForm(requestDto);
    },
    onMutate: async (newCommentText) => {
      await queryClient.cancelQueries({ queryKey: ['comments', teamId] });
      const previousComments = queryClient.getQueryData<CommentDto[]>(['comments', teamId]);

      const optimisticComment: CommentDto = {
        commentId: Date.now(),
        description: newCommentText,
        memberId: user?.id ?? 0,
        memberName: user?.name ?? '',
        teamId,
      };

      queryClient.setQueryData<CommentDto[]>(['comments', teamId], (old = []) => [...old, optimisticComment]);

      return { previousComments };
    },
    onError: (err, newComment, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', teamId], context.previousComments);
      }
      toast('댓글 등록에 실패했어요.');
    },
    onSuccess: () => {
      toast('댓글이 등록되었어요.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', teamId] });
      setNewComment('');
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
          maxLength={255}
          placeholder="프로젝트에 대해 댓글을 남겨보세요."
          className="placeholder-lightGray w-full flex-1 resize-none p-2 focus:outline-none"
        />
        <div className="text-exsm text-midGray text-right">
          <span className={newComment.length >= 200 ? 'text-mainRed' : ''}>{newComment.length}</span> / 255자
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          onClick={handleClick}
          className="text-mainGreen text-exsm rounded-full bg-[#D1F3E1] px-10 py-2 font-medium transition-colors duration-200 hover:cursor-pointer hover:bg-[#b2e8cf] focus:bg-[#b2e8cf] focus:outline-none sm:text-sm"
        >
          등록
        </button>
      </div>
    </>
  );
};

export default CommentFormSection;
