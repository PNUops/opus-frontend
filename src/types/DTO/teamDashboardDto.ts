export interface TeamDashboardSummaryResponseDto {
  pendingSubmissionCount: number;
  nearestDeadline: string | null;
  unreadFeedbackCount: number;
  latestFeedbackPreview: string | null;
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
