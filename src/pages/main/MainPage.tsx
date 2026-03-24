import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import NoticeList from './NoticeList';
import LeaderSection from './LeaderSection';
import ContestBanner from './ContestBox';
import StatisticsSection from './StatisticsSection';
import { currentContestOption } from 'queries/contests';
import QueryWrapper from 'providers/QueryWrapper';
import NoticeListSkeleton from './NoticeListSkeleton';

const MainPage = () => {
  const { data: currentContests } = useQuery(currentContestOption());

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-17.5">
      <section className="flex flex-col gap-4">
        <QueryWrapper loadingFallback={<NoticeListSkeleton />} errorStyle="h-36 rounded-xl shadow-md">
          <NoticeList />
        </QueryWrapper>
        <LeaderSection />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold sm:text-2xl">현재 진행 중인 대회</h2>
        <div className="flex flex-col gap-5">
          {currentContests && currentContests.length > 0 ? (
            currentContests.map((contest) => {
              return (
                <ContestBanner
                  key={contest.contestId}
                  contestId={contest.contestId}
                  title={contest.contestName}
                  period={`${dayjs(contest.voteStartAt).format('MM월 DD일')} ~ ${dayjs(contest.voteEndAt).format('MM월 DD일')}`}
                  status="진행중"
                  type={contest.categoryName}
                />
              );
            })
          ) : (
            <ContestBanner title="진행중인 대회가 없습니다." type="안내" />
          )}
        </div>
      </section>

      <QueryWrapper loadingStyle="h-58 rounded-2xl" errorStyle="h-58 rounded-2xl shadow-lg">
        <StatisticsSection />
      </QueryWrapper>
      <div className="h-10" />
    </div>
  );
};

export default MainPage;
