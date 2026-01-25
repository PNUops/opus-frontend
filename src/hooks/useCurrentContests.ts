import { useQuery } from '@tanstack/react-query';
import { getCurrentContest } from 'apis/contests';

const useCurrentContests = () => {
  return useQuery({
    queryKey: ['currentContests'],
    queryFn: getCurrentContest,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export default useCurrentContests;
