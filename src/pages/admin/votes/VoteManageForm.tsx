import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { MoveUp } from 'lucide-react';
import { VoteTermDto } from 'types/DTO';
import { useToast } from 'hooks/useToast';
import { useGetVoteTerm, useUpdateVoteTerm } from 'hooks/useVoteTerm';
import VoteRangeSelector from './VoteRangeSelector';
import VotePerPersonSelector from './VotePerPersonSelector';
import Button from '@components/Button';
import { useParams } from 'react-router-dom';
import { MAX_VOTE_PER_PERSON } from 'constants/contest';

const VoteManageForm = () => {
  const { contestId: contestIdParam } = useParams();
  const toast = useToast();
  const [form, setForm] = useState<VoteTermDto>({
    voteStartAt: dayjs().toISOString(),
    voteEndAt: dayjs().toISOString(),
    votePerPerson: 3,
  });

  const { data: voteTermData, isLoading } = useGetVoteTerm(Number(contestIdParam ?? 0));
  const updateVoteTerm = useUpdateVoteTerm(Number(contestIdParam ?? 0));

  useEffect(() => {
    if (voteTermData) {
      setForm((prev) => ({
        ...voteTermData,
        votePerPerson: prev.votePerPerson,
      }));
    }
  }, [voteTermData]);

  const handleDateSave = () => {
    const startDate = dayjs(form.voteStartAt);
    const endDate = dayjs(form.voteEndAt);
    if (endDate.isBefore(startDate)) {
      toast('종료 시간은 시작 시간보다 빠를 수 없습니다.', 'error');
      return;
    }

    updateVoteTerm.mutate(form);
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-2">
          <h2 className="text-2xl font-bold">투표 기간</h2>
          <p className="text-midGray text-xs">
            방향 키 <MoveUp className="inline-block h-2 w-2" />를 통해 오전/오후를 설정할 수 있어요.
          </p>
        </div>
        <VoteRangeSelector form={form} setForm={setForm} />
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-2">
          <h2 className="text-2xl font-bold">투표권 수</h2>
          <p className="text-midGray text-xs">{`최대 ${MAX_VOTE_PER_PERSON}까지 설정 가능합니다.`}</p>
        </div>
        <VotePerPersonSelector form={form} setForm={setForm} />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleDateSave}
          disabled={isLoading || updateVoteTerm.isPending}
          className="bg-mainBlue hover:bg-mainBlue/90 flex h-9 items-center justify-center rounded-md px-6 py-2 text-sm text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {'저장하기'}
        </Button>
      </div>
    </>
  );
};

export default VoteManageForm;
