import apiClient from './apiClient';
import { TeamLikeResponseDto } from '@dto/teamsLikeDto';

export const getRanking = async (): Promise<TeamLikeResponseDto[]> => {
  const { data } = await apiClient.get<TeamLikeResponseDto[]>('/admin/ranking');
  return data;
};
