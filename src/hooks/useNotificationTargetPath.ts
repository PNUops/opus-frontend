import { useQueryClient } from '@tanstack/react-query';

import type { NotificationDto } from '@dto/notificationDto';
import { teamDetailOption } from '@queries/team';
import { getNotificationTarget } from '@utils/notification/targetPath';
import { buildTeamNotificationTargetPath } from '@utils/notification/teamTargetPath';

export const useNotificationTargetPath = () => {
  const queryClient = useQueryClient();

  return async (notification: NotificationDto): Promise<string | null> => {
    const target = getNotificationTarget(notification);
    if (target === null || typeof target === 'string') return target;
    if (target.contestId !== null) return buildTeamNotificationTargetPath(target, target.contestId);

    try {
      const team = await queryClient.fetchQuery(teamDetailOption(target.teamId));
      return buildTeamNotificationTargetPath(target, team.contestId);
    } catch {
      return null;
    }
  };
};
