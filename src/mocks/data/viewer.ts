import type { ProjectDetailsResponseDto } from '../../types/DTO/projectViewerDto';

export const team_thumbnail =
  'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D';

export const team_images = [
  {
    teamId: 0,
    imageId: 1,
    imageUrl:
      'https://images.unsplash.com/vector-1748299004095-7912fef01c10?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxpbGx1c3RyYXRpb25zLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    teamId: 1,
    imageId: 2,
    imageUrl:
      'https://images.unsplash.com/vector-1748107986890-a07178dfe2c4?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxpbGx1c3RyYXRpb25zLWZlZWR8Nnx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    teamId: 2,
    imageId: 3,
    imageUrl:
      'https://images.unsplash.com/vector-1748448815232-0e1a737114d1?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxpbGx1c3RyYXRpb25zLWZlZWR8MTF8fHxlbnwwfHx8fHw%3D',
  },
];

export const project_view: ProjectDetailsResponseDto = {
  contestId: 1,
  contestName: '제6회PNU창의융합SW해커톤',
  trackId: 10,
  trackName: '웹/모바일',
  teamId: 1,
  teamName: 'PNU OPS',
  leaderId: 2,
  projectName: 'Ops Bakery',
  professorName: null,
  leaderName: '홍지연',
  teamMembers: [
    { teamMemberId: 1, teamMemberName: '김철수' },
    { teamMemberId: 2, teamMemberName: '박영희' },
    { teamMemberId: 3, teamMemberName: '최민수' },
  ],
  overview:
    '오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. 오래된 개발 서적으로 빵을 만드는 프로젝트입니다. ',
  previewIds: [1, 2, 3],
  productionPath: null,
  githubPath: 'https://github.com/facebook/react',
  youTubePath: 'https://youtu.be/Ywd6jylpd_g?si=y8DoDwtBbVpj3_bo',
  isLiked: false,
  isVoted: null,
};
