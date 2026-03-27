export interface CommentDto {
  commentId: number;
  content: string;
  createdAt: string;
  memberName: string;
}

export interface ProjectDto {
  contestId: number;
  contestName: string;
  categoryName: string;
  trackName: string;
  teamId: number;
  teamName: string;
  projectName: string;
  overview: string | null;
}

export interface MyCommentItemDto {
  comment: CommentDto;
  project: ProjectDto;
}

import { PaginationResponseDto } from './commonDto';

export interface GetCommentsPaginationResponseDto extends PaginationResponseDto<MyCommentItemDto> {
  currentPage: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}
