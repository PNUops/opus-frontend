import { useQuery } from '@tanstack/react-query';
import { getAllContests } from 'apis/contest';

const useContests = () => {
  return useQuery({ queryKey: ['contests'], queryFn: getAllContests, staleTime: Infinity, gcTime: Infinity });
};
export default useContests;
