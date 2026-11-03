import { decodeJwt } from 'jose';
import { delay, http, HttpResponse } from 'msw';

import { API_BASE_URL } from '../../constants/env';
import { defaultRequiredFields } from '../../constants/requiredFields';
import type { NotificationDto } from '@dto/notificationDto';
import { parsePositiveId } from '../../utils/id';
import {
  createScenarioNotifications,
  findScenarioSubmission,
  scenarioContests,
  scenarioFeedbacks,
  scenarioProjects,
  scenarioSubmissions,
} from '../data/notificationScenario';
import { mockTeamDetail } from '../data/teams';

const api = `${API_BASE_URL}/api`;
const notifications = new Map<string, NotificationDto[]>();
const getUser = (request: Request) => {
  try {
    return decodeJwt(request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '');
  } catch {
    return null;
  }
};
const isAdvisor = (request: Request) => {
  const roles = getUser(request)?.roles as string[] | undefined;
  return roles?.some((role) => ['ROLE_교수', 'ROLE_외부멘토'].includes(role)) ?? false;
};
const getNotifications = (request: Request) => {
  const user = getUser(request);
  if (!user?.sub) return null;
  if (!notifications.has(user.sub)) {
    notifications.set(
      user.sub,
      createScenarioNotifications(isAdvisor(request), (user.roles as string[]).includes('ROLE_외부멘토')),
    );
  }
  return notifications.get(user.sub)!;
};
const forbidden = () => HttpResponse.json({ message: 'MSW: 접근 권한이 없습니다.' }, { status: 403 });
const hasTeam = (contestId: string, teamId: string) =>
  scenarioProjects[Number(contestId)]?.some((team) => team.teamId === parsePositiveId(teamId)) ?? false;
const canReadTeam = (request: Request, contestId: string, teamId: string) =>
  !!getUser(request) && hasTeam(contestId, teamId) && (isAdvisor(request) || ['101', '102'].includes(teamId));
const getSubmission = (contestId: string, submissionId: string) =>
  findScenarioSubmission(Number(contestId), Number(submissionId));

