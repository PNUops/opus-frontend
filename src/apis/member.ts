import apiClient from './apiClient';

export const deleteMyAccount = async () => {
  const res = await apiClient.delete('/members/me');
  return res.data;
};

export const deleteUser = async (memberId: number) => {
  const res = await apiClient.delete(`/admin/members/${memberId}`);
  return res.data;
};
