import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FaRegTrashCan } from 'react-icons/fa6';
import { useState } from 'react';
import { deleteContest } from '@apis/contest';
import { useToast } from '@hooks/useToast';
import useContestName from '@hooks/useContestName';
import { useContestIdOrRedirect } from '@hooks/useId';
import { Dialog } from '@components/ui/dialog';
import { AdminActionButton, AdminDeleteConfirmModal } from '@components/admin';

const ContestDelete = () => {
  const contestId = useContestIdOrRedirect();
  const contestName = useContestName();
  const navigate = useNavigate();
  const toast = useToast();
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { mutateAsync: contestDelete, isPending } = useMutation({
    mutationFn: (payload: { contestId: number }) => deleteContest(payload.contestId),
  });

  const handleDelete = async () => {
    await contestDelete(
      {
        contestId,
      },
      {
        onSuccess: async () => {
          toast('대회가 삭제되었습니다.', 'success');
          navigate('/admin');
        },
        onError: (error: any) => {
          toast(error.response?.data?.message || '대회 삭제에 실패했습니다.', 'error');
        },
      },
    );
    setDeleteOpen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold">대회 삭제</h2>
      <div className="flex items-center justify-between">
        <p>
          <span className="underline underline-offset-3">{contestName ?? ''}</span>
          {' 삭제하기'}
        </p>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AdminActionButton disabled={isPending} onClick={() => setDeleteOpen(true)} variant="destructive">
            <FaRegTrashCan size={16} className="" />
            삭제하기
          </AdminActionButton>
          <AdminDeleteConfirmModal title={`${contestName} 대회를 삭제하시겠습니까?`} onDelete={handleDelete} />
        </Dialog>
      </div>
    </div>
  );
};

export default ContestDelete;
