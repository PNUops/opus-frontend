import type {
  SubmissionFileFormat,
  SubmissionOperationStatus,
  SubmissionStatus,
  SubmissionVisibility,
} from '@dto/submissionDto';
import type { SubmissionTabKey } from '@pages/admin/submission-manage/types/submission';

/** 제출물 관리 탭 목록 */
export const SUBMISSION_TABS: { key: SubmissionTabKey; label: string }[] = [
  { key: 'setting', label: '제출 항목 설정' },
  { key: 'status', label: '제출 현황' },
  { key: 'download', label: '제출 파일 다운로드' },
];

/** 운영 상태 라벨/뱃지 색상 */
export const OPERATION_STATUS_META: Record<SubmissionOperationStatus, { label: string; className: string }> = {
  IN_PROGRESS: { label: '진행 중', className: 'bg-subGreen text-mainGreen' },
  CLOSED: { label: '마감', className: 'bg-whiteGray text-midGray' },
  SCHEDULED: { label: '예정', className: 'bg-yellow-50 text-yellow-600' },
};

/** 제출 상태 라벨/뱃지 색상 */
export const SUBMISSION_STATUS_META: Record<SubmissionStatus, { label: string; className: string }> = {
  SUBMITTED: { label: '제출 완료', className: 'bg-subGreen text-mainGreen' },
  LATE: { label: '지각 제출', className: 'bg-blue-50 text-mainBlue' },
  NOT_SUBMITTED: { label: '미제출', className: 'bg-whiteGray text-midGray' },
  NOT_SUBMITTED_AFTER_DEADLINE: { label: '마감 후 미제출', className: 'bg-red-50 text-mainRed' },
};

/** 제출 상태 필터 옵션 */
export const SUBMISSION_STATUS_FILTER_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: '제출 상태', value: '' },
  { label: '제출 완료', value: 'SUBMITTED' },
  { label: '지각 제출', value: 'LATE' },
  { label: '미제출', value: 'NOT_SUBMITTED' },
  { label: '마감 후 미제출', value: 'NOT_SUBMITTED_AFTER_DEADLINE' },
];

/** 피드백 작성자 역할 라벨 ('ROLE_팀장' → '팀장') */
export const getFeedbackRoleLabel = (roleType: string): string => roleType.replace(/^ROLE_/, '');

/** 공개 범위 라벨 */
export const VISIBILITY_LABEL: Record<SubmissionVisibility, string> = {
  PUBLIC: '공개',
  PRIVATE: '비공개',
};

/** 공개 범위 선택 옵션 순서 */
export const VISIBILITY_OPTIONS: SubmissionVisibility[] = ['PUBLIC', 'PRIVATE'];

/** 공개 범위 설명 (툴팁용) */
export const VISIBILITY_DESCRIPTION: Record<SubmissionVisibility, string> = {
  PUBLIC: '제출 팀 외 회원도 제출물을 열람할 수 있습니다.',
  PRIVATE: '제출 팀의 팀원과 관리자만 열람할 수 있습니다.',
};

/** 허용 파일 형식(enum) → 확장자 */
export const FILE_FORMAT_EXTENSION: Record<SubmissionFileFormat, string> = {
  PDF: '.pdf',
  DOC: '.doc',
  DOCX: '.docx',
  HWP: '.hwp',
  PPT: '.ppt',
  PPTX: '.pptx',
  ZIP: '.zip',
  PNG: '.png',
  JPG: '.jpg',
  JPEG: '.jpeg',
  GIF: '.gif',
  MP4: '.mp4',
};

/** 허용 파일 형식 선택 옵션 순서 (제출물 추가/수정 폼용) */
export const FILE_FORMAT_OPTIONS: SubmissionFileFormat[] = [
  'PDF',
  'DOC',
  'DOCX',
  'HWP',
  'PPT',
  'PPTX',
  'ZIP',
  'PNG',
  'JPG',
  'JPEG',
  'GIF',
  'MP4',
];

/** 파일 형식(enum) 목록 → 확장자 목록 */
export const getFileFormatExtensions = (formats: SubmissionFileFormat[]): string[] =>
  formats.map((format) => FILE_FORMAT_EXTENSION[format]);

/** 최대 파일 크기 옵션 (MB) */
export const FILE_SIZE_OPTIONS: { label: string; value: number }[] = [
  { label: '10MB', value: 10 },
  { label: '50MB', value: 50 },
  { label: '100MB', value: 100 },
  { label: '500MB', value: 500 },
  { label: '1GB', value: 1024 },
];

/** 운영 상태 필터 옵션 (FilterDropDown용) */
export const OPERATION_STATUS_FILTER_OPTIONS: { label: string; value: SubmissionOperationStatus | '' }[] = [
  { label: '전체', value: '' },
  { label: '진행 중', value: 'IN_PROGRESS' },
  { label: '마감', value: 'CLOSED' },
  { label: '예정', value: 'SCHEDULED' },
];
