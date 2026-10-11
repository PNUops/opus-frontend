export type NotificationTargetType =
  | 'TEAM'
  | 'TEAM_COMMENT'
  | 'TEAM_AWARD'
  | 'TEAM_AWARDS'
  | 'SUBMISSION_COMPLETED'
  | 'SUBMISSION_FEEDBACK'
  | 'SUBMISSION_DEADLINE'
  | 'ADVISOR_ASSIGNED'
  | 'ADVISOR_UNASSIGNED'
  | 'MENTOR_ASSIGNED'
  | 'MENTOR_UNASSIGNED';

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
