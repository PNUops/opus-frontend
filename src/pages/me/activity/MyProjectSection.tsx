import { useQuery } from '@tanstack/react-query';
import { MyPageSection } from '@pages/me/mypageSection';
import { getMyProjects } from '@apis/me';
import { MY_PROJECTS_QUERY_KEY } from '@queries/me';
import type { MyProjectDto, GetMyProjectsResponseDto } from '@dto/meDto';
import TeamCard from '@pages/contest/TeamCard';
import { ActivityEmptyState, ActivityPreviewSkeleton } from './components/ActivityEmptyState';

const MyProjectSection = () => {
  return (
    <MyPageSection.Root>
      <MyPageSection.Header>
        <p>나의 프로젝트</p>
      </MyPageSection.Header>
      <MyPageSection.Body>
        <MyProjectPreviewList />
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

export default MyProjectSection;

const MyProjectPreviewList = () => {
  const { data: myProjects, isLoading } = useQuery<GetMyProjectsResponseDto>({
    queryKey: MY_PROJECTS_QUERY_KEY,
    queryFn: getMyProjects,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <ActivityPreviewSkeleton />;
  }

  if (!myProjects || myProjects.length === 0) {
    return <ActivityEmptyState message="참여한 프로젝트가 아직 없어요." className="min-h-55" />;
  }

  return (
    <div
      className="scrollbar-thin scrollbar-thumb-gray-300 flex min-h-55 w-full items-stretch gap-4 overflow-x-auto py-2 sm:gap-5"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {myProjects?.map((project) => (
        <MyProjectPreview key={project.teamId} project={project} />
      ))}
    </div>
  );
};

const MyProjectPreview = ({ project }: { project: MyProjectDto }) => {
  const { contestId, contestName, teamId, teamName, projectName, awards } = project;

  return (
    <div className="box-border flex h-full max-w-65 min-w-55 flex-col sm:max-w-65 sm:min-w-55">
      <h3 className="mb-2 truncate text-sm font-medium sm:text-base" title={contestName}>
        {contestName}
      </h3>
      <TeamCard
        contestId={contestId}
        teamId={teamId}
        teamName={teamName}
        projectName={projectName}
        awards={awards}
        to={`/me/contests/${contestId}/teams/${teamId}/dashboard`}
      />
    </div>
  );
};
