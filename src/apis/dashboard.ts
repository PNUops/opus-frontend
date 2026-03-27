import apiClient from './apiClient';
import { DashboardTeamResponseDto } from '../types/DTO';

export const getDashboard = async (): Promise<DashboardTeamResponseDto[]> => {
  const { data } = await apiClient.get<DashboardTeamResponseDto[]>('/admin/dashboard');
  return data;
};
