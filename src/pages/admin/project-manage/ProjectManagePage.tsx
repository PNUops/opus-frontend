import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjectsAdmin } from 'apis/contest';
import { deleteTeam } from 'apis/team';
import ConfirmModal from '@components/ConfirmModal';
import { twMerge } from 'tailwind-merge';
import Tag from '@components/Tag';
import {
  AdminHeader,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/ui/admin';
import { getColorClassForLabel } from 'utils/color';
import { useToast } from 'hooks/useToast';
import { useContestIdOrRedirect } from 'hooks/useId';

const ProjectManagePage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const navigate = useNavigate();
  const contestId = useContestIdOrRedirect();
  const handleCreateProject = () => navigate(`/admin/contest/${contestId}/projects/create`);
  const handleDeleteTeam = (teamId: number) => {
    deleteTeamMutation(teamId);
  };
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { data: projectsAdmin } = useQuery({
    queryKey: ['projects', contestId],
    queryFn: () => getProjectsAdmin(contestId),
    enabled: !!contestId,
  });

  const { mutate: deleteTeamMutation } = useMutation({
    mutationFn: (teamId: number) => deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', contestId] });
    },
    onError: () => toast('팀 삭제에 실패했어요', 'error'),
  });

  return (
    <div className="flex w-full flex-col">
      <AdminHeader
        title="프로젝트 관리"
        description="팀 | 프로젝트 | 소속 분과 | 제출 여부"
        onButtonClick={handleCreateProject}
        buttonLabel="+ 새 프로젝트"
      />
      <div className="h-[35px]" />
      <div className="flex flex-col gap-2">
        {!projectsAdmin || projectsAdmin.length === 0 ? (
          <div className="bg-whiteGray text-midGray rounded-md p-4 text-center">아직 등록된 프로젝트가 없어요.</div>
        ) : (
          projectsAdmin.map((proj, index) => (
            <AdminCardRow key={proj.teamId} className={twMerge('border-lightGray', 'even:bg-slate-50')}>
              <div className="flex w-full items-center gap-4 py-1">
                <p className="text-midGray w-10 flex-shrink-0 text-center text-sm">{(index ?? 0) + 1}</p>
                <div className="flex min-w-0 flex-1 items-center gap-6">
                  <p className="text-darkGray w-[150px] flex-shrink-0 truncate font-medium">{proj.teamName}</p>
                  <p className="flex-1 truncate text-gray-600">{proj.projectName}</p>
                  <div className="flex w-[100px] flex-shrink-0 justify-center">
                    <TrackTag name={proj.trackName} />
                  </div>
                </div>

                <div className="w-[80px] flex-shrink-0">
                  <SubmissionTag isSubmitted={proj.isSubmitted} />
                </div>
                <div className="flex w-10 flex-shrink-0 justify-end">
                  <AdminPopoverMenu>
                    <AdminPopoverEditButton
                      onEdit={() => {
                        navigate(`/contest/${contestId}/teams/edit/${proj.teamId}`);
                        close();
                      }}
                    />
                    <AdminPopoverDeleteButton onDelete={() => setDeleteTarget(proj.teamId)} />
                  </AdminPopoverMenu>
                </div>
                <ConfirmModal
                  isOpen={deleteTarget !== null}
                  onConfirm={() => {
                    if (deleteTarget !== null) handleDeleteTeam(deleteTarget);
                    setDeleteTarget(null);
                  }}
                  onCancel={() => setDeleteTarget(null)}
                />
              </div>
            </AdminCardRow>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectManagePage;

type SubmissionTagProps = { isSubmitted: boolean };
const SubmissionTag = ({ isSubmitted }: SubmissionTagProps) => {
  const label = isSubmitted ? '제출' : '미제출';
  const colorClass = isSubmitted ? 'bg-blue-300' : 'bg-midGray';
  return <Tag className={colorClass}>{label}</Tag>;
};

const TrackTag = ({ name }: { name: string }) => {
  const colorClass = getColorClassForLabel(name);
  return <Tag className={colorClass}>{name}</Tag>;
};
