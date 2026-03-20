import { useQuery } from '@tanstack/react-query';
import { ActivitySection } from './ActivityTab';
import { getMyProjects } from 'apis/me';
import type { MyProjectDto, GetMyProjectsResponseDto } from 'types/DTO/meDto';
import TeamCard from '@pages/main/TeamCard';

const MyProjectSection = () => {
  return (
    <ActivitySection.Root>
      <ActivitySection.Header>
        <p>나의 프로젝트</p>
      </ActivitySection.Header>
      <ActivitySection.Body>
        <MyProjectPreviewList />
      </ActivitySection.Body>
    </ActivitySection.Root>
  );
};

export default MyProjectSection;

const MyProjectPreviewList = () => {
  const { data: myProjects } = useQuery<GetMyProjectsResponseDto>({
    queryKey: ['myProjects'],
    queryFn: getMyProjects,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div
      className="flex min-h-55 w-full gap-5 overflow-hidden overflow-x-scroll py-2"
      style={{ alignItems: 'stretch' }}
    >
      {myProjects?.map((project) => (
        <MyProjectPreview key={project.projectName} project={project} />
      ))}
    </div>
  );
};

const MyProjectPreview = ({ project }: { project: MyProjectDto }) => {
  const { contestId, contestName, teamId, teamName, projectName, awards } = project;

  return (
    <div className="box-border flex max-w-65 min-w-55 flex-col items-start gap-1 rounded-lg bg-white p-4 text-xs">
      <h3 className="mb-2 truncate font-medium" title={contestName}>
        {contestName}
      </h3>
      <div className="flex w-full flex-1 items-center">
        <TeamCard
          key={teamId}
          contestId={contestId}
          teamId={teamId}
          teamName={teamName}
          projectName={projectName}
          awards={awards}
        />
      </div>
    </div>
  );
};
