import type { MemberType } from 'types/MemberType';

import type { SubmissionFileResponseDto } from './submissionDto';

export type AdvisorRoleType = Extract<MemberType, 'ROLE_교수' | 'ROLE_외부멘토'>;
export type AdvisorFeedbackStatus = 'PENDING' | 'COMPLETED';

export interface AdvisorProjectDto {
  teamId: number;
  teamName: string;
  projectName: string;
  trackName: string;
  roleType: AdvisorRoleType;
  pendingFeedbackCount: number;
}

export interface GetAdvisorProjectsResponseDto {
  assignedTeamCount: number;
  pendingFeedbackCount: number;
  projects: AdvisorProjectDto[];
}

export interface AdvisorSubmissionDto {
  submissionId: number;
  submissionItemId: number;
  submissionItemName: string;
  feedbackStatus: AdvisorFeedbackStatus;
  files: SubmissionFileResponseDto[];
}

export interface GetAdvisorTeamSubmissionsResponseDto {
  teamId: number;
  teamName: string;
  projectName: string;
  trackName: string;
  pendingFeedbackCount: number;
  submissions: AdvisorSubmissionDto[];
}

export interface AdvisorFeedbackDto {
  feedbackId: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  files: SubmissionFileResponseDto[];
}

export interface PutAdvisorFeedbackRequestDto {
  description: string;
  files?: File[];
  removeFileIds?: number[];
}
