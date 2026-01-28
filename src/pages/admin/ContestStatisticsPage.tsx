import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CURRENT_CONTEST_ID } from 'constants/contest';
import { getVoteStatistics, getLikeRanking } from 'apis/contests';
import VoteRate from './VoteRate';
import ProjectSubmissionTable from './ProjectSubmissionTable';
import StatCards from '@components/StatCards';
import { Button } from '@components/ui/button';
import { useToast } from 'hooks/useToast';

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

  // division filter state (front-end filter)
  const [selectedDivision, setSelectedDivision] = React.useState<string>('전체');

  const divisions = React.useMemo(() => {
    if (!likeRanking) return ['전체'];
    const uniq = Array.from(new Set(likeRanking.map((r) => r.trackName)));
    return ['전체', ...uniq];
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
          <div>
            <h2 className="text-title mb-2 font-bold">대회 통계</h2>
            <p className="text-sm text-gray-500">투표/좋아요 통계를 확인할 수 있습니다. </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className={`border ${mode === 'vote' ? 'bg-mainBlue text-white' : 'bg-white'}`}
              onClick={() => setMode('vote')}
            >
              투표 통계
            </Button>
            <Button
              className={`border ${mode === 'like' ? 'bg-mainBlue text-white' : 'bg-white'}`}
              onClick={() => setMode('like')}
            >
              좋아요 통계
            </Button>

            {mode === 'like' && (
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
            )}
          </div>
        </header>

        <section>
          <StatCards items={statItems} />
        </section>

        <section>
          {mode === 'vote' ? (
            <div>
              <VoteRate />
              {/* TODO: vote logs - backend endpoint unavailable -> show placeholder */}
              <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
                투표 로그 API는 아직 연결되어 있지 않습니다.
              </div>
            </div>
          ) : (
            <div>
              <ProjectSubmissionTable
                submissions={(filteredLikeRanking ?? []).map((r) => ({
                  teamId: r.teamId,
                  rank: r.rank,
                  teamName: r.teamName,
                  projectName: r.projectName,
                  likeCount: r.likeCount,
                  trackName: r.trackName,
                }))}
                type="vote"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ContestStatisticsPage;
