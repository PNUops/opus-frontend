import { Dispatch, SetStateAction, ChangeEvent, useEffect } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import Input from '@components/Input';
import { MAX_VOTE_PER_PERSON } from '@constants/votes';
import { useToast } from 'hooks/useToast';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useContestIdOrRedirect } from 'hooks/useId';
import { getMaxVoteLimit } from 'apis/vote';

interface VoteLimitSelectorProps {
  maxVotesLimit: number;
  setMaxVotesLimit: Dispatch<SetStateAction<number>>;
}

const VoteLimitSelector = ({ maxVotesLimit, setMaxVotesLimit }: VoteLimitSelectorProps) => {
  const contestId = useContestIdOrRedirect();
  const toast = useToast();

  const { data: maxVotesLimitData } = useSuspenseQuery({
    queryKey: ['maxVotesLimit', contestId],
    queryFn: () => getMaxVoteLimit(contestId),
  });

  useEffect(() => {
    if (maxVotesLimitData) {
      setMaxVotesLimit(maxVotesLimitData.maxVotesLimit);
    }
  }, [maxVotesLimitData]);

  const onButtonClick = (type: 'plus' | 'minus') => {
    if (type === 'plus') {
      if (maxVotesLimit < MAX_VOTE_PER_PERSON) setMaxVotesLimit((prev) => prev + 1);
      else toast('10개 이상으로 설정할 수 없습니다.', 'error');
    } else if (type === 'minus' && maxVotesLimit > 0) setMaxVotesLimit((prev) => prev - 1);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= MAX_VOTE_PER_PERSON) {
      setMaxVotesLimit(Number(e.target.value));
    }
  };

  return (
    <div className="flex items-center gap-5">
      <FiMinus size={18} onClick={() => onButtonClick('minus')} className="stroke-mainGreen hover:cursor-pointer" />
      <Input value={maxVotesLimit} onChange={onInputChange} className="h-10 max-w-10 p-0 text-center text-[16px]" />
      <FiPlus size={18} onClick={() => onButtonClick('plus')} className="stroke-mainGreen hover:cursor-pointer" />
    </div>
  );
};

export default VoteLimitSelector;
