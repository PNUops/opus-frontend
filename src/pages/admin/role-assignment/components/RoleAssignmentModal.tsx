import { type ReactNode, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { createContestStaffBatch, searchStaffMembers } from '@apis/contestStaff';
import { AdminActionButton } from '@components/admin';
import { cn } from '@components/lib/utils';
import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { ROLE_ASSIGNMENT_ROLE_OPTIONS, ROLE_LABEL } from '@constants/roleAssignment';
import { useToast } from '@hooks/useToast';
import { getApiErrorMessage } from '@utils/error';

import type {
  AssignableMember,
  AssignableTeam,
  ContestTrack,
  RoleAssignmentFormValues,
  RoleType,
} from '../types/roleAssignment';

const ALL_TRACKS = 'ALL_TRACKS';
const NO_TEAM = 'NO_TEAM';

interface RoleAssignmentModalProps {
  contestId: number;
  defaultRole: RoleType;
  teams: AssignableTeam[];
  tracks: ContestTrack[];
  onClose: () => void;
}

const createDefaultValues = (defaultRole: RoleType): RoleAssignmentFormValues => ({
  memberId: null,
  memberEmailQuery: '',
  roleType: defaultRole,
  trackName: null,
  teamSearch: '',
  teamIds: [],
});

export const RoleAssignmentModal = ({ contestId, defaultRole, teams, tracks, onClose }: RoleAssignmentModalProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [values, setValues] = useState<RoleAssignmentFormValues>(() => createDefaultValues(defaultRole));
  const memberKeyword = values.memberEmailQuery.trim();

  const update = <K extends keyof RoleAssignmentFormValues>(key: K, value: RoleAssignmentFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleMemberQueryChange = (memberEmailQuery: string) => {
    setValues((prev) => ({ ...prev, memberEmailQuery, memberId: null }));
  };

  const handleRoleChange = (roleType: RoleType) => {
    setValues((prev) => ({ ...prev, roleType, memberId: null }));
  };

  const { data: memberOptions = [], isFetching: isFetchingMembers } = useQuery({
    queryKey: ['staffMembers', values.roleType, memberKeyword],
    queryFn: () => searchStaffMembers({ keyword: memberKeyword, memberType: values.roleType }),
    enabled: memberKeyword.length > 0,
  });

  const teamOptions = useMemo(() => {
    const keyword = values.teamSearch.trim().toLowerCase();

    return teams.filter(
      (team) =>
        (values.trackName === null || team.trackName === values.trackName) &&
        (keyword === '' || team.teamName.toLowerCase().includes(keyword)),
    );
  }, [teams, values.teamSearch, values.trackName]);

  const selectedMember = memberOptions.find((member) => member.memberId === values.memberId) ?? null;
  const selectedTeamId = values.teamIds[0] ?? null;

  const { mutate: assignStaff, isPending: isAssigning } = useMutation({
    mutationFn: () => {
      if (!selectedMember) throw new Error('역할을 배정할 회원을 선택해주세요.');
      return createContestStaffBatch(contestId, {
        memberIds: [selectedMember.memberId],
        teamIds: values.teamIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contestStaff', contestId] });
      toast(`${selectedMember?.name ?? '회원'} 님에게 ${ROLE_LABEL[values.roleType]} 역할을 배정했어요.`, 'success');
      onClose();
    },
    onError: (error) => {
      toast(getApiErrorMessage(error, '역할 배정에 실패했어요.'), 'error');
    },
  });

  const handleTrackChange = (value: string) => {
    const nextTrackName = value === ALL_TRACKS ? null : value;
    update('trackName', nextTrackName);
    update('teamIds', []);
  };

  const handleSubmit = () => {
    if (!selectedMember) {
      toast('역할을 배정할 회원을 선택해주세요.', 'error');
      return;
    }
    if (values.teamIds.length === 0) {
      toast('담당 팀을 선택해주세요.', 'error');
      return;
    }

    assignStaff();
  };

  return (
    <DialogContent className="max-h-[calc(100vh-32px)] w-[600px] max-w-[92vw] grid-rows-[auto_minmax(0,1fr)_auto] items-stretch gap-4 overflow-hidden p-5 sm:max-h-[calc(100vh-48px)] sm:gap-5 sm:p-7">
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-xl font-bold text-gray-950">역할 일괄 배정</DialogTitle>
        <p className="text-midGray text-sm">
          이메일로 담당 팀을 배정할 수 있어요. ex) 구름팀의 지도교수, 햇살팀의 멘토
        </p>
      </div>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
        <ModalField label="회원 이메일">
          <div className="border-mainBlue flex min-h-[170px] flex-col rounded-md border bg-white p-3">
            <input
              type="search"
              value={values.memberEmailQuery}
              onChange={(event) => handleMemberQueryChange(event.target.value)}
              placeholder="회원 이름 또는 이메일로 검색"
              className="placeholder:text-midGray h-8 w-full text-sm focus:outline-none"
            />

            <div className="mt-3 flex flex-col gap-2">
              {memberKeyword.length === 0 ? (
                <p className="text-midGray py-4 text-center text-sm">회원 이름 또는 이메일을 입력해주세요.</p>
              ) : isFetchingMembers ? (
                <p className="text-midGray py-4 text-center text-sm">검색 중이에요.</p>
              ) : memberOptions.length === 0 ? (
                <p className="text-midGray py-4 text-center text-sm">검색 결과가 없어요.</p>
              ) : (
                memberOptions
                  .slice(0, 3)
                  .map((member) => (
                    <MemberOption
                      key={member.memberId}
                      member={member}
                      selected={values.memberId === member.memberId}
                      onSelect={() => update('memberId', member.memberId)}
                    />
                  ))
              )}
            </div>
          </div>
        </ModalField>

        <ModalField label="역할">
          <Select value={values.roleType} onValueChange={(role) => handleRoleChange(role as RoleType)}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {ROLE_ASSIGNMENT_ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ModalField>

        <ModalField label="팀">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[138px_1fr] gap-4">
              <Select
                value={values.trackName === null ? ALL_TRACKS : values.trackName}
                onValueChange={handleTrackChange}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value={ALL_TRACKS}>분과 전체</SelectItem>
                  {tracks.map((track) => (
                    <SelectItem key={track.trackId} value={track.trackName}>
                      {track.trackName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Search size={18} className="text-midGray absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  type="search"
                  value={values.teamSearch}
                  onChange={(event) => {
                    update('teamSearch', event.target.value);
                    update('teamIds', []);
                  }}
                  placeholder="팀 이름으로 검색"
                  className="border-input placeholder:text-midGray focus:border-mainBlue h-10 w-full rounded-md border pr-3 pl-10 text-sm focus:outline-none"
                />
              </div>
            </div>

            <Select
              value={selectedTeamId === null ? NO_TEAM : String(selectedTeamId)}
              onValueChange={(teamId) => update('teamIds', teamId === NO_TEAM ? [] : [Number(teamId)])}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="팀 이름" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value={NO_TEAM}>팀 이름</SelectItem>
                {teamOptions.map((team) => (
                  <SelectItem key={team.teamId} value={String(team.teamId)}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ModalField>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <DialogClose asChild>
          <AdminActionButton type="button" variant="outline" onClick={onClose}>
            취소
          </AdminActionButton>
        </DialogClose>
        <AdminActionButton type="button" onClick={handleSubmit}>
          {isAssigning ? '배정 중' : '일괄 배정'}
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};

const ModalField = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-darkGray text-sm font-semibold">{label}</span>
      {children}
    </div>
  );
};

interface MemberOptionProps {
  member: AssignableMember;
  selected: boolean;
  onSelect: () => void;
}

const MemberOption = ({ member, selected, onSelect }: MemberOptionProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex h-11 items-center gap-3 rounded-md px-2 text-left transition-colors',
        selected ? 'bg-whiteGray' : 'hover:bg-whiteGray',
      )}
    >
      <span
        className={cn(
          'border-lightGray flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
          selected && 'border-mainBlue',
        )}
        aria-hidden
      >
        {selected && <span className="bg-mainBlue h-3 w-3 rounded-full" />}
      </span>
      <span className="text-darkGray min-w-0 flex-1 truncate text-sm font-medium">{member.name}</span>
      <span className="text-darkGray truncate text-sm">{member.email}</span>
    </button>
  );
};
