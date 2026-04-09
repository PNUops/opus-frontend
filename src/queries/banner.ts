import { queryOptions } from '@tanstack/react-query';
import { getBanner } from '@apis/banner';
import { AxiosError } from 'axios';

export const bannerOption = (contestId: number) => {
  return queryOptions({
    queryKey: ['banner', contestId],
    queryFn: () => getBanner(contestId),
    enabled: !!contestId,
    staleTime: Infinity,
    retry: (failureCount, error: AxiosError | any) => {
      const status = error.response?.status;
      if (status >= 400) return false;
      else return failureCount < 3;
    },
  });
};
