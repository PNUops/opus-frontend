import { queryOptions } from '@tanstack/react-query';
import { getRecentAdminActivities } from '@apis/dashboard';

export const recentAdminActivitiesOption = () =>
  queryOptions({ queryKey: ['admin', 'recentActivities'], queryFn: getRecentAdminActivities, retry: false });
