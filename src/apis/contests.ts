import { ContestRequestDto, ContestResponseDto, VoteTermDto } from 'types/DTO';
import apiClient from './apiClient';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';

export const postContest = async (payload: ContestRequestDto): Promise<ContestResponseDto> => {
  const res = await apiClient.post('/contests', payload);
  return res.data;
};

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
  return res.data;
};

export const patchContest = async (contestId: number, payload: ContestRequestDto) => {
  const res = await apiClient.patch(`/contests/${contestId}`, payload);
  return res.data;
};

export const getCurrentContestTeams = async (): Promise<TeamListItemResponseDto[]> => {
  const res = await apiClient.get('/contests/current/teams');
  return res.data;
};

export const patchChangeOngoingContest = async (contestId: number, isCurrent: boolean) => {
  const res = await apiClient.patch(`/contests/${contestId}/current`, { isCurrent });
  return res.data;
};

export const getContestTeams = async (contestId: number): Promise<TeamListItemResponseDto[]> => {
  const res = await apiClient.get(`/contests/${contestId}/teams`);
  return res.data;
};

export const postBulkAddTeams = async (contestId: number, formData: FormData) => {
  const res = await apiClient.post(`/contests/${contestId}/teams/bulk`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
