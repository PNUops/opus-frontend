import { queryOptions } from '@tanstack/react-query';
import { getAllCategory } from '@apis/category';

export const categoryOption = () => {
  return queryOptions({
    queryKey: ['category'],
    queryFn: getAllCategory,
  });
};
