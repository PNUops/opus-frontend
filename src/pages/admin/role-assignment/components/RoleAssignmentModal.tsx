import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, X } from 'lucide-react';

import { getContestTeams } from '@apis/contest';
import { createContestStaffBatch, updateContestStaff } from '@apis/contestStaff';
import { searchAdminMembers } from '@apis/member';
import { AdminActionButton } from '@components/admin';
import { cn } from '@components/lib/utils';
import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { ROLE_LABEL } from '@constants/roleAssignment';
import useDebounce from '@hooks/useDebounce';
import { useToast } from '@hooks/useToast';
import { getApiErrorMessage } from '@utils/error';

import type {
  AssignableMember,
  AssignableTeam,
  RoleAssignment,
  RoleAssignmentFormValues,
  RoleType,
} from '../types/roleAssignment';

type FocusedField = 'member' | 'role' | 'team';

const getTrimmedValue = (value: string | null | undefined) => value?.trim() ?? '';

interface RoleAssignmentModalProps {
  contestId: number;
  defaultRole: RoleType;
  assignment?: RoleAssignment;
  onClose: () => void;
}

const createDefaultValues = (assignment?: RoleAssignment): RoleAssignmentFormValues => ({
  memberEmailQuery: '',
  teamIds: assignment?.teams.map((team) => team.teamId) ?? [],
});

const createSelectedMember = (assignment: RoleAssignment): AssignableMember => ({
  memberId: assignment.memberId,
  name: assignment.name,
  email: assignment.email,
  roleType: assignment.roleType,
});

