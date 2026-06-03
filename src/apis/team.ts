import { TeamListItemResponseDto } from '@dto/teams/teamListDto';
import { SubmissionStatusResponseDto } from '@dto/teams/submissionStatusDto';
import { GetTeamAwardsResponseDto } from '@dto/contestsDto';
import apiClient from './apiClient';

export const getAllTeams = async (contestId: number): Promise<TeamListItemResponseDto[]> => {
  const res = await apiClient.get(`/contests/${contestId}/teams`);
  return res.data;
};

export const getSubmissionStatus = async (): Promise<SubmissionStatusResponseDto> => {
  const res = await apiClient.get('/teams/submission-status');
  return res.data;
};

export const deleteTeam = async (teamId: number) => {
  const res = await apiClient.delete(`/teams/${teamId}`);
  return res.data;
};

export const getTeamAwards = async (teamId: number): Promise<GetTeamAwardsResponseDto> => {
  const res = await apiClient.get(`/admin/teams/${teamId}/awards`);
  return res.data.awards;
};

export const deleteTeamAward = async (teamId: number) => {
  const res = await apiClient.delete(`/admin/teams/${teamId}/awards`);
  return res.data;
};

export const updateTeamAward = async (teamId: number, awardIds: number[]) => {
  const res = await apiClient.put(`/admin/teams/${teamId}/awards`, { awardIds });
  return res.data;
};
