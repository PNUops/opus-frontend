import { AdminPopoverDeleteButton, AdminPopoverEditButton, AdminPopoverMenu } from '@components/admin';
import { ROLE_LABEL } from '@constants/roleAssignment';

import type { RoleAssignment } from '../types/roleAssignment';
import { RoleTeamChip } from './RoleTeamChip';

const TABLE_HEADERS = ['이름', '이메일', '회원 유형', '담당 팀'];

interface RoleAssignmentTableProps {
  assignments: RoleAssignment[];
  onEdit: (assignment: RoleAssignment) => void;
  onDelete: (assignment: RoleAssignment) => void;
}

export const RoleAssignmentTable = ({ assignments, onEdit, onDelete }: RoleAssignmentTableProps) => {
  return (
    <div className="border-lightGray overflow-x-auto rounded-md border">
      <table className="w-full min-w-[940px] border-collapse">
        <thead className="bg-whiteGray">
          <tr className="border-lightGray border-b">
            {TABLE_HEADERS.map((header) => (
              <th key={header} className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap">
                {header}
              </th>
            ))}
            <th className="px-6 py-3 text-center text-sm font-semibold whitespace-nowrap">작업</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td colSpan={TABLE_HEADERS.length + 1} className="text-midGray py-12 text-center text-sm">
                배정된 역할이 없어요.
              </td>
            </tr>
          ) : (
            assignments.map((assignment) => (
              <tr key={assignment.contestMemberId} className="border-lightGray border-b last:border-b-0">
                <td className="text-darkGray px-6 py-4 text-sm font-medium whitespace-nowrap">{assignment.name}</td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{assignment.email}</td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">{ROLE_LABEL[assignment.roleType]}</td>
                <td className="px-6 py-3">
                  <div className="flex max-w-[760px] flex-wrap gap-2">
                    {assignment.teams.map((team) => (
                      <RoleTeamChip key={`${assignment.memberId}-${team.teamId}`} team={team} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <AdminPopoverMenu>
                      <AdminPopoverEditButton onEdit={() => onEdit(assignment)} />
                      <AdminPopoverDeleteButton onDelete={() => onDelete(assignment)} />
                    </AdminPopoverMenu>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
