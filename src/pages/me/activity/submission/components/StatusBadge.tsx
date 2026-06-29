import { cn } from '@components/lib/utils';
import { SUBMISSION_STATUS_META } from '@constants/submission';
import type { SubmissionStatus } from '@dto/submissionDto';

export const StatusBadge = ({ status }: { status: SubmissionStatus }) => {
  const { label, className } = SUBMISSION_STATUS_META[status];
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  );
};
