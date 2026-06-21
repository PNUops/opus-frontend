import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from 'apis/notification';

const NOTIFICATION_QUERY_KEY = ['notifications'] as const;

export const useNotificationsQuery = (enabled = true) => {
  return useQuery<Notification[]>({
    queryKey: NOTIFICATION_QUERY_KEY,
    queryFn: getNotifications,
    enabled,
    staleTime: 1000 * 30,
  });
};

export const useReadNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,

    onMutate: async (notificationId: number) => {
      await queryClient.cancelQueries({
        queryKey: NOTIFICATION_QUERY_KEY,
      });

      const previousNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATION_QUERY_KEY);

      queryClient.setQueryData<Notification[]>(NOTIFICATION_QUERY_KEY, (oldNotifications) => {
        if (!oldNotifications) return oldNotifications;

        return oldNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification,
        );
      });

      return { previousNotifications };
    },

    onError: (_error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEY, context.previousNotifications);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEY,
      });
    },
  });
};

export const useReadAllNotificationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: NOTIFICATION_QUERY_KEY,
      });

      const previousNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATION_QUERY_KEY);

      queryClient.setQueryData<Notification[]>(NOTIFICATION_QUERY_KEY, (oldNotifications) => {
        if (!oldNotifications) return oldNotifications;

        return oldNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));
      });

      return { previousNotifications };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEY, context.previousNotifications);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEY,
      });
    },
  });
};
