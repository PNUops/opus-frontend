import { mockMyProjects } from '@mocks/data/me';
import { MyProjectDto } from 'types/DTO/meDto';

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
  const myProjects = mockMyProjects;
  return (
    <div className="flex gap-5">
      {myProjects.map((project) => (
        <MyProjectPreview key={project.projectName} project={project} />
      ))}
    </div>
  );
};

const MyProjectPreview = ({ project }: { project: MyProjectDto }) => {
  return (
    <div className="flex w-48 flex-col gap-2">
      <img src={project.thumbnailUrl ?? ''} alt={project.projectName} className="h-32 w-full rounded object-cover" />
      <h3 className="text-lg font-semibold">{project.projectName}</h3>
      <p className="text-sm text-gray-600">{project.contestName}</p>
    </div>
  );
};
