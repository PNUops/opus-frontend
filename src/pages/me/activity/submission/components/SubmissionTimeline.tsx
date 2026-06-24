import dayjs from 'dayjs';
import { Check } from 'lucide-react';

import { cn } from '@components/lib/utils';
import { SUBMISSION_STATUS_META } from '@constants/submission';
import type { SubmissionStatus } from '@dto/submissionDto';
import type { MySubmissionTimelineItemDto } from '@dto/meDto';

const isSubmitted = (status: SubmissionStatus) => status === 'SUBMITTED' || status === 'LATE';

export const SubmissionTimeline = ({ items }: { items: MySubmissionTimelineItemDto[] }) => {
  // 제출 완료된 마지막 노드까지 진행 라인을 초록색으로 표시
  const lastSubmittedIndex = items.reduce((acc, item, index) => (isSubmitted(item.status) ? index : acc), -1);

  if (items.length === 0) {
    return <div className="text-midGray rounded-md py-12 text-center text-sm">등록된 제출 항목이 없어요.</div>;
  }

  // 노드는 균등 폭 컬럼 중앙에 위치 → 진행선은 마지막 제출 노드 중앙까지 채움
  const progressWidth = lastSubmittedIndex < 0 ? '0%' : `${((lastSubmittedIndex + 0.5) / items.length) * 100}%`;

  return (
    <div className="relative">
      {/* 전체 트랙 (배경) */}
      <span className="bg-lightGray absolute top-3 right-0 left-0 h-0.5" />
      {/* 진행 구간 */}
      <span className="bg-mainGreen absolute top-3 left-0 h-0.5" style={{ width: progressWidth }} />

      {/* 노드 */}
      <div className="relative flex items-start">
        {items.map((item) => {
          const submitted = isSubmitted(item.status);
          const meta = SUBMISSION_STATUS_META[item.status];

          return (
            <div key={item.id} className="flex flex-1 flex-col items-center">
              <div
                className={cn(
                  'relative z-10 flex h-6 w-6 items-center justify-center rounded-full',
                  submitted ? 'bg-mainGreen text-white' : 'border-lightGray border-2 bg-white',
                )}
              >
                {submitted ? <Check size={14} /> : <span className="bg-lightGray h-2 w-2 rounded-full" />}
              </div>

              {/* 라벨 */}
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <span className={cn('rounded-full px-3 py-0.5 text-xs font-medium', meta.className)}>{meta.label}</span>
                <span className="text-darkGray text-sm font-semibold">{dayjs(item.dueDate).format('M/D')}</span>
                <span className="text-midGray text-sm">{item.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
