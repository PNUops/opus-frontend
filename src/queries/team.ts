import { queryOptions } from '@tanstack/react-query';
import { getTeamDetail } from '@apis/projectViewer';

export const teamDetailOption = (teamId: number) =>
  queryOptions({
    queryKey: ['teamDetail', teamId],
    queryFn: () => getTeamDetail(teamId),
  });
