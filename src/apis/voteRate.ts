import apiClient from './apiClient';
import { VoteRateResponseDto } from '../types/DTO';

export const getVoteRate = async (): Promise<VoteRateResponseDto> => {
  const { data } = await apiClient.get<VoteRateResponseDto>('/admin/participation-rate');
  return data;
};
