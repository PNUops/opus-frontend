import { cn } from '@components/lib/utils';
import { OPERATION_STATUS_META } from '@constants/submission';
import type { SubmissionOperationStatus } from '@dto/submissionDto';

const badgeBase = 'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium';

/** 운영 상태 뱃지 (진행 중 / 마감 / 예정) */
export const OperationStatusBadge = ({ status }: { status: SubmissionOperationStatus }) => {
  const { label, className } = OPERATION_STATUS_META[status];
  return <span className={cn(badgeBase, className)}>{label}</span>;
};

/** 지각 제출 허용 여부 뱃지 */
export const AllowLateBadge = ({ allowLate }: { allowLate: boolean }) => {
  return (
    <span className={cn(badgeBase, allowLate ? 'bg-subGreen text-mainGreen' : 'text-mainRed bg-red-50')}>
      {allowLate ? '허용' : '허용 안 함'}
    </span>
  );
};
