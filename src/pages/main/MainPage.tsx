import { useQuery } from '@tanstack/react-query';
import NoticeList from './NoticeList';
import LeaderSection from './LeaderSection';
import ContestBanner from './ContestBox';
import StatisticsSection from './StatisticsSection';
import { currentContestOption } from 'queries/contests';
import { noticeOption } from 'queries/notices';
import dayjs from 'dayjs';
import QueryWrapper from 'providers/QueryWrapper';

const MainPage = () => {
  const { data: notices } = useQuery(noticeOption());
  const { data: currentContests } = useQuery(currentContestOption());

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-17.5">
      <section className="flex flex-col gap-4">
        <div className="rounded-xl bg-gray-50 p-2">
          {notices && notices.length > 0 ? (
            <NoticeList notices={notices.slice(0, 3)} />
          ) : (
            <div className="py-4 text-center text-sm text-gray-500">공지사항을 불러오는 중...</div>
          )}
        </div>
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
