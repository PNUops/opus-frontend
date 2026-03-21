import { useQuery } from '@tanstack/react-query';
import { getAllCategory } from 'apis/category';
import { getAllContests } from 'apis/contest';
import { CategoryDto } from 'types/DTO';
import { ContestResponseDto } from 'types/DTO';

type SortType = 'latest' | 'oldest';
type DateType = '' | '1m' | '3m' | 'custom';
export type Option<T extends string> = {
  label: string;
  value: T;
};

const useFilterQuery = () => {
  const { data: categories = [] } = useQuery<CategoryDto[]>({
    queryKey: ['categories'],
    queryFn: getAllCategory,
  });
  const { data: contests = [] } = useQuery<ContestResponseDto[]>({
    queryKey: ['contests'],
    queryFn: getAllContests,
  });

  const SORT_OPTIONS: Option<SortType>[] = [
    { label: '최신순', value: 'latest' },
    { label: '오래된순', value: 'oldest' },
  ];

  const DATE_OPTIONS: Option<DateType>[] = [
    { label: '모든 날짜', value: '' },
    { label: '최근 한달', value: '1m' },
    { label: '최근 3개월', value: '3m' },
    { label: '기간', value: 'custom' },
  ];

  const CATEGORY_OPTIONS: Option<string>[] = [
    { label: '모든 카테고리', value: '' },
    ...categories.map((c: CategoryDto) => ({ label: c.categoryName, value: String(c.categoryId) })),
  ];

  const CONTEST_OPTIONS: Option<string>[] = [
    { label: '모든 대회', value: '' },
    ...contests.map((c: ContestResponseDto) => ({ label: c.contestName, value: String(c.contestId) })),
  ];

  return { SORT_OPTIONS, DATE_OPTIONS, CATEGORY_OPTIONS, CONTEST_OPTIONS };
};

export default useFilterQuery;
