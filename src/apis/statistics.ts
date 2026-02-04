import apiClient from './apiClient';
import { VoteRankingDto, VoteStatsDto, VoteLogItemDto } from 'types/DTO';

export const getVoteRanking = async (contestId: number): Promise<VoteRankingDto[]> => {
  const res = await apiClient.get(`/admin/contests/${contestId}/ranking`);
  return res.data;
};

export const getVoteStats = async (contestId: number): Promise<VoteStatsDto> => {
  const res = await apiClient.get(`/admin/contests/${contestId}/votes-stats`);
  return res.data;
};

export const getVoteLog = async (): Promise<VoteLogItemDto[]> => {
  const { data } = await apiClient.get('/admin/vote-log');
  return data;
};
