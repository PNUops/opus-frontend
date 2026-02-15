import DateTimePicker from '@components/DateTimePicker';
import { VOTETERM_TIME_FORMAT } from 'constants/votes';
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
        onChange={(newDate) => setVoteTerm((prev) => ({ ...prev, voteStartAt: newDate.format(VOTETERM_TIME_FORMAT) }))}
      />
      <DateTimePicker
        label={'투표 마감 일시'}
        prevDate={voteTerm.voteEndAt}
        onChange={(newDate) => setVoteTerm((prev) => ({ ...prev, voteEndAt: newDate.format(VOTETERM_TIME_FORMAT) }))}
      />
    </div>
  );
};

export default VoteRangeSelector;
