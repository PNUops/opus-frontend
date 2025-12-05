import { useQuery } from '@tanstack/react-query';
import { getNotices } from 'apis/notices';
import useContests from 'hooks/useContests';
import { getAllContests } from 'apis/contests';
import NoticeList from './NoticeList';
import LeaderSection from './LeaderSection';
import ContestBanner from './ContestBox';
import StatisticsSection from './StatisticsSection';
import techweekBanner from 'styles/techweek-2025.webp';
import defaultBanner from 'assets/basicThumbnail.jpg';
import { mockNotices } from '@mocks/data/notices';
import { mockContestsResponse } from '@mocks/data/contests';

const MainPage = () => {
  const { data: notices } = useQuery({
    queryKey: ['notices'],
    queryFn: getNotices,
  });

  const { data: contests } = useContests();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
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
          {contests && contests.length > 0 ? (
            contests.slice(0, 2).map((contest, index) => {
              const isTechWeek = contest.contestName.toLowerCase().includes('techweek');
              const bannerImage = isTechWeek ? techweekBanner : defaultBanner;
              const type = isTechWeek ? '캡스톤' : '해커톤';
              const status = '신청접수';

              return (
                <ContestBanner
                  key={contest.contestId}
                  contestId={contest.contestId}
                  title={contest.contestName}
                  period="2025.09.30 - 2025.10.01"
                  type={type}
                  status={status}
                  backgroundImage={bannerImage}
                />
              );
            })
          ) : (
            <ContestBanner
              contestId={0}
              title="등록된 대회가 없습니다."
              period="-"
              type="안내"
              backgroundImage={defaultBanner}
            />
          )}
        </div>
      </section>

      <StatisticsSection />

      <div className="h-10" />
    </div>
  );
};

export default MainPage;
