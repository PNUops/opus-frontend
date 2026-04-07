import { useState } from 'react';
import { IoPerson } from 'react-icons/io5';
import Menu, { MenuOption } from 'components/Menu';
import type { FormTeamMember } from 'hooks/useProjectForm';
import type { TeamMemberType } from 'types/MemberType';

interface MembersInputProps {
  teamMembers: FormTeamMember[];
  onMemberAdd: (member: { teamMemberName: string; teamMemberStudentId: string; roleType: TeamMemberType }) => void;
  onMemberRemove: (teamMemberId: number) => void;
  required?: boolean;
}

const MAX_MEMBERS = 6;

const MembersInput = ({ teamMembers, onMemberAdd, onMemberRemove, required = false }: MembersInputProps) => {
  const [newteamMemberName, setNewteamMemberName] = useState('');
  const [newteamMemberStudentId, setNewteamMemberStudentId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMemberType>('ROLE_팀원');

  const roleOptions: MenuOption<TeamMemberType>[] = [
    { label: '팀원', value: 'ROLE_팀원' },
    { label: '팀장', value: 'ROLE_팀장' },
  ];

  const handleAddMember = () => {
    const trimmed = newteamMemberName.trim();
    if (!trimmed || teamMembers.length >= MAX_MEMBERS) return;
    onMemberAdd({
      teamMemberName: trimmed,
      teamMemberStudentId: newteamMemberStudentId.trim(),
      roleType: newMemberRole,
    });
    setNewteamMemberName('');
    setNewteamMemberStudentId('');
    setNewMemberRole('ROLE_팀원');
  };

  return (
    <div className="text-exsm flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-10 sm:text-sm">
      <div className="text-midGray flex w-25 gap-1 sm:py-3">
        <span className={`mr-1 ${required ? 'text-red-500' : 'text-transparent'}`}>*</span>
        <span>팀원</span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {teamMembers.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
            {teamMembers.map((member) => (
              <div
                key={member.memberId}
                className="border-lightGray bg-whiteGray/30 flex min-h-12 w-full items-center justify-between gap-3 rounded border px-4 py-3 text-black"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <IoPerson className="text-mainGreen/60 shrink-0" size={17} />
                  <span className="truncate font-medium">{member.teamMemberName}</span>
                  <span className="text-midGray shrink-0 text-xs whitespace-nowrap">
                    {member.teamMemberStudentId ? `(${member.teamMemberStudentId})` : ''}
                  </span>
                  <span className="text-mainGreen shrink-0 text-xs whitespace-nowrap">
                    {member.roleType === 'ROLE_팀장' ? '팀장' : '팀원'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onMemberRemove(member.memberId)}
                  className="shrink-0 text-xs text-red-500 hover:cursor-pointer hover:text-red-700"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}

        {teamMembers.length < MAX_MEMBERS && (
          <div className="border-lightGray flex w-full flex-col gap-2 rounded border p-3">
            <input
              type="text"
              placeholder="팀원 이름을 입력해주세요."
              className="placeholder-lightGray border-lightGray focus:border-mainGreen w-full truncate rounded border px-4 py-2.5 text-black duration-300 ease-in-out focus:outline-none"
              value={newteamMemberName}
              onChange={(e) => {
                if (e.target.value.length <= 20) setNewteamMemberName(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddMember();
              }}
            />
            <input
              type="text"
              placeholder="학번을 입력해주세요."
              className="placeholder-lightGray border-lightGray focus:border-mainGreen w-full truncate rounded border px-4 py-2.5 text-black duration-300 ease-in-out focus:outline-none"
              value={newteamMemberStudentId}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) setNewteamMemberStudentId(e.target.value);
              }}
            />
            <Menu<'ROLE_팀장' | 'ROLE_팀원'>
              options={roleOptions}
              value={newMemberRole}
              onChange={(value) => setNewMemberRole(value)}
              placeholder="권한을 선택해주세요."
            />
            <button
              type="button"
              onClick={handleAddMember}
              disabled={!newteamMemberName.trim() || !newteamMemberStudentId.trim()}
              className={`mt-1 self-end rounded px-3 py-1.5 text-xs font-medium ${
                newteamMemberName.trim() && newteamMemberStudentId.trim()
                  ? 'text-mainGreen bg-subGreen hover:cursor-pointer hover:bg-emerald-100'
                  : 'cursor-not-allowed bg-gray-100 text-gray-300'
              }`}
            >
              추가
            </button>
          </div>
        )}
        <p className="text-lightGray text-xs">
          최대 {MAX_MEMBERS}명까지 등록할 수 있어요 ({MAX_MEMBERS - teamMembers.length}명 남음)
        </p>
      </div>
    </div>
  );
};

export default MembersInput;
