import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { AdminHeader } from '@components/admin';
import { getVoteStats } from '@apis/statistics';
import { useContestIdOrRedirect } from '@hooks/useId';
import QueryWrapper from '@providers/QueryWrapper';

const StatCardsSection = () => {
  return (
    <section className="flex flex-col gap-5">
      <AdminHeader title="투표 집계" />
      <QueryWrapper loadingStyle="h-33 my-0 rounded-sm" errorStyle="h-33">
        <StatCardList />
      </QueryWrapper>
    </section>
  );
};

export default StatCardsSection;

const StatCardList = () => {
  const contestId = useContestIdOrRedirect();

  const { data: voteStats } = useSuspenseQuery({
    queryKey: ['voteStatistics', contestId],
    queryFn: () => getVoteStats(contestId),
  });

  const statsItemList = useMemo(
    () => [
      { title: `총 투표 수`, value: `${voteStats.totalVotes}개` },
      { title: `총 투표 인원`, value: `${voteStats.totalVoters}명` },
      { title: `1인당 평균`, value: `${voteStats.averageVotesPerVoter}개` },
    ],
    [voteStats],
  );

  return (
    <div className="border-lightGray grid grid-cols-3 gap-3 border-y py-4 sm:gap-4 sm:rounded-lg sm:border sm:p-4">
      {statsItemList.map((item) => (
        <div key={item.title} className="sm:bg-whiteGray flex min-w-0 flex-col gap-1 sm:rounded-sm sm:p-6 sm:shadow-sm">
          <p className="text-xs font-medium text-gray-600 sm:text-sm sm:font-semibold sm:text-gray-500">{item.title}</p>
          <p className="text-mainGreen text-2xl font-bold break-words tabular-nums sm:text-3xl sm:font-extrabold">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
};
