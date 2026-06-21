import { type ReactNode, useMemo, useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { Dialog } from '@components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import useTeamList from 'hooks/useTeamList';
import { useContestIdOrRedirect } from 'hooks/useId';
import { cn } from 'utils/classname';

import RoleAssignmentModal, { AssignmentRole, RoleAssignmentFormValue, RoleMemberType } from './RoleAssignmentModal';

interface RoleAssignmentRow {
  id: string;
  role: AssignmentRole;
  name: string;
  email: string;
  memberType: RoleMemberType;
  teams: string[];
}

type MemberTypeFilter = 'all' | RoleMemberType;

const roleLabels: Record<AssignmentRole, string> = {
  professor: '지도교수',
  mentor: '멘토',
};

const memberTypeFilterOptions: { label: string; value: MemberTypeFilter }[] = [
  { label: '회원 유형', value: 'all' },
  { label: '교수진', value: '교수진' },
  { label: '산업체', value: '산업체' },
  { label: '학생', value: '학생' },
];

const RoleAssignmentPage = () => {
  const contestId = useContestIdOrRedirect();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRole: AssignmentRole = searchParams.get('role') === 'mentor' ? 'mentor' : 'professor';
  const [memberTypeFilter, setMemberTypeFilter] = useState<MemberTypeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalRole, setModalRole] = useState<AssignmentRole | null>(null);
  const [rows, setRows] = useState<RoleAssignmentRow[]>([]);

  const { data: teams = [] } = useTeamList(contestId);

  const filteredRows = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      if (row.role !== activeRole) return false;
      if (memberTypeFilter !== 'all' && row.memberType !== memberTypeFilter) return false;
      if (!normalizedSearchTerm) return true;

      return [row.name, row.email, row.memberType, ...row.teams].some((value) =>
        value.toLowerCase().includes(normalizedSearchTerm),
      );
    });
  }, [activeRole, memberTypeFilter, rows, searchTerm]);

  const handleRoleTabChange = (role: AssignmentRole) => {
    setSearchParams(role === 'mentor' ? { role: 'mentor' } : {});
  };

  const handleAssignmentSubmit = (value: RoleAssignmentFormValue) => {
    const assignedTeams = teams.filter((team) => value.teamIds.includes(team.teamId)).map((team) => team.teamName);

    setRows((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        role: value.role,
        name: value.name,
        email: value.email,
        memberType: value.memberType,
        teams: assignedTeams,
      },
    ]);
    setModalRole(null);
    handleRoleTabChange(value.role);
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <div className="flex w-full flex-col">
      <header className="mb-[56px]">
        <h1 className="text-[24px] leading-[32px] font-bold text-[#161616]">지도교수 및 멘토 지정</h1>
        <p className="mt-1 text-[16px] leading-[26px] text-[#6b7280]">
          현재 대회의 지도교수, 멘토를 지정하고 각 역할의 팀을 지정합니다.
        </p>
      </header>

      <section>
        <div className="flex items-center border-b-2 border-[#e5e7eb]">
          <RoleTab active={activeRole === 'professor'} onClick={() => handleRoleTabChange('professor')}>
            지도교수
          </RoleTab>
          <RoleTab active={activeRole === 'mentor'} onClick={() => handleRoleTabChange('mentor')}>
            멘토
          </RoleTab>
          <div className="h-[58px] flex-1" />
        </div>

        <div className="mt-[26px] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={memberTypeFilter} onValueChange={(value) => setMemberTypeFilter(value as MemberTypeFilter)}>
              <SelectTrigger className="h-[42px] w-[138px] rounded-[6px] border-[#d1d5db] px-4 text-[16px] text-[#6b7280] shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[6px] border-[#d1d5db] bg-white p-2">
                {memberTypeFilterOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    className="h-[42px] rounded-[6px] px-4 text-[16px]"
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative h-[42px] w-[374px] max-w-full">
              <Search className="absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2 stroke-[#6b7280]" strokeWidth={1.8} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-full w-full rounded-[6px] border border-[#d1d5db] pr-4 pl-11 text-[14px] leading-[20px] text-[#111827] transition-colors outline-none placeholder:text-[#6b7280] focus:border-[#007fcc]"
                placeholder={`${roleLabels[activeRole]} 이름 또는 담당 팀으로 검색`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalRole(activeRole)}
            className="h-[42px] min-w-[100px] rounded-[6px] border border-[#007fcc] px-4 text-[16px] leading-[26px] text-[#005baa] transition-colors hover:bg-[#e6f2f8]"
          >
            + {roleLabels[activeRole]} 배정
          </button>
        </div>

        <RoleAssignmentTable rows={filteredRows} activeRole={activeRole} onDeleteRow={handleDeleteRow} />
      </section>

      <Dialog open={modalRole !== null} onOpenChange={(open) => !open && setModalRole(null)}>
        {modalRole && <RoleAssignmentModal defaultRole={modalRole} teams={teams} onSubmit={handleAssignmentSubmit} />}
      </Dialog>
    </div>
  );
};

const RoleTab = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      '-mb-0.5 flex h-[58px] items-center justify-center border-b-2 px-8 text-[20px] leading-[26px] font-medium transition-colors',
      active ? 'border-[#007fcc] text-[#005baa]' : 'border-transparent text-[#6b7280] hover:text-[#111827]',
    )}
  >
    {children}
  </button>
);

const RoleAssignmentTable = ({
  rows,
  activeRole,
  onDeleteRow,
}: {
  rows: RoleAssignmentRow[];
  activeRole: AssignmentRole;
  onDeleteRow: (id: string) => void;
}) => (
  <div className="mt-4 overflow-hidden rounded-[6px] border border-[#d1d5db]">
    <div className="grid min-h-[50px] grid-cols-[120px_200px_120px_minmax(240px,1fr)_91px] items-center gap-[10px] bg-[#f9fafb] px-7 text-[16px] leading-[26px] font-medium text-[#111827]">
      <span>이름</span>
      <span>이메일</span>
      <span>회원 유형</span>
      <span>담당 팀</span>
      <span className="text-center">작업</span>
    </div>

    {rows.length === 0 ? (
      <div className="flex min-h-[156px] items-center justify-center border-t border-[#e5e7eb] text-[16px] text-[#6b7280]">
        배정된 {roleLabels[activeRole]}가 없습니다.
      </div>
    ) : (
      <div className="divide-y divide-[#e5e7eb]">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid min-h-[56px] grid-cols-[120px_200px_120px_minmax(240px,1fr)_91px] items-center gap-[10px] px-7 py-3 text-[16px] leading-[26px] text-black"
          >
            <span className="truncate">{row.name}</span>
            <span className="truncate">{row.email}</span>
            <span className="truncate">{row.memberType}</span>
            <div className="flex flex-wrap gap-[10px]">
              {row.teams.length === 0 ? (
                <span className="text-[#6b7280]">미지정</span>
              ) : (
                row.teams.map((teamName) => (
                  <span
                    key={`${row.id}-${teamName}`}
                    className="rounded-[8px] bg-[#cce6f1] px-2 py-1 text-[16px] leading-[26px] text-[#005baa]"
                  >
                    {teamName}
                  </span>
                ))
              )}
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                aria-label={`${row.name} 배정 삭제`}
                onClick={() => onDeleteRow(row.id)}
                className="rounded-full p-2 text-[#111827] transition-colors hover:bg-[#f9fafb]"
              >
                <MoreVertical className="h-6 w-6" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default RoleAssignmentPage;
