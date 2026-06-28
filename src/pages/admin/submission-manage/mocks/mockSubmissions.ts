import type {
  SubmissionArchiveResponseDto,
  SubmissionFeedbackResponseDto,
  SubmissionItemSettingResponseDto,
  SubmissionStatus,
  SubmissionStatusResponseDto,
} from '@dto/submissionDto';

/** TODO: API 연동 전 임시 분과 목데이터 (대상 분과 선택용) */
export const MOCK_TRACKS: { trackId: number; trackName: string }[] = [
  { trackId: 1, trackName: 'AI+X' },
  { trackId: 2, trackName: '보안' },
  { trackId: 3, trackName: '네트워크' },
];

/** TODO: API 연동 전 임시 제출물 설정값 확인 목데이터 (수정 모달 초기값용, 추가/수정 요청과 동일 DTO) */
export const getMockSubmissionItemSetting = (_contestSubmissionItemId: number): SubmissionItemSettingResponseDto => ({
  name: '중간발표 자료',
  contestTrackId: 1,
  description: '프로젝트 진행 상황을 확인할 수 있는 발표자료입니다.',
  allowedFileFormats: ['PDF', 'PPT', 'PPTX'],
  maxFileSizeMb: 500,
  maxFileCount: 3,
  startAt: '2025-05-14T23:59:00',
  endAt: '2026-05-15T23:59:00',
  allowLateSubmission: true,
  visibility: 'PUBLIC',
});

/** TODO: API 연동 전 임시 제출 파일 다운로드 목데이터 */
export const MOCK_ARCHIVES: SubmissionArchiveResponseDto[] = [
  {
    submissionTypeId: 3,
    submissionTypeName: '최종발표 자료',
    trackId: 1,
    trackName: 'AI+X',
    submittedTeamCount: 6,
    estimatedSize: 314572800,
  },
  {
    submissionTypeId: 3,
    submissionTypeName: '최종발표 자료',
    trackId: 2,
    trackName: '보안',
    submittedTeamCount: 8,
    estimatedSize: 419430400,
  },
  {
    submissionTypeId: 3,
    submissionTypeName: '최종발표 자료',
    trackId: 3,
    trackName: '네트워크',
    submittedTeamCount: 5,
    estimatedSize: 251658240,
  },
  {
    submissionTypeId: 1,
    submissionTypeName: '중간발표 자료',
    trackId: 1,
    trackName: 'AI+X',
    submittedTeamCount: 6,
    estimatedSize: 157286400,
  },
  {
    submissionTypeId: 1,
    submissionTypeName: '중간발표 자료',
    trackId: 2,
    trackName: '보안',
    submittedTeamCount: 8,
    estimatedSize: 188743680,
  },
  {
    submissionTypeId: 2,
    submissionTypeName: '시연 영상',
    trackId: 2,
    trackName: '보안',
    submittedTeamCount: 8,
    estimatedSize: 901775360,
  },
  {
    submissionTypeId: 2,
    submissionTypeName: '시연 영상',
    trackId: 3,
    trackName: '네트워크',
    submittedTeamCount: 5,
    estimatedSize: 1288490188,
  },
];

const STATUS_CYCLE: SubmissionStatus[] = [
  'SUBMITTED',
  'SUBMITTED',
  'SUBMITTED',
  'LATE',
  'NOT_SUBMITTED',
  'NOT_SUBMITTED_AFTER_DEADLINE',
];
const STATUS_TRACKS = ['AI/데이터', '웹/모바일', '보안'];
const STATUS_TYPES = ['최종발표 자료', '중간발표 자료', '시연 영상'];

/** TODO: API 연동 전 임시 제출 현황 목데이터 */
export const MOCK_SUBMISSION_STATUSES: SubmissionStatusResponseDto[] = Array.from({ length: 23 }, (_, index) => {
  const status = STATUS_CYCLE[index % STATUS_CYCLE.length];
  const isSubmitted = status === 'SUBMITTED' || status === 'LATE';
  return {
    submissionId: isSubmitted ? index + 1 : null,
    teamId: index + 1,
    teamName: `퓨처메이커스 ${index + 1}`,
    trackName: STATUS_TRACKS[index % STATUS_TRACKS.length],
    submissionTypeName: STATUS_TYPES[index % STATUS_TYPES.length],
    status,
    firstSubmittedAt: isSubmitted ? '2026-05-15T23:59:00' : null,
    lastModifiedAt: isSubmitted ? '2026-05-15T23:59:00' : null,
  };
});

const COMMENT_BODY =
  '자료 흐름은 명확하지만 실험 결과 설명이 조금 더 필요합니다. 예시로 첨부 파일을 참고해주세요. 자료 흐름은 명확하지만 실험 결과 설명이 조금 더 필요합니다. 예시로 첨부 파일을 참고해주세요.';

/** TODO: API 연동 전 임시 피드백 목데이터 (제출 ID 기반으로 합성) */
export const buildMockFeedbacks = (row: SubmissionStatusResponseDto): SubmissionFeedbackResponseDto[] =>
  Array.from({ length: 3 }, (_, index) => ({
    feedbackId: index + 1,
    memberId: index + 1,
    memberName: '김민수',
    roleType: 'ROLE_팀장',
    description: COMMENT_BODY,
    createdAt: '2026-05-14T21:47:00',
    updatedAt: '2026-05-14T21:47:00',
    files: Array.from({ length: index === 1 ? 1 : 3 }, (_, fileIndex) => ({
      fileId: fileIndex + 1,
      fileName: `AI데이터_${row.teamName}_참고자료.pdf`,
      fileSize: 13002342,
    })),
  }));
