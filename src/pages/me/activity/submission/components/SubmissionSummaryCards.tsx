import { ReactNode } from 'react';
import { ClipboardList, CircleCheck, MessageSquare } from 'lucide-react';

import type { MySubmissionSummaryDto } from '@dto/meDto';

export const SubmissionSummaryCards = ({ summary }: { summary: MySubmissionSummaryDto }) => {
  return (
    <div className="flex flex-wrap gap-3">
      <SummaryCard icon={<ClipboardList size={18} />} label="전체 제출물" count={summary.totalItemCount} />
      <SummaryCard icon={<CircleCheck size={18} />} label="제출 완료" count={summary.submittedCount} />
      <SummaryCard icon={<MessageSquare size={18} />} label="피드백" count={summary.totalFeedbackCount} />
    </div>
  );
};

const SummaryCard = ({ icon, label, count }: { icon: ReactNode; label: string; count: number }) => {
  return (
    <div className="border-subGreen flex min-w-[150px] items-center gap-2 rounded-lg border bg-green-50/60 px-4 py-2.5">
      <span className="text-mainGreen">{icon}</span>
      <span className="text-midGray flex-1 text-sm whitespace-nowrap">{label}</span>
      <span className="text-darkGray font-bold whitespace-nowrap">{count}건</span>
    </div>
  );
};
