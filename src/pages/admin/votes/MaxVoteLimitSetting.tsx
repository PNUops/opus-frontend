import { ChangeEvent, useEffect, useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import Input from '@components/Input';
import { Label } from '@components/ui/label';
import { MAX_VOTE_PER_PERSON } from 'constants/votes';
import Button from '@components/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getMaxVoteLimit, patchMaxVoteLimit } from 'apis/votes';
import { VoteMaxVotesLimitDto } from 'types/DTO';
import { useToast } from 'hooks/useToast';

const MaxVoteLimitSetting = () => {
  const { contestId: contestIdParam } = useParams();
  const [maxVotesLimit, setMaxVotesLimit] = useState<number>(3);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: maxVotesLimitData } = useQuery({
    queryKey: ['maxVotesLimit', contestIdParam],
    queryFn: () => getMaxVoteLimit(Number(contestIdParam ?? 0)),
    enabled: !!contestIdParam,
  });
  const updateMaxVoteLimit = useMutation({
    mutationKey: ['updateMaxVotesLimit'],
    mutationFn: (payload: VoteMaxVotesLimitDto) => patchMaxVoteLimit(Number(contestIdParam ?? 0), payload),
  });

  useEffect(() => {
    if (maxVotesLimitData) {
      setMaxVotesLimit(maxVotesLimitData.maxVotesLimit);
    }
  }, [maxVotesLimitData]);

  const onButtonClick = (type: 'plus' | 'minus') => {
    if (type === 'plus' && maxVotesLimit < MAX_VOTE_PER_PERSON) setMaxVotesLimit((prev) => prev + 1);
    else if (type === 'minus' && maxVotesLimit > 0) setMaxVotesLimit((prev) => prev - 1);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= MAX_VOTE_PER_PERSON) {
      setMaxVotesLimit(Number(e.target.value));
    }
  };

  const handleDataSave = () => {
    if (maxVotesLimit === 0) {
      return toast('투표권 수를 0으로 설정할 수 없습니다.', 'error');
    }

    updateMaxVoteLimit.mutate(
      { maxVotesLimit },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['maxVotesLimit'] });
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
      <div className="flex flex-wrap items-end gap-2">
        <h2 className="text-2xl font-bold">투표권 수</h2>
        <p className="text-midGray text-xs">{`최대 ${MAX_VOTE_PER_PERSON}개까지 설정 가능합니다.`}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pl-2">
        <div className="flex flex-wrap items-center gap-10">
          <Label className="font-normal">{'1인당 투표권 수'}</Label>
          <div className="flex items-center gap-5">
            <FiMinus
              size={18}
              onClick={() => onButtonClick('minus')}
              className="stroke-mainGreen hover:cursor-pointer"
            />
            <Input
              value={maxVotesLimit}
              onChange={onInputChange}
              className="h-10 max-w-10 p-0 text-center text-[16px]"
            />
            <FiPlus size={18} onClick={() => onButtonClick('plus')} className="stroke-mainGreen hover:cursor-pointer" />
          </div>
        </div>
        <Button
          onClick={handleDataSave}
          disabled={updateMaxVoteLimit.isPending}
          className="bg-mainBlue hover:bg-mainBlue/90 flex h-9 items-center justify-center rounded-md px-6 py-2 text-sm text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {'저장하기'}
        </Button>
      </div>
    </div>
  );
};

export default MaxVoteLimitSetting;
