import { useSearchParams } from 'react-router-dom';
import { parseSort, normalize, inferDateType } from '../utils/filter';
import { getDateRange } from '../utils/date';
import { SortType, DateType } from '@pages/me/activity/types/filter';

export type FilterState = {
  sort: SortType;
  dateType: DateType;
  startDate: string;
  endDate: string;
  categoryId: string;
  contestId: string;
  page: string;
};

type ActivityApiParams = {
  sort?: SortType;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  contestId?: string;
  page?: number;
  size?: number;
};

interface UseMyActivityFilterOptions {
  queryKeyBase: string;
  size?: number;
  includeCategory?: boolean;
  includeContest?: boolean;
}

const parseState = (params: URLSearchParams): FilterState => {
  const startDate = normalize(params.get('startDate'));
  const endDate = normalize(params.get('endDate'));
  const dateTypeParam = normalize(params.get('dateType'));
  const dateType: DateType =
    dateTypeParam === '1m' || dateTypeParam === '3m' || dateTypeParam === 'custom'
      ? dateTypeParam
      : inferDateType(startDate, endDate);

  return {
    sort: parseSort(params.get('sort')),
    dateType,
    startDate,
    endDate,
    categoryId: normalize(params.get('categoryId')),
    contestId: normalize(params.get('contestId')),
    page: normalize(params.get('page') ?? '0'),
  };
};

export const useMyActivityFilter = <TApiParams extends ActivityApiParams>({
  queryKeyBase,
  size = 12,
  includeCategory = false,
  includeContest = false,
}: UseMyActivityFilterOptions) => {
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
        if (next.startDate !== undefined || next.endDate !== undefined) {
          merged.startDate = normalize(next.startDate);
          merged.endDate = normalize(next.endDate);
        } else {
          merged.startDate = '';
          merged.endDate = '';
        }
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

  const apiParams = {
    sort: state.sort,
    page: Number(state.page),
    size,

    ...(includeCategory && state.categoryId ? { categoryId: state.categoryId } : {}),
    ...(includeContest && state.contestId ? { contestId: state.contestId } : {}),
    ...(state.startDate && state.endDate
      ? {
          startDate: state.startDate,
          endDate: state.endDate,
        }
      : {}),
  } as TApiParams;

  const queryKey = [
    queryKeyBase,
    apiParams.sort,
    apiParams.startDate,
    apiParams.endDate,
    includeCategory ? apiParams.categoryId : undefined,
    includeContest ? apiParams.contestId : undefined,
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
