import { queryOptions } from '@tanstack/react-query';

import { getTeamDashboardSummary, getUpcomingSubmissions } from '@apis/teamDashboard';

export const TEAM_DASHBOARD_QUERY_KEY = ['teamDashboard'] as const;

export const teamDashboardSummaryOption = (contestId: number, teamId: number) =>
  queryOptions({
    queryKey: [...TEAM_DASHBOARD_QUERY_KEY, 'summary', contestId, teamId],
    queryFn: () => getTeamDashboardSummary(contestId, teamId),
    staleTime: 60 * 1000,
  });

export const upcomingSubmissionsOption = (contestId: number, teamId: number) =>
  queryOptions({
    queryKey: [...TEAM_DASHBOARD_QUERY_KEY, 'upcomingSubmissions', contestId, teamId],
    queryFn: () => getUpcomingSubmissions(contestId, teamId),
    staleTime: 60 * 1000,
  });
