import apiClient from './apiClient';
import type { AxiosError } from 'axios';

export const getBanner = async (contestId: number): Promise<Blob | null> => {
  try {
    const response = await apiClient.get(`/contests/${contestId}/image/banner`, {
      responseType: 'blob',
    });

    if (response.status === 202) {
      const error = new Error('배너 이미지 처리 중입니다.');
      (error as any).response = response;
      throw error;
    }

    return response.data;
  } catch (error: AxiosError | any) {
    if (error.response?.status === 404) return null;
    else throw error;
  }
};

export const postBanner = async (contestId: number, formData: FormData) => {
  const res = await apiClient.post(`/contests/${contestId}/image/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res;
};

export const deleteBanner = async (contestId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/image/banner`);
  return res;
};
