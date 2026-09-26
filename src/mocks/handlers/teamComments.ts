import { decodeJwt } from 'jose';
import { delay, http, HttpResponse } from 'msw';

import { API_BASE_URL } from '../../constants/env';
import type {
  CommentCreateRequestDto,
  CommentDto,
  CommentMemberRoleType,
  CommentVisibility,
} from '@dto/projectViewerDto';
import { mockTeamComments } from '../data/teamComments';
import { mockTeamDetail } from '../data/teams';
import type { MemberType } from 'types/MemberType';

const MAX_COMMENT_LENGTH = 3000;

interface MockMember {
  id: number;
  name: string;
  roles: MemberType[];
}

interface CommentUpdateRequest {
  description: string;
}

const getRequestMember = (request: Request): MockMember | null => {
  const authorization = request.headers.get('Authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return null;

  try {
    const payload = decodeJwt(token);
    const roles = payload.roles;
    if (!payload.sub || !payload.name || !Array.isArray(roles)) return null;

    return {
      id: Number(payload.sub),
      name: String(payload.name),
      roles: roles as MemberType[],
    };
  } catch {
    return null;
  }
};

const getVisibility = (request: Request): CommentVisibility | null | 'INVALID' => {
  const visibility = new URL(request.url).searchParams.get('visibility');
  if (visibility === null || visibility === '') return null;
  if (visibility === 'PUBLIC' || visibility === 'TEAM') return visibility;
  return 'INVALID';
};

const getTeamId = (params: Record<string, string | readonly string[] | undefined>) => Number(params.teamId);

const getCommentId = (params: Record<string, string | readonly string[] | undefined>) => Number(params.commentId);

const isValidDescription = (description: unknown): description is string =>
  typeof description === 'string' && description.trim().length > 0 && description.length <= MAX_COMMENT_LENGTH;

const getAdvisorRole = (member: MockMember): CommentMemberRoleType | null => {
  if (member.roles.includes('ROLE_교수')) return 'ROLE_교수';
  if (member.roles.includes('ROLE_외부멘토')) return 'ROLE_외부멘토';
  return null;
};

const canViewAllTeamComments = (member: MockMember) =>
  member.roles.includes('ROLE_관리자') || mockTeamDetail.teamMembers.some(({ memberId }) => memberId === member.id);

const findComment = (teamId: number, commentId: number) =>
  mockTeamComments.find((comment) => comment.teamId === teamId && comment.commentId === commentId);

const unauthorizedResponse = () => HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });

const invalidDescriptionResponse = () =>
  HttpResponse.json({ message: '댓글은 공백이 아니며 최대 3000자까지 작성할 수 있습니다.' }, { status: 400 });

export const teamCommentsHandlers = [
  http.get(`${API_BASE_URL}/api/teams/:teamId/comments`, async ({ request, params }) => {
    await delay(200);
    const member = getRequestMember(request);
    if (!member) return unauthorizedResponse();

    const visibility = getVisibility(request);
    if (visibility === 'INVALID') {
      return HttpResponse.json({ message: '유효하지 않은 댓글 공개 범위입니다.' }, { status: 400 });
    }

    const teamId = getTeamId(params);
    const comments = mockTeamComments
      .filter((comment) => comment.teamId === teamId)
      .filter((comment) => visibility === null || comment.visibility === visibility)
      .filter(
        (comment) =>
          comment.visibility === 'PUBLIC' || canViewAllTeamComments(member) || comment.memberId === member.id,
      )
      .sort((a, b) => b.commentId - a.commentId);

    return HttpResponse.json(comments);
  }),

  http.post(`${API_BASE_URL}/api/teams/:teamId/comments`, async ({ request, params }) => {
    await delay(200);
    const member = getRequestMember(request);
    if (!member) return unauthorizedResponse();

    const body = (await request.json()) as Partial<CommentCreateRequestDto>;
    if (!isValidDescription(body.description) || (body.visibility !== 'PUBLIC' && body.visibility !== 'TEAM')) {
      return invalidDescriptionResponse();
    }

    const advisorRole = getAdvisorRole(member);
    if (body.visibility === 'TEAM' && advisorRole === null) {
      return HttpResponse.json({ message: '팀 피드백 작성 권한이 없습니다.' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const nextCommentId = Math.max(0, ...mockTeamComments.map(({ commentId }) => commentId)) + 1;
    const comment: CommentDto = {
      commentId: nextCommentId,
      description: body.description,
      visibility: body.visibility,
      memberId: member.id,
      memberName: member.name,
      memberRoleType: advisorRole,
      teamId: getTeamId(params),
      createdAt: now,
      updatedAt: now,
    };

    mockTeamComments.unshift(comment);
    return new HttpResponse(null, { status: 201 });
  }),

  http.patch(`${API_BASE_URL}/api/teams/:teamId/comments/:commentId`, async ({ request, params }) => {
    await delay(200);
    const member = getRequestMember(request);
    if (!member) return unauthorizedResponse();

    const teamId = getTeamId(params);
    const comment = findComment(teamId, getCommentId(params));
    if (!comment) return HttpResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    if (comment.memberId !== member.id) {
      return HttpResponse.json({ message: '본인이 작성한 댓글만 수정할 수 있습니다.' }, { status: 403 });
    }

    const body = (await request.json()) as Partial<CommentUpdateRequest>;
    if (!isValidDescription(body.description)) return invalidDescriptionResponse();

    comment.description = body.description;
    comment.updatedAt = new Date().toISOString();
    return new HttpResponse(null, { status: 200 });
  }),

  http.delete(`${API_BASE_URL}/api/teams/:teamId/comments/:commentId`, async ({ request, params }) => {
    await delay(200);
    const member = getRequestMember(request);
    if (!member) return unauthorizedResponse();

    const teamId = getTeamId(params);
    const commentId = getCommentId(params);
    const commentIndex = mockTeamComments.findIndex(
      (comment) => comment.teamId === teamId && comment.commentId === commentId,
    );
    if (commentIndex === -1) {
      return HttpResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (mockTeamComments[commentIndex].memberId !== member.id) {
      return HttpResponse.json({ message: '본인이 작성한 댓글만 삭제할 수 있습니다.' }, { status: 403 });
    }

    mockTeamComments.splice(commentIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
