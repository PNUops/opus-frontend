import type { AdvisorFeedbackStatus, AdvisorProjectDto, AdvisorRoleType, AdvisorSubmissionDto } from '@dto/advisorDto';
import type { SubmissionFileResponseDto } from '@dto/submissionDto';

export type AdvisorSubmissionFile = SubmissionFileResponseDto & {
  feedbackId?: number;
  source?: 'feedback' | 'local' | 'submission';
  sourceFile?: File;
  submissionId?: number;
};

export type { AdvisorFeedbackStatus, AdvisorRoleType };

export interface AdvisorSubmission extends Omit<AdvisorSubmissionDto, 'files'> {
  feedbackFiles?: AdvisorSubmissionFile[];
  files: AdvisorSubmissionFile[];
  isFeedbackLoading?: boolean;
}

export interface AdvisorProject extends AdvisorProjectDto {
  submissions: AdvisorSubmission[];
}

export interface AdvisorActivityContest {
  contestId: number;
  contestName: string;
  tags: string[];
  assignedTeamCount: number;
  pendingFeedbackCount: number;
  projects: AdvisorProject[];
}
