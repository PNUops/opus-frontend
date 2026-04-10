import { RequiredFieldsDto } from '@dto/requiredFieldsDto';
import apiClient from './apiClient';

export const getRequiredFields = async (contestId: number): Promise<RequiredFieldsDto> => {
  const { data } = await apiClient.get(`/contests/${contestId}/template`);
  return data;
};

export const putRequiredFields = async (contestId: number, payload: RequiredFieldsDto) => {
  const { data } = await apiClient.put(`/contests/${contestId}/template`, payload);
  return data;
};
