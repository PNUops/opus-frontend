import type { GetCommentsPaginationResponseDto } from 'types/DTO/commentDto';

export const mockCommentsPagination: GetCommentsPaginationResponseDto = {
  content: [
    {
      commentId: 1,
      content: '멋진 프로젝트네요!',
      createdAt: '2026-03-14T10:00:00Z',
      teamId: 101,
      teamName: '오푸스팀',
      projectName: 'Opus Project',
      overview: '프로젝트 개요입니다.',
      thumbnailUrl: 'https://example.com/thumb1.png',
      contestId: 201,
      contestName: '2026 해커톤',
      categoryName: '웹',
      trackName: '프론트엔드',
    },
    {
      commentId: 2,
      content: '기능이 인상적입니다.',
      createdAt: '2026-03-14T11:00:00Z',
      teamId: 102,
      teamName: '코드마스터',
      projectName: 'Code Master',
      overview: null,
      thumbnailUrl: null,
      contestId: 202,
      contestName: '2026 아이디어톤',
      categoryName: '앱',
      trackName: '백엔드',
    },
  ],
  totalElements: 2,
  totalPages: 1,
  currentPage: 1,
  size: 10,
};
