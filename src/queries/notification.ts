import { queryOptions } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

import { getNotifications } from '@apis/notification';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export const notificationOption = () =>
  queryOptions({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotifications,
    staleTime: 30 * 1000,
  });

export const invalidateNotificationQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
