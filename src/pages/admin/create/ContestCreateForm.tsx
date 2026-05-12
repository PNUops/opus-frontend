import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Input from '@components/Input';
import { AdminActionButton, AdminHeader } from '@components/admin';
import { postContest } from '@apis/contest';
import { ContestRequestDto } from '@dto/contestsDto';
import { useToast } from '@hooks/useToast';
import QueryWrapper from '@providers/QueryWrapper';
import { useContestCreate } from './ContestCreateContext';
import CategorySelect from '../CategorySelect';
import { getApiErrorMessage } from '@utils/error';

const ContestCreateForm = () => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [contestName, setContestName] = useState<string>('');
  const { currentStepName, setCurrentStep, setContestId } = useContestCreate();
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
          toast(`${currentStepName}이 완료되었습니다.`, 'success');
          setContestId(res.contestId);
          setCurrentStep(2);
        },
        onError: (error) => {
          toast(getApiErrorMessage(error, `${currentStepName}에 실패했습니다.`), 'error');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-7">
      <AdminHeader title={currentStepName} description="대회 카테고리 및 이름을 설정해주세요." />
      <div className="rounded-sm border border-red-400 p-2 text-red-400">
        * 다음 단계로 넘어갈 시 대회 관리 페이지에서 수정 및 삭제가 가능합니다.
      </div>
      <div className="flex flex-col gap-7.5">
        <div className="flex items-center gap-2.5">
          <div className="text-midGray w-[120px] shrink-0">대회 카테고리</div>
          <QueryWrapper loadingStyle="h-10 rounded-sm w-[250px]" errorStyle="h-50">
            <CategorySelect categoryId={categoryId} onChange={(id) => setCategoryId(id)} />
          </QueryWrapper>
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
        <AdminActionButton size="lg" className="rounded-full" variant="outline" onClick={handleCancel}>
          취소하기
        </AdminActionButton>
        <AdminActionButton size="lg" className="rounded-full" disabled={!contestName} onClick={handleCreateContest}>
          생성하기
        </AdminActionButton>
      </div>
    </div>
  );
};

export default ContestCreateForm;
