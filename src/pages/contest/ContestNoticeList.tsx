import dayjs from 'dayjs';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContestIdOrRedirect } from '@hooks/useId';
import { contestNoticeOption } from '@queries/notices';
import type { NoticeListDto } from '@dto/noticeDto';
import { NoticeNewIndicator } from '@components/notice';
import { getNoticePath, isRecentNotice } from '@utils/notice';

const ContestNoticeList = () => {
  const contestId = useContestIdOrRedirect();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: notices } = useSuspenseQuery(contestNoticeOption(contestId));
  const primaryNotices = notices.slice(0, 3);
  const additionalNotices = notices.slice(3);
  const hiddenNoticeCount = additionalNotices.length;
  const hasHiddenNewNotice = additionalNotices.some(isRecentNotice);

  if (primaryNotices.length === 0) return null;

  return (
    <section aria-labelledby="contest-notice-title" className="grid gap-1 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-5">
      <header className="flex items-center px-1 py-1.5 sm:items-start sm:pt-3">
        <h2 id="contest-notice-title" className="text-midGray text-xs font-semibold tracking-[-0.01em]">
          공지
        </h2>
      </header>

      <div className="min-w-0">
        <ol className="divide-y divide-neutral-200/80">
          {primaryNotices.map((notice) => (
            <ContestNoticeItem key={notice.noticeId} notice={notice} contestId={contestId} />
          ))}
        </ol>

        {hiddenNoticeCount > 0 && (
          <>
            <div
              id="contest-additional-notices"
              aria-hidden={!isExpanded}
              inert={!isExpanded}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <ol className="divide-y divide-neutral-200/80 border-t border-neutral-200/80">
                  {additionalNotices.map((notice) => (
                    <ContestNoticeItem key={notice.noticeId} notice={notice} contestId={contestId} />
                  ))}
                </ol>
              </div>
            </div>

            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls="contest-additional-notices"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="text-midGray hover:text-mainBlue focus-visible:ring-mainBlue mt-1 inline-flex items-center gap-1 rounded-sm px-1.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {isExpanded ? '접기' : `공지 ${hiddenNoticeCount}개 더보기`}
              {!isExpanded && hasHiddenNewNotice && (
                <NoticeNewIndicator className="bg-mainRed" label="새 공지 또는 최근 수정된 공지 있음" />
              )}
              <ChevronDown
                aria-hidden="true"
                className={`size-3.5 transition-transform duration-300 motion-reduce:transition-none ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </>
        )}
      </div>
    </section>
  );
};

interface ContestNoticeItemProps {
  notice: NoticeListDto;
  contestId: number;
}

const ContestNoticeItem = ({ notice, contestId }: ContestNoticeItemProps) => {
  const createdAt = dayjs(notice.createdAt);
  const showNewIndicator = isRecentNotice(notice);

  return (
    <li>
      <Link
        to={getNoticePath(notice.noticeId, contestId)}
        viewTransition
        className="group focus-visible:ring-mainBlue grid min-h-11 grid-cols-1 items-center gap-x-3 rounded-sm px-1 py-2.5 transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[minmax(0,1fr)_auto] sm:px-2"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="group-hover:text-mainBlue truncate text-sm font-medium text-neutral-700 transition-colors">
            {notice.title}
          </span>
          {showNewIndicator && <NoticeNewIndicator className="bg-mainRed" />}
        </span>

        <time
          dateTime={notice.createdAt}
          className="text-midGray hidden text-xs whitespace-nowrap tabular-nums sm:block"
        >
          {createdAt.format('YYYY-MM-DD HH:mm')}
        </time>

        <time dateTime={notice.createdAt} className="text-midGray col-start-1 -mt-1 text-[11px] tabular-nums sm:hidden">
          {createdAt.format('YYYY-MM-DD HH:mm')}
        </time>
      </Link>
    </li>
  );
};

export const ContestNoticeListSkeleton = () => (
  <section
    className="grid animate-pulse gap-1 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-5"
    aria-label="대회 공지사항을 불러오는 중"
    aria-busy="true"
  >
    <div className="px-1 py-1.5 sm:pt-3">
      <div className="bg-lightGray h-3 w-7 rounded-sm" />
    </div>
    <ul className="divide-y divide-neutral-200/80" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <li
          key={index}
          className="grid min-h-11 grid-cols-1 items-center gap-x-3 px-1 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-2"
        >
          <div className="space-y-2">
            <div className="bg-lightGray h-3.5 w-full max-w-sm rounded-sm" />
            <div className="bg-lightGray h-2.5 w-28 rounded-sm sm:hidden" />
          </div>
          <div className="bg-lightGray hidden h-3 w-28 rounded-sm sm:block" />
        </li>
      ))}
    </ul>
  </section>
);

export const ContestNoticeListError = ({ resetErrorBoundary }: FallbackProps) => (
  <section
    aria-labelledby="contest-notice-error-title"
    className="grid gap-1 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-5"
  >
    <header className="px-1 py-1.5 sm:pt-3">
      <h2 id="contest-notice-error-title" className="text-midGray text-xs font-semibold">
        공지
      </h2>
    </header>
    <div className="flex min-h-11 items-center justify-between gap-3 px-1 py-2 sm:px-2">
      <p className="text-midGray text-xs">공지사항을 불러오지 못했습니다.</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="text-midGray hover:text-mainBlue focus-visible:ring-mainBlue inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-1 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
      >
        <RotateCcw aria-hidden="true" className="size-3" />
        다시 시도
      </button>
    </div>
  </section>
);

export default ContestNoticeList;
