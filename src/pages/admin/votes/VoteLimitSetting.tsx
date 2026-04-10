import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Label } from '@components/ui/label';
import { AdminActionButton, AdminHeader } from '@components/admin';
import { MAX_VOTE_PER_PERSON } from '@constants/votes';
import { patchMaxVoteLimit } from '@apis/vote';
import { VoteMaxVotesLimitDto } from '@dto/votesDto';
import { useToast } from '@hooks/useToast';
import { useContestIdOrRedirect } from '@hooks/useId';
import QueryWrapper from '@providers/QueryWrapper';
import VoteLimitSelector from './VoteLimitSelector';

const MaxVoteLimitSetting = () => {
  const contestId = useContestIdOrRedirect();
  const [maxVotesLimit, setMaxVotesLimit] = useState<number>(0);
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateMaxVoteLimit = useMutation({
    mutationKey: ['updateMaxVotesLimit'],
    mutationFn: (payload: VoteMaxVotesLimitDto) => patchMaxVoteLimit(contestId, payload),
  });

  const handleDataSave = () => {
    if (maxVotesLimit === 0) {
      return toast('투표권 수를 0으로 설정할 수 없습니다.', 'error');
    }

    updateMaxVoteLimit.mutate(
      { maxVotesLimit },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['maxVotesLimit', contestId] });
          toast('투표권 수를 수정했습니다.', 'success');
        },
        onError: (error: any) => {
          toast(error.response?.data?.message || '투표권 수 수정에 실패했습니다.', 'error');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="투표권 수" description={`최대 ${MAX_VOTE_PER_PERSON}개까지 설정 가능합니다.`} />
      <div className="flex flex-wrap items-center justify-between gap-3 pl-2">
        <div className="flex flex-wrap items-center gap-10">
          <Label className="text-base font-normal">{'1인당 투표권 수'}</Label>
          <QueryWrapper loadingStyle="h-10 my-0 rounded-sm w-[116px]" errorStyle="h-10">
            <VoteLimitSelector maxVotesLimit={maxVotesLimit} setMaxVotesLimit={setMaxVotesLimit} />
          </QueryWrapper>
        </div>
        <AdminActionButton className="ml-auto" disabled={updateMaxVoteLimit.isPending} onClick={handleDataSave}>
          {'저장하기'}
        </AdminActionButton>
      </div>
    </div>
  );
};

export default MaxVoteLimitSetting;
