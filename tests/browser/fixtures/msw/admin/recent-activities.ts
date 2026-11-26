import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  http.get('/api/categories', () => HttpResponse.json([])),
  http.get('/api/notifications', () => HttpResponse.json([])),
  http.get('/api/admin/dashboard/recent-activities', async () => {
    await delay(300);
    return HttpResponse.json([
      {
        id: 4,
        type: 'MEMBER_ROLES_CHANGED',
        actorName: '운영자',
        targetType: 'MEMBER',
        targetName: '첫 대상',
        contestId: null,
        contestName: null,
        summary: '첫 번째 이력',
        createdAt: '2026-11-19T14:30:00',
      },
      {
        id: 3,
        type: 'ADMIN_PERMISSION_GRANTED',
        actorName: '관리자',
        targetType: 'MEMBER',
        targetName: '두 번째 대상',
        contestId: 3,
        contestName: '테스트 대회',
        summary: '두 번째 이력',
        createdAt: '2026-11-19T13:05:00',
      },
      {
        id: 2,
        type: 'ADMIN_PERMISSION_REVOKED',
        actorName: '관리자',
        targetType: 'MEMBER',
        targetName: '세 번째 대상',
        contestId: null,
        contestName: null,
        summary: '세 번째 이력',
        createdAt: '2026-11-19T12:05:00',
      },
      {
        id: 1,
        type: 'MEMBER_WITHDRAWN_BY_ADMIN',
        actorName: '관리자',
        targetType: 'MEMBER',
        targetName: '네 번째 대상',
        contestId: null,
        contestName: null,
        summary: '네 번째 이력',
        createdAt: '2026-11-19T11:05:00',
      },
    ]);
  }),
];
