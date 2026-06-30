import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import ConfirmModal from '@components/ConfirmModal';
import { AdminHeader } from '@components/admin';
import { Dialog } from '@components/ui/dialog';
import { deleteContestStaff, getContestStaff } from '@apis/contestStaff';
import { ROLE_LABEL } from '@constants/roleAssignment';
import { useContestIdOrRedirect } from '@hooks/useId';
import { useToast } from '@hooks/useToast';
import { getApiErrorMessage } from '@utils/error';

import { RoleAssignmentFilterBar } from './components/RoleAssignmentFilterBar';
import { RoleAssignmentModal } from './components/RoleAssignmentModal';
import { RoleAssignmentTabBar } from './components/RoleAssignmentTabBar';
import { RoleAssignmentTable } from './components/RoleAssignmentTable';
import type { RoleAssignment, RoleType } from './types/roleAssignment';

type RoleAssignmentModalState =
  | {
      mode: 'create';
      role: RoleType;
    }
  | {
      mode: 'edit';
      assignment: RoleAssignment;
    };

const RoleAssignmentPage = () => {
  const contestId = useContestIdOrRedirect();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeRole, setActiveRole] = useState<RoleType>('ROLE_교수');
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState<RoleAssignmentModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleAssignment | null>(null);

  const assignmentQueryKey = ['contestStaff', contestId, activeRole, search.trim()];

  const { data: assignments = [] } = useQuery({
    queryKey: assignmentQueryKey,
    queryFn: () => getContestStaff({ contestId, memberType: activeRole, search: search.trim() || undefined }),
  });

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

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteAssignment(deleteTarget.contestMemberId);
    setDeleteTarget(null);
  };

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
          onAssignClick={() => setModalState({ mode: 'create', role: activeRole })}
        />

        <RoleAssignmentTable
          assignments={assignments}
          onEdit={(assignment) => setModalState({ mode: 'edit', assignment })}
          onDelete={setDeleteTarget}
        />
      </div>

      <Dialog open={modalState !== null} onOpenChange={(open) => !open && setModalState(null)}>
        {modalState && (
          <RoleAssignmentModal
            contestId={contestId}
            defaultRole={modalState.mode === 'create' ? modalState.role : modalState.assignment.roleType}
            assignment={modalState.mode === 'edit' ? modalState.assignment : undefined}
            onClose={() => setModalState(null)}
          />
        )}
      </Dialog>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        message="역할 배정을 삭제하시겠어요?"
        description={
          deleteTarget
            ? `${deleteTarget.name}님의 ${ROLE_LABEL[deleteTarget.roleType]} 담당 팀 배정이 삭제됩니다.`
            : undefined
        }
      />
    </div>
  );
};

export default RoleAssignmentPage;
