import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjectsAdmin } from 'apis/contests';
import { ProjectsAdminResponseDto } from 'types/DTO';
import { twMerge } from 'tailwind-merge';
import Tag from '@components/Tag';
import {
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
  AdminListLayout,
} from '@components/ui/admin';
import { getColorClassForLabel } from 'utils/color';

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

const ProjectManagePage = () => {
  const navigate = useNavigate();
  const contestId = 1; // TODO: 현재 선택된 공모전 ID로 변경 필요
  // const contestId = useContestId();
  const handleCreateProject = () => navigate(`/admin/contest/${contestId}/projects/create`);
  const handleDeleteTeam = (teamId: number) => {
    alert(`팀 ${teamId} 삭제 훅 호출`);
  };
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { data: projectsAdmin } = useQuery({
    queryKey: ['projects', contestId],
    queryFn: () => getProjectsAdmin(contestId),
    enabled: !!contestId,
  });

  return (
    <AdminListLayout<ProjectsAdminResponseDto>
      title="프로젝트 관리"
      description="팀 | 프로젝트 | 소속 분과 | 제출 여부"
      buttonLabel="+ 새 프로젝트"
      onButtonClick={handleCreateProject}
      items={projectsAdmin ?? []}
      renderItem={(proj, index) => (
        <AdminCardRow key={proj.teamId} className={twMerge('border-lightGray', 'even:bg-slate-50')}>
          <div className="flex w-full items-center gap-4 py-1">
            <p className="text-midGray w-10 flex-shrink-0 text-center text-sm">{(index ?? 0) + 1}</p>
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
      )}
    />
  );
};

export default ProjectManagePage;
