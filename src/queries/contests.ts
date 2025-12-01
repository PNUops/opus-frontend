import { queryOptions } from '@tanstack/react-query';
import { getAllContests } from 'apis/contests';

export const contestOption = () => {
  return queryOptions({ queryKey: ['contests'], queryFn: getAllContests });
};
