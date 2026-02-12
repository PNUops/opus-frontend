import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const useTeamId = (): number | null => {
  const { teamId } = useParams<{ teamId: string }>();
  const parsedTeamId = Number(teamId);
  return !teamId || isNaN(parsedTeamId) ? null : parsedTeamId;
};

export const useContestId = (): number | null => {
  const { contestId } = useParams<{ contestId: string }>();
  const parsedContestId = Number(contestId);
  return !contestId || isNaN(parsedContestId) ? null : parsedContestId;
};

export const useContestIdOrRedirect = (redirectTo: string = '/'): number => {
  const navigate = useNavigate();
  const contestId = useContestId();

  useEffect(() => {
    if (contestId === null) {
      navigate(redirectTo, { replace: true });
    }
  }, [contestId, navigate, redirectTo]);

  return contestId as number;
};
