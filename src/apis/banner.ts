import apiClient from './apiClient';

export const postBanner = async (contestId: number, formData: FormData) => {
  const response = await apiClient.post(`/contests/${contestId}/image/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const getBannerUrl = async (contestId: number): Promise<string | null> => {
  try {
    const res = await apiClient.get(`/contests/${contestId}/image/banner`, { responseType: 'blob' });
    const blob = res.data as Blob;
    const objUrl = URL.createObjectURL(blob);
    return objUrl;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const deleteBanner = async (contestId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/image/banner`);
  return res;
};
