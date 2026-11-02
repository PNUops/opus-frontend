import { useState } from 'react';
import type { VoteReportRankingDto } from '@dto/voteReportDto';
import VoteFilterSelect from './VoteFilterSelect';
import VoteRankingList from './VoteRankingList';

const VoteRankingSection = ({ rankings }: { rankings: VoteReportRankingDto[] }) => {
  const [filter, setFilter] = useState('all');
  const selectedFilter =
    filter === 'all' || filter === 'grouped' || rankings.some((r) => `track:${JSON.stringify(r.trackName)}` === filter)
      ? filter
      : 'all';
  return (
    <section className="flex min-w-0 flex-col gap-5" aria-labelledby="vote-ranking-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="vote-ranking-title" className="text-lg font-semibold text-neutral-900">
            팀별 순위
          </h2>
          <p className="mt-1 text-sm leading-6 text-neutral-600">동점과 0표인 팀을 포함한 전체 순위입니다.</p>
        </div>
        <VoteFilterSelect selectedFilter={selectedFilter} onChange={setFilter} rankings={rankings} />
      </div>
      <VoteRankingList selectedFilter={selectedFilter} rankings={rankings} />
    </section>
  );
};

export default VoteRankingSection;
