import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postCommentForm } from '@apis/projectViewer';
import { useToast } from '@hooks/useToast';
import { teamCommentKeys } from '@queries/teamComments';

const MAX_FEEDBACK_LENGTH = 3000;

interface FeedbackFormProps {
  teamId: number;
}

const FeedbackForm = ({ teamId }: FeedbackFormProps) => {
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: () => postCommentForm({ teamId, description, visibility: 'TEAM' }),
    onSuccess: () => {
      setDescription('');
      queryClient.invalidateQueries({ queryKey: teamCommentKeys.list(teamId, 'TEAM') });
      toast('피드백이 등록되었어요.');
    },
    onError: () => toast('피드백 등록에 실패했어요.'),
  });

  const handleSubmit = () => {
    if (!description.trim()) {
      toast('피드백을 입력해주세요.');
      return;
    }
    if (createMutation.isPending) return;
    createMutation.mutate();
  };

  return (
    <>
      <div className="ring-lightGray focus-within:ring-mainGreen text-exsm flex h-36 flex-col gap-2 rounded p-3 text-sm ring-1 transition-all duration-300 ease-in-out focus-within:ring-1 sm:text-sm">
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={MAX_FEEDBACK_LENGTH}
          placeholder="프로젝트 전반에 대한 피드백을 작성해주세요."
          className="placeholder-lightGray w-full flex-1 resize-none p-2 focus:outline-none"
        />
        <div className="text-exsm text-midGray text-right">
          <span className={description.length >= 2700 ? 'text-mainRed' : ''}>{description.length}</span> /{' '}
          {MAX_FEEDBACK_LENGTH}자
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="text-mainGreen text-exsm bg-subGreen w-32 rounded-full py-2 font-medium transition-colors duration-200 hover:cursor-pointer hover:bg-[#b2e8cf] focus:bg-[#b2e8cf] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          {createMutation.isPending ? '등록 중' : '등록'}
        </button>
      </div>
    </>
  );
};

export default FeedbackForm;
