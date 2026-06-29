import { cn } from '@utils/classname';

import type { AdvisorFeedbackStatus } from '../types';
import { getFeedbackStatusLabel } from '../utils/format';

interface AdvisorStatusBadgeProps {
  status: AdvisorFeedbackStatus;
}

export const AdvisorStatusBadge = ({ status }: AdvisorStatusBadgeProps) => {
  const completed = status === 'COMPLETED';

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-md px-3 py-1 text-xs font-bold',
        completed ? 'bg-subGreen text-mainGreen' : 'bg-amber-50 text-amber-600',
      )}
    >
      {getFeedbackStatusLabel(status)}
    </span>
  );
};
