export interface NoticeRequestDto {
  title: string;
  description: string;
}

export interface NoticeListDto {
  noticeId: number;
  title: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface NoticeDetailDto {
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
