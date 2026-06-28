import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Bell, CheckCheck, ChevronRight, RotateCw } from 'lucide-react';

import { markAllNotificationsAsRead, markNotificationAsRead } from '@apis/notification';
import Spinner from '@components/Spinner';
import { cn } from '@components/lib/utils';
import { useOutsideClick } from '@hooks/useOutsideClick';
import { invalidateNotificationQueries } from '@queries/notification';
import type { NotificationDto } from '@dto/notificationDto';

interface NotificationOverlayProps {
  isOpen: boolean;
  notifications: NotificationDto[];
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const targetTypeLabel: Record<NotificationDto['targetType'], string> = {
  TEAM: '프로젝트',
  TEAM_COMMENT: '댓글',
  TEAM_AWARD: '수상',
};

const formatCreatedAt = (value: string) => {
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY.MM.DD HH:mm') : '-';
};

const NotificationOverlay = ({
  isOpen,
  notifications,
  isLoading,
  isError,
  onClose,
  onRetry,
}: NotificationOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useOutsideClick(overlayRef, () => {
    if (isOpen) {
      onClose();
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSettled: () => {
      void invalidateNotificationQueries(queryClient);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSettled: () => {
      void invalidateNotificationQueries(queryClient);
    },
  });

  const handleNotificationClick = (notification: NotificationDto) => {
    const moveToTarget = () => {
      onClose();
      navigate(notification.redirectUrl);
    };

    if (notification.isRead) {
      moveToTarget();
      return;
    }

    markAsReadMutation.mutate(notification.id, {
      onSettled: moveToTarget,
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div
      ref={overlayRef}
      aria-hidden={!isOpen}
      className={cn(
        'border-lightGray absolute top-full right-0 z-50 mt-3 w-[min(360px,calc(100vw-32px))] origin-top-right rounded-lg border bg-white shadow-xl transition duration-150 ease-out',
        isOpen
          ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
      )}
    >
      <div className="border-lightGray flex items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Bell className="text-mainGreen size-5 shrink-0" />
          <div className="min-w-0">
            <h2 className="font-bold text-neutral-900">알림</h2>
            <p className="text-midGray text-xs">읽지 않은 알림 {unreadCount}개</p>
          </div>
        </div>
        <button
          type="button"
          className="hover:bg-whiteGray text-midGray inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
        >
          <CheckCheck size={14} />
          모두 읽음
        </button>
      </div>

      <div className="max-h-[440px] overflow-y-auto">
        {isLoading && <NotificationLoading />}
        {isError && !isLoading && <NotificationError onRetry={onRetry} />}
        {!isLoading && !isError && notifications.length === 0 && <NotificationEmpty />}
        {!isLoading && !isError && notifications.length > 0 && (
          <ul className="divide-lightGray divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isPending={markAsReadMutation.isPending}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationOverlay;

const NotificationItem = ({
  notification,
  isPending,
  onClick,
}: {
  notification: NotificationDto;
  isPending: boolean;
  onClick: () => void;
}) => {
  return (
    <li>
      <button
        type="button"
        className="hover:bg-whiteGray flex w-full items-start gap-3 rounded-lg px-5 py-4 text-left transition-colors disabled:cursor-wait"
        onClick={onClick}
        disabled={isPending}
      >
        <span
          className={cn('mt-1 size-2.5 shrink-0 rounded-full', notification.isRead ? 'bg-lightGray' : 'bg-mainGreen')}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={cn('truncate text-sm font-bold', notification.isRead && 'text-neutral-500')}>
              {notification.title}
            </span>
            <span className="bg-whiteGray shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              {targetTypeLabel[notification.targetType]}
            </span>
          </span>
          <span
            className={cn(
              'mt-1 line-clamp-2 text-sm leading-5 text-neutral-700',
              notification.isRead && 'text-midGray',
            )}
          >
            {notification.content}
          </span>
          <span className="text-midGray mt-2 block text-xs">{formatCreatedAt(notification.createdAt)}</span>
        </span>
        <ChevronRight className="text-midGray mt-1 size-4 shrink-0" />
      </button>
    </li>
  );
};

const NotificationLoading = () => {
  return (
    <div className="flex min-h-36 items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
};

const NotificationError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-3 px-5 py-8 text-center">
      <p className="text-mainRed text-sm font-semibold">알림을 불러오지 못했습니다.</p>
      <button
        type="button"
        className="border-lightGray hover:bg-whiteGray inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-neutral-800 transition-colors"
        onClick={onRetry}
      >
        <RotateCw size={14} />
        다시 시도
      </button>
    </div>
  );
};

const NotificationEmpty = () => {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-2 px-5 py-8 text-center">
      <Bell className="text-lightGray size-8" />
      <p className="text-sm font-semibold text-neutral-700">새 알림이 없습니다.</p>
      <p className="text-midGray text-xs">프로젝트 소식이 생기면 이곳에 표시됩니다.</p>
    </div>
  );
};
