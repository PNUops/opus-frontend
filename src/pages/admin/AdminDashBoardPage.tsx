import AllNoticeListSection from './AllNoticeListSection';
import ContestCategorySection from './ContestCategorySection';
import ContentListSection from './ContestListSection';
import OngoingContestSetting from './OngoingContestSetting';
import ServiceInfoSection from './ServiceInfoSection';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DashBoardPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [hash]);

  return (
    <div className="flex flex-col gap-10">
      <OngoingContestSetting />
      <section id="contest-categories">
        <ContestCategorySection />
      </section>
      <section id="contests">
        <ContentListSection />
      </section>
      <section id="notices">
        <AllNoticeListSection />
      </section>
      <section id="service-info">
        <ServiceInfoSection />
      </section>
    </div>
  );
};

export default DashBoardPage;
