import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FaRegTrashCan } from 'react-icons/fa6';
import { useState } from 'react';
import { deleteContest } from '@apis/contest';
import { useToast } from '@hooks/useToast';
import useContestName from '@hooks/useContestName';
import { useContestIdOrRedirect } from '@hooks/useId';
import { Dialog, DialogTrigger } from '@components/ui/dialog';
import { AdminActionButton, AdminDeleteConfirmModal, AdminHeader } from '@components/admin';
import { getApiErrorMessage } from '@utils/error';

const ContestDelete = () => {
  const contestId = useContestIdOrRedirect();
  const contestName = useContestName();
  const navigate = useNavigate();
  const toast = useToast();
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const {
    mutate: contestDelete,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (payload: { contestId: number }) => deleteContest(payload.contestId),
  });

  const handleDelete = () => {
    if (isPending) return;
    contestDelete(
      {
        contestId,
      },
      {
        onSuccess: async () => {
          toast('대회가 삭제되었습니다.', 'success');
          navigate('/admin');
          setDeleteOpen(false);
        },
        onError: (error) => {
          toast(getApiErrorMessage(error, '대회 삭제에 실패했습니다.'), 'error');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <AdminHeader title="대회 삭제" />
      <div className="flex items-center justify-between">
        <p>
          <span className="underline underline-offset-3">{contestName ?? ''}</span>
          {' 삭제하기'}
        </p>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <AdminActionButton disabled={isPending} variant="destructive">
              <FaRegTrashCan size={16} className="" />
              삭제하기
            </AdminActionButton>
          </DialogTrigger>
          <AdminDeleteConfirmModal
            title="대회를 삭제하시겠습니까?"
            description={contestName ?? undefined}
            onDelete={handleDelete}
            isPending={isPending}
            isError={isError}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default ContestDelete;