export const RoleAssignmentModal = ({ contestId, defaultRole, assignment, onClose }: RoleAssignmentModalProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const isEditMode = assignment !== undefined;
  const [values, setValues] = useState<RoleAssignmentFormValues>(() => createDefaultValues(assignment));
  const [selectedMembers, setSelectedMembers] = useState<AssignableMember[]>(() =>
    assignment ? [createSelectedMember(assignment)] : [],
  );
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField | null>(null);
  const memberInputRef = useRef<HTMLInputElement>(null);
  const memberKeyword = values.memberEmailQuery.trim();
  const debouncedMemberKeyword = useDebounce(memberKeyword, 300);
  const roleLabel = ROLE_LABEL[defaultRole];

  useEffect(() => {
    setValues(createDefaultValues(assignment));
    setSelectedMembers(assignment ? [createSelectedMember(assignment)] : []);
    setIsTeamDropdownOpen(false);
    setFocusedField(null);
  }, [assignment]);

  const update = <K extends keyof RoleAssignmentFormValues>(key: K, value: RoleAssignmentFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleMemberQueryChange = (memberEmailQuery: string) => {
    setValues((prev) => ({ ...prev, memberEmailQuery }));
  };

  const handleFieldFocus = (
    field: FocusedField,
    fieldElement: HTMLDivElement | null,
    block: ScrollLogicalPosition = 'nearest',
  ) => {
    setFocusedField(field);

    requestAnimationFrame(() => {
      fieldElement?.scrollIntoView({
        behavior: 'smooth',
        block,
        inline: 'nearest',
      });
    });
  };

  const handleFieldBlur = (field: FocusedField) => {
    setFocusedField((prev) => (prev === field ? null : prev));
  };

  const { data: memberOptions = [], isFetching: isFetchingMembers } = useQuery({
    queryKey: ['adminMemberSearch', defaultRole, debouncedMemberKeyword],
    queryFn: () => searchAdminMembers({ keyword: debouncedMemberKeyword, roleType: defaultRole }),
    enabled: !isEditMode && debouncedMemberKeyword.length > 0,
  });
  const isDebouncingMemberSearch = memberKeyword !== debouncedMemberKeyword;

  const { data: teams = [], isFetching: isFetchingTeams } = useQuery({
    queryKey: ['contestTeams', contestId],
    queryFn: () => getContestTeams(contestId),
    enabled: contestId > 0,
    select: (teams): AssignableTeam[] =>
      teams.map((team) => ({
        teamId: team.teamId,
        teamName: team.teamName,
      })),
  });

  const availableTeams = useMemo(() => teams.filter((team) => getTrimmedValue(team.teamName).length > 0), [teams]);
  const selectedMemberIds = useMemo(() => new Set(selectedMembers.map((member) => member.memberId)), [selectedMembers]);
  const selectedTeams = useMemo(
    () => availableTeams.filter((team) => values.teamIds.includes(team.teamId)),
    [availableTeams, values.teamIds],
  );
  const originalTeamIds = useMemo(() => assignment?.teams.map((team) => team.teamId) ?? [], [assignment]);

  const toggleMember = (member: AssignableMember) => {
    setSelectedMembers((prev) =>
      prev.some((selectedMember) => selectedMember.memberId === member.memberId)
        ? prev.filter((selectedMember) => selectedMember.memberId !== member.memberId)
        : [...prev, member],
    );
    update('memberEmailQuery', '');
    requestAnimationFrame(() => {
      memberInputRef.current?.focus();
    });
  };

  const removeMember = (memberId: number) => {
    setSelectedMembers((prev) => prev.filter((member) => member.memberId !== memberId));
  };

  const toggleTeam = (teamId: number) => {
    setValues((prev) => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId) ? prev.teamIds.filter((id) => id !== teamId) : [...prev.teamIds, teamId],
    }));
  };

  const { mutate: submitAssignment, isPending: isSubmitting } = useMutation({
    mutationFn: () => {
      if (assignment) {
        return updateContestStaff(contestId, assignment.contestMemberId, {
          addTeamIds: values.teamIds.filter((teamId) => !originalTeamIds.includes(teamId)),
          deleteTeamIds: originalTeamIds.filter((teamId) => !values.teamIds.includes(teamId)),
        });
      }

      if (selectedMembers.length === 0) throw new Error('역할을 배정할 회원을 선택해주세요.');
      return createContestStaffBatch(contestId, {
        memberIds: selectedMembers.map((member) => member.memberId),
        teamIds: values.teamIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contestStaff', contestId] });
      toast(
        assignment
          ? `${assignment.name}님의 담당 팀을 수정했어요.`
          : `${selectedMembers.length}명의 ${roleLabel}에게 ${values.teamIds.length}개 팀을 배정했어요.`,
        'success',
      );
      onClose();
    },
    onError: (error) => {
      toast(
        getApiErrorMessage(error, isEditMode ? '역할 배정 수정에 실패했어요.' : '역할 배정에 실패했어요.'),
        'error',
      );
    },
  });

  const handleSubmit = () => {
    if (!isEditMode && selectedMembers.length === 0) {
      toast('역할을 배정할 회원을 선택해주세요.', 'error');
      return;
    }
    if (values.teamIds.length === 0) {
      toast('담당 팀을 선택해주세요.', 'error');
      return;
    }

    submitAssignment();
  };

  const dialogTitle = isEditMode ? '담당 팀 수정' : '담당 팀 배정';
  const dialogDescription = isEditMode
    ? `${assignment?.name ?? ''}님의 담당 팀을 수정할 수 있어요.`
    : `이메일로 ${roleLabel}의 담당 팀을 배정할 수 있어요.`;
  const submitButtonText = isEditMode ? '수정' : '일괄 배정';
  const submittingButtonText = isEditMode ? '수정 중' : '배정 중';

  return (
    <DialogContent className="max-h-[calc(100vh-32px)] w-[600px] max-w-[92vw] grid-rows-[auto_minmax(0,1fr)_auto] items-stretch gap-8 overflow-hidden rounded-lg border bg-white p-6 sm:max-h-[calc(100vh-48px)] sm:p-8">
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-2xl leading-8 font-bold text-black">{dialogTitle}</DialogTitle>
        <p className="text-midGray text-sm leading-5">{dialogDescription}</p>
      </div>

      <div className="flex min-h-0 flex-col gap-5 overflow-y-auto pr-1">
        <ModalField
          label="회원 이메일"
          field="member"
          scrollBlock="center"
          onFieldFocus={handleFieldFocus}
          onFieldBlur={handleFieldBlur}
        >
          <div className="flex flex-col gap-2">
            <div
              className={cn(
                'border-lightGray flex min-h-[115px] flex-wrap content-start items-start gap-2 rounded-md border bg-white px-4 py-3 transition-colors duration-300 ease-in-out',
                focusedField === 'member' && 'border-mainBlue',
                isEditMode && 'bg-gray-50',
              )}
              onClick={() => {
                if (!isEditMode) memberInputRef.current?.focus();
              }}
            >
              {selectedMembers.map((member) => (
                <MemberChip
                  key={member.memberId}
                  member={member}
                  onRemove={isEditMode ? undefined : () => removeMember(member.memberId)}
                />
              ))}
              {!isEditMode && (
                <input
                  ref={memberInputRef}
                  type="search"
                  value={values.memberEmailQuery}
                  onChange={(event) => handleMemberQueryChange(event.target.value)}
                  placeholder={selectedMembers.length > 0 ? '이메일 추가 검색' : '회원 이메일로 검색'}
                  className="placeholder:text-midGray h-8 min-w-[180px] flex-1 text-sm focus:outline-none"
                />
              )}
              {!isEditMode && memberKeyword.length > 0 && (
                <div className="border-lightGray flex max-h-48 w-full basis-full flex-col overflow-y-auto rounded-md border bg-white p-1">
                  {isDebouncingMemberSearch || isFetchingMembers ? (
                    <p className="text-midGray py-4 text-center text-sm">검색 중이에요.</p>
                  ) : memberOptions.length === 0 ? (
                    <p className="text-midGray py-4 text-center text-sm">검색 결과가 없어요.</p>
                  ) : (
                    memberOptions.map((member) => (
                      <MemberOption
                        key={member.memberId}
                        member={member}
                        selected={selectedMemberIds.has(member.memberId)}
                        onToggle={() => toggleMember(member)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </ModalField>

        <ModalField label="역할" field="role" onFieldFocus={handleFieldFocus} onFieldBlur={handleFieldBlur}>
          <div
            className={cn(
              'border-lightGray flex h-[42px] items-center rounded-md border bg-gray-50 px-4 text-sm font-medium text-neutral-800 transition-colors duration-300 ease-in-out focus:outline-none',
              focusedField === 'role' && 'border-mainBlue',
            )}
            tabIndex={0}
          >
            {roleLabel}
          </div>
        </ModalField>

        <ModalField
          label="팀"
          field="team"
          scrollBlock="center"
          onFieldFocus={handleFieldFocus}
          onFieldBlur={handleFieldBlur}
        >
          <div className="flex flex-col gap-2">
            <Popover
              open={isTeamDropdownOpen}
              onOpenChange={(open) => {
                setIsTeamDropdownOpen(open);
                setFocusedField(open ? 'team' : null);
              }}
            >
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    'border-lightGray flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-left transition-colors duration-300 ease-in-out focus:outline-none',
                    (focusedField === 'team' || isTeamDropdownOpen) && 'border-mainBlue',
                  )}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isTeamDropdownOpen}
                >
                  <div className="flex min-h-7 min-w-0 flex-1 flex-wrap gap-2">
                    {selectedTeams.length === 0 ? (
                      <span className="text-midGray flex h-7 items-center text-sm">팀 이름</span>
                    ) : (
                      selectedTeams.map((team) => (
                        <TeamChip key={team.teamId} team={team} onRemove={() => toggleTeam(team.teamId)} />
                      ))
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      'text-midGray size-4 shrink-0 transition-transform',
                      isTeamDropdownOpen && 'rotate-180',
                    )}
                    aria-hidden
                  />
                </div>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                sideOffset={4}
                onOpenAutoFocus={(event) => event.preventDefault()}
                onWheel={(event) => event.stopPropagation()}
                onTouchMove={(event) => event.stopPropagation()}
                className="border-lightGray pointer-events-auto z-[70] max-h-56 w-[var(--radix-popover-trigger-width)] overflow-y-auto overscroll-contain bg-white p-1 shadow-lg"
              >
                {isFetchingTeams && availableTeams.length === 0 ? (
                  <p className="text-midGray py-4 text-center text-sm">팀 목록을 불러오는 중이에요.</p>
                ) : availableTeams.length === 0 ? (
                  <p className="text-midGray py-4 text-center text-sm">선택할 팀이 없어요.</p>
                ) : (
                  availableTeams.map((team) => (
                    <TeamOption
                      key={team.teamId}
                      team={team}
                      selected={values.teamIds.includes(team.teamId)}
                      onToggle={() => toggleTeam(team.teamId)}
                    />
                  ))
                )}
              </PopoverContent>
            </Popover>
          </div>
        </ModalField>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <DialogClose asChild>
          <AdminActionButton type="button" variant="outline" className="min-w-[100px]" onClick={onClose}>
            취소
          </AdminActionButton>
        </DialogClose>
        <AdminActionButton type="button" className="min-w-[100px]" onClick={handleSubmit}>
          {isSubmitting ? submittingButtonText : submitButtonText}
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};

interface ModalFieldProps {
  label: string;
  field: FocusedField;
  scrollBlock?: ScrollLogicalPosition;
  onFieldFocus: (field: FocusedField, fieldElement: HTMLDivElement | null, block?: ScrollLogicalPosition) => void;
  onFieldBlur: (field: FocusedField) => void;
  children: ReactNode;
}

const ModalField = ({
  label,
  field,
  scrollBlock = 'nearest',
  onFieldFocus,
  onFieldBlur,
  children,
}: ModalFieldProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const activateField = () => onFieldFocus(field, fieldRef.current, scrollBlock);

  return (
    <div
      ref={fieldRef}
      className="flex flex-col gap-2"
      onFocusCapture={activateField}
      onMouseDownCapture={activateField}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onFieldBlur(field);
        }
      }}
    >
      <span className="text-base leading-7 font-medium text-black">{label}</span>
      {children}
    </div>
  );
};

const MemberChip = ({ member, onRemove }: { member: AssignableMember; onRemove?: () => void }) => {
  return (
    <span className="inline-flex h-8 max-w-full items-center gap-2 rounded-full bg-sky-50 px-3 text-sm text-neutral-900">
      <span className="shrink-0 font-medium">{member.name}</span>
      <span className="min-w-0 truncate">{member.email}</span>
      {onRemove && (
        <button
          type="button"
          className="text-mainBlue shrink-0 rounded-full p-0.5 hover:bg-white/60"
          onClick={onRemove}
          aria-label={`${member.email} 선택 해제`}
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
};

interface MemberOptionProps {
  member: AssignableMember;
  selected: boolean;
  onToggle: () => void;
}

const MemberOption = ({ member, selected, onToggle }: MemberOptionProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex min-h-12 w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
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
        {selected && <Check className="text-mainBlue size-4" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-darkGray truncate text-sm font-medium">{member.name}</span>
        <span className="text-midGray truncate text-sm">{member.email}</span>
      </span>
    </button>
  );
};

const TeamChip = ({ team, onRemove }: { team: AssignableTeam; onRemove: () => void }) => {
  const teamName = getTrimmedValue(team.teamName);

  return (
    <span className="inline-flex h-7 max-w-full items-center gap-2 rounded-full bg-sky-50 px-3 text-sm text-neutral-800">
      <span className="min-w-0 truncate">{teamName}</span>
      <button
        type="button"
        className="text-midGray shrink-0 rounded-full p-0.5 hover:bg-white"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        aria-label={`${teamName} 선택 해제`}
      >
        <X size={13} />
      </button>
    </span>
  );
};

const TeamOption = ({
  team,
  selected,
  onToggle,
}: {
  team: AssignableTeam;
  selected: boolean;
  onToggle: () => void;
}) => {
  const teamName = getTrimmedValue(team.teamName);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex min-h-10 w-full items-center gap-3 rounded-md px-4 text-left transition-colors',
        selected ? 'bg-whiteGray' : 'hover:bg-whiteGray',
      )}
    >
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">{teamName}</span>
      <Check className={cn('text-mainBlue size-4 shrink-0', !selected && 'invisible')} aria-hidden />
    </button>
  );
};
