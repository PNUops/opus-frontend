import { useEffect, useRef, useState } from 'react';
import { IoPerson } from 'react-icons/io5';
import { AiOutlineUserDelete } from 'react-icons/ai';

import Menu, { MenuOption } from '@components/Menu';
import { RequiredFieldsDto } from '@dto/requiredFieldsDto';
import type { FormTeamMember } from '@hooks/useProjectForm';
import type { TeamMemberType } from 'types/MemberType';

interface MembersInputProps {
  teamMembers: FormTeamMember[];
  onMemberAdd: (member: { teamMemberName: string; teamMemberStudentId: string; roleType: TeamMemberType }) => void;
  onMemberRemove: (clientId: string) => void;
  requiredFields: RequiredFieldsDto;
}

const MAX_LEADER = 1;
const MAX_TEAMMEMBERS = 6;

const MembersInput = ({ teamMembers, onMemberAdd, onMemberRemove, requiredFields }: MembersInputProps) => {
  const [newteamMemberName, setNewteamMemberName] = useState('');
  const [newteamMemberStudentId, setNewteamMemberStudentId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMemberType>('ROLE_팀원');

  const teamLeaders = teamMembers.filter((member) => member.roleType === 'ROLE_팀장');
  const teamMembersOnly = teamMembers.filter((member) => member.roleType === 'ROLE_팀원');

  const existingTeamLeadersCount = teamLeaders.filter((member) => !member.isNew).length;
  const existingTeamMembersCount = teamMembersOnly.filter((member) => !member.isNew).length;
  const newTeamLeadersCount = teamLeaders.filter((member) => member.isNew).length;
  const newTeamMembersCount = teamMembersOnly.filter((member) => member.isNew).length;

  const totalTeamLeadersCount = existingTeamLeadersCount + newTeamLeadersCount;
  const totalTeamMembersCount = existingTeamMembersCount + newTeamMembersCount;
  const canAddLeader = totalTeamLeadersCount < MAX_LEADER;
  const canAddTeamMember = totalTeamMembersCount < MAX_TEAMMEMBERS;

  const roleOptions: MenuOption<TeamMemberType>[] = [];
  if (canAddTeamMember) roleOptions.push({ label: '팀원', value: 'ROLE_팀원' });
  if (canAddLeader) roleOptions.push({ label: '팀장', value: 'ROLE_팀장' });

  useEffect(() => {
    if (roleOptions.length === 0) return;
    if (!roleOptions.some((option) => option.value === newMemberRole)) {
      setNewMemberRole(roleOptions[0].value);
    }
  }, [newMemberRole, roleOptions]);

  const handleAddMember = () => {
    const trimmedName = newteamMemberName.trim();
    if (!trimmedName) return;
    if (newMemberRole === 'ROLE_팀장' && !canAddLeader) return;
    if (newMemberRole === 'ROLE_팀원' && !canAddTeamMember) return;

    onMemberAdd({
      teamMemberName: trimmedName,
      teamMemberStudentId: newteamMemberStudentId.trim(),
      roleType: newMemberRole,
    });
    setNewteamMemberName('');
    setNewteamMemberStudentId('');
    setNewMemberRole(canAddTeamMember ? 'ROLE_팀원' : 'ROLE_팀장');
  };

  const memberFormRef = useRef<HTMLInputElement>(null);
  const handleFocusOnTeamMemberInput = () => memberFormRef.current?.focus();

  return (
    <div className="flex w-full flex-col gap-8 sm:gap-5 sm:text-sm">
      <div className="text-exsm flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-10 sm:text-sm">
        <div className="text-midGray flex w-25 gap-1 sm:py-3">
          <span className={`mr-1 ${requiredFields.leaderRequired ? 'text-red-500' : 'text-transparent'}`}>*</span>
          <span>팀장</span>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {teamLeaders.length > 0 ? (
            <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
              {teamLeaders.map((member) => (
                <RegisteredMember key={member.clientId} member={member} onMemberRemove={onMemberRemove} />
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleFocusOnTeamMemberInput}
              className="border-lightGray text-lightGray bg-whiteGray/30 hover:bg-whiteGray flex min-h-12 w-full items-center justify-between gap-3 rounded border px-4 py-3"
            >
              팀장 정보를 입력해주세요.
            </button>
          )}
        </div>
      </div>
      <div className="text-exsm flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-10 sm:text-sm">
        <div className="text-midGray flex w-25 gap-1 sm:py-3">
          <span className={`mr-1 ${requiredFields.teamMembersRequired ? 'text-red-500' : 'text-transparent'}`}>*</span>
          <span>팀원</span>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {teamMembersOnly.length > 0 ? (
            <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
              {teamMembersOnly.map((member) => (
                <RegisteredMember key={member.clientId} member={member} onMemberRemove={onMemberRemove} />
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleFocusOnTeamMemberInput}
              className="border-lightGray text-lightGray bg-whiteGray/30 hover:bg-whiteGray flex min-h-12 w-full items-center justify-between gap-3 rounded border px-4 py-3"
            >
              팀원 정보를 입력해주세요.
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-10">
        <div className="flex w-25" />
        <div className="flex flex-1 flex-col">
          {(canAddLeader || canAddTeamMember) && (
            <div className="border-lightGray flex w-full flex-col gap-2 rounded border p-3">
              <input
                ref={memberFormRef}
                id="team-member-name-input"
                type="text"
                placeholder="팀장 또는 팀원의 이름을 입력해주세요."
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
                  if (/^\d{0,9}$/.test(e.target.value)) setNewteamMemberStudentId(e.target.value);
                }}
              />
              <Menu<TeamMemberType>
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
            팀장 최대 {MAX_LEADER}명, 팀원 최대 {MAX_TEAMMEMBERS}명까지 등록할 수 있어요. (팀장{' '}
            {MAX_LEADER - totalTeamLeadersCount}명, 팀원 {MAX_TEAMMEMBERS - totalTeamMembersCount}명 남음)
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembersInput;

const RegisteredMember = ({
  member,
  onMemberRemove,
}: {
  member: FormTeamMember;
  onMemberRemove: (clientId: string) => void;
}) => {
  return (
    <div
      key={member.clientId}
      className="border-lightGray bg-whiteGray/30 flex min-h-12 w-full items-center justify-between gap-3 rounded border px-4 py-3 text-black"
    >
      <div className="flex min-w-0 items-center gap-2">
        <IoPerson className="text-mainGreen/60 shrink-0" size={17} />
        <span className="truncate font-medium">{member.teamMemberName}</span>
        <span className="text-midGray shrink-0 text-xs whitespace-nowrap">
          {member.teamMemberStudentId ? `(${member.teamMemberStudentId})` : ''}
        </span>

        <span className="text-mainGreen/60 bg-subGreen/50 shrink-0 rounded-full px-2 py-1 text-xs whitespace-nowrap">
          {member.roleType === 'ROLE_팀장' ? '팀장' : '팀원'}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onMemberRemove(member.clientId)}
        className="shrink-0 text-sm text-red-500 hover:cursor-pointer hover:text-red-700"
      >
        <AiOutlineUserDelete className="mr-1 inline-block" size={14} />
      </button>
    </div>
  );
};
