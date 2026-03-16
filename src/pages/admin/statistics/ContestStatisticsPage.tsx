import VoteRankingSection from './VoteRankingSection';
import StatCardsSection from './StatCardsSection';
import VoteLogSection from './VoteLogSection';

const ContestStatisticsPage = () => {
  return (
    <div className="flex flex-col gap-[70px]">
      <VoteRankingSection />
      <StatCardsSection />
      <VoteLogSection />
    </div>
  );
};

export default ContestStatisticsPage;
