import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { advisorContestsOption, advisorProjectsOption, advisorTeamSubmissionsOption } from '@queries/advisor';
import { parsePositiveId } from '@utils/id';

export const useAdvisorSelection = (isAdvisor: boolean) => {
  const { contestId: contestIdParam } = useParams<{ contestId?: string }>();
  const [searchParams] = useSearchParams();
  const contestParams = contestIdParam === undefined ? searchParams.getAll('contestId') : [contestIdParam];
  const teamParams = searchParams.getAll('teamId');
  const requestedContestId =
    contestParams.length === 0 ? undefined : contestParams.length === 1 ? parsePositiveId(contestParams[0]) : null;
  const requestedTeamId =
    teamParams.length === 0 ? undefined : teamParams.length === 1 ? parsePositiveId(teamParams[0]) : null;

  const advisorContestsQuery = useQuery({ ...advisorContestsOption(), enabled: isAdvisor });
  const contests = isAdvisor && advisorContestsQuery.isSuccess ? advisorContestsQuery.data : [];
  const selectedContest =
    (requestedContestId === undefined
      ? contests[0]
      : contests.find((contest) => contest.contestId === requestedContestId)) ?? null;
  const contestId = selectedContest?.contestId ?? null;

  // URL 또는 대회가 바뀌면 선택만 초기화한다. 편집 중인 데이터는 페이지에서 보존한다.
  const scope = JSON.stringify([contestParams, teamParams, contestId]);
  const [selection, setSelection] = useState<{
    scope: string;
    teamId: number | null | undefined;
    submissionId: number | null;
  }>({ scope, teamId: undefined, submissionId: null });
  const currentSelection = selection.scope === scope ? selection : { scope, teamId: undefined, submissionId: null };
  // effect를 기다리는 동안 이전 선택으로 조회하지 않도록 같은 렌더에서 선택 범위를 맞춘다.
  if (selection.scope !== scope) setSelection(currentSelection);

  const advisorProjectsQuery = useQuery({
    ...advisorProjectsOption(contestId ?? 0),
    enabled: isAdvisor && contestId !== null,
  });
  const advisorProjects = contestId !== null && advisorProjectsQuery.isSuccess ? advisorProjectsQuery.data : [];
  const preferredTeamId = requestedTeamId === undefined ? advisorProjects[0]?.teamId : requestedTeamId;
  const candidateTeamId = currentSelection.teamId === undefined ? preferredTeamId : currentSelection.teamId;
  const expandedTeamId = advisorProjects.find((project) => project.teamId === candidateTeamId)?.teamId ?? null;

  const teamSubmissionsQuery = useQuery({
    ...advisorTeamSubmissionsOption(contestId ?? 0, expandedTeamId ?? 0),
    enabled: isAdvisor && contestId !== null && expandedTeamId !== null,
  });
  const teamSubmissions =
    expandedTeamId !== null && teamSubmissionsQuery.isSuccess && teamSubmissionsQuery.data.teamId === expandedTeamId
      ? teamSubmissionsQuery.data
      : undefined;
  const selectedSubmissionId = teamSubmissions?.submissions.some(
    (submission) => submission.submissionId === currentSelection.submissionId,
  )
    ? currentSelection.submissionId
    : (teamSubmissions?.submissions[0]?.submissionId ?? null);

  const toggleTeam = (teamId: number) => {
    if (!advisorProjects.some((project) => project.teamId === teamId)) return;
    setSelection({ scope, teamId: expandedTeamId === teamId ? null : teamId, submissionId: null });
  };
  const selectSubmission = (submissionId: number) => {
    if (!teamSubmissions?.submissions.some((submission) => submission.submissionId === submissionId)) return;
    setSelection({ scope, teamId: expandedTeamId, submissionId });
  };

  return {
    requestedContestId,
    requestedTeamId,
    selectedContest,
    contestId,
    advisorContestsQuery,
    advisorProjectsQuery,
    advisorProjects,
    teamSubmissionsQuery,
    teamSubmissions,
    expandedTeamId,
    selectedSubmissionId,
    toggleTeam,
    selectSubmission,
  };
};
