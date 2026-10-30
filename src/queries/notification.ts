import { queryOptions } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

import { getNotifications } from '@apis/notification';
import type { NotificationDto } from '@dto/notificationDto';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export const notificationOption = () =>
  queryOptions({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotifications,
    staleTime: 30 * 1000,
  });

export const invalidateNotificationQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

export const markNotificationAsReadInCache = (queryClient: QueryClient, notificationId: number) => {
  queryClient.setQueryData<NotificationDto[]>(NOTIFICATIONS_QUERY_KEY, (cachedNotifications) =>
    cachedNotifications?.map((notification) =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification,
    ),
  );
};

export const markAllNotificationsAsReadInCache = (queryClient: QueryClient) => {
  queryClient.setQueryData<NotificationDto[]>(NOTIFICATIONS_QUERY_KEY, (cachedNotifications) =>
    cachedNotifications?.map((notification) => ({ ...notification, isRead: true })),
  );
};
