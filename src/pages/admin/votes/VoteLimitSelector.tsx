import { Dispatch, SetStateAction, ChangeEvent, useEffect } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import Input from '@components/Input';
import { AdminActionButton } from '@components/admin';
import { MAX_VOTE_PER_PERSON } from '@constants/votes';
import { useToast } from '@hooks/useToast';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useContestIdOrRedirect } from '@hooks/useId';
import { getMaxVoteLimit } from '@apis/vote';

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
    <div className="flex items-center gap-2">
      <AdminActionButton
        type="button"
        variant="outline"
        size="icon"
        aria-label="투표권 수 줄이기"
        disabled={maxVotesLimit <= 0}
        onClick={() => onButtonClick('minus')}
      >
        <FiMinus />
      </AdminActionButton>
      <Input
        appearance="admin"
        aria-label="1인당 투표권 수"
        inputMode="numeric"
        value={maxVotesLimit}
        onChange={onInputChange}
        className="h-11 w-14 px-2 text-center"
      />
      <AdminActionButton
        type="button"
        variant="outline"
        size="icon"
        aria-label="투표권 수 늘리기"
        disabled={maxVotesLimit >= MAX_VOTE_PER_PERSON}
        onClick={() => onButtonClick('plus')}
      >
        <FiPlus />
      </AdminActionButton>
    </div>
  );
};

export default VoteLimitSelector;
