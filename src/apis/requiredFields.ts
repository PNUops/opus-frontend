import { RequiredFieldsDto } from 'types/DTO/requiredFieldsDto';
import apiClient from './apiClient';

export const getRequiredFields = async (contestId: number): Promise<RequiredFieldsDto> => {
  const { data } = await apiClient.get(`/contests/${contestId}/contest-detail-template`);
  return data;
};

export const putRequiredFields = async (contestId: number, payload: RequiredFieldsDto) => {
  const { data } = await apiClient.put(`/contests/${contestId}/contest-detail-template`, payload);
  return data;
};
