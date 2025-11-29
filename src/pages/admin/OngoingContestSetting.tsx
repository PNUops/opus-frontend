import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { TiDeleteOutline } from 'react-icons/ti';
import { twMerge } from 'tailwind-merge';
import { getAllContests } from 'apis/contests';
import { ContestResponseDto } from 'types/DTO';

const OngoingContestSetting = () => {
  const [selectedContest, setSelectedContest] = useState<Omit<ContestResponseDto, 'updatedAt'>>();
  // 전체 대회 조회에서 현재 진행 중인 대회인지 확인하는 필드 필요
  const { data: contests } = useQuery({ queryKey: ['contests'], queryFn: getAllContests });

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold">진행 중인 대회 설정</h2>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative inline-block w-64">
          <select
            onChange={(e) => {
              const contest = contests?.find((contest) => contest.contestName === e.target.value);
              if (contest) setSelectedContest(contest);
            }}
            className="border-subGreen cursor-pointer appearance-none rounded border-b-2 bg-white px-4 py-2 pr-10 text-nowrap focus:outline-none"
          >
            {contests?.map((contest: ContestResponseDto) => (
              <option key={contest.contestId} value={contest.contestName}>
                {contest.contestName}
              </option>
            ))}
          </select>
          <IoIosArrowDown className="text-mainGreen pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-lg" />
        </div>
        <div className="flex flex-wrap gap-5">
          <OngoingContestSlot type="occupied" text="제6회PNU창의융합해커톤" />
          <OngoingContestSlot type="available" text="진행 대회 2로 설정" />
        </div>
      </div>
    </div>
  );
};

interface OngoingContestSlotProps {
  text: string;
  type: 'available' | 'occupied' | 'disabled';
  onDelete?: () => void;
}

const slotStyle = {
  available: 'bg-mainBlue text-white hover:cursor-pointer',
  occupied: 'bg-mainGreen text-white',
  disabled: 'bg-lightGray text-midGray hover:cursor-not-allowed',
};

const OngoingContestSlot = ({ type, text, onDelete }: OngoingContestSlotProps) => {
  return (
    <div className={twMerge('flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm', slotStyle[type])}>
      <span>{text}</span>
      {type === 'occupied' && (
        <TiDeleteOutline className="mt-0.5 fill-white hover:cursor-pointer" size={20} onClick={onDelete} />
      )}
    </div>
  );
};

export default OngoingContestSetting;
