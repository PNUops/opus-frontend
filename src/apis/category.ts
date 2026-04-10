import { CategoryDto } from '@dto/categoryDto';
import apiClient from './apiClient';

export const getAllCategory = async () => {
  const res = await apiClient.get<CategoryDto[]>('/categories');
  return res.data;
};

export const postCategory = async (categoryName: string) => {
  const res = await apiClient.post('/categories', { categoryName });
  return res.data;
};

export const patchCategory = async (categoryId: number, categoryName: string) => {
  const res = await apiClient.patch(`/categories/${categoryId}`, { categoryName });
  return res.data;
};

export const deleteCategory = async (categoryId: number) => {
  const res = await apiClient.delete(`/categories/${categoryId}`);
  return res.data;
};
