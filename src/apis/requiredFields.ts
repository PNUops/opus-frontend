import { RequiredFieldsDto } from 'types/DTO/requiredFieldsDto';
import apiClient from './apiClient';

export const getRequiredFields = async (contestId: number): Promise<RequiredFieldsDto> => {
  const { data } = await apiClient.get(`/contests/${contestId}/team-detail-template`);
  return data;
};

export const putRequiredFields = async (contestId: number, payload: RequiredFieldsDto) => {
  const { data } = await apiClient.put(`/contests/${contestId}/team-detail-template`, payload);
  return data;
};
