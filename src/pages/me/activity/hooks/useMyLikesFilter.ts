import { GetMyLikesParamsDto } from 'types/DTO/meDto';
import { useMyActivityFilter } from './useMyActivityFilter';

export type { FilterState } from './useMyActivityFilter';

export const useMyLikesFilter = () =>
  useMyActivityFilter<GetMyLikesParamsDto>({
    queryKeyBase: 'myLikes',
    size: 12,
    includeCategory: true,
    includeContest: true,
  });
