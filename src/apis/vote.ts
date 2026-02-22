import { VoteMaxVotesLimitDto, VoteTermDto } from 'types/DTO';
import apiClient from './apiClient';

export const getVoteTerm = async (contestId: number): Promise<VoteTermDto> => {
  const res = await apiClient.get(`/contests/${contestId}/vote`);
  return res.data;
};

export const putVoteTerm = async (contestId: number, payload: VoteTermDto) => {
  const res = await apiClient.put(`/contests/${contestId}/vote`, payload);
  return res.data;
};

export const getMaxVoteLimit = async (contestId: number): Promise<VoteMaxVotesLimitDto> => {
  const res = await apiClient.get(`/contests/${contestId}/votes`);
  return res.data;
};

export const patchMaxVoteLimit = async (contestId: number, payload: VoteMaxVotesLimitDto) => {
  const res = await apiClient.patch(`/contests/${contestId}/votes`, payload);
  return res.data;
};
