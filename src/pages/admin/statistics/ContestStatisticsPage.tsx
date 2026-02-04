import VoteRankingSection from './VoteRankingSection';
import StatCardsSection from './StatCardsSection';
import VoteLogTable from './VoteLogTable';

const ContestStatisticsPage = () => {
  return (
    <div className="flex flex-col gap-[70px]">
      <VoteRankingSection />
      <StatCardsSection />
      <VoteLogTable />
    </div>
  );
};

export default ContestStatisticsPage;
