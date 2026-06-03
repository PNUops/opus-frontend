/** 제출물 운영 상태 */
export type SubmissionOperationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'CLOSED';

/** 제출물 공개 범위 (SubmissionVisibility Enum) */
// TODO: 백엔드 enum 키 확정되면 동기화
export type SubmissionVisibility = 'PRIVATE' | 'STAFF' | 'MEMBER' | 'PUBLIC';

/** 허용 파일 형식 (SubmissionFileFormat Enum) */
// TODO: 백엔드 enum 키 확정되면 동기화
export type SubmissionFileFormat = 'DOCUMENT' | 'PRESENTATION' | 'ARCHIVE' | 'IMAGE' | 'SPREADSHEET' | 'VIDEO';

/** 제출물 항목 응답 */
export interface SubmissionItemResponseDto {
  /** 제출물 ID */
  contestSubmissionItemId: number;
  /** 제출물 종류 이름 */
  name: string;
  /** 대상 분과명, null이면 전체 */
  trackName: string | null;
  /** 시작일시 (LocalDateTime) */
  startAt: string;
  /** 마감일시 (LocalDateTime) */
  endAt: string;
  /** 지각 제출 허용 */
  allowLateSubmission: boolean;
  /** 공개 범위 */
  visibility: SubmissionVisibility;
  /** 운영 상태 */
  operationStatus: SubmissionOperationStatus;
}

export type GetSubmissionItemsResponseDto = SubmissionItemResponseDto[];

/** 제출 파일 다운로드 - 아카이브(제출물 종류 x 분과) 항목 */
export interface SubmissionArchiveResponseDto {
  /** 제출물 종류 ID */
  submissionTypeId: number;
  /** 제출물 종류명 */
  submissionTypeName: string;
  /** 분과 ID */
  trackId: number;
  /** 분과명 */
  trackName: string;
  /** 제출 팀 수 */
  submittedTeamCount: number;
  /** 예상 용량 (bytes) */
  estimatedSize: number;
}

/** 제출 파일 다운로드 목록 응답 */
export interface GetSubmissionArchivesResponseDto {
  archives: SubmissionArchiveResponseDto[];
}

/** 제출물 추가/수정 요청 */
export interface SubmissionItemRequestDto {
  /** 제출물 종류 이름 */
  name: string;
  /** 대상 분과 ID, 생략 시 전체 분과 */
  contestTrackId?: number;
  /** 설명 */
  description?: string;
  /** 허용 파일 형식 목록 (SubmissionFileFormat Enum 값) */
  allowedFileFormats: SubmissionFileFormat[];
  /** 파일 크기 제한 (MB) */
  maxFileSizeMb: number;
  /** 파일 수 제한 */
  maxFileCount: number;
  /** 시작일시 (LocalDateTime) */
  startAt: string;
  /** 마감일시 (LocalDateTime) */
  endAt: string;
  /** 지각 제출 허용 */
  allowLateSubmission: boolean;
  /** 공개 범위 */
  visibility: SubmissionVisibility;
}
