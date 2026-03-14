import { useQuery } from '@tanstack/react-query';
import { getMyProjects } from 'apis/me';
import type { MyProjectDto, GetMyProjectsResponseDto } from 'types/DTO/meDto';

const MyProjectSection = () => {
  return (
    <section className="flex flex-col gap-5">
      <h2>나의 프로젝트</h2>
      <MyProjectPreviewList />
    </section>
  );
};

export default MyProjectSection;

const MyProjectPreviewList = () => {
  const { data: myProjects } = useQuery<GetMyProjectsResponseDto>({
    queryKey: ['myProjects'],
    queryFn: getMyProjects,
    staleTime: 5 * 60 * 1000,
  });

  console.log(myProjects);

  return (
    <div className="flex gap-5">
      {myProjects?.map((project) => (
        <MyProjectPreview key={project.projectName} project={project} />
      ))}
    </div>
  );
};

const MyProjectPreview = ({ project }: { project: MyProjectDto }) => {
  return (
    <div className="relative flex w-48 flex-col gap-2">
      <img src={project.thumbnailUrl ?? ''} alt={project.projectName} className="h-32 w-full rounded object-cover" />
      <h3 className="text-lg font-semibold">{project.projectName}</h3>
      <p className="text-sm text-gray-600">{project.contestName}</p>
      <div className="absolute right-0 bottom-0 left-0 flex justify-center gap-2 p-2">
        {project.awards.map((award) => (
          <span
            key={award.awardName}
            className="rounded-full px-2 py-1 text-xs font-bold"
            style={{ backgroundColor: award.awardColor || 'gray', color: 'white' }}
          >
            {award.awardName}
          </span>
        ))}
      </div>
    </div>
  );
};
