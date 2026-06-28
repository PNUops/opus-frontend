import type { ConfirmMemoResponseDto, MySubmissionSummaryDto, MySubmissionTimelineItemDto } from '@dto/meDto';
import type { SubmissionItemSettingResponseDto } from '@dto/submissionDto';

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

/** TODO: API 연동 전 임시 제출물 설정값 확인 (어드민과 동일 DTO) */
export const getMockSubmissionSetting = (_submissionItemId: number): SubmissionItemSettingResponseDto => ({
  name: '중간발표 자료2',
  contestTrackId: 1,
  description: '프로젝트 진행 상황을 확인할 수 있는 발표자료입니다.',
  allowedFileFormats: ['PDF', 'PPT', 'PPTX'],
  maxFileSizeMb: 500,
  maxFileCount: 3,
  startAt: '2026-06-18T23:59:00',
  endAt: '2026-07-18T23:59:00',
  allowLateSubmission: true,
  visibility: 'PUBLIC',
});

/** submissionId별 확인 메모 목데이터 (메모 없으면 null) */
const MOCK_CONFIRM_MEMOS: Record<number, ConfirmMemoResponseDto> = {
  101: { id: 1, content: '이번 피드백을 반영하여 착수보고서의 일정을 일주일 당기기로 함. 다음 주 화요일까지 보완.' },
};

/** TODO: API 연동 전 임시 확인 메모 조회 목데이터 (메모 없으면 null) */
export const getMockConfirmMemo = (submissionId: number): ConfirmMemoResponseDto | null =>
  MOCK_CONFIRM_MEMOS[submissionId] ?? null;
