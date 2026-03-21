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

interface MyLikeGridPagination {
  content: MyLikeDto[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export type GetMyProjectsResponseDto = MyProjectDto[];

export type GetMyVotesResponseDto = MyVoteDto[];

export type GetMyLikesPreviewResponseDto = MyLikeDto[]; // INFO: 미리보기는 3개까지만 반환
export type GetMyLikesResponseDto = MyLikeGridPagination;

export type GetMyLikesParamsDto = {
  sort?: 'latest' | 'oldest';
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  contestId?: string;
  page: number;
  size: number;
};
