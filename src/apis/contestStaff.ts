import apiClient from '@apis/apiClient';

import {
  CreateContestStaffBatchRequest,
  GetContestStaffParams,
  GetContestStaffResponse,
  UpdateContestStaffRequest,
} from '@dto/contestStaffDto';

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
