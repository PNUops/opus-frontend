import type { MyProjectDto } from '@dto/meDto';
import type { TeamDetailDto } from '@dto/teams/teamsDto';
import type { GetUpcomingSubmissionsResponseDto, TeamDashboardSummaryResponseDto } from '@dto/teamDashboardDto';

export const mockMyProjects: MyProjectDto[] = [
  {
    contestId: 1,
    contestName: '제6회 창의융합해커톤대회',
    teamId: 10,
    teamName: '00. TeamName',
    projectName: 'artify',
    awards: [],
  },
];

export const mockTeamDetail: TeamDetailDto = {
  contestId: 1,
  contestName: '제6회 창의융합해커톤대회',
  trackId: 1,
  trackName: '창업 트랙',
  teamId: 10,
  teamName: '00. TeamName',
  projectName: 'artify',
  teamMembers: [
    {
      memberId: 1,
      teamMemberName: '김민수',
      roleType: 'ROLE_팀장',
    },
  ],
  professorName: null,
  githubPath: null,
  youTubePath: null,
  productionPath: 'https://example.com/archive/artify',
  overview: '팀 대시보드 UI 확인을 위한 mock 프로젝트입니다.',
  previewIds: [],
  isLiked: false,
  isVoted: false,
  awards: [],
};

export const mockTeamDashboardSummary: TeamDashboardSummaryResponseDto = {
  submissionSummary: {
    requiredCount: 2,
    nearestDueDate: '2026-07-23T23:59:00',
  },
  feedbackSummary: {
    unreadCount: 3,
    latestFeedback: {
      mentorName: '김민수',
      content: '자료 흐름은 명확하지만 실험 결과 설명이 조금 더 필요합니다. 예시로 첨부 파일을 참고해주세요.',
    },
  },
};

export const mockUpcomingSubmissions: GetUpcomingSubmissionsResponseDto = [
  {
    submissionItemId: 201,
    submissionTypeName: '중간발표 자료',
    deadlineAt: '2026-07-15T23:59:00',
    lastModifiedAt: '2026-07-16T00:01:00',
    status: 'LATE',
  },
  {
    submissionItemId: 202,
    submissionTypeName: '최종발표 자료',
    deadlineAt: '2026-07-20T23:59:00',
    lastModifiedAt: '2026-07-18T23:59:00',
    status: 'SUBMITTED',
  },
  {
    submissionItemId: 203,
    submissionTypeName: '시연영상',
    deadlineAt: '2026-07-21T23:59:00',
    lastModifiedAt: null,
    status: 'NOT_SUBMITTED',
  },
];
