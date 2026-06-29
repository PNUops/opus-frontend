import { queryOptions, type QueryClient } from '@tanstack/react-query';

import { getAdvisorProjects, getAdvisorTeamSubmissions, getMyAdvisorFeedback } from '@apis/advisor';

export const ADVISOR_ACTIVITY_QUERY_KEY = ['advisorActivity'] as const;

export const advisorProjectsOption = (contestId: number) =>
  queryOptions({
    queryKey: [...ADVISOR_ACTIVITY_QUERY_KEY, 'projects', contestId],
    queryFn: () => getAdvisorProjects(contestId),
    staleTime: 60 * 1000,
  });

export const advisorTeamSubmissionsOption = (contestId: number, teamId: number) =>
  queryOptions({
    queryKey: [...ADVISOR_ACTIVITY_QUERY_KEY, 'teamSubmissions', contestId, teamId],
    queryFn: () => getAdvisorTeamSubmissions(contestId, teamId),
    staleTime: 60 * 1000,
  });

export const advisorFeedbackOption = (contestId: number, submissionId: number) =>
  queryOptions({
    queryKey: [...ADVISOR_ACTIVITY_QUERY_KEY, 'feedback', contestId, submissionId],
    queryFn: () => getMyAdvisorFeedback(contestId, submissionId),
    staleTime: 60 * 1000,
  });

export const invalidateAdvisorActivityQueries = (
  queryClient: QueryClient,
  contestId: number,
  teamId?: number,
  submissionId?: number,
) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [...ADVISOR_ACTIVITY_QUERY_KEY, 'projects', contestId] }),
    teamId
      ? queryClient.invalidateQueries({
          queryKey: [...ADVISOR_ACTIVITY_QUERY_KEY, 'teamSubmissions', contestId, teamId],
        })
      : Promise.resolve(),
    submissionId
      ? queryClient.invalidateQueries({
          queryKey: [...ADVISOR_ACTIVITY_QUERY_KEY, 'feedback', contestId, submissionId],
        })
      : Promise.resolve(),
  ]);
