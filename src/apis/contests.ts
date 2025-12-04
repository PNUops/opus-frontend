import apiClient from './apiClient';

import { ContestResponseDto, VoteTermDto } from 'types/DTO';
import { ProjectsAdminResponseDto } from 'types/DTO';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';

import { mockProjectsAdminResponse } from '@mocks/data/contests';

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

export const getCurrentContestTeams = async (): Promise<TeamListItemResponseDto[]> => {
  const res = await apiClient.get('/contests/current/teams');
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

export const getProjectsAdmin = async (contestId: number): Promise<ProjectsAdminResponseDto[]> => {
  // const res = await apiClient.get<ProjectsAdminResponseDto[]>(`/admin/contests/${contestId}/dashboard`);
  // return res.data;
  return mockProjectsAdminResponse;
};
