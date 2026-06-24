import type { MySubmissionSummaryDto, MySubmissionTimelineItemDto } from '@dto/meDto';

/** TODO: API 연동 전 임시 제출물 상태 요약 목데이터 */
export const getMockMySubmissionSummary = (_teamId: number): MySubmissionSummaryDto => ({
  totalCount: 3,
  submittedCount: 1,
  feedbackCount: 5,
});

/** TODO: API 연동 전 임시 제출 타임라인 목데이터 */
export const getMockMySubmissionTimeline = (_teamId: number): MySubmissionTimelineItemDto[] => [
  { id: 1, title: '착수보고서', dueDate: '2026-06-30', status: 'SUBMITTED' },
  { id: 2, title: '중간보고서', dueDate: '2026-07-01', status: 'NOT_SUBMITTED' },
  { id: 3, title: '최종보고서', dueDate: '2026-08-01', status: 'NOT_SUBMITTED' },
];
