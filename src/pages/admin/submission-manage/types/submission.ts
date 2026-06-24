import type { SubmissionFileFormat, SubmissionVisibility } from '@dto/submissionDto';

/** 제출물 관리 탭 종류 (UI 전용) */
export type SubmissionTabKey = 'setting' | 'status' | 'download';

/** 제출물 추가/수정 폼 값 (UI 전용, 제출 시 SubmissionItemRequestDto로 변환) */
export interface SubmissionFormValues {
  /** 제출물 이름 */
  name: string;
  /** 대상 분과 ID, null이면 전체 */
  trackId: number | null;
  /** 설명 */
  description: string;
  /** 허용 파일 형식 */
  fileFormat: SubmissionFileFormat | null;
  /** 최대 파일 크기 (MB) */
  maxFileSizeMb: number;
  /** 최대 파일 수 */
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
