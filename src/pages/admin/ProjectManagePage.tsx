import { useQuery } from '@tanstack/react-query';
import { getProjectsAdmin } from 'apis/contests';
import { ProjectsAdminResponseDto } from 'types/DTO';

import { useState } from 'react';
import {
  AdminCard,
  AdminCardTop,
  AdminCardCreateButton,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/ui/admin';
import { Dialog, DialogTrigger } from '@components/ui/dialog';

const ManageTitle = () => {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">프로젝트 관리</h2>
        <h4 className="text-exsm text-midGray">팀명, 프로젝트명, 분과, 제출 정보</h4>
      </div>
      <AdminCardCreateButton>+ 새 프로젝트</AdminCardCreateButton>
    </div>
  );
};

type ProjectListProps = {
  projects: ProjectsAdminResponseDto[];
};

const ProjectList = ({ projects }: ProjectListProps) => {
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  return projects.map((proj) => (
    <div>
      <AdminCardRow key={proj.teamId} className="border-lightGray not-last:border">
        <div className="flex gap-10">
          <div className="w-5 text-center">{proj.teamId}</div>
          <div>{proj.teamName}</div>
          <div>{proj.projectName}</div>
          <div>{proj.divisionName}</div>
          <div>{proj.isSubmitted}</div>
        </div>
        <AdminPopoverMenu>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <AdminPopoverEditButton onEdit={() => setEditOpen(true)} />
          </Dialog>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AdminPopoverDeleteButton onDelete={() => setDeleteOpen(false)} />
          </Dialog>
        </AdminPopoverMenu>
      </AdminCardRow>
    </div>
  ));
};

const ProjectManagePage = () => {
  const contestId = 1; // TODO: 현재 선택된 공모전 ID로 변경 필요

  const { data: projectsAdmin } = useQuery({
    queryKey: ['projects', contestId],
    queryFn: () => getProjectsAdmin(contestId),
  });

  return (
    <div className="flex w-full flex-col gap-[35px]">
      <ManageTitle />
      <ProjectList projects={projectsAdmin ?? []} />
    </div>
  );
};

export default ProjectManagePage;
