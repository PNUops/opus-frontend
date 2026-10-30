import type { AdvisorContestDto, AdvisorFeedbackDto, AdvisorProjectDto } from '@dto/advisorDto';
import type { MySubmissionListItemDto } from '@dto/meDto';
import type { NotificationDto, NotificationTargetType } from '@dto/notificationDto';

export const scenarioContests: AdvisorContestDto[] = [1, 2].map((contestId) => ({
  contestId,
  contestName: `알림 테스트 대회 ${contestId}`,
  categoryName: 'MSW',
  assignedTrackNames: ['소프트웨어'],
  totalAssignedTeamCount: contestId === 1 ? 2 : 1,
  totalPendingFeedbackCount: 2,
}));

export const scenarioProjects: Record<number, AdvisorProjectDto[]> = {
  1: [101, 103].map((teamId) => ({
    teamId,
    teamName: `테스트 팀 ${teamId}`,
    projectName: `프로젝트 ${teamId}`,
    trackName: '소프트웨어',
    roleType: 'ROLE_교수',
    pendingFeedbackCount: 2,
  })),
  2: [
    {
      teamId: 102,
      teamName: '테스트 팀 102',
      projectName: '다른 대회 프로젝트',
      trackName: '소프트웨어',
      roleType: 'ROLE_교수',
      pendingFeedbackCount: 2,
    },
  ],
};

export const scenarioSubmissions = (contestId: number, teamId: number): MySubmissionListItemDto[] =>
  ['기획서', '최종 보고서'].map((name, index) => ({
    submissionItemId: contestId * 10 + index + 1,
    submissionId: teamId * 10 + index + 1,
    submissionItemName: name,
    description: `${teamId}팀의 ${name}`,
    deadlineAt: '2099-12-31T23:59:00',
    status: 'SUBMITTED',
    files: [{ fileId: teamId * 100 + index, fileName: `${teamId}-${name}.pdf`, fileSize: 1024 }],
  }));

export const findScenarioSubmission = (contestId: number, submissionId: number) => {
  for (const project of scenarioProjects[contestId] ?? []) {
    const submission = scenarioSubmissions(contestId, project.teamId).find(
      (item) => item.submissionId === submissionId,
    );
    if (submission) return { project, submission };
  }
  return null;
};

export const scenarioFeedbacks = new Map<string, AdvisorFeedbackDto>();

export const createScenarioNotifications = (isAdvisor: boolean, isMentor: boolean): NotificationDto[] => {
  const entries: [NotificationTargetType, string, string, number][] = isAdvisor
    ? [
        [
          isMentor ? 'MENTOR_ASSIGNED' : 'ADVISOR_ASSIGNED',
          '단일 팀 지정',
          '/me/advisor-activity/contests/1?teamId=103',
          103,
        ],
        [isMentor ? 'MENTOR_ASSIGNED' : 'ADVISOR_ASSIGNED', '복수 팀 지정', '/me/advisor-activity/contests/1', 101],
        [isMentor ? 'MENTOR_UNASSIGNED' : 'ADVISOR_UNASSIGNED', '지정 해제', '/contest/1/teams/view/104', 104],
        ['ADVISOR_ASSIGNED', '다른 대회 지정', '/me/advisor-activity/contests/2?teamId=102', 102],
        ['ADVISOR_ASSIGNED', '담당하지 않는 팀', '/me/advisor-activity/contests/1?teamId=999', 999],
        ['ADVISOR_ASSIGNED', '중복 팀 ID', '/me/advisor-activity/contests/1?teamId=101&teamId=103', 101],
        ['ADVISOR_ASSIGNED', '권한 없는 대회', '/me/advisor-activity/contests/999?teamId=101', 101],
      ]
    : [
        ['SUBMISSION_COMPLETED', '기획서 제출 완료', '/me/contests/1/teams/101/submissions?submissionItemId=11', 1011],
        ['SUBMISSION_FEEDBACK', '최종 보고서 피드백', '/me/contests/1/teams/101/submissions?submissionItemId=12', 1012],
        ['SUBMISSION_DEADLINE', '최종 보고서 마감', '/me/contests/1/teams/101/submissions?submissionItemId=12', 12],
        ['ADVISOR_ASSIGNED', '지도교수 지정', '/me/contests/1/teams/101/dashboard', 101],
        ['ADVISOR_UNASSIGNED', '지도교수 지정 해제', '/me/contests/1/teams/101/dashboard', 101],
        ['MENTOR_ASSIGNED', '멘토 지정', '/me/contests/1/teams/101/dashboard', 101],
        ['MENTOR_UNASSIGNED', '멘토 지정 해제', '/me/contests/1/teams/101/dashboard', 101],
        [
          'SUBMISSION_FEEDBACK',
          '존재하지 않는 제출 항목',
          '/me/contests/1/teams/101/submissions?submissionItemId=999',
          999,
        ],
        ['SUBMISSION_FEEDBACK', '권한 없는 팀 제출물', '/me/contests/1/teams/999/submissions?submissionItemId=11', 999],
        [
          'SUBMISSION_FEEDBACK',
          '중복 제출 항목 ID',
          '/me/contests/1/teams/101/submissions?submissionItemId=11&submissionItemId=12',
          1011,
        ],
      ];
  entries.push(
    ['TEAM', '기존 팀 알림', '/teams/101', 101],
    ['TEAM_COMMENT', '기존 댓글 알림', '/teams/101', 101],
    ['TEAM_AWARDS', '기존 수상 알림', '/teams/101', 101],
    ['TEAM', '외부 URL 차단', 'https://example.com/teams/101', 101],
  );
  return entries.map(([targetType, title, redirectUrl, targetId], index) => ({
    id: index + 1,
    targetType,
    title: `[MSW] ${title}`,
    content: `서버 본문: ${title}`,
    redirectUrl,
    targetId,
    createdAt: '2026-10-27T10:00:00',
    isRead: false,
  }));
};
