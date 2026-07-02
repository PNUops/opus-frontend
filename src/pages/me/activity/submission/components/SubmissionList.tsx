import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useContestIdOrRedirect, useTeamIdOrRedirect } from '@hooks/useId';
import { mySubmissionsOption } from '@queries/submission';
import { cn } from '@utils/classname';

import { formatDateTime, formatFileSize } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { SubmissionDetailPanel } from './SubmissionDetailPanel';

const GRID_COLS = 'grid grid-cols-[1fr_160px_110px_200px_110px] items-center gap-4';
const SUBMISSION_ITEM_ID_PARAM = 'submissionItemId';

const getSubmissionItemIdParam = (searchParams: URLSearchParams) => {
  const rawValue = searchParams.get(SUBMISSION_ITEM_ID_PARAM);
  const parsedValue = Number(rawValue);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

export const SubmissionList = () => {
  const contestId = useContestIdOrRedirect();
  const teamId = useTeamIdOrRedirect();
  const [searchParams, setSearchParams] = useSearchParams();
  const submissionItemIdParam = getSubmissionItemIdParam(searchParams);
  const [expandedId, setExpandedId] = useState<number | null>(() => submissionItemIdParam);

  const { data: items } = useSuspenseQuery(mySubmissionsOption(contestId, teamId));

  useEffect(() => {
    setExpandedId(submissionItemIdParam);
  }, [submissionItemIdParam]);

  const handleTogglePanel = (submissionItemId: number, isExpanded: boolean) => {
    const nextExpandedId = isExpanded ? null : submissionItemId;
    const nextSearchParams = new URLSearchParams(searchParams);

    setExpandedId(nextExpandedId);

    if (nextExpandedId === null) {
      nextSearchParams.delete(SUBMISSION_ITEM_ID_PARAM);
    } else {
      nextSearchParams.set(SUBMISSION_ITEM_ID_PARAM, String(nextExpandedId));
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-bold">제출물 목록</h3>

      <div className="overflow-x-auto">
        <div className="border-lightGray min-w-[760px] overflow-hidden rounded-xl border">
          {/* 헤더 */}
          <div className={`${GRID_COLS} bg-whiteGray px-4 py-3 text-sm font-medium`}>
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
              const isExpanded = expandedId === item.submissionItemId;
              const firstFile = item.files[0];

              return (
                <div
                  key={item.submissionItemId}
                  className={cn(
                    'rounded-lg bg-white transition-colors',
                    isExpanded ? 'border-mainGreen border bg-white' : 'border-lightGray border-t first:border-t-0',
                  )}
                >
                  <div className={`${GRID_COLS} px-4 py-4`}>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-darkGray truncate text-sm font-semibold">{item.submissionItemName}</span>
                      <span className="text-midGray truncate text-xs">{item.description}</span>
                    </div>
                    <span className="text-sm text-gray-600">{formatDateTime(item.deadlineAt)}</span>
                    <span>
                      <StatusBadge status={item.status} />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      {firstFile ? (
                        <>
                          <span className="text-darkGray truncate text-sm">{firstFile.fileName}</span>
                          <span className="text-midGray text-xs">{formatFileSize(firstFile.fileSize)}</span>
                        </>
                      ) : (
                        <span className="text-midGray text-sm">-</span>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePanel(item.submissionItemId, isExpanded)}
                        className="border-mainGreen text-mainGreen rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-green-50"
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
                          <SubmissionDetailPanel contestId={contestId} teamId={teamId} item={item} />
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
