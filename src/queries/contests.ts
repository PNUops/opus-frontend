import { queryOptions } from '@tanstack/react-query';
import { getAllContests, getCurrentContest } from 'apis/contest';

export const contestOption = () => {
  return queryOptions({ queryKey: ['contests'], queryFn: getAllContests });
};

export const currentContestOption = () => {
  return queryOptions({ queryKey: ['currentContests'], queryFn: getCurrentContest });
};
