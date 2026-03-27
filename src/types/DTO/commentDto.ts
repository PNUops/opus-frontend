interface MyCommentItemDto {
  commentId: number;
  content: string;
  createdAt: string;
  teamId: number;
  teamName: string;
  projectName: string;
  overview: string | null;
  thumbnailUrl: string | null;
  contestId: number;
  contestName: string;
  categoryName: string;
  trackName: string;
}

import { PaginationResponseDto } from './commonDto';

export interface GetCommentsPaginationResponseDto extends PaginationResponseDto<MyCommentItemDto> {
  currentPage: number;
  size: number;
}
