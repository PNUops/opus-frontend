import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { ContestResponseDto } from 'types/DTO';
import { contestOption } from 'queries/contests';
import { ContestSlots } from './ContestSlots';

const OngoingContestSetting = () => {
  const [selectedContest, setSelectedContest] = useState<ContestResponseDto>();
  const { data: contests } = useQuery(contestOption());

  useEffect(() => {
    if (!selectedContest && contests) setSelectedContest(contests[0]);
  }, [contests, selectedContest]);

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contest = contests?.find((contest) => contest.contestName === e.target.value);
    if (contest) setSelectedContest(contest);
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold">진행 중인 대회 설정</h2>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative inline-block w-64">
          <select
            onChange={onSelectChange}
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
          <ContestSlots contests={contests} selectedContest={selectedContest} />
        </div>
      </div>
    </div>
  );
};

export default OngoingContestSetting;
