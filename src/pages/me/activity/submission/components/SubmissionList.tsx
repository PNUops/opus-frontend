import { useSuspenseQuery } from '@tanstack/react-query';

import { useSearchParamId } from '@hooks/useId';
import { useScrollToTarget } from '@hooks/useScrollToTarget';
import { mySubmissionsOption } from '@queries/submission';
import { cn } from '@utils/classname';

import { formatDateTime, formatFileSize } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { SubmissionDetailPanel } from './SubmissionDetailPanel';

const GRID_COLS =
  'grid grid-cols-2 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_160px_110px_200px_110px] xl:items-center xl:gap-4';

export const SubmissionList = ({ contestId, teamId }: { contestId: number; teamId: number }) => {
  const [submissionItemIdParam, setSubmissionItemIdParam] = useSearchParamId('submissionItemId');

  const { data: items, error, isFetching } = useSuspenseQuery(mySubmissionsOption(contestId, teamId));
  const expandedItemId = items.find((item) => item.submissionItemId === submissionItemIdParam)?.submissionItemId;

  const { targetRef: expandedItemRef, skipNextScroll } = useScrollToTarget<HTMLDivElement>({
    targetId: expandedItemId,
  });

  if (error && !isFetching) throw error;

  const handleTogglePanel = (submissionItemId: number, isExpanded: boolean) => {
    skipNextScroll();
    setSubmissionItemIdParam(isExpanded ? null : submissionItemId);
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-bold">제출물 목록</h3>

      <div className="overflow-x-auto">
        <div className="border-lightGray overflow-hidden rounded-xl border">
          {/* 헤더 */}
          <div className={`${GRID_COLS} bg-whiteGray hidden px-4 py-3 text-sm font-medium xl:grid`}>
            <span>제출물 항목</span>
            <span>마감일시</span>
            <span>제출 상태</span>
            <span>제출 파일</span>
            <span className="text-center">작업</span>
          </div>

          {items.length === 0 ? (
            <div className="text-midGray py-12 text-center text-sm">제출물이 없어요.</div>
          ) : (
            items.map((item) => {
              const isExpanded = submissionItemIdParam === item.submissionItemId;
              const firstFile = item.files[0];

              return (
                <div
                  key={item.submissionItemId}
                  ref={isExpanded ? expandedItemRef : undefined}
                  className={cn(
                    'scroll-mt-4 rounded-lg bg-white transition-colors',
                    isExpanded ? 'border-mainGreen border bg-white' : 'border-lightGray border-t first:border-t-0',
                  )}
                >
                  <div className={`${GRID_COLS} px-4 py-4`}>
                    <div className="col-span-2 flex min-w-0 flex-col gap-1 xl:col-span-1">
                      <span className="text-sm leading-6 font-medium break-words text-neutral-950">
                        {item.submissionItemName}
                      </span>
                      <span className="text-xs leading-5 break-words text-neutral-600">{item.description}</span>
                    </div>
                    <span className="flex min-w-0 flex-col gap-1 text-sm leading-6 text-neutral-700">
                      <span className="text-xs text-neutral-600 xl:hidden">마감일시</span>
                      {formatDateTime(item.deadlineAt)}
                    </span>
                    <span className="flex flex-col items-start gap-1">
                      <span className="text-xs text-neutral-600 xl:hidden">제출 상태</span>
                      <StatusBadge status={item.status} />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-xs text-neutral-600 xl:hidden">제출 파일</span>
                      {firstFile ? (
                        <>
                          <span className="text-sm break-all text-neutral-800">{firstFile.fileName}</span>
                          <span className="text-xs text-neutral-600">{formatFileSize(firstFile.fileSize)}</span>
                        </>
                      ) : (
                        <span className="text-midGray text-sm">-</span>
                      )}
                    </div>
                    <div className="flex items-end justify-end self-end xl:justify-center xl:self-auto">
                      <button
                        type="button"
                        onClick={() => handleTogglePanel(item.submissionItemId, isExpanded)}
                        className="border-mainGreen focus-visible:outline-mainBlue min-h-11 rounded-md border px-3 py-2 text-xs font-medium whitespace-nowrap text-neutral-800 transition-colors hover:bg-green-50 focus-visible:outline-2"
                        aria-expanded={isExpanded}
                      >
                        자세히 보기
                      </button>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                    aria-hidden={!isExpanded}
                  >
                    <div className="overflow-hidden">
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <SubmissionDetailPanel
                            key={`${contestId}:${teamId}:${item.submissionId}`}
                            contestId={contestId}
                            teamId={teamId}
                            item={item}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
