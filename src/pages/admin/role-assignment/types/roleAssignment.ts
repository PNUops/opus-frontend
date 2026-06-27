import type {
  ContestStaff,
  ContestStaffMemberType,
  ContestStaffTeam,
  StaffMemberSearchResult,
} from '@dto/contestStaffDto';

export type RoleType = ContestStaffMemberType;

export type AssignedTeam = ContestStaffTeam;

export type RoleAssignment = ContestStaff;

export interface AssignableTeam extends AssignedTeam {
  trackName: string;
}

export type AssignableMember = StaffMemberSearchResult;

export interface ContestTrack {
  trackId: number;
  trackName: string;
}

export interface RoleAssignmentFormValues {
  memberId: number | null;
  memberEmailQuery: string;
  roleType: RoleType;
  trackName: string | null;
  teamSearch: string;
  teamIds: number[];
}
