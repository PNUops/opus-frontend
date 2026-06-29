import { MemberType } from 'types/MemberType';

export type ContestStaffMemberType = Extract<MemberType, 'ROLE_교수' | 'ROLE_외부멘토'>;

export interface ContestStaff {
  contestMemberId: number;
  memberId: number;
  name: string;
  email: string;
  roleType: ContestStaffMemberType;
  teams: ContestStaffTeam[];
}

export interface ContestStaffTeam {
  teamId: number;
  teamName: string;
}

export interface GetContestStaffParams {
  contestId: number;
  memberType?: ContestStaffMemberType;
  search?: string;
}

export type GetContestStaffResponse = ContestStaff[];

export interface CreateContestStaffBatchRequest {
  memberIds: number[];
  teamIds: number[];
}

export interface UpdateContestStaffRequest {
  addTeamIds: number[];
  deleteTeamIds: number[];
}
