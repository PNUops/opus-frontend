import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVoteStatistics, getLikeRanking } from 'apis/contests';
import RankingListSection from './RankingListSection';
import StatCards from '@components/StatCards';
import { Button } from '@components/ui/button';
import VoteLogTable from './VoteLogTable';
import { useParams } from 'react-router-dom';
import { cn } from '@components/lib/utils';

const ContestStatisticsPage = () => {
  const { contestId } = useParams();
  const [mode, setMode] = useState<'vote' | 'like'>('vote');

  const { data: voteStats, isLoading: loadingVoteStats } = useQuery({
    queryKey: ['voteStatistics', Number(contestId ?? 0)],
    queryFn: () => getVoteStatistics(Number(contestId ?? 0)),
    enabled: !!contestId,
  });

  const { data: likeRanking, isLoading: loadingLikeRanking } = useQuery({
    queryKey: ['likeRanking', contestId],
    queryFn: () => getLikeRanking(Number(contestId ?? 0)),
    enabled: !!contestId,
  });

  const totalLikes = useMemo(
    () => (likeRanking ? likeRanking.reduce((s, r) => s + (r.likeCount || 0), 0) : 0),
    [likeRanking],
  );

  const statItems = useMemo(() => {
    if (mode === 'vote') {
      return [
        { title: '총 투표 수', value: voteStats?.totalVotes ?? 0 },
        { title: '투표한 사람', value: voteStats?.totalVoters ?? 0 },
        { title: '1인당 평균', value: voteStats?.averageVotesPerVoter ?? 0 },
      ];
    }

    return [
      { title: '총 좋아요 수', value: totalLikes },
      { title: '좋아요한 사람', value: likeRanking?.length ?? 0 },
      { title: '1인당 평균', value: (totalLikes / (likeRanking?.length || 1)).toFixed(1) },
    ];
  }, [mode, voteStats, likeRanking, totalLikes]);

  return (
    <div className="flex w-full justify-center">
      <div className="max-w-container flex w-full flex-col gap-8 px-4 sm:px-8 md:px-16">
        <div className="flex gap-4">
          <Button
            className={cn(
              mode === 'vote'
                ? 'bg-subGreen hover:bg-subGreen text-black'
                : 'bg-whiteGray text-midGray hover:bg-subGreen',
            )}
            onClick={() => setMode('vote')}
          >
            투표 통계
          </Button>
          <Button
            className={cn(
              mode === 'like'
                ? 'bg-subGreen hover:bg-subGreen text-black'
                : 'bg-whiteGray text-midGray hover:bg-subGreen',
            )}
            onClick={() => setMode('like')}
          >
            좋아요 통계
          </Button>
        </div>
        <RankingListSection />
        <StatCards items={statItems} variant="green" />
        {mode === 'vote' && <VoteLogTable />}
      </div>
    </div>
  );
};

export default ContestStatisticsPage;
