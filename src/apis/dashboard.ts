import apiClient from './apiClient';
import { AdminRecentActivityDto, DashboardTeamResponseDto } from '@dto/dashboardDto';

export const getDashboard = async (): Promise<DashboardTeamResponseDto[]> => {
  const { data } = await apiClient.get<DashboardTeamResponseDto[]>('/admin/dashboard');
  return data;
};

export const getRecentAdminActivities = async (): Promise<AdminRecentActivityDto[]> => {
  const { data } = await apiClient.get<AdminRecentActivityDto[]>('/admin/dashboard/recent-activities');
  return data;
};
