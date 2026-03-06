import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { AdminHeader } from '@components/admin';
import { getVoteStats } from 'apis/statistics';
import { useContestIdOrRedirect } from 'hooks/useId';
import QueryWrapper from 'providers/QueryWrapper';

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
    <div className="border-lightGray grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-3">
      {statsItemList.map((item) => (
        <div key={item.title} className="bg-whiteGray flex flex-col gap-1 rounded-sm p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">{item.title}</p>
          <p className={`text-mainGreen text-3xl font-extrabold`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
};
