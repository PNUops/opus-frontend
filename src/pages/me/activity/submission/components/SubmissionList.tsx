import { useEffect, useRef } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

import { useContestIdOrRedirect, useSearchParamId, useTeamIdOrRedirect } from '@hooks/useId';
import { mySubmissionsOption } from '@queries/submission';
import { cn } from '@utils/classname';

import { formatDateTime, formatFileSize } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { SubmissionDetailPanel } from './SubmissionDetailPanel';

const GRID_COLS =
  'grid grid-cols-2 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_160px_110px_200px_110px] xl:items-center xl:gap-4';

export const SubmissionList = () => {
  const contestId = useContestIdOrRedirect();
  const teamId = useTeamIdOrRedirect();
  const [submissionItemIdParam, setSubmissionItemIdParam] = useSearchParamId('submissionItemId');
  const { key: navigationKey } = useLocation();
  const expandedItemRef = useRef<HTMLDivElement>(null);
  const skipNextScrollRef = useRef(false);

  const { data: items, error, isFetching } = useSuspenseQuery(mySubmissionsOption(contestId, teamId));
  const expandedItemId = items.find((item) => item.submissionItemId === submissionItemIdParam)?.submissionItemId;

  useEffect(() => {
    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false;
      return;
    }
    if (expandedItemId === undefined) return;

    // 경로 이동 시 실행되는 공통 최상단 스크롤 이후, 렌더링된 제출 항목으로 이동한다.
    let cancelled = false;
    const frame = requestAnimationFrame(async () => {
      await document.fonts.ready;
      if (cancelled) return;
      const item = expandedItemRef.current;
      if (!item) return;

      // 이전 패널이 접히면서 대상 항목의 위치가 바뀌므로 높이 전환이 끝난 뒤 스크롤한다.
      const transitions =
        item.parentElement
          ?.getAnimations({ subtree: true })
          .filter(
            (animation) => animation instanceof CSSTransition && animation.transitionProperty === 'grid-template-rows',
          ) ?? [];
      await Promise.all(transitions.map((animation) => animation.finished.catch(() => undefined)));
      if (cancelled) return;

      item.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [navigationKey, expandedItemId]);

  if (error && !isFetching) throw error;

  const handleTogglePanel = (submissionItemId: number, isExpanded: boolean) => {
    skipNextScrollRef.current = true;
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
