import Input from '@components/Input';
import CategorySelect from '../CategorySelect';
import { useState } from 'react';
import Button from '@components/Button';
import { useMutation } from '@tanstack/react-query';
import { useContestCreate } from './ContestCreateContext';
import { postContest } from 'apis/contest';
import { ContestRequestDto } from 'types/DTO';
import { useToast } from 'hooks/useToast';
import { useNavigate } from 'react-router-dom';

const ContestCreateForm = () => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [contestName, setContestName] = useState<string>('');
  const { setCurrentStep, setContestId } = useContestCreate();
  const toast = useToast();
  const navigate = useNavigate();

  const createContest = useMutation({
    mutationKey: ['createContest'],
    mutationFn: (payload: ContestRequestDto) => postContest(payload),
  });

  const handleCancel = () => {
    navigate(-1);
  };

  const handleCreateContest = () => {
    if (!contestName) return toast('대회 이름을 입력해주세요.', 'error');

    createContest.mutate(
      {
        categoryId: Number(categoryId),
        contestName,
      },
      {
        onSuccess: (res) => {
          toast('대회 생성이 완료되었습니다.', 'success');
          setContestId(res.contestId);
          setCurrentStep(2);
        },
        onError: () => {
          toast('대회 생성에 실패했습니다.', 'error');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">대회 생성</h2>
        <div className="text-midGray text-xs">대회 카테고리 및 이름을 설정해주세요.</div>
      </div>
      <div className="rounded-sm border border-red-400 p-2 text-red-400">
        * 다음 단계로 넘어갈 시 대회 관리 페이지에서 수정 및 삭제가 가능합니다.
      </div>
      <div className="flex flex-col gap-7.5">
        <div className="flex items-center gap-2.5">
          <div className="text-midGray w-[120px] shrink-0">대회 카테고리</div>
          <CategorySelect categoryId={categoryId} onChange={(id) => setCategoryId(id)} />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-midGray w-[120px] shrink-0">대회 이름</div>
          <Input
            value={contestName}
            onChange={(e) => setContestName(e.target.value)}
            className="bg-whiteGray rounded-sm px-3 py-2 text-base focus:outline-1"
            placeholder="대회 이름을 입력해주세요."
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-6">
        <Button className="rounded-3xl border border-red-400 px-6 py-2 text-red-400" onClick={handleCancel}>
          취소하기
        </Button>
        <Button
          className="disabled:border-midGray disabled:bg-whiteGray disabled:text-midGray border-mainGreen text-mainGreen rounded-3xl border px-6 py-2"
          onClick={handleCreateContest}
        >
          생성하기
        </Button>
      </div>
    </div>
  );
};

export default ContestCreateForm;
