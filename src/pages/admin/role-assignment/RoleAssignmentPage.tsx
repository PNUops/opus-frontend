import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AdminHeader } from '@components/admin';
import { Dialog } from '@components/ui/dialog';
import { deleteContestStaff, getContestStaff } from '@apis/contestStaff';
import { getProjectsAdmin } from '@apis/contest';
import { getContestTracks } from '@apis/track';
import { useContestIdOrRedirect } from '@hooks/useId';
import { useToast } from '@hooks/useToast';
import { getApiErrorMessage } from '@utils/error';

import { RoleAssignmentFilterBar } from './components/RoleAssignmentFilterBar';
import { RoleAssignmentModal } from './components/RoleAssignmentModal';
import { RoleAssignmentTabBar } from './components/RoleAssignmentTabBar';
import { RoleAssignmentTable } from './components/RoleAssignmentTable';
import type { RoleType } from './types/roleAssignment';

const RoleAssignmentPage = () => {
  const contestId = useContestIdOrRedirect();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeRole, setActiveRole] = useState<RoleType>('ROLE_교수');
  const [search, setSearch] = useState('');
  const [modalRole, setModalRole] = useState<RoleType | null>(null);

  const assignmentQueryKey = ['contestStaff', contestId, activeRole, search.trim()];

  const { data: assignments = [] } = useQuery({
    queryKey: assignmentQueryKey,
    queryFn: () => getContestStaff({ contestId, memberType: activeRole, search: search.trim() || undefined }),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', contestId],
    queryFn: () => getProjectsAdmin(contestId),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks', contestId],
    queryFn: () => getContestTracks(contestId),
  });

  const assignableTeams = useMemo(
    () =>
      projects.map((project) => ({
        teamId: project.teamId,
        teamName: project.teamName,
        trackName: project.trackName,
      })),
    [projects],
  );

  const { mutate: deleteAssignment } = useMutation({
    mutationFn: (contestMemberId: number) => deleteContestStaff(contestId, contestMemberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contestStaff', contestId] });
      toast('배정을 삭제했어요.', 'success');
    },
    onError: (error) => {
      toast(getApiErrorMessage(error, '배정 삭제에 실패했어요.'), 'error');
    },
  });

  return (
    <div className="flex w-full flex-col gap-10">
      <AdminHeader
        title="지도교수 및 멘토 지정"
        description="현재 대회의 지도교수, 멘토를 지정하고 각 역할의 팀을 지정합니다."
      />

      <div className="flex flex-col gap-6">
        <RoleAssignmentTabBar activeTab={activeRole} onChange={setActiveRole} />

        <RoleAssignmentFilterBar
          activeRole={activeRole}
          search={search}
          onSearchChange={setSearch}
          onAssignClick={() => setModalRole(activeRole)}
        />

        <RoleAssignmentTable assignments={assignments} onDelete={deleteAssignment} />
      </div>

      <Dialog open={modalRole !== null} onOpenChange={(open) => !open && setModalRole(null)}>
        {modalRole && (
          <RoleAssignmentModal
            contestId={contestId}
            defaultRole={modalRole}
            teams={assignableTeams}
            tracks={tracks}
            onClose={() => setModalRole(null)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default RoleAssignmentPage;
