import apiClient from './apiClient';
import { DashboardTeamResponseDto } from '@dto/dashboardDto';

export const getDashboard = async (): Promise<DashboardTeamResponseDto[]> => {
  const { data } = await apiClient.get<DashboardTeamResponseDto[]>('/admin/dashboard');
  return data;
};
