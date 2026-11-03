import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markAllNotificationsAsRead, markNotificationAsRead } from '@apis/notification';
import type { NotificationDto } from '@dto/notificationDto';
import { useNotificationTargetPath } from '@hooks/useNotificationTargetPath';
import { useToast } from '@hooks/useToast';
import {
  invalidateNotificationQueries,
  markAllNotificationsAsReadInCache,
  markNotificationAsReadInCache,
  NOTIFICATIONS_QUERY_KEY,
} from '@queries/notification';
import { useTokenStore } from '@stores/useTokenStore';

export const useNotificationActions = (isOpen: boolean, onClose: () => void) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const resolveTarget = useNotificationTargetPath();
  const toast = useToast();
  const token = useTokenStore((state) => state.token);
  const generation = useRef(0);
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    generation.current += 1;
    return () => {
      generation.current += 1;
    };
  }, [isOpen, location.key, location.pathname, location.search, location.hash, token]);

  const readMutation = useMutation({
    mutationFn: ({ id, token: startedToken }: { id: number | null; token: string | null }) => {
      if (startedToken !== useTokenStore.getState().token) throw new Error('Notification session changed');
      return id === null ? markAllNotificationsAsRead() : markNotificationAsRead(id);
    },
    onMutate: async ({ id, token: startedToken }) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      if (startedToken !== useTokenStore.getState().token) throw new Error('Notification session changed');
      const previous = queryClient.getQueryData<NotificationDto[]>(NOTIFICATIONS_QUERY_KEY);
      if (id === null) markAllNotificationsAsReadInCache(queryClient);
      else markNotificationAsReadInCache(queryClient, id);
      return { previous, token: startedToken };
    },
    onError: (_error, _variables, context) => {
      if (context && context.token === useTokenStore.getState().token) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context && context.token === useTokenStore.getState().token) {
        void invalidateNotificationQueries(queryClient);
      }
    },
  });

  const close = () => {
    generation.current += 1;
    onClose();
  };

  const run = async (notification?: NotificationDto) => {
    if (locked.current || !isOpen || !token) return;
    locked.current = true;
    setBusy(true);
    const startedGeneration = generation.current;
    const isCurrent = () => startedGeneration === generation.current && token === useTokenStore.getState().token;
    try {
      // 경로 조회와 읽음 저장은 함께 시작하되, 전체/개별 읽음끼리는 직렬화합니다.
      const targetPromise = notification ? resolveTarget(notification).catch(() => null) : Promise.resolve(null);
      if (!notification?.isRead) {
        try {
          await readMutation.mutateAsync({ id: notification?.id ?? null, token });
        } catch {
          if (isCurrent()) toast('읽음 상태를 저장하지 못했어요. 다시 시도해주세요.', 'error');
        }
      }
      const target = await targetPromise;
      if (!notification || !isCurrent()) return;
      if (target === null) {
        toast('알림에 연결된 화면을 확인할 수 없어요.', 'error');
        return;
      }
      close();
      navigate(target, { viewTransition: location.pathname === '/' });
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };

  return {
    busy,
    close,
    openNotification: (notification: NotificationDto) => run(notification),
    markAllRead: () => run(),
  };
};
