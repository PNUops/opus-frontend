import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { MoveUp } from 'lucide-react';
import { VoteTermDto } from 'types/DTO';
import { useToast } from 'hooks/useToast';
import VoteRangeSelector from './VoteRangeSelector';
import Button from '@components/Button';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { voteTermOption } from 'queries/votes';
import { putVoteTerm } from 'apis/votes';

const VoteTermSetting = () => {
  const { contestId: contestIdParam } = useParams();
  const [voteTerm, setVoteTerm] = useState<VoteTermDto>({
    voteStartAt: dayjs().toISOString(),
    voteEndAt: dayjs().toISOString(),
  });
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: voteTermData } = useQuery(voteTermOption(Number(contestIdParam ?? 0)));
  const updateVoteTerm = useMutation({
    mutationFn: (payload: VoteTermDto) => putVoteTerm(Number(contestIdParam), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voteTerm', Number(contestIdParam)] });
      toast('투표 설정이 업데이트 되었어요', 'success');
    },
    onError: () => {
      toast('투표 설정 업데이트에 실패했어요', 'error');
    },
  });

  useEffect(() => {
    if (voteTermData) {
      setVoteTerm(voteTermData);
    }
  }, [voteTermData]);

  const handleDateSave = () => {
    const startDate = dayjs(voteTerm.voteStartAt);
    const endDate = dayjs(voteTerm.voteEndAt);
    if (endDate.isBefore(startDate)) {
      toast('종료 시간은 시작 시간보다 빠를 수 없습니다.', 'error');
      return;
    }

    updateVoteTerm.mutate(voteTerm, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['voteTerm'] });
        toast('투표 기간을 수정했습니다.', 'success');
      },
      onError: (error: any) => {
        toast(error.response?.data?.message || '투표 기간 수정에 실패했습니다.', 'error');
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end gap-2">
        <h2 className="text-2xl font-bold">투표 기간</h2>
        <p className="text-midGray text-xs">
          방향 키 <MoveUp className="inline-block h-2 w-2" />를 통해 오전/오후를 설정할 수 있어요.
        </p>
      </div>
      <VoteRangeSelector voteTerm={voteTerm} setVoteTerm={setVoteTerm} />
      <Button
        onClick={handleDateSave}
        disabled={updateVoteTerm.isPending}
        className="bg-mainBlue hover:bg-mainBlue/90 mt-4 ml-auto flex h-9 items-center justify-center rounded-md px-6 py-2 text-sm text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {'저장하기'}
      </Button>
    </div>
  );
};

export default VoteTermSetting;
