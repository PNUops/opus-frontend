import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Input from '@components/Input';
import { patchContest } from '@apis/contest';
import { useToast } from '@hooks/useToast';
import useContestName from '@hooks/useContestName';
import CategorySelect from '../CategorySelect';
import { ContestRequestDto } from '@dto/contestsDto';
import { useContestIdOrRedirect } from '@hooks/useId';
import QueryWrapper from '@providers/QueryWrapper';
import { AdminActionButton } from '@components/admin';

const ContestEdit = () => {
  const contestId = useContestIdOrRedirect();
  const prevName = useContestName();
  const [categoryId, setCategoryId] = useState<string>('');
  const [contestName, setContestName] = useState<string>('');
  const toast = useToast();
  const queryClient = useQueryClient();

  const { mutate: editContestName, isPending } = useMutation({
    mutationFn: (payload: ContestRequestDto) => patchContest(contestId, payload),
  });

  useEffect(() => {
    if (prevName) setContestName(prevName);
  }, [prevName]);

  const handleEdit = () => {
    if (!contestName) {
      toast('수정할 대회명을 입력해주세요.', 'error');
      return;
    }

    editContestName(
      {
        categoryId: Number(categoryId),
        contestName: contestName.trim(),
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['contests'] });
          toast('대회가 수정되었습니다.', 'success');
        },
        onError: (error: any) => {
          toast(error.response?.data?.message || '대회 수정에 실패했습니다.', 'error');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">대회 수정</h2>
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
            className="bg-whiteGray w-[250px] rounded-sm px-3 py-2 text-sm focus:outline-1"
            placeholder="대회 이름을 입력해주세요."
          />
        </div>
      </div>
      <AdminActionButton disabled={!contestName || isPending} className="ml-auto" onClick={handleEdit}>
        수정하기
      </AdminActionButton>
    </div>
  );
};

export default ContestEdit;
