import AllNoticeListSection from './AllNoticeListSection';
import ContestCategorySection from './ContestCategorySection';
import ContentListSection from './ContestListSection';
import OngoingContestSetting from './OngoingContestSetting';
import ServiceInfoSection from './ServiceInfoSection';

const DashBoardPage = () => {
  return (
    <div className="flex flex-col gap-[70px]">
      <OngoingContestSetting />
      <ContestCategorySection />
      <ContentListSection />
      <AllNoticeListSection />
      <ServiceInfoSection />
    </div>
  );
};

export default DashBoardPage;
