import type {
  ConfirmMemoResponseDto,
  MySubmissionListItemDto,
  MySubmissionSummaryDto,
  MySubmissionTimelineItemDto,
} from '@dto/meDto';
import type { SubmissionFeedbackResponseDto, SubmissionItemSettingResponseDto } from '@dto/submissionDto';

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

const mockFiles = (label: string) =>
  Array.from({ length: 3 }, (_, index) => ({
    fileId: index + 1,
    fileName: `AI데이터_퓨처메이커스_${label}.pdf`,
    fileSize: 13002342,
  }));

/** TODO: API 연동 전 임시 제출물 목록 목데이터 */
export const getMockMySubmissionList = (_teamId: number): MySubmissionListItemDto[] => [
  {
    submissionItemId: 1,
    submissionId: 101,
    submissionTypeName: '중간발표 자료',
    description: '프로젝트 진행 상황을 확인할 수 있는 발표자료',
    deadlineAt: '2026-05-15T23:59:00',
    status: 'LATE',
    files: [{ fileId: 1, fileName: '창업트랙_artify_중간발표자료.pptx', fileSize: 13002342 }],
  },
  {
    submissionItemId: 2,
    submissionId: 102,
    submissionTypeName: '중간발표 자료2',
    description: '프로젝트 진행 상황을 확인할 수 있는 발표자료',
    deadlineAt: '2026-05-15T23:59:00',
    status: 'LATE',
    files: [{ fileId: 1, fileName: '창업트랙_artify_중간발표자료2.pptx', fileSize: 13002342 }],
  },
];

const FEEDBACK_BODY =
  '자료 흐름은 명확하지만 실험 결과 설명이 조금 더 필요합니다. 예시로 첨부 파일을 참고해주세요. 자료 흐름은 명확하지만 실험 결과 설명이 조금 더 필요합니다. 예시로 첨부 파일을 참고해주세요.';

/** TODO: API 연동 전 임시 피드백 목데이터 (어드민과 동일 DTO) */
export const getMockMyFeedbacks = (_submissionId: number): SubmissionFeedbackResponseDto[] => [
  {
    feedbackId: 1,
    memberId: 1,
    memberName: '김민수',
    roleType: 'ROLE_팀장',
    description: FEEDBACK_BODY,
    createdAt: '2026-05-14T21:47:00',
    updatedAt: '2026-05-14T21:47:00',
    files: mockFiles('참고자료'),
  },
  {
    feedbackId: 2,
    memberId: 2,
    memberName: '김민수',
    roleType: 'ROLE_팀원',
    description: FEEDBACK_BODY,
    createdAt: '2026-05-14T21:47:00',
    updatedAt: '2026-05-14T21:47:00',
    files: mockFiles('참고자료'),
  },
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
