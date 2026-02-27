export interface PaginationRequestDto {
  page?: number;
  size?: number;
}

export interface PaginationResponseDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
