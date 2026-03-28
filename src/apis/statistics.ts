import apiClient from './apiClient';
import {
  MainStatsDto,
  VoteRankingDto,
  VoteStatsDto,
  VoteLogItemDto,
  PaginationRequestDto,
  PaginationResponseDto,
} from 'types/DTO';

export const getMainStats = async (): Promise<MainStatsDto> => {
  const res = await apiClient.get('/statistics/summary');
  return res.data;
};

export const getVoteRanking = async (contestId: number): Promise<VoteRankingDto[]> => {
  const res = await apiClient.get(`/contests/${contestId}/ranking`);
  return res.data;
};

export const getVoteStats = async (contestId: number): Promise<VoteStatsDto> => {
  const res = await apiClient.get(`/contests/${contestId}/votes/statistics`);
  return res.data;
};

export const getVoteLog = async (
  contestId: number,
  pagination: PaginationRequestDto,
): Promise<PaginationResponseDto<VoteLogItemDto>> => {
  const { data } = await apiClient.get(`/contests/${contestId}/vote-log`, { params: pagination });
  return data;
};
