// TODO: Recheck this union against the Notion v2 notification spec once connector auth is refreshed.
export type NotificationTargetType = 'TEAM' | 'TEAM_COMMENT' | 'TEAM_AWARD';

export interface NotificationDto {
  id: number;
  title: string;
  content: string;
  targetType: NotificationTargetType;
  targetId: number;
  redirectUrl: string;
  isRead: boolean;
  createdAt: string;
}

export type GetNotificationsResponseDto = NotificationDto[];
