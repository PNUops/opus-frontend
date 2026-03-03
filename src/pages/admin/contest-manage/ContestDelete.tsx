import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { FaRegTrashCan } from 'react-icons/fa6';
import Button from '@components/Button';
import { deleteContest } from 'apis/contest';
import { useToast } from 'hooks/useToast';
import useContestName from 'hooks/useContestName';
import { useState } from 'react';
import { Dialog } from '@components/ui/dialog';
import { AdminDeleteConfirmModal } from '@components/admin';

const ContestDelete = () => {
  const { contestId: contestIdParam } = useParams();
  const contestName = useContestName();
  const navigate = useNavigate();
  const toast = useToast();
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { mutateAsync: contestDelete, isPending } = useMutation({
    mutationFn: (payload: { contestId: number }) => deleteContest(payload.contestId),
  });

  const handleDelete = async () => {
    if (!contestIdParam) return;

    await contestDelete(
      {
        contestId: Number(contestIdParam),
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
        <p className="ml-1">{`${contestName} 삭제하기`}</p>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <Button
            disabled={isPending}
            onClick={() => setDeleteOpen(true)}
            className="group flex items-center gap-1.5 border-2 border-red-500 px-3.5 py-2 text-sm text-red-500 transition-colors hover:bg-red-500 hover:text-white"
          >
            <FaRegTrashCan size={16} className="mt-0.5 fill-red-500 transition-all group-hover:fill-white" />
            삭제하기
          </Button>
          <AdminDeleteConfirmModal title={`${contestName} 대회를 삭제하시겠습니까?`} onDelete={handleDelete} />
        </Dialog>
      </div>
    </div>
  );
};

export default ContestDelete;
