import { postBanner, getBannerUrl, deleteBanner } from 'apis/contests';
import { queryOptions } from '@tanstack/react-query';

export const postBannerOption = (contestId: number) => {
  return {
    mutationFn: (formData: FormData) => postBanner(contestId, formData),
  };
};

export const getBannerOption = (contestId: number) => {
  return queryOptions({ queryKey: ['banner', contestId], queryFn: () => getBannerUrl(contestId) });
};

export const deleteBannerOption = (contestId: number) => {
  return {
    mutationFn: () => deleteBanner(contestId),
  };
};

