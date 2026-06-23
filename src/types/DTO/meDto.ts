import { AwardDto } from './awardsDto';
import type { SubmissionStatus } from './submissionDto';

export interface MyProjectDto {
  contestId: number;
  contestName: string;
  teamId: number;
  teamName: string;
  projectName: string;
  awards: AwardDto[];
}

export interface MyVoteDto {
  contestId: number;
  contestName: string;
  teamId: number;
  teamName: string;
  projectName: string;
}

export interface MyLikeDto {
  contestId: number;
  contestName: string;
  teamId: number;
  teamName: string;
  projectName: string;
}

import { PaginationResponseDto } from './commonDto';
interface MyLikeGridPagination extends PaginationResponseDto<MyLikeDto> {
  currentPage: number;
  size: number;
}

export type GetMyProjectsResponseDto = MyProjectDto[];

/** 나의 활동 - 제출물 상태 요약 */
export interface MySubmissionSummaryDto {
  /** 전체 제출물 수 */
  totalCount: number;
  /** 제출 완료 수 */
  submittedCount: number;
  /** 피드백 수 */
  feedbackCount: number;
}

export type GetMySubmissionSummaryResponseDto = MySubmissionSummaryDto;

/** 나의 활동 - 제출 타임라인 항목 */
export interface MySubmissionTimelineItemDto {
  /** 제출물 id */
  id: number;
  /** 제출물 항목 */
  title: string;
  /** 제출 마감일 (LocalDate) */
  dueDate: string;
  /** 제출 상태 */
  status: SubmissionStatus;
}

export type GetMySubmissionTimelineResponseDto = MySubmissionTimelineItemDto[];

export type GetMyVotesResponseDto = MyVoteDto[];

export type GetMyLikesPreviewResponseDto = MyLikeDto[]; // INFO: 미리보기는 3개까지만 반환
export type GetMyLikesResponseDto = MyLikeGridPagination;

import type { SortType } from '@pages/me/activity/types/filter';

export type GetMyLikesParamsDto = {
  sort?: SortType;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  contestId?: string;
  page?: number;
  size?: number;
};

export type GetMyCommentsParamsDto = {
  sort?: SortType;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
};
