import { NoticeListSkeleton } from '@components/notice';
import AllNoticeList from './AllNoticeList';
import LeaderSection from './LeaderSection';
import CurrentContestSection from './CurrentContestSection';
import StatisticsSection from './StatisticsSection';
import QueryWrapper from 'providers/QueryWrapper';

const MainPage = () => {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-17.5">
      <section className="flex flex-col gap-4">
        <QueryWrapper loadingFallback={<NoticeListSkeleton />} errorStyle="h-36 rounded-xl shadow-md">
          <AllNoticeList />
        </QueryWrapper>
        <LeaderSection />
      </section>
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold sm:text-2xl">현재 진행 중인 대회</h2>
        <QueryWrapper loadingStyle="h-64 rounded-3xl my-0" errorStyle="h-64 rounded-3xl">
          <CurrentContestSection />
        </QueryWrapper>
      </section>
      <QueryWrapper loadingStyle="h-58 rounded-2xl" errorStyle="h-58 rounded-2xl shadow-lg">
        <StatisticsSection />
      </QueryWrapper>
    </div>
  );
};

export default MainPage;
