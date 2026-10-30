import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, ChevronRight, RotateCw, X } from 'lucide-react';

import Spinner from '@components/Spinner';
import { cn } from '@components/lib/utils';
import { notificationTargetTypeLabel } from '@constants/notification';
import { useOutsideClick } from '@hooks/useOutsideClick';
import { useNotificationActions } from '@hooks/useNotificationActions';
import type { NotificationDto } from '@dto/notificationDto';
import { formatNotificationCreatedAt } from '@utils/notification';

interface NotificationOverlayProps {
  isOpen: boolean;
  notifications: NotificationDto[];
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onCloseAutoFocus?: () => void;
  onRetry: () => void;
}

const NotificationOverlay = ({
  isOpen,
  notifications,
  isLoading,
  isError,
  onClose,
  onCloseAutoFocus,
  onRetry,
}: NotificationOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const { busy, close, openNotification, markAllRead } = useNotificationActions(isOpen, onClose);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  useOutsideClick(overlayRef, () => {
    if (isOpen) close();
  });
  useEffect(() => {
    if (isOpen) overlayRef.current?.focus({ preventScroll: true });
  }, [isOpen]);
  const closeAndFocus = () => {
    close();
    requestAnimationFrame(() => onCloseAutoFocus?.());
  };
  useEffect(() => {
    if (!isOpen) return;
    // 읽음 처리로 누른 버튼이 disabled되면 포커스가 body로 이동할 수 있다.
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      close();
      requestAnimationFrame(() => onCloseAutoFocus?.());
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close, onCloseAutoFocus]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-label="알림"
      aria-hidden={!isOpen}
      inert={!isOpen}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeAndFocus();
        }
      }}
      className={cn(
        'border-lightGray absolute top-full right-0 z-50 mt-3 flex max-h-[min(560px,calc(100dvh-112px))] w-[min(380px,calc(100vw-32px))] origin-top-right flex-col rounded-lg border bg-white text-neutral-900 shadow-lg transition duration-150 ease-out outline-none motion-reduce:transition-none',
        isOpen
          ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
      )}
    >
      <div className="border-lightGray flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Bell className="text-mainGreen size-5 shrink-0" />
          <div className="min-w-0">
            <h2 className="font-bold text-neutral-900">알림</h2>
            <p className="mt-0.5 text-xs text-neutral-600">읽지 않은 알림 {unreadCount}개</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="hover:bg-whiteGray focus-visible:outline-mainBlue inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs text-neutral-700 transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void markAllRead()}
            disabled={unreadCount === 0 || busy}
          >
            <CheckCheck size={14} />
            모두 읽음
          </button>
          <button
            type="button"
            aria-label="알림 닫기"
            onClick={closeAndFocus}
            className="hover:bg-whiteGray focus-visible:outline-mainBlue flex size-11 items-center justify-center rounded-md text-neutral-600 focus-visible:outline-2"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto overscroll-contain">
        {isLoading && <NotificationLoading />}
        {isError && !isLoading && <NotificationError onRetry={onRetry} />}
        {!isLoading && !isError && notifications.length === 0 && <NotificationEmpty />}
        {!isLoading && !isError && notifications.length > 0 && (
          <ul className="divide-lightGray divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isPending={busy}
                onClick={() => void openNotification(notification)}
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
        className="hover:bg-whiteGray focus-visible:outline-mainBlue flex w-full items-start gap-3 px-4 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:cursor-wait"
        onClick={onClick}
        disabled={isPending}
      >
        <span
          className={cn('mt-1 size-2.5 shrink-0 rounded-full', notification.isRead ? 'bg-lightGray' : 'bg-mainGreen')}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'min-w-0 flex-1 text-sm leading-6 font-medium break-words text-neutral-950',
                notification.isRead && 'text-neutral-600',
              )}
            >
              {notification.title}
            </span>
            <span className="bg-whiteGray shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              {notificationTargetTypeLabel[notification.targetType] ?? '알림'}
            </span>
          </span>
          <span
            className={cn(
              'mt-1 line-clamp-2 text-sm leading-5 text-neutral-700',
              notification.isRead && 'text-neutral-600',
            )}
          >
            {notification.content}
          </span>
          <span className="mt-2 block text-xs text-neutral-600">
            {formatNotificationCreatedAt(notification.createdAt)}
          </span>
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
