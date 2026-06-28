/** 제출물 운영 상태 */
export type SubmissionOperationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'CLOSED';

/** 제출물 공개 범위 (SubmissionVisibility Enum) */
export type SubmissionVisibility = 'PUBLIC' | 'PRIVATE';

/** 허용 파일 형식 (SubmissionFileFormat Enum) */
export type SubmissionFileFormat =
  | 'PDF'
  | 'ZIP'
  | 'PNG'
  | 'JPG'
  | 'JPEG'
  | 'GIF'
  | 'MP4'
  | 'PPT'
  | 'PPTX'
  | 'DOC'
  | 'DOCX'
  | 'HWP';

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

/** 제출 상태 (계산값) */
export type SubmissionStatus = 'SUBMITTED' | 'LATE' | 'NOT_SUBMITTED' | 'NOT_SUBMITTED_AFTER_DEADLINE';

/** 제출 현황 목록 항목 */
export interface SubmissionStatusResponseDto {
  /** 제출 ID, 미제출이면 null */
  submissionId: number | null;
  /** 팀 ID */
  teamId: number;
  /** 팀 이름 */
  teamName: string;
  /** 분과명 */
  trackName: string;
  /** 제출물 종류명 */
  submissionTypeName: string;
  /** 제출 상태 */
  status: SubmissionStatus;
  /** 최초 제출일시, 미제출이면 null */
  firstSubmittedAt: string | null;
  /** 마지막 수정일시, 미제출이면 null */
  lastModifiedAt: string | null;
}

/** 제출 현황 목록 응답 (전체 목록, 페이지네이션·필터는 클라이언트 State에서 처리) */
export type GetSubmissionStatusesResponseDto = SubmissionStatusResponseDto[];

/** 제출 파일 */
export interface SubmissionFileResponseDto {
  /** 파일 ID */
  fileId: number;
  /** 파일명 */
  fileName: string;
  /** 파일 용량 (byte) */
  fileSize: number;
}

/** 제출물 피드백 */
export interface SubmissionFeedbackResponseDto {
  /** 피드백 ID */
  feedbackId: number;
  /** 작성자 ID */
  memberId: number;
  /** 작성자 이름 */
  memberName: string;
  /** 피드백 본문 */
  description: string;
  /** 작성 시각 */
  createdAt: string;
  /** 마지막 수정 시각 */
  updatedAt: string;
  /** 작성자 역할 (예: 'ROLE_팀장', 'ROLE_팀원') */
  roleType: string;
  /** 첨부파일 목록 */
  files: SubmissionFileResponseDto[];
}

/** 피드백 목록 조회 응답 */
export type GetSubmissionFeedbacksResponseDto = SubmissionFeedbackResponseDto[];

/** 제출물 상세 조회 응답 */
export interface SubmissionDetailResponseDto {
  /** 제출 ID */
  submissionId: number;
  /** 팀 ID */
  teamId: number;
  /** 팀 이름 */
  teamName: string;
  /** 프로젝트 설명 */
  projectOverview: string;
  /** 분과명 */
  trackName: string;
  /** 제출물 종류명 */
  submissionTypeName: string;
  /** 제출 상태 */
  status: SubmissionStatus;
  /** 제출 마감일시 */
  deadlineAt: string;
  /** 최초 제출일시 */
  firstSubmittedAt: string | null;
  /** 마지막 수정일시 */
  lastModifiedAt: string | null;
  /** 제출 파일 목록 */
  files: SubmissionFileResponseDto[];
  /** 피드백 개수 */
  feedbackCount: number;
}

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
  targets: SubmissionArchiveResponseDto[];
}

/** 제출 파일 다운로드 대상 (제출 항목 종류 x 분과) */
export interface SubmissionDownloadTargetDto {
  /** 제출물 종류 ID */
  submissionTypeId: number;
  /** 분과 ID */
  trackId: number;
}

/** 제출 파일 여러개 다운로드 요청 */
export interface SubmissionDownloadsRequestDto {
  targets: SubmissionDownloadTargetDto[];
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

/** 제출물 설정값 확인 응답 (추가/수정 요청과 동일 필드) */
export type SubmissionItemSettingResponseDto = SubmissionItemRequestDto;

/** 제출물 제출 응답 (생성된 제출 ID) */
export interface SubmitSubmissionResponseDto {
  /** 생성된 제출 ID */
  submissionId: number;
}
