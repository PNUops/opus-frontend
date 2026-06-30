export interface TeamDashboardSubmissionSummaryDto {
  requiredCount: number;
  nearestDueDate?: string | null;
}

export interface TeamDashboardLatestFeedbackDto {
  mentorName: string;
  content: string;
}

export interface TeamDashboardFeedbackSummaryDto {
  unreadCount: number;
  latestFeedback: TeamDashboardLatestFeedbackDto | null;
}

export interface TeamDashboardSummaryResponseDto {
  submissionSummary: TeamDashboardSubmissionSummaryDto;
  feedbackSummary: TeamDashboardFeedbackSummaryDto;
}

export type UpcomingSubmissionStatus = 'SUBMITTED' | 'LATE' | 'NOT_SUBMITTED';

export interface UpcomingSubmissionItemResponseDto {
  submissionItemId: number;
  submissionItemName: string;
  deadlineAt: string;
  lastModifiedAt: string | null;
  status: UpcomingSubmissionStatus;
}

export type GetUpcomingSubmissionsResponseDto = UpcomingSubmissionItemResponseDto[];
