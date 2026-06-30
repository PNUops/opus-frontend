import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useContestIdOrRedirect, useTeamIdOrRedirect } from '@hooks/useId';
import { mySubmissionsOption } from '@queries/submission';

import { formatDateTime, formatFileSize } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import { SubmissionDetailPanel } from './SubmissionDetailPanel';

const GRID_COLS = 'grid grid-cols-[1fr_160px_110px_200px_110px] items-center gap-4';

export const SubmissionList = () => {
  const contestId = useContestIdOrRedirect();
  const teamId = useTeamIdOrRedirect();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: items } = useSuspenseQuery(mySubmissionsOption(contestId, teamId));

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
                <div key={item.submissionItemId} className="border-lightGray border-t first:border-t-0">
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
                        onClick={() => setExpandedId(isExpanded ? null : item.submissionItemId)}
                        className="border-mainGreen text-mainGreen rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-green-50"
                      >
                        자세히 보기
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <SubmissionDetailPanel contestId={contestId} teamId={teamId} item={item} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
