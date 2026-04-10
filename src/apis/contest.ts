import apiClient from './apiClient';
import axios from 'axios';

import {
  ContestRequestDto,
  ContestResponseDto,
  CurrentContestResponseDto,
  ContestBulkAddTeamsResponseDto,
  GroupedContestResponseDto,
  ProjectsAdminResponseDto,
  TeamCustomSortData,
  TeamSortOption,
} from '@dto/contestsDto';
import { TeamListItemResponseDto } from '@dto/teams/teamListDto';

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

export const getGroupedContests = async (): Promise<GroupedContestResponseDto[]> => {
  const res = await apiClient.get('/sidebar');
  return res.data;
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

export const getCurrentContest = async (): Promise<CurrentContestResponseDto[]> => {
  const res = await apiClient.get('/contests/current');
  return res.data;
};

export const patchChangeOngoingContest = async (contestId: number, isCurrent: boolean) => {
  const res = await apiClient.patch(`/contests/${contestId}/current`, { isCurrent });
  return res.data;
};

export const getContestTeams = async (contestId: number): Promise<TeamListItemResponseDto[]> => {
  try {
    const res = await apiClient.get(`/contests/${contestId}/teams`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && [401].includes(error.response?.status ?? 0)) {
      return getContestTeamsPublic(contestId);
    }
    throw error;
  }
};

export const getContestTeamsPublic = async (contestId: number): Promise<TeamListItemResponseDto[]> => {
  const res = await apiClient.get(`/contests/${contestId}/teams/public`);
  return res.data;
};

export const postBulkAddTeams = async (
  contestId: number,
  formData: FormData,
): Promise<ContestBulkAddTeamsResponseDto> => {
  const res = await apiClient.post(`/contests/${contestId}/teams/bulk`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getSortStatus = async (contestId: number): Promise<TeamSortOption> => {
  const res = await apiClient.get(`/contests/${contestId}/sort`);
  return res.data.currentMode as TeamSortOption;
};

export const putTeamSort = async (contestId: number, mode: string) => {
  const res = await apiClient.put(`/contests/${contestId}/sort`, { mode });
  return res.data;
};

export const putTeamCustomSort = async (contestId: number, payload: TeamCustomSortData[]) => {
  const res = await apiClient.put(`/contests/${contestId}/sort/custom`, payload);
  return res.data;
};

export const getProjectsAdmin = async (contestId: number): Promise<ProjectsAdminResponseDto[]> => {
  const res = await apiClient.get<ProjectsAdminResponseDto[]>(`/contests/${contestId}/submissions`);
  return res.data;
};
