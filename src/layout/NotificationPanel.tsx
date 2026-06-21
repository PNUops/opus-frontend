import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Bell, LoaderCircle, MessageCircle, Trophy, Users } from 'lucide-react';

import {
  useNotificationsQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
} from 'hooks/useNotifications';
import type { Notification } from 'apis/notification';
import { cn } from 'utils/classname';

type NotificationFilter = 'all' | 'unread';

interface NotificationPanelProps {
  id?: string;
  onClose?: () => void;
  variant?: 'popover' | 'page';
}

const formatNotificationTime = (createdAt: string) => {
  const parsedDate = dayjs(createdAt);

  if (!parsedDate.isValid()) return '';

  return parsedDate.format('HH:mm');
};

const getNotificationTypeMeta = (targetType: Notification['targetType']) => {
  switch (targetType) {
    case 'TEAM_COMMENT':
      return {
        label: '댓글',
        icon: MessageCircle,
      };
    case 'TEAM_AWARD':
      return {
        label: '수상',
        icon: Trophy,
      };
    case 'TEAM':
    default:
      return {
        label: '팀',
        icon: Users,
      };
  }
};

const NotificationPanel = ({ id = 'notification-panel', onClose, variant = 'popover' }: NotificationPanelProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const { data: notifications = [], isLoading, isError } = useNotificationsQuery();
  const readNotificationMutation = useReadNotificationMutation();
  const readAllNotificationsMutation = useReadAllNotificationsMutation();

  const sortedNotifications = useMemo(
    () => [...notifications].sort((prev, next) => dayjs(next.createdAt).valueOf() - dayjs(prev.createdAt).valueOf()),
    [notifications],
  );
  const unreadCount = sortedNotifications.filter((notification) => !notification.isRead).length;
  const filteredNotifications =
    filter === 'unread' ? sortedNotifications.filter((notification) => !notification.isRead) : sortedNotifications;
  const todayNotifications = filteredNotifications.filter((notification) =>
    dayjs(notification.createdAt).isSame(dayjs(), 'day'),
  );
  const previousNotifications = filteredNotifications.filter(
    (notification) => !dayjs(notification.createdAt).isSame(dayjs(), 'day'),
  );

  const closePanel = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      readNotificationMutation.mutate(notification.id);
    }

    if (notification.redirectUrl) {
      closePanel();
      navigate(notification.redirectUrl);
    }
  };

  const handleReadAll = () => {
    if (unreadCount > 0) {
      readAllNotificationsMutation.mutate();
    }
  };

  useEffect(() => {
    if (!onClose) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <aside
      id={id}
      className={cn(
        'flex flex-col overflow-hidden border border-[#E5E7EB] bg-white text-[#111827]',
        variant === 'popover'
          ? 'motion-safe:animate-notification-panel-in md:top-header fixed top-12 right-3 left-3 z-40 max-h-[calc(100vh-3rem)] origin-top-right rounded-md shadow-[0_8px_18px_rgba(15,23,42,0.08)] sm:top-20 sm:right-8 sm:left-auto sm:h-[min(620px,calc(100vh-80px))] sm:w-[390px] md:h-[min(620px,calc(100vh-104px))] lg:right-10 lg:max-w-[420px]'
          : 'mx-auto min-h-[620px] w-full max-w-[720px] rounded-md',
      )}
      role="region"
      aria-labelledby={`${id}-title`}
    >
      <header className="flex flex-shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 id={`${id}-title`} className="text-[15px] leading-6 font-semibold text-[#111827]">
            알림
          </h2>
          {unreadCount > 0 && (
            <span className="text-mainGreen rounded-full bg-[#EAF7EF] px-2 py-0.5 text-[12px] leading-4 font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          type="button"
          className="hover:text-mainGreen rounded-sm px-2 py-1 text-[13px] font-medium text-[#4B5563] transition-colors hover:bg-[#F3F4F6] disabled:cursor-default disabled:text-[#B8B8B8]"
          onClick={handleReadAll}
          disabled={unreadCount === 0 || readAllNotificationsMutation.isPending}
        >
          모두 읽음
        </button>
      </header>

      <div className="flex flex-shrink-0 items-center gap-1 border-b border-[#EEF0F2] px-4 py-2">
        <FilterButton isActive={filter === 'all'} onClick={() => setFilter('all')}>
          전체
        </FilterButton>
        <FilterButton isActive={filter === 'unread'} onClick={() => setFilter('unread')}>
          안읽음
        </FilterButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex min-h-[260px] items-center justify-center text-[#8F8F8F]">
            <LoaderCircle className="animate-spin" size={24} />
          </div>
        )}

        {isError && !isLoading && <NotificationEmpty message="알림을 불러오지 못했어요." />}

        {!isLoading && !isError && filteredNotifications.length === 0 && (
          <NotificationEmpty message={filter === 'unread' ? '읽지 않은 알림이 없어요.' : '알림이 없어요.'} />
        )}

        {!isLoading && !isError && filteredNotifications.length > 0 && (
          <div className="divide-y divide-[#EEF0F2]">
            <NotificationGroup title="오늘" notifications={todayNotifications} onItemClick={handleNotificationClick} />
            <NotificationGroup
              title="이전"
              notifications={previousNotifications}
              onItemClick={handleNotificationClick}
            />
          </div>
        )}
      </div>

      {variant === 'popover' && (
        <footer className="flex flex-shrink-0 items-center justify-between border-t border-[#E5E7EB] px-4 py-3">
          <span className="text-[12px] text-[#6B7280]">최근 알림을 빠르게 확인하세요.</span>
          <Link
            to="/notification"
            className="text-mainGreen text-[13px] font-medium hover:underline"
            onClick={closePanel}
          >
            전체 알림 보기
          </Link>
        </footer>
      )}
    </aside>
  );
};

interface FilterButtonProps {
  children: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton = ({ children, isActive, onClick }: FilterButtonProps) => (
  <button
    type="button"
    className={cn(
      'rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors',
      isActive ? 'text-mainGreen bg-[#F0FDF4]' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
    )}
    onClick={onClick}
    aria-pressed={isActive}
  >
    {children}
  </button>
);

interface NotificationGroupProps {
  title: string;
  notifications: Notification[];
  onItemClick: (notification: Notification) => void;
}

const NotificationGroup = ({ title, notifications, onItemClick }: NotificationGroupProps) => {
  if (notifications.length === 0) return null;

  return (
    <section>
      <h3 className="bg-[#FAFAFA] px-4 py-2 text-[12px] font-semibold text-[#6B7280]">{title}</h3>
      <ul>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => onItemClick(notification)}
          />
        ))}
      </ul>
    </section>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const typeMeta = getNotificationTypeMeta(notification.targetType);
  const TypeIcon = typeMeta.icon;

  return (
    <li>
      <button
        type="button"
        className={cn(
          'grid w-full grid-cols-[12px_1fr] gap-2 px-4 py-3 text-left transition-colors hover:bg-[#F8FAF9]',
          !notification.isRead && 'bg-[#F7FBF9]',
        )}
        onClick={onClick}
      >
        <span
          className={cn('mt-2 h-2 w-2 rounded-full', notification.isRead ? 'bg-transparent' : 'bg-mainGreen')}
          aria-hidden="true"
        />
        <span className="min-w-0">
          <span className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-sm border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#4B5563]">
              <TypeIcon size={12} strokeWidth={2} />
              {typeMeta.label}
            </span>
            <time dateTime={notification.createdAt} className="text-[12px] text-[#9CA3AF]">
              {formatNotificationTime(notification.createdAt)}
            </time>
          </span>
          <span
            className={cn(
              'block truncate text-[14px] leading-5 text-[#111827]',
              notification.isRead ? 'font-medium' : 'font-semibold',
            )}
          >
            {notification.title}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-[18px] text-[#6B7280]">
            {notification.content}
          </span>
        </span>
      </button>
    </li>
  );
};

const NotificationEmpty = ({ message }: { message: string }) => (
  <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 px-8 text-center">
    <Bell size={22} className="text-[#9CA3AF]" />
    <p className="text-[14px] text-[#6B7280]">{message}</p>
  </div>
);

export default NotificationPanel;
