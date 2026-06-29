import type { QueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { NOTIFICATIONS_QUERY_KEY } from '@queries/notification';
import { teamDetailOption } from '@queries/team';
import type { NotificationDto, NotificationTargetType } from '@dto/notificationDto';

type NotificationRouteIds = {
  contestId: number | null;
  teamId: number | null;
};

export const notificationTargetTypeLabel: Record<NotificationTargetType, string> = {
  TEAM: '프로젝트',
  TEAM_COMMENT: '댓글',
  TEAM_AWARD: '수상',
  TEAM_AWARDS: '수상',
};

export const formatNotificationCreatedAt = (value: string) => {
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY.MM.DD HH:mm') : '-';
};

export const markNotificationAsReadInCache = (queryClient: QueryClient, notificationId: number) => {
  queryClient.setQueryData<NotificationDto[]>(NOTIFICATIONS_QUERY_KEY, (cachedNotifications) =>
    cachedNotifications?.map((notification) =>
      notification.notificationId === notificationId ? { ...notification, isRead: true } : notification,
    ),
  );
};

export const markAllNotificationsAsReadInCache = (queryClient: QueryClient) => {
  queryClient.setQueryData<NotificationDto[]>(NOTIFICATIONS_QUERY_KEY, (cachedNotifications) =>
    cachedNotifications?.map((notification) => ({ ...notification, isRead: true })),
  );
};

const toPositiveNumber = (value: string | number | undefined | null) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const extractNotificationRouteIds = (redirectUrl: string): NotificationRouteIds => {
  const contestTeamPatterns = [
    /\/contest\/(\d+)\/teams\/(?:view|edit)\/(\d+)/,
    /\/me\/contests\/(\d+)\/teams\/(\d+)/,
    /\/contests\/(\d+)\/teams\/(\d+)/,
    /\/contest\/(\d+)\/teams\/(\d+)/,
  ];

  for (const pattern of contestTeamPatterns) {
    const match = redirectUrl.match(pattern);
    const contestId = toPositiveNumber(match?.[1]);
    const teamId = toPositiveNumber(match?.[2]);

    if (contestId && teamId) {
      return { contestId, teamId };
    }
  }

  const contestId = toPositiveNumber(redirectUrl.match(/(?:\/contest\/|\/contests\/|contestId=)(\d+)/)?.[1]);
  const teamId = toPositiveNumber(redirectUrl.match(/(?:\/teams\/|teamId=)(\d+)/)?.[1]);

  return { contestId, teamId };
};

const buildNotificationTargetPath = (
  targetType: NotificationTargetType,
  { contestId, teamId }: { contestId: number; teamId: number },
) => {
  switch (targetType) {
    case 'TEAM':
      return `/me/contests/${contestId}/teams/${teamId}/dashboard`;
    case 'TEAM_COMMENT':
      return `/contest/${contestId}/teams/view/${teamId}#comments`;
    case 'TEAM_AWARD':
    case 'TEAM_AWARDS':
      return `/contest/${contestId}/teams/view/${teamId}#awards`;
  }
};

export const resolveNotificationTargetPath = async (
  queryClient: QueryClient,
  notification: NotificationDto,
): Promise<string | null> => {
  const idsFromRedirectUrl = extractNotificationRouteIds(notification.redirectUrl);
  const teamId = idsFromRedirectUrl.teamId ?? toPositiveNumber(notification.targetId);

  if (!teamId) {
    return null;
  }

  if (idsFromRedirectUrl.contestId) {
    return buildNotificationTargetPath(notification.targetType, {
      contestId: idsFromRedirectUrl.contestId,
      teamId,
    });
  }

  try {
    const teamDetail = await queryClient.fetchQuery(teamDetailOption(teamId));
    return buildNotificationTargetPath(notification.targetType, { contestId: teamDetail.contestId, teamId });
  } catch {
    return null;
  }
};
