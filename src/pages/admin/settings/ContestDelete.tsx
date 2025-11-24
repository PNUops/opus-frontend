import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { FaRegTrashCan } from 'react-icons/fa6';
import Button from '@components/Button';
import { deleteContest } from 'apis/contests';
import { useToast } from 'hooks/useToast';
import useContestName from 'hooks/useContestName';

const ContestDelete = () => {
  const { contestId: contestIdParam } = useParams();
  const contestName = useContestName();
  const navigate = useNavigate();
  const toast = useToast();

  const { mutate: delContest, isPending } = useMutation({
    mutationFn: (payload: { contestId: number }) => deleteContest(payload.contestId),
  });

  const handleDelete = () => {
    if (!contestIdParam) return;

    delContest(
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
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold">대회 삭제</h2>
      <div className="flex items-center justify-between">
        <p className="ml-1">{`${contestName} 삭제하기`}</p>
        <Button
          disabled={isPending}
          onClick={handleDelete}
          className="group flex items-center gap-1.5 border-2 border-red-500 px-3.5 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500 hover:text-white"
        >
          <FaRegTrashCan size={16} className="mt-0.5 fill-red-500 transition-all group-hover:fill-white" />
          삭제하기
        </Button>
      </div>
    </div>
  );
};

export default ContestDelete;
