import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjectsAdmin } from 'apis/contests';
import { ProjectsAdminResponseDto } from 'types/DTO';
import { twMerge } from 'tailwind-merge';
import { useContestId } from 'hooks/useId';
import { useState } from 'react';
import {
  AdminCardCreateButton,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/ui/admin';
import { getColorClassForLabel } from 'utils/color';
import useContestAdmin from 'hooks/useContestAdmin';

const ManageTitle = () => {
  const navigate = useNavigate();
  const contestId = useContestId();

  const handleCreateProject = () => navigate(`/admin/contest/${contestId}/project/create`);

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">프로젝트 관리</h2>
        <h4 className="text-exsm text-midGray">팀명, 프로젝트명, 분과명, 제출 정보</h4>
      </div>
      <AdminCardCreateButton onClick={handleCreateProject}>+ 새 프로젝트</AdminCardCreateButton>
    </div>
  );
};

const Tag = ({ children, className }: React.ComponentProps<'div'>) => {
  return (
    <div className={twMerge('min-w-[70px] rounded-full px-3 py-1 text-center text-xs text-white', className)}>
      {children}
    </div>
  );
};

type SubmissionTagProps = { isSubmitted: boolean };
const SubmissionTag = ({ isSubmitted }: SubmissionTagProps) => {
  const label = isSubmitted ? '제출' : '미제출';
  const colorClass = isSubmitted ? 'bg-blue-300' : 'bg-midGray';
  return <Tag className={colorClass}>{label}</Tag>;
};

const DivisionTag = ({ name }: { name: string }) => {
  const colorClass = getColorClassForLabel(name);
  return <Tag className={colorClass}>{name}</Tag>;
};

type ProjectListProps = { projects: ProjectsAdminResponseDto[] };
const ProjectList = ({ projects }: ProjectListProps) => {
  const navigate = useNavigate();
  const handleDeleteTeam = (teamId: number) => {
    alert(`팀 ${teamId} 삭제 훅 호출`);
  };
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      {projects.map((proj) => (
        <AdminCardRow key={proj.teamId} className="border-lightGray">
          <div className="flex w-full items-center gap-4 py-1">
            <p className="text-midGray w-10 flex-shrink-0 text-center text-sm">{proj.teamId}</p>
            <div className="flex min-w-0 flex-1 items-center gap-6">
              <p className="text-darkGray w-[150px] flex-shrink-0 truncate font-medium">{proj.teamName}</p>
              <p className="flex-1 truncate text-gray-600">{proj.projectName}</p>
              <div className="flex w-[100px] flex-shrink-0 justify-center">
                <DivisionTag name={proj.trackName} />
              </div>
            </div>

            <div className="w-[80px] flex-shrink-0">
              <SubmissionTag isSubmitted={proj.isSubmitted} />
            </div>
            <div className="flex w-10 flex-shrink-0 justify-end">
              <AdminPopoverMenu>
                <AdminPopoverEditButton onEdit={() => navigate(`/teams/edit/${proj.teamId}`)} />
                <AdminPopoverDeleteButton
                  onDelete={() => {
                    handleDeleteTeam(proj.teamId);
                    setDeleteOpen(true);
                  }}
                />
              </AdminPopoverMenu>
            </div>
          </div>
        </AdminCardRow>
      ))}
    </div>
  );
};

const ProjectManagePage = () => {
  const contestId = 1; // TODO: 현재 선택된 공모전 ID로 변경 필요

  const { data: projectsAdmin } = useQuery({
    queryKey: ['projects', contestId],
    queryFn: () => getProjectsAdmin(contestId),
  });

  return (
    <div className="flex w-full flex-col">
      <ManageTitle />
      <div className="h-[35px]" />
      <ProjectList projects={projectsAdmin ?? []} />
    </div>
  );
};

export default ProjectManagePage;
