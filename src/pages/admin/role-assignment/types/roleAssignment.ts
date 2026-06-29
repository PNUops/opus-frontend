import type { ContestStaff, ContestStaffMemberType, ContestStaffTeam } from '@dto/contestStaffDto';
import type { AdminMemberSearchResultDto } from '@dto/memberDto';

export type RoleType = ContestStaffMemberType;

export type AssignedTeam = ContestStaffTeam;

export type RoleAssignment = ContestStaff;

export interface AssignableTeam extends AssignedTeam {
  trackName: string | null;
}

export type AssignableMember = AdminMemberSearchResultDto;

export interface RoleAssignmentFormValues {
  memberEmailQuery: string;
  teamIds: number[];
}
