import type { SubmissionItemResponseDto } from '@dto/submissionDto';

/** TODO: API 연동 전 임시 분과 목데이터 (대상 분과 선택용) */
export const MOCK_TRACKS: { trackId: number; trackName: string }[] = [
  { trackId: 1, trackName: 'AI+X' },
  { trackId: 2, trackName: '보안' },
  { trackId: 3, trackName: '네트워크' },
];

/** TODO: API 연동 전 임시 목데이터 */
export const MOCK_SUBMISSIONS: SubmissionItemResponseDto[] = [
  {
    contestSubmissionItemId: 1,
    operationStatus: 'IN_PROGRESS',
    name: '중간발표 자료',
    trackName: 'AI+X',
    startAt: '2025-05-14T23:59:00',
    endAt: '2026-05-15T23:59:00',
    allowLateSubmission: true,
    visibility: 'PRIVATE',
  },
  {
    contestSubmissionItemId: 2,
    operationStatus: 'CLOSED',
    name: '시연 영상',
    trackName: '보안',
    startAt: '2026-04-14T23:59:00',
    endAt: '2026-04-15T23:59:00',
    allowLateSubmission: false,
    visibility: 'STAFF',
  },
  {
    contestSubmissionItemId: 3,
    operationStatus: 'SCHEDULED',
    name: '최종발표 자료',
    trackName: '네트워크',
    startAt: '2026-06-14T23:59:00',
    endAt: '2026-06-15T23:59:00',
    allowLateSubmission: false,
    visibility: 'PRIVATE',
  },
];
