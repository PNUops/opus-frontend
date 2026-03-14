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

export interface GetCommentsPaginationResponseDto {
  content: MyCommentItemDto[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}
