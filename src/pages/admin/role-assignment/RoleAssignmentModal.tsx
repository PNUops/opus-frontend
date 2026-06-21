import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';

import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';
import { cn } from 'utils/classname';

export type AssignmentRole = 'professor' | 'mentor';
export type RoleMemberType = '교수진' | '산업체' | '학생';

export interface RoleAssignmentFormValue {
  role: AssignmentRole;
  name: string;
  email: string;
  memberType: RoleMemberType;
  teamIds: number[];
}

interface RoleAssignmentModalProps {
  defaultRole: AssignmentRole;
  teams: TeamListItemResponseDto[];
  onSubmit: (value: RoleAssignmentFormValue) => void;
}

const roleLabels: Record<AssignmentRole, string> = {
  professor: '지도교수',
  mentor: '멘토',
};

const memberTypeOptions: RoleMemberType[] = ['교수진', '산업체', '학생'];

const RoleAssignmentModal = ({ defaultRole, teams, onSubmit }: RoleAssignmentModalProps) => {
  const [role, setRole] = useState<AssignmentRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [memberType, setMemberType] = useState<RoleMemberType>('교수진');
  const [teamIds, setTeamIds] = useState<number[]>([]);

  useEffect(() => {
    setRole(defaultRole);
    setName('');
    setEmail('');
    setMemberType(defaultRole === 'professor' ? '교수진' : '산업체');
    setTeamIds([]);
  }, [defaultRole]);

  const selectedTeamsText = useMemo(() => {
    if (teamIds.length === 0) return '담당 팀을 선택하세요';
    return `${teamIds.length}개 팀 선택됨`;
  }, [teamIds.length]);

  const handleToggleTeam = (teamId: number) => {
    setTeamIds((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      role,
      name: name.trim(),
      email: email.trim(),
      memberType,
      teamIds,
    });
  };

  return (
    <DialogContent className="w-[560px] max-w-[calc(100vw-32px)] rounded-[8px] border border-[#e5e7eb] bg-white p-0 shadow-xl">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <header className="border-b border-[#e5e7eb] px-7 py-5">
          <DialogTitle className="text-left text-[20px] leading-[28px] font-semibold text-[#111827]">
            {roleLabels[defaultRole]} 배정
          </DialogTitle>
        </header>

        <div className="grid gap-5 px-7 py-6">
          <Field label="역할">
            <Select value={role} onValueChange={(value) => setRole(value as AssignmentRole)}>
              <SelectTrigger className="h-[42px] rounded-[6px] border-[#d1d5db] px-4 text-[16px] shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[6px] border-[#d1d5db] bg-white p-2">
                <SelectItem className="h-[42px] rounded-[6px] px-4 text-[16px]" value="professor">
                  지도교수
                </SelectItem>
                <SelectItem className="h-[42px] rounded-[6px] px-4 text-[16px]" value="mentor">
                  멘토
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="이름">
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-[42px] w-full rounded-[6px] border border-[#d1d5db] px-4 text-[16px] transition-colors outline-none focus:border-[#007fcc]"
                placeholder="이름"
              />
            </Field>

            <Field label="회원 유형">
              <Select value={memberType} onValueChange={(value) => setMemberType(value as RoleMemberType)}>
                <SelectTrigger className="h-[42px] rounded-[6px] border-[#d1d5db] px-4 text-[16px] shadow-none focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[6px] border-[#d1d5db] bg-white p-2">
                  {memberTypeOptions.map((option) => (
                    <SelectItem key={option} className="h-[42px] rounded-[6px] px-4 text-[16px]" value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="이메일">
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-[42px] w-full rounded-[6px] border border-[#d1d5db] px-4 text-[16px] transition-colors outline-none focus:border-[#007fcc]"
              placeholder="email@example.com"
            />
          </Field>

          <Field label="담당 팀">
            <div className="rounded-[6px] border border-[#d1d5db] p-3">
              <p
                className={cn('mb-3 text-[14px] leading-[22px]', teamIds.length ? 'text-[#111827]' : 'text-[#6b7280]')}
              >
                {selectedTeamsText}
              </p>
              {teams.length === 0 ? (
                <p className="rounded-[6px] bg-[#f9fafb] px-4 py-3 text-[14px] text-[#6b7280]">등록된 팀이 없습니다.</p>
              ) : (
                <div className="flex max-h-[132px] flex-wrap gap-2 overflow-y-auto">
                  {teams.map((team) => {
                    const isSelected = teamIds.includes(team.teamId);
                    return (
                      <button
                        key={team.teamId}
                        type="button"
                        onClick={() => handleToggleTeam(team.teamId)}
                        className={cn(
                          'flex items-center gap-1 rounded-[8px] px-3 py-1.5 text-[14px] leading-[20px] transition-colors',
                          isSelected ? 'bg-[#cce6f1] text-[#005baa]' : 'bg-[#f9fafb] text-[#4b5563] hover:bg-[#e6f2f8]',
                        )}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                        {team.teamName}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Field>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[#e5e7eb] px-7 py-5">
          <DialogClose asChild>
            <button
              type="button"
              className="h-[42px] rounded-[6px] border border-[#d1d5db] px-5 text-[16px] text-[#4b5563] transition-colors hover:bg-[#f9fafb]"
            >
              취소
            </button>
          </DialogClose>
          <button
            type="submit"
            className="h-[42px] rounded-[6px] bg-[#005baa] px-5 text-[16px] text-white transition-colors hover:bg-[#007fcc]"
          >
            배정
          </button>
        </footer>
      </form>
    </DialogContent>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="grid gap-2">
    <span className="text-[14px] leading-[22px] font-medium text-[#111827]">{label}</span>
    {children}
  </label>
);

export default RoleAssignmentModal;
