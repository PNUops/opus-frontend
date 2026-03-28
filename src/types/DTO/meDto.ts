import { AwardDto } from './awardsDto';

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
