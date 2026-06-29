import apiClient from './apiClient';
import {
  GetMyProfileResponseDto,
  SearchAdminMembersParams,
  SearchAdminMembersResponseDto,
  UpdateProfileVisibilityRequestDto,
  PatchMyStudentIdRequestDto,
  PatchMyPasswordRequestDto,
} from '@dto/memberDto';

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

export const patchMyPassword = async (payload: PatchMyPasswordRequestDto): Promise<void> => {
  const res = await apiClient.patch('/members/me/password-reset', payload);
  return res.data;
};

export const searchAdminMembers = async ({
  keyword,
  roleType,
}: SearchAdminMembersParams): Promise<SearchAdminMembersResponseDto> => {
  const res = await apiClient.get<SearchAdminMembersResponseDto>('/admin/members/search', {
    params: {
      keyword,
      roleType,
    },
  });

  return res.data;
};
