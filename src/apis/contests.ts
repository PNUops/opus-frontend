import { ContestResponseDto, CurrentContestResponseDto, VoteTermDto } from 'types/DTO';
import apiClient from './apiClient';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';

export const getAllContests = async (): Promise<ContestResponseDto[]> => {
  const res = await apiClient.get('/contests');
  return res.data.map((contest: ContestResponseDto) => ({
    ...contest,
    updatedAt: new Date(contest.updatedAt),
  }));
};

export const postAllContests = async (contestName: string) => {
  const res = await apiClient.post('/contests', { contestName });
  return res.data;
};

export const deleteContest = async (contestId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}`);
  console.log(res);
  return res.data;
};

export const patchContest = async (contestId: number, contestName: string) => {
  const res = await apiClient.patch(`/contests/${contestId}`, { contestName });
  return res.data;
};

export const getCurrentContest = async (): Promise<CurrentContestResponseDto[]> => {
  const res = await apiClient.get('/contests/current');
  return res.data;
};

export const getContestTeams = async (contestId: number): Promise<TeamListItemResponseDto[]> => {
  const res = await apiClient.get(`/contests/${contestId}/teams`);
  return res.data;
};

export const getVoteTerm = async (contestId: number): Promise<VoteTermDto> => {
  const res = await apiClient.get(`/contests/${contestId}/vote`);
  return res.data;
};

export const updateVoteTerm = async (contestId: number, payload: VoteTermDto) => {
  const res = await apiClient.put(`/contests/${contestId}/vote`, payload);
  return res.data;
};

export const postBanner = async (contestId: number, formData: FormData) => {
  // Ensure the request is sent as multipart/form-data
  const response = await apiClient.post(`/contests/${contestId}/image/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const getBannerUrl = async (contestId: number): Promise<string | null> => {
  try {
    // Request the image as blob and return an Object URL so the browser doesn't need to call the protected endpoint again
    const res = await apiClient.get(`/contests/${contestId}/image/banner`, { responseType: 'blob' });
    const blob = res.data as Blob;
    const objUrl = URL.createObjectURL(blob);
    return objUrl;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const deleteBanner = async (contestId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/image/banner`);
  return res;
};
