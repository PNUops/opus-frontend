import dayjs from 'dayjs';
import { useState } from 'react';
import { VoteTermDto } from '@dto/votesDto';
import { useToast } from '@hooks/useToast';
import VoteRangeSelector from './VoteRangeSelector';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putVoteTerm } from '@apis/vote';
import { VOTETERM_TIME_FORMAT } from '@constants/votes';
import { useContestIdOrRedirect } from '@hooks/useId';
import { AdminActionButton, AdminHeader } from '@components/admin';
import { voteTermOption } from '@queries/votes';
import QueryWrapper from '@providers/QueryWrapper';
import { getApiErrorMessage } from '@utils/error';

const VoteTermSetting = () => {
  const contestId = useContestIdOrRedirect();
  const [voteTerm, setVoteTerm] = useState<VoteTermDto>({
    voteStartAt: dayjs().format(VOTETERM_TIME_FORMAT),
    voteEndAt: dayjs().format(VOTETERM_TIME_FORMAT),
  });
  const toast = useToast();
  const queryClient = useQueryClient();

  const updateVoteTerm = useMutation({
    mutationKey: ['updateVoteTerm'],
    mutationFn: (payload: VoteTermDto) => putVoteTerm(contestId, payload),
  });

  const handleDateSave = () => {
    const startDate = dayjs(voteTerm.voteStartAt);
    const endDate = dayjs(voteTerm.voteEndAt);
    if (endDate.isBefore(startDate)) {
      toast('종료 시간은 시작 시간보다 빠를 수 없습니다.', 'error');
      return;
    }

    updateVoteTerm.mutate(voteTerm, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: voteTermOption(contestId).queryKey });
        toast('투표 기간을 수정했습니다.', 'success');
      },
      onError: (error) => {
        toast(getApiErrorMessage(error, '투표 기간 수정에 실패했습니다.'), 'error');
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="투표 기간" description="방향 키 ↑↓ 를 통해 오전/오후를 설정할 수 있어요." />
      <QueryWrapper loadingStyle="h-9 my-0 rounded-sm" errorStyle="h-9">
        <VoteRangeSelector voteTerm={voteTerm} setVoteTerm={setVoteTerm} />
      </QueryWrapper>
      <AdminActionButton className="ml-auto" disabled={updateVoteTerm.isPending} onClick={handleDateSave}>
        저장하기
      </AdminActionButton>
    </div>
  );
};

export default VoteTermSetting;
