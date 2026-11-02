import { cn } from '@components/lib/utils';
import { OPERATION_STATUS_META, SUBMISSION_STATUS_META } from '@constants/submission';
import type { SubmissionOperationStatus, SubmissionStatus } from '@dto/submissionDto';

const badgeBase =
  'inline-flex shrink-0 items-center justify-center rounded-md px-2.5 py-1 text-xs leading-5 font-medium whitespace-nowrap';

/** 운영 상태 뱃지 (진행 중 / 마감 / 예정) */
export const OperationStatusBadge = ({ status }: { status: SubmissionOperationStatus }) => {
  const { label, className } = OPERATION_STATUS_META[status];
  return <span className={cn(badgeBase, className, 'text-neutral-800')}>{label}</span>;
};

/** 제출 상태 뱃지 (제출 완료 / 지각 제출 / 미제출 / 마감 후 미제출) */
export const SubmissionStatusBadge = ({ status }: { status: SubmissionStatus }) => {
  const { label, className } = SUBMISSION_STATUS_META[status];
  return <span className={cn(badgeBase, className, 'text-neutral-800')}>{label}</span>;
};

/** 지각 제출 허용 여부 뱃지 */
export const AllowLateBadge = ({ allowLate }: { allowLate: boolean }) => {
  return (
    <span className={cn(badgeBase, 'text-neutral-800', allowLate ? 'bg-subGreen' : 'bg-red-50')}>
      {allowLate ? '허용' : '허용 안 함'}
    </span>
  );
};
