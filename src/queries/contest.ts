import { queryOptions } from '@tanstack/react-query';
import { getAllContests, getContestTeams, getCurrentContest, getSortStatus } from 'apis/contest';

export const contestsOption = () => {
  return queryOptions({ queryKey: ['contests'], queryFn: getAllContests });
};

export const currentContestOption = () => {
  return queryOptions({ queryKey: ['currentContests'], queryFn: getCurrentContest });
};

export const contestTeamOption = (contestId: number) => {
  return queryOptions({ queryKey: ['teams', contestId], queryFn: () => getContestTeams(contestId) });
};

export const sortStatusOption = (contestId: number) => {
  return queryOptions({ queryKey: ['sortStatus'], queryFn: () => getSortStatus(contestId) });
};
