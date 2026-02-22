import ProjectSubmissionTable from '@pages/admin/ProjectSubmissionTable';
import VoteRate from '@pages/admin/VoteRate';
import ProjectSortToggle from './ProjectSortToggle';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from 'apis/dashboard';
import { getRanking } from 'apis/ranking';
import { DashboardTeamResponseDto, TeamLikeResponseDto } from 'types/DTO';

const OngoingContestsTab = () => {
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardTeamResponseDto[]>({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 0,
    refetchOnMount: true,
  });
  const { data: rankingData, isLoading: isRankingLoading } = useQuery<TeamLikeResponseDto[]>({
    queryKey: ['ranking'],
    queryFn: getRanking,
    staleTime: 0,
    refetchOnMount: true,
  });

  if (isDashboardLoading || isRankingLoading) {
    return <p className="text-center text-gray-400">로딩 중...</p>;
  }

  if (!dashboardData || !rankingData) {
    return (
      <div className="mx-auto w-full rounded bg-white p-6 text-center shadow-md">
        <p className="text-red-500">데이터를 불러오는 데 실패했습니다.</p>
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-col gap-12">
        <div className="border-lightGray rounded-xl border p-8">
          <div className="my-6 border-t border-gray-200"></div>
          <ProjectSortToggle />
        </div>
        <ProjectSubmissionTable submissions={dashboardData} type="project" />
        <ProjectSubmissionTable submissions={rankingData} type="vote" />
        <VoteRate />
      </div>
    </>
  );
};

export default OngoingContestsTab;
