import DateTimePicker from '@components/DateTimePicker';
import { Dispatch, SetStateAction } from 'react';
import { VoteTermDto } from 'types/DTO';

interface VoteRangeSelectorProps {
  voteTerm: VoteTermDto;
  setVoteTerm: Dispatch<SetStateAction<VoteTermDto>>;
}

const VoteRangeSelector = ({ voteTerm, setVoteTerm }: VoteRangeSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-5 pl-2.5">
      <DateTimePicker
        label={'투표 시작 일시'}
        prevDate={voteTerm.voteStartAt}
        onChange={(newDate) => setVoteTerm((prev) => ({ ...prev, voteStartAt: newDate.toISOString() }))}
      />
      <DateTimePicker
        label={'투표 마감 일시'}
        prevDate={voteTerm.voteEndAt}
        onChange={(newDate) => setVoteTerm((prev) => ({ ...prev, voteEndAt: newDate.toISOString() }))}
      />
    </div>
  );
};

export default VoteRangeSelector;
