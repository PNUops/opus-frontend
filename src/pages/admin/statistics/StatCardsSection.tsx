import { useQuery } from '@tanstack/react-query';
import { getVoteStatistics } from 'apis/contests';
import { statsModes } from 'constants/statistics';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

interface StatCardsSectionProps {
  mode: 'vote' | 'like';
}

const StatCardsSection = ({ mode }: StatCardsSectionProps) => {
  const { contestId } = useParams();

  const { data: voteStats } = useQuery({
    queryKey: ['voteStatistics', Number(contestId ?? 0)],
    queryFn: () => getVoteStatistics(Number(contestId ?? 0)),
    enabled: !!contestId,
  });

  const statsItemList = useMemo(() => {
    if (!voteStats) return [];
    return [
      { title: `총 ${statsModes[mode]} 수`, value: `${voteStats.totalVotes}개` },
      { title: `총 ${statsModes[mode]} 인원`, value: `${voteStats.totalVoters}명` },
      { title: `1인당 평균`, value: `${voteStats.averageVotesPerVoter}개` },
    ];
  }, [voteStats]);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold">{`${statsModes[mode]} 집계`}</h2>
      <div className="border-lightGray grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-3">
        {statsItemList.map((item) => (
          <div className="bg-whiteGray flex flex-col gap-1 rounded-sm p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">{item.title}</p>
            <p className={`text-mainGreen text-3xl font-extrabold`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatCardsSection;
