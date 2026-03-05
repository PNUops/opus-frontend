import { useState } from 'react';
import { defaultRankFilter } from 'constants/statistics';
import { AdminHeader } from '@components/admin';
import QueryWrapper from 'providers/QueryWrapper';
import VoteFilterSelect from './VoteFilterSelect';
import VoteRankingList from './VoteRankingList';

const VoteRankingSection = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>(defaultRankFilter[0]);

  return (
    <section className="flex flex-col gap-5">
      <AdminHeader title="투표 순위" description="순위 | 팀 | 프로젝트 | 분과 | 투표수">
        <QueryWrapper loadingStyle="h-10 my-0 rounded-sm w-[180px]" errorStyle="h-10 flex-wrap">
          <VoteFilterSelect selectedFilter={selectedFilter} onChange={(value) => setSelectedFilter(value)} />
        </QueryWrapper>
      </AdminHeader>
      <QueryWrapper loadingStyle="h-60 my-0 rounded-sm" errorStyle="h-60 flex-wrap">
        <VoteRankingList selectedFilter={selectedFilter} />
      </QueryWrapper>
    </section>
  );
};

export default VoteRankingSection;
