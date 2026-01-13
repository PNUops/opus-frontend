import { ContestResponseDto } from 'types/DTO';
import apiClient from './apiClient';
import { mockContestsResponse } from 'mocks/data/contests';
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

export const getCurrentContestTeams = async (): Promise<TeamListItemResponseDto[]> => {
  const res = await apiClient.get('/contests/current/teams');
  return res.data;
};

export const getContestTeams = async (contestId: number): Promise<TeamListItemResponseDto[]> => {
  const res = await apiClient.get(`/contests/${contestId}/teams`);
  return res.data;
};
