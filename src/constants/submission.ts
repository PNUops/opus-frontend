import type {
  CommentAuthorRole,
  SubmissionFileFormat,
  SubmissionOperationStatus,
  SubmissionStatus,
  SubmissionVisibility,
} from '@dto/submissionDto';
import type { SubmissionTabKey } from '@pages/admin/submission-manage/types/submission';

/** 제출물 관리 탭 목록 */
export const SUBMISSION_TABS: { key: SubmissionTabKey; label: string }[] = [
  { key: 'setting', label: '제출물 설정' },
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

/** 코멘트 작성자 역할 라벨 */
export const COMMENT_ROLE_LABEL: Record<CommentAuthorRole, string> = {
  MENTOR: '멘토',
  PROFESSOR: '지도교수',
  ADMIN: '관리자',
};

/** 공개 범위 라벨 */
export const VISIBILITY_LABEL: Record<SubmissionVisibility, string> = {
  PRIVATE: '제출 팀만',
  STAFF: '대회 관계자',
  MEMBER: '회원 전체',
  PUBLIC: '전체 공개',
};

/** 공개 범위 선택 옵션 순서 */
export const VISIBILITY_OPTIONS: SubmissionVisibility[] = ['PRIVATE', 'STAFF', 'MEMBER', 'PUBLIC'];

/** 공개 범위 설명 (툴팁용) */
export const VISIBILITY_DESCRIPTION: Record<SubmissionVisibility, string> = {
  PRIVATE: '제출 팀의 팀원과 관리자만 열람할 수 있습니다.',
  STAFF: '팀원, 지도교수, 심사위원, 멘토, 관리자가 열람할 수 있습니다.',
  MEMBER: '로그인한 모든 회원이 열람할 수 있습니다.',
  PUBLIC: '비회원도 열람할 수 있습니다.',
};

/** 허용 파일 형식 그룹 (제출물 추가/수정 폼용) */
export const FILE_FORMAT_GROUPS: {
  key: SubmissionFileFormat;
  label: string;
  extensions: string[];
  example: string;
}[] = [
  {
    key: 'DOCUMENT',
    label: '문서 파일',
    extensions: ['.pdf', '.doc', '.docx', '.hwp'],
    example: '보고서, 계획서, 결과보고서',
  },
  { key: 'PRESENTATION', label: '발표자료', extensions: ['.ppt', '.pptx', '.pdf'], example: '중간발표, 최종발표 자료' },
  { key: 'ARCHIVE', label: '압축 파일', extensions: ['.zip', '.7z', '.tar', '.gz'], example: '소스코드, 결과물 묶음' },
  {
    key: 'IMAGE',
    label: '이미지 파일',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
    example: '포스터, 썸네일, 이미지 산출물',
  },
  {
    key: 'SPREADSHEET',
    label: '스프레드시트',
    extensions: ['.xls', '.xlsx', '.csv'],
    example: '명단, 평가표, 데이터 파일',
  },
  { key: 'VIDEO', label: '영상 파일', extensions: ['.mp4', '.mov', '.webm'], example: '발표 영상, 시연 영상' },
];

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
