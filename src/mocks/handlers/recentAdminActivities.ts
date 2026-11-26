import { decodeJwt } from 'jose';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../../constants/env';
import type { AdminRecentActivityDto } from '@dto/dashboardDto';

export const recentAdminActivityHandlers = [
  http.get(`${API_BASE_URL}/api/admin/dashboard/recent-activities`, ({ request }) => {
    try {
      const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
      const roles = decodeJwt(token).roles;
      if (!Array.isArray(roles) || !roles.includes('ROLE_관리자')) return new HttpResponse(null, { status: 403 });
    } catch {
      return new HttpResponse(null, { status: 403 });
    }
    const now = Date.now();
    const examples: AdminRecentActivityDto[] = [
      {
        id: 4,
        type: 'MEMBER_ROLES_CHANGED',
        actorName: '관리자',
        targetType: 'MEMBER',
        targetName: '홍길동',
        contestId: null,
        contestName: null,
        summary: '홍길동님의 역할이 학생에서 교수로 변경됨',
        createdAt: new Date(now - 10 * 60_000).toISOString(),
      },
      {
        id: 3,
        type: 'ADMIN_PERMISSION_GRANTED',
        actorName: '관리자',
        targetType: 'MEMBER',
        targetName: '김철수',
        contestId: null,
        contestName: null,
        summary: '김철수님에게 관리자 권한이 부여됨',
        createdAt: new Date(now - 15 * 60_000).toISOString(),
      },
      {
        id: 2,
        type: 'ADMIN_PERMISSION_REVOKED',
        actorName: '관리자',
        targetType: 'MEMBER',
        targetName: '이영희',
        contestId: null,
        contestName: null,
        summary: '이영희님의 관리자 권한이 회수됨',
        createdAt: new Date(now - 60 * 60_000).toISOString(),
      },
      {
        id: 1,
        type: 'MEMBER_WITHDRAWN_BY_ADMIN',
        actorName: '관리자',
        targetType: 'MEMBER',
        targetName: '박민수',
        contestId: null,
        contestName: null,
        summary: '박민수님의 계정이 탈퇴 처리됨',
        createdAt: new Date(now - 24 * 60 * 60_000).toISOString(),
      },
    ];
    return HttpResponse.json(examples);
  }),
];
