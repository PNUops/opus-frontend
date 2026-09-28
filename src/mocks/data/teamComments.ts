import type { CommentDto } from '@dto/projectViewerDto';

export const mockTeamComments: CommentDto[] = [
  {
    commentId: 2,
    description: '사용자 흐름이 명확해서 프로젝트의 목적을 이해하기 쉬웠어요.',
    visibility: 'PUBLIC',
    memberId: 1002,
    memberName: '이동혁',
    memberRoleType: null,
    teamId: 8,
    createdAt: '2026-09-20T14:10:00',
    updatedAt: '2026-09-20T14:10:00',
  },
  {
    commentId: 1,
    description: '실제 사용자에게 유용한 프로젝트가 될 것 같습니다.',
    visibility: 'PUBLIC',
    memberId: 1001,
    memberName: '홍지연',
    memberRoleType: null,
    teamId: 8,
    createdAt: '2026-09-19T11:20:00',
    updatedAt: '2026-09-19T11:20:00',
  },
  {
    commentId: 102,
    description: '서비스 운영 단계에서 필요한 데이터 수집 기준과 성과 지표를 함께 정리해보면 좋겠습니다.',
    visibility: 'TEAM',
    memberId: 32,
    memberName: '최민호',
    memberRoleType: 'ROLE_외부멘토',
    teamId: 8,
    createdAt: '2026-09-22T13:15:00',
    updatedAt: '2026-09-22T13:15:00',
  },
  {
    commentId: 101,
    description:
      '문제 정의와 사용자 조사가 잘 연결되어 있습니다. 다음 단계에서는 사용자 경험을 조금 더 구체화해보세요.',
    visibility: 'TEAM',
    memberId: 31,
    memberName: '박지윤',
    memberRoleType: 'ROLE_교수',
    teamId: 8,
    createdAt: '2026-09-21T09:30:00',
    updatedAt: '2026-09-21T09:30:00',
  },
];
