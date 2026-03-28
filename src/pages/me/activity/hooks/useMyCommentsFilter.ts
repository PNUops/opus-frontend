import { GetMyCommentsParamsDto } from 'types/DTO/meDto';
import { useMyActivityFilter } from './useMyActivityFilter';

export const useMyCommentsFilter = () =>
  useMyActivityFilter<GetMyCommentsParamsDto>({
    queryKeyBase: 'myComments',
    size: 2,
  });
