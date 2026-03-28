import { useContestIdOrRedirect } from './useId';
import { useQuery } from '@tanstack/react-query';
import { contestsOption } from 'queries/contest';

const useContestName = () => {
  const contestId = useContestIdOrRedirect();
  const { data: contests } = useQuery(contestsOption());
  const contestName = contests?.find((contest) => contest.contestId === Number(contestId))?.contestName;

  return contestName;
};

export default useContestName;
