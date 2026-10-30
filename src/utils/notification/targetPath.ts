import type { NotificationDto } from '@dto/notificationDto';
import { parsePositiveId } from '@utils/id';

import { getTeamNotificationTarget, type TeamNotificationTarget } from './teamTargetPath';

const getInternalNotificationUrl = (path: string) => {
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /[\\\s]/.test(path) ||
    Array.from(path).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
  ) {
    return null;
  }

  try {
    const url = new URL(path, 'https://notification.internal');
    return url.pathname === path.split(/[?#]/)[0] ? url : null;
  } catch {
    return null;
  }
};

const isValidRouteMatch = (match: RegExpMatchArray | null) =>
  match !== null && match.slice(1).every((id) => parsePositiveId(id) !== null);

const isSubmissionNotificationPath = (url: URL) => {
  const itemIds = url.searchParams.getAll('submissionItemId');
  return (
    isValidRouteMatch(url.pathname.match(/^\/me\/contests\/([1-9]\d*)\/teams\/([1-9]\d*)\/submissions$/)) &&
    itemIds.length === 1 &&
    parsePositiveId(itemIds[0]) !== null
  );
};

/** 신규 알림은 서버 경로를, 기존 팀 알림은 경로 계산에 필요한 ID를 반환한다. */
export const getNotificationTarget = (notification: NotificationDto): string | TeamNotificationTarget | null => {
  const url = getInternalNotificationUrl(notification.redirectUrl || '/');
  if (!url) return null;

  switch (notification.targetType) {
    case 'SUBMISSION_COMPLETED':
    case 'SUBMISSION_FEEDBACK':
    case 'SUBMISSION_DEADLINE':
      return isSubmissionNotificationPath(url) ? notification.redirectUrl : null;
    case 'ADVISOR_ASSIGNED':
    case 'MENTOR_ASSIGNED':
      return isValidRouteMatch(url.pathname.match(/^\/me\/advisor-activity\/contests\/([1-9]\d*)$/)) ||
        isValidRouteMatch(url.pathname.match(/^\/me\/contests\/([1-9]\d*)\/teams\/([1-9]\d*)\/dashboard$/))
        ? notification.redirectUrl
        : null;
    case 'ADVISOR_UNASSIGNED':
    case 'MENTOR_UNASSIGNED':
      return isValidRouteMatch(url.pathname.match(/^\/contest\/([1-9]\d*)\/teams\/view\/([1-9]\d*)$/)) ||
        isValidRouteMatch(url.pathname.match(/^\/me\/contests\/([1-9]\d*)\/teams\/([1-9]\d*)\/dashboard$/))
        ? notification.redirectUrl
        : null;
    case 'TEAM':
    case 'TEAM_COMMENT':
    case 'TEAM_AWARD':
    case 'TEAM_AWARDS':
      return getTeamNotificationTarget({ ...notification, targetType: notification.targetType }, url);
    default:
      return null;
  }
};
