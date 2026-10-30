import type { NotificationDto, NotificationTargetType } from '@dto/notificationDto';
import { parsePositiveId } from '@utils/id';

export type TeamNotificationType = Extract<
  NotificationTargetType,
  'TEAM' | 'TEAM_COMMENT' | 'TEAM_AWARD' | 'TEAM_AWARDS'
>;

export type TeamNotificationTarget = {
  targetType: TeamNotificationType;
  contestId: number | null;
  teamId: number;
};

/** URL에 ID가 명시되었지만 잘못된 경우에는 targetId로 대체하지 않는다. */
export const getTeamNotificationTarget = (
  notification: NotificationDto & { targetType: TeamNotificationType },
  url: URL,
): TeamNotificationTarget | null => {
  const contestValue = url.pathname.match(/\/(?:contest|contests)\/([^/]+)/)?.[1];
  const teamValue = url.pathname.match(/\/teams\/(?:view\/|edit\/)?([^/]+)/)?.[1];
  const contestParams = url.searchParams.getAll('contestId');
  const teamParams = url.searchParams.getAll('teamId');
  if (contestParams.length > 1 || teamParams.length > 1) return null;

  const rawContestId = contestValue ?? contestParams[0];
  const rawTeamId = teamValue ?? teamParams[0] ?? notification.targetId;
  const contestId = parsePositiveId(rawContestId);
  const teamId = parsePositiveId(rawTeamId);
  if (teamId === null || (rawContestId !== undefined && contestId === null)) return null;

  return { targetType: notification.targetType, contestId, teamId };
};

export const buildTeamNotificationTargetPath = (
  { targetType, teamId }: TeamNotificationTarget,
  contestId: number,
): string | null => {
  if (parsePositiveId(contestId) === null || parsePositiveId(teamId) === null) return null;

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
