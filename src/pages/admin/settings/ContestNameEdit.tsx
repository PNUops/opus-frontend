import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Button from '@components/Button';
import Input from '@components/Input';
import { patchContest } from 'apis/contests';
import { useToast } from 'hooks/useToast';
import useContestName from 'hooks/useContestName';

const ContestNameEdit = () => {
  const { contestId: contestIdParam } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [contestName, setContestName] = useState('');
  const prevName = useContestName();

  const { mutate: editContestName, isPending } = useMutation({
    mutationFn: (payload: { contestId: number; contestName: string }) =>
      patchContest(payload.contestId, payload.contestName),
  });

  useEffect(() => {
    if (prevName) setContestName(prevName);
  }, [prevName]);

  const handleEdit = () => {
    if (!contestIdParam) return;
    if (!contestName) {
      toast('수정할 대회명을 입력해주세요.', 'error');
      return;
    }

    editContestName(
      {
        contestId: Number(contestIdParam),
        contestName,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['contests'] });
          await queryClient.invalidateQueries({ queryKey: ['teams'] });
          toast('대회명이 수정되었습니다.', 'success');
        },
        onError: (error: any) => {
          toast(error.response?.data?.message || '대회명 수정에 실패했습니다.', 'error');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold">대회명 수정</h2>
      <div className="flex items-center justify-between gap-5">
        <Input
          value={contestName}
          onChange={(e) => setContestName(e.target.value)}
          className="max-w-[50%] px-3.5 py-2.5"
        />
        <Button disabled={isPending} onClick={handleEdit} className="bg-mainBlue px-3.5 py-2.5 text-sm">
          수정하기
        </Button>
      </div>
    </div>
  );
};

export default ContestNameEdit;
