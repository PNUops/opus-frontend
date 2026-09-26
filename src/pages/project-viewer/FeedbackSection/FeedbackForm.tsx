import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postCommentForm } from '@apis/projectViewer';
import { useToast } from '@hooks/useToast';
import { MY_COMMENTS_QUERY_KEY } from '@queries/me';
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
      queryClient.invalidateQueries({ queryKey: MY_COMMENTS_QUERY_KEY });
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
    <div className="border-mainGreen/30 bg-subGreen/20 rounded-lg border p-4">
      <p className="text-darkGray mb-3 text-sm font-semibold">프로젝트 피드백 남기기</p>
      <div className="border-lightGray focus-within:border-mainGreen flex h-36 flex-col gap-2 rounded-md border bg-white p-3 text-sm transition-colors">
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={MAX_FEEDBACK_LENGTH}
          placeholder="프로젝트 전반에 대한 피드백을 작성해주세요."
          className="placeholder-lightGray w-full flex-1 resize-none p-1 focus:outline-none"
        />
        <div className="text-exsm text-midGray text-right">
          <span className={description.length >= 2700 ? 'text-mainRed' : ''}>{description.length}</span> /{' '}
          {MAX_FEEDBACK_LENGTH}자
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="bg-mainGreen text-exsm rounded-full px-6 py-2 font-medium text-white transition-colors hover:cursor-pointer hover:bg-emerald-600 focus:bg-emerald-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createMutation.isPending ? '등록 중' : '피드백 등록'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackForm;
