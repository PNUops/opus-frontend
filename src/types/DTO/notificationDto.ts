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
  /** 팀 알림은 팀 ID, 제출·피드백은 제출물 ID, 마감은 제출 항목 ID */
  targetId: number;
  redirectUrl: string;
  isRead: boolean;
  createdAt: string;
}

export type GetNotificationsResponseDto = NotificationDto[];
