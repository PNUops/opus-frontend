import { AdminPopoverDeleteButton, AdminPopoverEditButton, AdminPopoverMenu } from '@components/admin';
import { AdminResponsiveList } from '@components/admin/AdminResponsiveList';
import { ROLE_LABEL } from '@constants/roleAssignment';
import type { RoleAssignment } from '../types/roleAssignment';
import { RoleTeamChip } from './RoleTeamChip';

interface RoleAssignmentTableProps {
  assignments: RoleAssignment[];
  onEdit: (assignment: RoleAssignment) => void;
  onDelete: (assignment: RoleAssignment) => void;
}

export const RoleAssignmentTable = ({ assignments, onEdit, onDelete }: RoleAssignmentTableProps) => (
  <AdminResponsiveList
    label="역할 배정 목록"
    items={assignments}
    getKey={(assignment) => assignment.contestMemberId}
    primaryKey="name"
    emptyText="배정된 역할이 없어요."
    tableClassName="min-w-[940px]"
    columns={[
      { key: 'name', label: '이름', render: (assignment) => assignment.name },
      { key: 'email', label: '이메일', render: (assignment) => assignment.email },
      { key: 'role', label: '회원 유형', render: (assignment) => ROLE_LABEL[assignment.roleType] },
      {
        key: 'teams',
        label: '담당 팀',
        render: (assignment) => (
          <div className="flex flex-wrap gap-2">
            {assignment.teams.map((team) => (
              <RoleTeamChip key={team.teamId} team={team} />
            ))}
          </div>
        ),
      },
    ]}
    actions={(assignment) => (
      <AdminPopoverMenu>
        <AdminPopoverEditButton onEdit={() => onEdit(assignment)} />
        <AdminPopoverDeleteButton onDelete={() => onDelete(assignment)} />
      </AdminPopoverMenu>
    )}
  />
);
