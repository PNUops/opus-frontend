import apiClient from './apiClient';

export const postBanner = async (contestId: number, formData: FormData) => {
  const response = await apiClient.post(`/contests/${contestId}/image/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const deleteBanner = async (contestId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/image/banner`);
  return res;
};
