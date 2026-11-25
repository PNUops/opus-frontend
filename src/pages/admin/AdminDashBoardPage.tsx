import AllNoticeListSection from './AllNoticeListSection';
import ContestCategorySection from './ContestCategorySection';
import ContentListSection from './ContestListSection';
import OngoingContestSetting from './OngoingContestSetting';
import ServiceInfoSection from './ServiceInfoSection';
import QuickActions from './QuickActions';

const DashBoardPage = () => {
  return (
    <div className="flex flex-col gap-10">
      <OngoingContestSetting />
      <QuickActions />
      <ContestCategorySection />
      <ContentListSection />
      <AllNoticeListSection />
      <ServiceInfoSection />
    </div>
  );
};

export default DashBoardPage;
