import type { NotificationTargetType } from '@dto/notificationDto';

export const notificationTargetTypeLabel: Record<NotificationTargetType, string> = {
  TEAM: '프로젝트',
  TEAM_COMMENT: '댓글',
  TEAM_AWARD: '수상',
  TEAM_AWARDS: '수상',
  SUBMISSION_COMPLETED: '제출',
  SUBMISSION_FEEDBACK: '피드백',
  SUBMISSION_DEADLINE: '마감',
  ADVISOR_ASSIGNED: '지도교수',
  ADVISOR_UNASSIGNED: '지도교수',
  MENTOR_ASSIGNED: '멘토',
  MENTOR_UNASSIGNED: '멘토',
};