// #307 수동/브라우저 검증용 상태는 새로고침하면 초기화된다.
export const notificationScenarioHandlers = [
  http.get(`${api}/contests/:contestId/template`, () => HttpResponse.json(defaultRequiredFields)),
  http.get(`${api}/teams/:teamId/image/posters`, () => new HttpResponse(null, { status: 404 })),
  http.get(`${api}/teams/:teamId/image/thumbnail`, () => new HttpResponse(null, { status: 404 })),
  http.get(`${api}/contests/:contestId/vote`, () =>
    HttpResponse.json({ voteStartAt: '2020-01-01T00:00:00', voteEndAt: '2020-01-02T00:00:00' }),
  ),
  http.get(`${api}/notifications`, ({ request }) => {
    const list = getNotifications(request);
    return list ? HttpResponse.json(list) : forbidden();
  }),
  http.patch(`${api}/notifications/:id`, ({ request, params }) => {
    const item = getNotifications(request)?.find((entry) => entry.id === Number(params.id));
    if (!item) return new HttpResponse(null, { status: 404 });
    item.isRead = true;
    return new HttpResponse(null, { status: 204 });
  }),
  http.patch(`${api}/notifications`, ({ request }) => {
    const list = getNotifications(request);
    if (!list) return forbidden();
    list.forEach((item) => {
      item.isRead = true;
    });
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${api}/mentors/me/contests`, ({ request }) =>
    isAdvisor(request) ? HttpResponse.json(scenarioContests) : forbidden(),
  ),
  http.get(`${api}/mentors/me/contests/:contestId/teams`, ({ request, params }) =>
    isAdvisor(request) && scenarioProjects[Number(params.contestId)]
      ? HttpResponse.json(scenarioProjects[Number(params.contestId)])
      : forbidden(),
  ),
  http.get(`${api}/mentors/me/contests/:contestId/teams/:teamId/submissions`, ({ request, params }) => {
    const { contestId, teamId } = params as { contestId: string; teamId: string };
    if (!isAdvisor(request) || !hasTeam(contestId, teamId)) return forbidden();
    const project = scenarioProjects[Number(contestId)].find((team) => team.teamId === Number(teamId))!;
    return HttpResponse.json({
      ...project,
      submissions: scenarioSubmissions(Number(contestId), Number(teamId)).map((item) => ({
        ...item,
        feedbackStatus: scenarioFeedbacks.has(`${contestId}:${item.submissionId}`) ? 'COMPLETED' : 'PENDING',
      })),
    });
  }),
  http.get(`${api}/contests/:contestId/submissions/:submissionId/feedbacks/me`, ({ request, params }) => {
    const { contestId, submissionId } = params as { contestId: string; submissionId: string };
    if (!isAdvisor(request) || !getSubmission(contestId, submissionId)) return forbidden();
    const feedback = scenarioFeedbacks.get(`${contestId}:${submissionId}`);
    return feedback ? HttpResponse.json(feedback) : new HttpResponse(null, { status: 404 });
  }),
  http.put(`${api}/contests/:contestId/submissions/:submissionId/feedbacks`, async ({ request, params }) => {
    const { contestId, submissionId } = params as { contestId: string; submissionId: string };
    if (!isAdvisor(request) || !getSubmission(contestId, submissionId)) return forbidden();
    const body = await request.formData();
    const description = String(body.get('description') ?? '');
    await delay(800);
    if (description.includes('[실패]'))
      return HttpResponse.json({ message: 'MSW 저장 실패 시나리오' }, { status: 500 });
    const key = `${contestId}:${submissionId}`;
    const previous = scenarioFeedbacks.get(key);
    const removed = body.getAll('removeFileIds').map(Number);
    const files = (previous?.files ?? []).filter((file) => !removed.includes(file.fileId));
    const uploaded = body.getAll('files').filter((file): file is File => typeof file !== 'string');
    const now = new Date().toISOString();
    scenarioFeedbacks.set(key, {
      feedbackId: Number(submissionId),
      description,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
      files: [
        ...files,
        ...uploaded.map((file, index) => ({ fileId: Date.now() + index, fileName: file.name, fileSize: file.size })),
      ],
    });
    return HttpResponse.json(scenarioFeedbacks.get(key));
  }),
  http.get(`${api}/contests/:contestId/submissions`, ({ request, params }) => {
    const contestId = String(params.contestId);
    const teamId = new URL(request.url).searchParams.get('teamId') ?? '';
    return canReadTeam(request, contestId, teamId)
      ? HttpResponse.json(scenarioSubmissions(Number(contestId), Number(teamId)))
      : forbidden();
  }),
  http.get(`${api}/contests/:contestId/teams/:teamId/submissions/:section`, ({ request, params }) => {
    const { contestId, teamId, section } = params as { contestId: string; teamId: string; section: string };
    if (!canReadTeam(request, contestId, teamId)) return forbidden();
    if (section === 'summary')
      return HttpResponse.json({ totalItemCount: 2, submittedCount: 2, totalFeedbackCount: 1 });
    if (section === 'timeline') return HttpResponse.json(scenarioSubmissions(Number(contestId), Number(teamId)));
    return new HttpResponse(null, { status: 404 });
  }),
  http.get(`${api}/contests/:contestId/submission-items/:itemId`, ({ params }) => {
    const itemId = Number(params.itemId);
    if (![Number(params.contestId) * 10 + 1, Number(params.contestId) * 10 + 2].includes(itemId))
      return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      name: itemId % 10 === 1 ? '기획서' : '최종 보고서',
      description: 'MSW 제출 항목',
      startAt: '2020-01-01T00:00:00',
      endAt: '2099-12-31T23:59:00',
      allowLateSubmission: true,
      allowedFileFormats: ['PDF'],
      maxFileSizeMb: 10,
      maxFileCount: 5,
      visibility: 'TEAM',
    });
  }),
  http.get(`${api}/contests/:contestId/submissions/upcoming`, () => HttpResponse.json([])),
  http.get(`${api}/contests/:contestId/submissions/:submissionId`, ({ request, params }) => {
    const { contestId, submissionId } = params as { contestId: string; submissionId: string };
    const found = getSubmission(contestId, submissionId);
    if (!found || !canReadTeam(request, contestId, String(found.project.teamId))) return forbidden();
    return HttpResponse.json({
      ...found.project,
      ...found.submission,
      projectOverview: 'MSW 테스트 프로젝트',
      firstSubmittedAt: '2026-10-01T10:00:00',
      lastModifiedAt: '2026-10-02T10:00:00',
      feedbackCount: 1,
    });
  }),
  http.get(`${api}/contests/:contestId/submissions/:submissionId/feedbacks`, ({ request, params }) => {
    const { contestId, submissionId } = params as { contestId: string; submissionId: string };
    const found = getSubmission(contestId, submissionId);
    if (!found || !canReadTeam(request, contestId, String(found.project.teamId))) return forbidden();
    return HttpResponse.json([
      {
        feedbackId: 1,
        memberId: 31,
        memberName: '박지윤',
        memberRoleType: 'ROLE_교수',
        description: `${found.submission.submissionItemName} 피드백입니다.`,
        createdAt: '2026-10-27T10:00:00',
        updatedAt: '2026-10-27T10:00:00',
        files: [],
      },
    ]);
  }),
  http.get(`${api}/contests/:contestId/teams/:teamId/submissions/:submissionId/memos`, () => HttpResponse.json(null)),
  http.get(`${api}/teams/:teamId`, ({ params }) => {
    const teamId = Number(params.teamId);
    if (![101, 102, 103, 104].includes(teamId)) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      ...mockTeamDetail,
      teamId,
      teamName: `테스트 팀 ${teamId}`,
      contestId: teamId === 102 ? 2 : 1,
      previewIds: [],
      githubPath: null,
      youTubePath: null,
      productionPath: null,
    });
  }),
  http.get(`${api}/contests/:contestId/teams/:teamId/summary`, ({ request, params }) => {
    if (!canReadTeam(request, String(params.contestId), String(params.teamId))) return forbidden();
    return HttpResponse.json({
      pendingSubmissionCount: 0,
      nearestDeadline: '2099-12-31T23:59:00',
      unreadFeedbackCount: 1,
      latestFeedbackPreview: '기획서 피드백을 확인해주세요.',
    });
  }),
];
