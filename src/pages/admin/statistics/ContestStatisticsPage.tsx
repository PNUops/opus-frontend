import RankingListSection from './RankingListSection';
import StatCardsSection from './StatCardsSection';
import VoteLogTable from './VoteLogTable';

const ContestStatisticsPage = () => {
  return (
    <div className="flex flex-col gap-[70px]">
      <RankingListSection />
      <StatCardsSection />
      <VoteLogTable />
    </div>
  );
};

export default ContestStatisticsPage;
