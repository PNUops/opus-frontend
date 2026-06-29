export type NotificationTargetType = 'TEAM' | 'TEAM_COMMENT' | 'TEAM_AWARD' | 'TEAM_AWARDS';

export interface NotificationDto {
  notificationId: number;
  title: string;
  content: string;
  targetType: NotificationTargetType;
  targetId: number;
  redirectUrl: string;
  isRead: boolean;
  createdAt: string;
}

export type GetNotificationsResponseDto = NotificationDto[];
