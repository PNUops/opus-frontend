import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CURRENT_CONTEST_ID } from 'constants/contest';
import { getVoteStatistics, getLikeRanking } from 'apis/contests';
import VoteRate from './VoteRate';
import RankingList from './RankingList';
import StatCards from '@components/StatCards';
import { Button } from '@components/ui/button';
import { useToast } from 'hooks/useToast';
import VoteLogTable from './VoteLogTable';

const ContestStatisticsPage: React.FC = () => {
  const contestId = CURRENT_CONTEST_ID;
  const toast = useToast();
  const [mode, setMode] = useState<'vote' | 'like'>('vote');

  const { data: voteStats, isLoading: loadingVoteStats } = useQuery({
    queryKey: ['voteStatistics', contestId],
    queryFn: () => getVoteStatistics(contestId),
    enabled: !!contestId,
  });

  const { data: likeRanking, isLoading: loadingLikeRanking } = useQuery({
    queryKey: ['likeRanking', contestId],
    queryFn: () => getLikeRanking(contestId),
    enabled: !!contestId,
  });

  const [selectedDivision, setSelectedDivision] = React.useState<string>('전체');

  const divisions = React.useMemo(() => {
    if (!likeRanking) return ['전체', '분과별 묶어보기'];
    const uniq = Array.from(new Set(likeRanking.map((r) => r.trackName)));
    return ['전체', '분과별 묶어보기', ...uniq];
  }, [likeRanking]);

  const filteredLikeRanking = React.useMemo(() => {
    if (!likeRanking) return [];
    if (selectedDivision === '전체') return likeRanking;
    return likeRanking.filter((r) => r.trackName === selectedDivision);
  }, [likeRanking, selectedDivision]);

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

  if (!contestId) {
    toast('현재 선택된 대회가 없습니다', 'error');
    return null;
  }

  return (
    <div className="flex w-full justify-center">
      <div className="max-w-container flex w-full flex-col gap-8 px-4 sm:px-8 md:px-16">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex gap-4">
            <Button
              className={` ${
                mode === 'vote'
                  ? 'bg-subGreen hover:bg-subGreen text-black'
                  : 'bg-lightGray text-whiteGray hover:bg-subGreen'
              }`}
              onClick={() => setMode('vote')}
            >
              투표 통계
            </Button>
            <Button
              className={` ${
                mode === 'like'
                  ? 'bg-subGreen hover:bg-subGreen text-black'
                  : 'bg-lightGray text-whiteGray hover:bg-subGreen'
              }`}
              onClick={() => setMode('like')}
            >
              좋아요 통계
            </Button>
          </div>
        </header>
        <section>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">투표 순위</h2>
              <p className="text-sm text-gray-500">순위, 팀명, 프로젝트명, 분과</p>
            </div>
            <div>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="ml-4 rounded border border-gray-200 bg-white px-3 py-2 text-sm"
                aria-label="분과 필터"
              >
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <section>
          {selectedDivision === '분과별 묶어보기' ? (
            <RankingList items={likeRanking ?? []} grouped />
          ) : (
            <RankingList items={selectedDivision === '전체' ? (likeRanking ?? []) : filteredLikeRanking} />
          )}
        </section>
        <section>
          <StatCards items={statItems} variant="green" />
        </section>
        <section>{mode === 'vote' ? <VoteLogTable /> : <></>}</section>
      </div>
    </div>
  );
};

export default ContestStatisticsPage;
