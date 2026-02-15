import apiClient from './apiClient';

import {
  ContestRequestDto,
  ContestResponseDto,
  CurrentContestResponseDto,
  VoteTermDto,
  GetContestAwardsResponseDto,
  PatchContestAwardRequestDto,
  PostContestTrackRequestDto,
} from 'types/DTO';
import { ProjectsAdminResponseDto, GetContestTracksResponseDto } from 'types/DTO';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';
import { AwardDto } from 'types/DTO/awardsDto';

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

export const getCurrentContest = async (): Promise<CurrentContestResponseDto[]> => {
  const res = await apiClient.get('/contests/current');
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

export const getProjectsAdmin = async (contestId: number): Promise<ProjectsAdminResponseDto[]> => {
  const res = await apiClient.get<ProjectsAdminResponseDto[]>(`/admin/contests/${contestId}/submissions`);
  return res.data;
};

/**
 * @description 분과 API
 */

export const getContestTracks = async (contestId: number): Promise<GetContestTracksResponseDto> => {
  const res = await apiClient.get<GetContestTracksResponseDto>(`/contests/${contestId}/tracks`);
  return res.data;
};

export const createContestTrack = async (contestId: number, payload: PostContestTrackRequestDto) => {
  const res = await apiClient.post(`/contests/${contestId}/tracks`, payload);
  return res.data;
};

export const updateContestTrack = async (contestId: number, trackId: number, payload: PostContestTrackRequestDto) => {
  const res = await apiClient.patch(`/contests/${contestId}/tracks/${trackId}`, payload);
  return res.data;
};

export const deleteContestTrack = async (contestId: number, trackId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/tracks/${trackId}`);
  return res.data;
};

/**
 * @description 대회 수상 API
 */

export const getContestAwards = async (contestId: number): Promise<GetContestAwardsResponseDto> => {
  const res = await apiClient.get<GetContestAwardsResponseDto>(`/contests/${contestId}/awards`);
  return res.data;
};

export const createContestAward = async (contestId: number, payload: AwardDto) => {
  const res = await apiClient.post(`/contests/${contestId}/awards`, payload);
  return res.data;
};

export const updateContestAward = async (contestId: number, awardId: number, payload: PatchContestAwardRequestDto) => {
  const res = await apiClient.patch(`/contests/${contestId}/awards/${awardId}`, payload);
  return res.data;
};

export const deleteContestAward = async (contestId: number, awardId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/awards/${awardId}`);
  return res.data;
};
