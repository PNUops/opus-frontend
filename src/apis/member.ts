import apiClient from './apiClient';
import { GetMyProfileResponseDto, UpdateProfileVisibilityRequestDto, PatchMyStudentIdRequestDto } from 'types/DTO';

export const deleteMyAccount = async () => {
  const res = await apiClient.delete('/members/me');
  return res.data;
};

export const deleteMember = async (memberId: number) => {
  const res = await apiClient.delete(`/admin/members/${memberId}`);
  return res.data;
};

export const getMyAccount = async (): Promise<GetMyProfileResponseDto> => {
  const res = await apiClient.get('/members/me');
  return res.data;
};

export const updateProfileVisibility = async (payload: UpdateProfileVisibilityRequestDto) => {
  const res = await apiClient.patch('/members/me/profile-visibility', payload);
  return res.data;
};

export const patchMyStudentId = async (payload: PatchMyStudentIdRequestDto) => {
  const res = await apiClient.patch('/members/me/student-id', payload);
  return res.data;
};
