import apiClient from './apiClient';
import { VoteLogResponseDto } from 'types/DTO';

export const getVoteLog = async (): Promise<VoteLogResponseDto> => {
  const { data } = await apiClient.get<VoteLogResponseDto>('/admin/vote-log');
  return data;
};
