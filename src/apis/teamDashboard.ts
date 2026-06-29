import apiClient from './apiClient';
import type { GetUpcomingSubmissionsResponseDto, TeamDashboardSummaryResponseDto } from '@dto/teamDashboardDto';

export const getTeamDashboardSummary = async (
  contestId: number,
  teamId: number,
): Promise<TeamDashboardSummaryResponseDto> => {
  const res = await apiClient.get<TeamDashboardSummaryResponseDto>(`/contests/${contestId}/teams/${teamId}/summary`);
  return res.data;
};

export const getUpcomingSubmissions = async (
  contestId: number,
  teamId: number,
): Promise<GetUpcomingSubmissionsResponseDto> => {
  const res = await apiClient.get<GetUpcomingSubmissionsResponseDto>(`/contests/${contestId}/submissions/upcoming`, {
    params: { teamId },
  });
  return res.data;
};
