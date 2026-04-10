import { GetMyLikesParamsDto } from '@dto/meDto';
import { useMyActivityFilter } from './useMyActivityFilter';

export type { FilterState } from './useMyActivityFilter';

export const useMyLikesFilter = () =>
  useMyActivityFilter<GetMyLikesParamsDto>({
    queryKeyBase: 'myLikes',
    size: 12,
    includeCategory: true,
    includeContest: true,
  });
