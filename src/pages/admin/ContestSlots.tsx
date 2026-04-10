import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { ContestResponseDto } from '@dto/contestsDto';
import { cn } from '@components/lib/utils';
import { TiDeleteOutline } from 'react-icons/ti';
import { patchChangeOngoingContest } from '@apis/contest';
import { useToast } from '@hooks/useToast';
import { contestsOption } from '@queries/contest';

interface ContestSlotsProps {
  selectedId: string;
}

export const ContestSlots = ({ selectedId }: ContestSlotsProps) => {
  const { data: contests } = useSuspenseQuery(contestsOption());

  const toast = useToast();
  const queryClient = useQueryClient();

  const changeOngoingContest = useMutation({
    mutationKey: ['changeOngoingContest'],
    mutationFn: (payload: { contestId: number; isCurrent: boolean }) =>
      patchChangeOngoingContest(payload.contestId, payload.isCurrent),
  });

  const toggleOngoingContest = (target: ContestResponseDto | number, isCurrent: boolean) => {
    let contest: ContestResponseDto;
    if (typeof target === 'number') {
      const targetContest = contests.find((c) => c.contestId === Number(selectedId));
      if (!targetContest) return toast(`ID: ${target}의 대회를 찾을 수 없습니다.`);
      contest = targetContest;
    } else contest = target;

    changeOngoingContest.mutate(
      { contestId: contest.contestId, isCurrent },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: contestsOption().queryKey });
          if (isCurrent) toast(`${contest.contestName}를 진행 대회로 설정했습니다.`, 'success');
          else toast(`${contest.contestName}를 진행 대회에서 제외했습니다.`, 'success');
        },
        onError: () => toast(`진행 대회 변경 중 오류가 발생했습니다.`, 'error'),
      },
    );
  };

  const ongoingContests = contests.filter((e) => e.isCurrent);

  if (ongoingContests.length === 0) {
    return (
      <OngoingContestSlot
        type="available"
        text="진행 중인 대회로 설정"
        onClick={() => toggleOngoingContest(Number(selectedId), true)}
      />
    );
  }

  if (ongoingContests.length === 1) {
    const alreadyOccupied = ongoingContests[0].contestId === Number(selectedId);
    return (
      <>
        <OngoingContestSlot
          type="occupied"
          text={ongoingContests[0].contestName}
          onDelete={() => toggleOngoingContest(ongoingContests[0], false)}
        />
        <OngoingContestSlot
          type={alreadyOccupied ? 'disabled' : 'available'}
          text={alreadyOccupied ? '이미 설정된 대회입니다' : '진행 중인 대회로 설정'}
          onClick={() => toggleOngoingContest(Number(selectedId), true)}
        />
      </>
    );
  }

  return ongoingContests.map((contest) => (
    <OngoingContestSlot
      key={contest.contestId}
      type="occupied"
      text={contest.contestName}
      onDelete={() => toggleOngoingContest(contest, false)}
    />
  ));
};

interface OngoingContestSlotProps {
  text: string;
  type: 'available' | 'occupied' | 'disabled';
  onClick?: () => void;
  onDelete?: () => void;
}

const slotStyle = {
  available: 'bg-mainBlue text-white hover:cursor-pointer',
  occupied: 'bg-mainGreen text-white hover:cursor-default',
  disabled: 'bg-lightGray text-midGray hover:cursor-not-allowed',
};

const OngoingContestSlot = ({ type, text, onClick, onDelete }: OngoingContestSlotProps) => (
  <button
    className={cn('flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm', slotStyle[type])}
    disabled={type === 'disabled'}
    onClick={onClick}
  >
    <span>{text}</span>
    {type === 'occupied' && (
      <TiDeleteOutline
        className="mt-0.5 fill-white hover:cursor-pointer hover:fill-red-600"
        size={20}
        onClick={onDelete}
      />
    )}
  </button>
);
