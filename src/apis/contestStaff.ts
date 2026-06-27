import apiClient from '@apis/apiClient';

import {
  CreateContestStaffBatchRequest,
  GetContestStaffParams,
  GetContestStaffResponse,
  SearchStaffMembersParams,
  StaffMemberSearchResult,
  UpdateContestStaffRequest,
} from '@dto/contestStaffDto';
import type { MemberType } from 'types/MemberType';

interface StaffMemberSearchResponseItem {
  id?: number;
  memberId?: number;
  name?: string;
  memberName?: string;
  email?: string;
  memberEmail?: string;
  roles?: MemberType[] | MemberType;
  memberType?: MemberType | 'ROLE_멘토';
}

type StaffRoleTypeLike = MemberType | 'ROLE_멘토' | undefined;

const normalizeStaffRoleType = (roleType: StaffRoleTypeLike): StaffMemberSearchResult['roleType'] | null => {
  if (roleType === 'ROLE_교수') return 'ROLE_교수';
  if (roleType === 'ROLE_외부멘토' || roleType === 'ROLE_멘토') return 'ROLE_외부멘토';
  return null;
};

const toStaffMemberSearchResult = (member: StaffMemberSearchResponseItem): StaffMemberSearchResult | null => {
  const roles = Array.isArray(member.roles) ? member.roles : [member.roles];
  const roleType =
    roles.map(normalizeStaffRoleType).find((role): role is StaffMemberSearchResult['roleType'] => Boolean(role)) ??
    normalizeStaffRoleType(member.memberType);
  const memberId = member.memberId ?? member.id;
  const name = member.memberName ?? member.name;
  const email = member.memberEmail ?? member.email;

  if (!memberId || !name || !email || !roleType) return null;

  return { memberId, name, email, roleType };
};

export const getContestStaff = async ({
  contestId,
  memberType,
  search,
}: GetContestStaffParams): Promise<GetContestStaffResponse> => {
  const res = await apiClient.get<GetContestStaffResponse>(`/contests/${contestId}/staff`, {
    params: {
      memberType,
      search,
    },
  });

  return res.data;
};

export const createContestStaffBatch = async (
  contestId: number,
  payload: CreateContestStaffBatchRequest,
): Promise<void> => {
  const res = await apiClient.post<void>(`/contests/${contestId}/staff/batch`, payload);
  return res.data;
};

export const updateContestStaff = async (
  contestId: number,
  contestMemberId: number,
  payload: UpdateContestStaffRequest,
): Promise<void> => {
  const res = await apiClient.patch<void>(`/contests/${contestId}/staff/${contestMemberId}`, payload);
  return res.data;
};

export const deleteContestStaff = async (contestId: number, contestMemberId: number): Promise<void> => {
  const res = await apiClient.delete<void>(`/contests/${contestId}/staff/${contestMemberId}`);
  return res.data;
};

export const searchStaffMembers = async ({
  keyword,
  memberType,
}: SearchStaffMembersParams): Promise<StaffMemberSearchResult[]> => {
  const res = await apiClient.get<StaffMemberSearchResponseItem[]>('/admin/members/search', {
    params: {
      keyword,
      memberType,
    },
  });

  return res.data.map(toStaffMemberSearchResult).filter((member): member is StaffMemberSearchResult => member !== null);
};
