import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import Input from '@components/Input';
import { Label } from '@components/ui/label';
import { VoteTermDto } from 'types/DTO';
import { MAX_VOTE_PER_PERSON } from 'constants/contest';

interface VotePerPersonSelectorProps {
  form: VoteTermDto;
  setForm: Dispatch<SetStateAction<VoteTermDto>>;
}

const VotePerPersonSelector = ({ form, setForm }: VotePerPersonSelectorProps) => {
  const onButtonClick = (type: 'plus' | 'minus') => {
    if (type === 'plus' && form.votePerPerson < MAX_VOTE_PER_PERSON)
      setForm((prev) => ({ ...prev, votePerPerson: prev.votePerPerson + 1 }));
    else if (type === 'minus' && form.votePerPerson > 0)
      setForm((prev) => ({ ...prev, votePerPerson: prev.votePerPerson - 1 }));
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= MAX_VOTE_PER_PERSON) {
      setForm((prev) => ({ ...prev, votePerPerson: Number(e.target.value) }));
    }
  };

  return (
    <div className="flex flex-wrap justify-between gap-3 px-2.5">
      <Label className="font-normal">{'1인당 투표권 수'}</Label>
      <div className="flex items-center gap-5">
        <FiMinus size={18} onClick={() => onButtonClick('minus')} className="stroke-mainGreen hover:cursor-pointer" />
        <Input
          value={form.votePerPerson}
          onChange={onInputChange}
          className="h-10 max-w-10 p-0 text-center text-[16px]"
        />
        <FiPlus size={18} onClick={() => onButtonClick('plus')} className="stroke-mainGreen hover:cursor-pointer" />
      </div>
    </div>
  );
};

export default VotePerPersonSelector;
