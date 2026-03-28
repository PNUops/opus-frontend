import { TeamListItemResponseDto } from '../types/DTO/teams/teamListDto';
import { SubmissionStatusResponseDto } from '../types/DTO/teams/submissionStatusDto';
import { PatchAwardRequestDto, PatchCustomOrderRequestDto, GetTeamAwardsResponseDto } from 'types/DTO';
import apiClient from './apiClient';
import { API_BASE_URL } from '@constants/env';

export type SortOption = 'RANDOM' | 'ASC' | 'CUSTOM';
export const sortOptions: { label: string; value: SortOption }[] = [
  { label: '랜덤', value: 'RANDOM' },
  { label: '오름차순', value: 'ASC' },
  { label: '직접 설정', value: 'CUSTOM' },
];

export const getAllTeams = async (contestId: number): Promise<TeamListItemResponseDto[]> => {
  const res = await apiClient.get(`/contests/${contestId}/teams`);
  return res.data;
};

export const getSubmissionStatus = async (): Promise<SubmissionStatusResponseDto> => {
  const res = await apiClient.get('/teams/submission-status');
  return res.data;
};

export const getThumbnailTeams = async (teamId: number) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/image/thumbnail`);

    if (response.status === 200) {
      return `${API_BASE_URL}/api/teams/${teamId}/image/thumbnail`;
    } else if (response.status === 202) {
      return null;
    }
    return null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
  }
};

export const deleteTeam = async (teamId: number) => {
  const res = await apiClient.delete(`/teams/${teamId}`);
  return res.data;
};

export const patchSortTeam = async (mode: string) => {
  const res = await apiClient.patch('/teams/sort', { mode: mode });
  return res.data;
};

export const getSortStatus = async (): Promise<SortOption> => {
  const res = await apiClient.get('/teams/sort');
  return res.data.currentMode as SortOption;
};

export const patchCustomSortTeam = async (payload: PatchCustomOrderRequestDto) => {
  const res = await apiClient.patch('/teams/sort/custom', payload);
  return res.data;
};

export const getTeamAwards = async (teamId: number): Promise<GetTeamAwardsResponseDto> => {
  const res = await apiClient.get(`admin/teams/${teamId}/awards`);
  return res.data;
};

export const deleteTeamAward = async (teamId: number) => {
  const payload: PatchAwardRequestDto = { awardName: null, awardColor: null };
  const res = await apiClient.patch(`admin/teams/${teamId}/awards`, payload);
  return res.data;
};

export const updateTeamAward = async (teamId: number, awardIds: number[]) => {
  const res = await apiClient.patch(`admin/teams/${teamId}/awards`, awardIds);
  return res.data;
};
