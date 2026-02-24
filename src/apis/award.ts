import apiClient from './apiClient';
import { GetContestAwardsResponseDto, PatchContestAwardRequestDto } from 'types/DTO';
import { AwardDto } from 'types/DTO/awardsDto';

export const getContestAwards = async (contestId: number): Promise<GetContestAwardsResponseDto> => {
  const res = await apiClient.get<GetContestAwardsResponseDto>(`/contests/${contestId}/awards`);
  return res.data;
};

export const createContestAward = async (contestId: number, payload: AwardDto) => {
  const res = await apiClient.post(`/contests/${contestId}/awards`, payload);
  return res.data;
};

export const updateContestAward = async (contestId: number, awardId: number, payload: PatchContestAwardRequestDto) => {
  const res = await apiClient.patch(`/contests/${contestId}/awards/${awardId}`, payload);
  return res.data;
};

export const deleteContestAward = async (contestId: number, awardId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/awards/${awardId}`);
  return res.data;
};
