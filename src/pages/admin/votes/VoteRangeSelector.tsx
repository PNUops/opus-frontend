import DateTimePicker from '@components/DateTimePicker';
import { Dispatch, SetStateAction } from 'react';
import { VoteTermDto } from 'types/DTO';

interface VoteRangeSelectorProps {
  form: VoteTermDto;
  setForm: Dispatch<SetStateAction<VoteTermDto>>;
}

const VoteRangeSelector = ({ form, setForm }: VoteRangeSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-5 px-2.5">
      <DateTimePicker
        label={'투표 시작 일시'}
        prevDate={form.voteStartAt}
        onChange={(newDate) => setForm((prev) => ({ ...prev, voteStartAt: newDate.toISOString() }))}
      />
      <DateTimePicker
        label={'투표 마감 일시'}
        prevDate={form.voteEndAt}
        onChange={(newDate) => setForm((prev) => ({ ...prev, voteEndAt: newDate.toISOString() }))}
      />
    </div>
  );
};

export default VoteRangeSelector;
