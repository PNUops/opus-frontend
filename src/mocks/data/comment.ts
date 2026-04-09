import type { GetCommentsPaginationResponseDto } from '@dto/commentDto';

const mockComments = [
  {
    comment: {
      commentId: 1,
      content: '멋진 프로젝트네요!',
      createdAt: '2026-03-14T10:00:00Z',
      memberName: '홍길동',
    },
    project: {
      contestId: 201,
      contestName: '제6회창의융합해커톤대회',
      categoryName: '해커톤',
      trackName: '창업 트랙',
      teamId: 101,
      teamName: '오푸스팀',
      projectName: 'Opus Project',
      overview:
        '프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. ',
    },
  },
  {
    comment: {
      commentId: 2,
      content: '기능이 인상적입니다.',
      createdAt: '2026-03-14T11:00:00Z',
      memberName: '김개발',
    },
    project: {
      contestId: 202,
      contestName: '2026 아이디어톤',
      categoryName: '앱',
      trackName: '백엔드',
      teamId: 102,
      teamName: '코드마스터',
      projectName: 'Code Master',
      overview: null,
    },
  },
  {
    comment: {
      commentId: 3,
      content: 'UI가 정말 깔끔하네요!',
      createdAt: '2026-03-14T12:00:00Z',
      memberName: '이디자이너',
    },
    project: {
      contestId: 203,
      contestName: '2026 디자인톤',
      categoryName: '디자인',
      trackName: 'UX/UI',
      teamId: 103,
      teamName: '디자인러버',
      projectName: 'Design Lover',
      overview: '사용자 경험을 극대화한 디자인 프로젝트입니다.',
    },
  },
  {
    comment: {
      commentId: 4,
      content: '백엔드 구조가 탄탄해 보여요.',
      createdAt: '2026-03-14T13:00:00Z',
      memberName: '박백엔드',
    },
    project: {
      contestId: 204,
      contestName: '2026 시스템톤',
      categoryName: '시스템',
      trackName: '인프라',
      teamId: 104,
      teamName: '인프라마스터',
      projectName: 'Infra Master',
      overview: '안정적인 시스템 구축을 목표로 한 프로젝트입니다.',
    },
  },
  {
    comment: {
      commentId: 5,
      content: '백엔드 구조가 탄탄해 보여요.',
      createdAt: '2026-03-14T13:00:00Z',
      memberName: '박백엔드',
    },
    project: {
      contestId: 204,
      contestName: '2026 시스템톤',
      categoryName: '시스템',
      trackName: '인프라',
      teamId: 104,
      teamName: '인프라마스터',
      projectName: 'Infra Master',
      overview: '안정적인 시스템 구축을 목표로 한 프로젝트입니다.',
    },
  },
];

export const getMockMyComments = (page = 0, size = 10): GetCommentsPaginationResponseDto => {
  const content = mockComments.slice(page * size, (page + 1) * size);
  const totalElements = mockComments.length;
  const totalPages = Math.ceil(totalElements / size);

  return {
    content,
    totalElements,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
    currentPage: page,
    size,
    number: page,
    sort: {
      empty: false,
      sorted: true,
      unsorted: false,
    },
    numberOfElements: content.length,
    empty: content.length === 0,
  };
};

export const mockCommentsPagination: GetCommentsPaginationResponseDto = {
  content: [
    {
      comment: {
        commentId: 1,
        content: '멋진 프로젝트네요!',
        createdAt: '2026-03-14T10:00:00Z',
        memberName: '홍길동',
      },
      project: {
        contestId: 201,
        contestName: '제6회창의융합해커톤대회',
        categoryName: '해커톤',
        trackName: '창업 트랙',
        teamId: 101,
        teamName: '오푸스팀',
        projectName: 'Opus Project',
        overview:
          '프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. 프로젝트 개요입니다. ',
      },
    },
    {
      comment: {
        commentId: 2,
        content: '기능이 인상적입니다.',
        createdAt: '2026-03-14T11:00:00Z',
        memberName: '김개발',
      },
      project: {
        contestId: 202,
        contestName: '2026 아이디어톤',
        categoryName: '앱',
        trackName: '백엔드',
        teamId: 102,
        teamName: '코드마스터',
        projectName: 'Code Master',
        overview: null,
      },
    },
    {
      comment: {
        commentId: 3,
        content: 'UI가 정말 깔끔하네요!',
        createdAt: '2026-03-14T12:00:00Z',
        memberName: '이디자이너',
      },
      project: {
        contestId: 203,
        contestName: '2026 디자인톤',
        categoryName: '디자인',
        trackName: 'UX/UI',
        teamId: 103,
        teamName: '디자인러버',
        projectName: 'Design Lover',
        overview: '사용자 경험을 극대화한 디자인 프로젝트입니다.',
      },
    },
    {
      comment: {
        commentId: 4,
        content: '백엔드 구조가 탄탄해 보여요.',
        createdAt: '2026-03-14T13:00:00Z',
        memberName: '박백엔드',
      },
      project: {
        contestId: 204,
        contestName: '2026 시스템톤',
        categoryName: '시스템',
        trackName: '인프라',
        teamId: 104,
        teamName: '인프라마스터',
        projectName: 'Infra Master',
        overview: '안정적인 시스템 구축을 목표로 한 프로젝트입니다.',
      },
    },
    {
      comment: {
        commentId: 5,
        content: '백엔드 구조가 탄탄해 보여요.',
        createdAt: '2026-03-14T13:00:00Z',
        memberName: '박백엔드',
      },
      project: {
        contestId: 204,
        contestName: '2026 시스템톤',
        categoryName: '시스템',
        trackName: '인프라',
        teamId: 104,
        teamName: '인프라마스터',
        projectName: 'Infra Master',
        overview: '안정적인 시스템 구축을 목표로 한 프로젝트입니다.',
      },
    },
  ],
  totalElements: 5,
  totalPages: 1,
  first: true,
  last: true,
  currentPage: 0,
  size: 10,
  number: 0,
  sort: {
    empty: false,
    sorted: true,
    unsorted: false,
  },
  numberOfElements: 2,
  empty: false,
};
