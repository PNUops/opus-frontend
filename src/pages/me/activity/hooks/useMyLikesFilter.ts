import { useSearchParams } from 'react-router-dom';
import { parseSort, normalize, inferDateType } from '../utils/filter';
import { getDateRange } from '../utils/date';
import { GetMyLikesParamsDto } from 'types/DTO/meDto';

export type FilterState = {
  sort: 'latest' | 'oldest';
  dateType: '' | '1m' | '3m' | 'custom';
  startDate: string;
  endDate: string;
  categoryId: string;
  contestId: string;
  page: string;
};

const parseState = (params: URLSearchParams): FilterState => {
  const startDate = normalize(params.get('startDate'));
  const endDate = normalize(params.get('endDate'));

  return {
    sort: parseSort(params.get('sort')),
    dateType: inferDateType(startDate, endDate),
    startDate,
    endDate,
    categoryId: normalize(params.get('categoryId')),
    contestId: normalize(params.get('contestId')),
    page: normalize(params.get('page') ?? '0'),
  };
};

export const useMyLikesFilter = () => {
  const [params, setParams] = useSearchParams();

  const state = parseState(params);

  const update = (next: Partial<FilterState>) => {
    const merged = {
      ...state,
      ...Object.fromEntries(Object.entries(next).map(([k, v]) => [k, normalize(v)])),
    } as FilterState;

    if (next.dateType !== undefined) {
      if (next.dateType === '') {
        merged.startDate = '';
        merged.endDate = '';
      }

      if (next.dateType === '1m' || next.dateType === '3m') {
        const { startDate, endDate } = getDateRange(next.dateType);
        merged.startDate = startDate;
        merged.endDate = endDate;
      } else if (next.dateType === 'custom') {
        alert('날짜를 입력해주세요.');
      }
    }

    if (!merged.startDate || !merged.endDate) {
      merged.startDate = '';
      merged.endDate = '';
    }

    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([_, v]) => v !== undefined && v !== '' && v !== null),
    );
    const newParams = new URLSearchParams();

    Object.entries(cleaned).forEach(([k, v]) => {
      newParams.set(k, v);
    });

    setParams(newParams, { replace: true });
  };

  const reset = () => {
    setParams({}, { replace: true });
  };

  const apiParams: GetMyLikesParamsDto = {
    sort: state.sort,
    page: Number(state.page),
    size: 12,

    ...(state.categoryId && { categoryId: state.categoryId }),
    ...(state.contestId && { contestId: state.contestId }),

    ...(state.startDate &&
      state.endDate && {
        startDate: state.startDate,
        endDate: state.endDate,
      }),
  };

  const queryKey = [
    'myLikes',
    apiParams.sort,
    apiParams.startDate,
    apiParams.endDate,
    apiParams.categoryId,
    apiParams.contestId,
    apiParams.page,
  ];

  return {
    state,
    update,
    reset,
    apiParams,
    queryKey,
  };
};
